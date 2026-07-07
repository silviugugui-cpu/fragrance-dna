import "server-only";

export interface FragranticaSnapshot {
  externalId: string;
  externalUrl: string;
  perfumeName: string;
  brand: string;
  launchYear: string;
  perfumer: string;
  gender: string;
  mainAccords: string[];
  notes: string[];
  imageUrl: string;
  rating: string;
  voteCount: string;
  releaseStatus: string;
  availability: string;
  confidence: number;
  fetchedAt: string;
  source: string;
}

const FRAGRANTICA_BASE = "https://www.fragrantica.com";

const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const decodeHtml = (value: string): string =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const stripTags = (value: string): string =>
  decodeHtml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

const safeJsonParse = <T,>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const absoluteUrl = (href: string): string =>
  href.startsWith("http") ? href : `${FRAGRANTICA_BASE}${href.startsWith("/") ? href : `/${href}`}`;

const fetchHtml = async (url: string, timeoutMs: number): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "FragranceDNA-Connector/1.0",
        accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Fragrantica fetch failed ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
};

const extractLinks = (html: string): Array<{ href: string; title: string }> => {
  const matches = html.matchAll(/<a[^>]*href="([^"]*\/perfume\/[^"]+)"[^>]*>(.*?)<\/a>/gi);
  const links: Array<{ href: string; title: string }> = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const href = match[1]?.trim();
    if (!href) {
      continue;
    }

    const full = absoluteUrl(href.split("#")[0]);
    if (seen.has(full)) {
      continue;
    }

    seen.add(full);
    links.push({
      href: full,
      title: stripTags(match[2] ?? ""),
    });
  }

  return links;
};

const extractJsonLd = (html: string): Array<Record<string, unknown>> => {
  const scripts = html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  );

  const payloads: Array<Record<string, unknown>> = [];
  for (const script of scripts) {
    const raw = script[1]?.trim();
    if (!raw) {
      continue;
    }

    const parsed = safeJsonParse<unknown>(raw);
    if (!parsed) {
      continue;
    }

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item && typeof item === "object") {
          payloads.push(item as Record<string, unknown>);
        }
      }
      continue;
    }

    if (parsed && typeof parsed === "object") {
      payloads.push(parsed as Record<string, unknown>);
    }
  }

  return payloads;
};

const readString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const extractFirst = (html: string, regexes: RegExp[]): string => {
  for (const regex of regexes) {
    const match = html.match(regex);
    const raw = match?.[1];
    if (!raw) {
      continue;
    }

    const cleaned = stripTags(raw);
    if (cleaned.length > 0) {
      return cleaned;
    }
  }

  return "";
};

const splitTokens = (value: string): string[] =>
  value
    .split(/[|,;/]/g)
    .map((item) => stripTags(item))
    .filter((item) => item.length > 0)
    .slice(0, 24);

const extractList = (html: string, pattern: RegExp): string[] => {
  const list: string[] = [];
  const matches = html.matchAll(pattern);
  for (const match of matches) {
    const value = stripTags(match[1] ?? "");
    if (value.length > 0 && !list.includes(value)) {
      list.push(value);
    }
  }
  return list;
};

const detectGender = (html: string): string => {
  const text = html.toLowerCase();
  if (text.includes("for women and men") || text.includes("unisex")) {
    return "unisex";
  }
  if (text.includes("for women")) {
    return "feminine";
  }
  if (text.includes("for men")) {
    return "masculine";
  }
  return "unknown";
};

const computeConfidence = (input: {
  perfume: string;
  brand: string;
  accords: number;
  notes: number;
  rating: string;
  launchYear: string;
}): number => {
  let score = 0.45;
  if (input.perfume.length > 0) score += 0.15;
  if (input.brand.length > 0) score += 0.15;
  if (input.launchYear.length === 4) score += 0.08;
  if (input.accords > 0) score += 0.07;
  if (input.notes > 0) score += 0.06;
  if (input.rating.length > 0) score += 0.04;
  return Number(Math.min(0.98, score).toFixed(2));
};

export const fetchFragranticaSnapshot = async (
  pageUrl: string,
  timeoutMs: number,
): Promise<FragranticaSnapshot | null> => {
  const html = await fetchHtml(pageUrl, timeoutMs);
  const payloads = extractJsonLd(html);

  const productLike = payloads.find((item) => {
    const type = readString(item["@type"]);
    if (type === "Product") {
      return true;
    }

    if (Array.isArray(item["@type"])) {
      return (item["@type"] as unknown[]).some((entry) => readString(entry) === "Product");
    }

    return false;
  }) ?? {};

  const brandObj = productLike["brand"] as { name?: string } | undefined;
  const aggregate = productLike["aggregateRating"] as
    | { ratingValue?: string | number; ratingCount?: string | number }
    | undefined;

  const perfumeName = readString(productLike["name"]) || extractFirst(html, [
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
  ]);

  const brand = readString(brandObj?.name) || extractFirst(html, [
    /Brand\s*:\s*<a[^>]*>([\s\S]*?)<\/a>/i,
    /"brand"\s*:\s*"([^"]+)"/i,
  ]);

  const launchYear = extractFirst(html, [
    /(?:launched|released|from)\s*(?:in\s*)?(\d{4})/i,
    /(?:release\s*year|launch\s*year)\s*[:\-]\s*(\d{4})/i,
  ]);

  const perfumer = extractFirst(html, [
    /(?:perfumer|nose)\s*[:\-]\s*<a[^>]*>([\s\S]*?)<\/a>/i,
    /(?:perfumer|nose)\s*[:\-]\s*([^<\n]+)/i,
  ]);

  const imageUrl = readString(productLike["image"]);
  const rating = aggregate?.ratingValue !== undefined ? String(aggregate.ratingValue) : "";
  const voteCount = aggregate?.ratingCount !== undefined ? String(aggregate.ratingCount) : "";

  const accords = extractList(
    html,
    /class="[^\"]*accord-box[^\"]*"[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/gi,
  );

  const noteCandidates = extractList(
    html,
    /class="[^\"]*notes-box[^\"]*"[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/gi,
  );

  const notes = noteCandidates.length > 0
    ? noteCandidates
    : splitTokens(
        extractFirst(html, [
          /(?:top notes|heart notes|base notes)[\s\S]{0,320}/i,
          /Notes\s*[:\-]\s*([^<\n]+)/i,
        ]),
      );

  const lower = html.toLowerCase();
  const releaseStatus = lower.includes("discontinued") ? "discontinued" : "active";
  const availability = lower.includes("not available")
    ? "unavailable"
    : releaseStatus === "discontinued"
      ? "discontinued"
      : "available";

  if (perfumeName.length === 0 && brand.length === 0) {
    return null;
  }

  const confidence = computeConfidence({
    perfume: perfumeName,
    brand,
    accords: accords.length,
    notes: notes.length,
    rating,
    launchYear,
  });

  const externalId = pageUrl
    .split("/")
    .filter((part) => part.length > 0)
    .slice(-1)[0]
    ?.replace(/\.html$/i, "") ?? "";

  return {
    externalId,
    externalUrl: pageUrl,
    perfumeName,
    brand,
    launchYear,
    perfumer,
    gender: detectGender(html),
    mainAccords: accords,
    notes,
    imageUrl,
    rating,
    voteCount,
    releaseStatus,
    availability,
    confidence,
    fetchedAt: new Date().toISOString(),
    source: "Fragrantica",
  };
};

export const searchFragranticaFragrances = async (
  query: string,
  limit: number,
  timeoutMs: number,
): Promise<FragranticaSnapshot[]> => {
  const searchUrl = `${FRAGRANTICA_BASE}/search/?q=${encodeURIComponent(query)}`;
  const html = await fetchHtml(searchUrl, timeoutMs);
  const links = extractLinks(html).slice(0, Math.max(1, limit));

  const results: FragranticaSnapshot[] = [];
  for (const link of links) {
    try {
      const snapshot = await fetchFragranticaSnapshot(link.href, timeoutMs);
      if (!snapshot) {
        continue;
      }
      results.push(snapshot);
    } catch {
      continue;
    }
  }

  const dedupe = new Map<string, FragranticaSnapshot>();
  for (const item of results) {
    const key = `${normalize(item.brand)}::${normalize(item.perfumeName)}`;
    if (!dedupe.has(key) || (dedupe.get(key)?.confidence ?? 0) < item.confidence) {
      dedupe.set(key, item);
    }
  }

  return Array.from(dedupe.values());
};
