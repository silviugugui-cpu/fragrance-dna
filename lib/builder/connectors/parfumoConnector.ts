import "server-only";

export interface ParfumoSnapshot {
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

const PARFUMO_BASE = "https://www.parfumo.com";

const stripTags = (value: string): string =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const normalize = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, " ");

const absoluteUrl = (href: string): string =>
  href.startsWith("http") ? href : `${PARFUMO_BASE}${href.startsWith("/") ? href : `/${href}`}`;

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
      throw new Error(`Parfumo fetch failed ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
};

const extractLinks = (html: string): Array<{ href: string; title: string }> => {
  const matches = html.matchAll(/<a[^>]*href="([^"]*\/Perfumes\/[^"]+)"[^>]*>(.*?)<\/a>/gi);
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
    links.push({ href: full, title: stripTags(match[2] ?? "") });
  }

  return links;
};

const extractFirst = (html: string, regexes: RegExp[]): string => {
  for (const regex of regexes) {
    const match = html.match(regex);
    const value = stripTags(match?.[1] ?? "");
    if (value.length > 0) {
      return value;
    }
  }

  return "";
};

const extractList = (html: string, regex: RegExp): string[] => {
  const list: string[] = [];
  const matches = html.matchAll(regex);
  for (const match of matches) {
    const value = stripTags(match[1] ?? "");
    if (value.length > 0 && !list.includes(value)) {
      list.push(value);
    }
  }
  return list.slice(0, 24);
};

const computeConfidence = (input: {
  perfume: string;
  brand: string;
  launchYear: string;
  accords: number;
  notes: number;
}): number => {
  let score = 0.44;
  if (input.perfume.length > 0) score += 0.16;
  if (input.brand.length > 0) score += 0.16;
  if (input.launchYear.length === 4) score += 0.08;
  if (input.accords > 0) score += 0.08;
  if (input.notes > 0) score += 0.06;
  return Number(Math.min(0.97, score).toFixed(2));
};

export const fetchParfumoSnapshot = async (
  pageUrl: string,
  timeoutMs: number,
): Promise<ParfumoSnapshot | null> => {
  const html = await fetchHtml(pageUrl, timeoutMs);

  const perfumeName = extractFirst(html, [
    /<h1[^>]*class="[^"]*">([\s\S]*?)<\/h1>/i,
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
  ]);

  const brand = extractFirst(html, [
    /href="\/Brands\/[^"]+"[^>]*>([\s\S]*?)<\/a>/i,
    /Brand[^<]{0,25}<[^>]*>([\s\S]*?)<\/a>/i,
  ]);

  const launchYear = extractFirst(html, [
    /(?:released|launch|from)\s*(?:in\s*)?(\d{4})/i,
    /"year"\s*:\s*"(\d{4})"/i,
  ]);

  const perfumer = extractFirst(html, [
    /(?:Perfumer|Nose)\s*:?\s*<a[^>]*>([\s\S]*?)<\/a>/i,
    /(?:Perfumer|Nose)\s*:?\s*([^<\n]+)/i,
  ]);

  const mainAccords = extractList(html, /href="\/Notes\/[^"]+"[^>]*>([\s\S]*?)<\/a>/gi);
  const notes = extractList(html, /class="[^"]*note[^"]*"[^>]*>([\s\S]*?)<\/a>/gi);

  const imageUrl = extractFirst(html, [
    /property="og:image"\s+content="([^"]+)"/i,
    /<img[^>]*class="[^"]*perfume[^"]*"[^>]*src="([^"]+)"/i,
  ]);

  const rating = extractFirst(html, [/ratingValue"\s*content="([^"]+)"/i]);
  const voteCount = extractFirst(html, [/ratingCount"\s*content="([^"]+)"/i]);

  if (perfumeName.length === 0 && brand.length === 0) {
    return null;
  }

  const confidence = computeConfidence({
    perfume: perfumeName,
    brand,
    launchYear,
    accords: mainAccords.length,
    notes: notes.length,
  });

  const externalId = pageUrl
    .split("/")
    .filter((part) => part.length > 0)
    .slice(-1)[0] ?? "";

  return {
    externalId,
    externalUrl: pageUrl,
    perfumeName,
    brand,
    launchYear,
    perfumer,
    gender: "unknown",
    mainAccords,
    notes,
    imageUrl: absoluteUrl(imageUrl),
    rating,
    voteCount,
    releaseStatus: "active",
    availability: "available",
    confidence,
    fetchedAt: new Date().toISOString(),
    source: "Parfumo",
  };
};

export const searchParfumoFragrances = async (
  query: string,
  limit: number,
  timeoutMs: number,
): Promise<ParfumoSnapshot[]> => {
  const searchCandidates = [
    `${PARFUMO_BASE}/search?query=${encodeURIComponent(query)}`,
    `${PARFUMO_BASE}/s_perfumes_x.php?in=1&filter=${encodeURIComponent(query)}`,
  ];

  let html = "";
  for (const candidate of searchCandidates) {
    try {
      html = await fetchHtml(candidate, timeoutMs);
      if (html.length > 0) {
        break;
      }
    } catch {
      continue;
    }
  }

  if (html.length === 0) {
    return [];
  }

  const links = extractLinks(html).slice(0, Math.max(1, limit));
  const results: ParfumoSnapshot[] = [];

  for (const link of links) {
    try {
      const snapshot = await fetchParfumoSnapshot(link.href, timeoutMs);
      if (snapshot) {
        results.push(snapshot);
      }
    } catch {
      continue;
    }
  }

  const dedupe = new Map<string, ParfumoSnapshot>();
  for (const item of results) {
    const key = `${normalize(item.brand)}::${normalize(item.perfumeName)}`;
    if (!dedupe.has(key) || (dedupe.get(key)?.confidence ?? 0) < item.confidence) {
      dedupe.set(key, item);
    }
  }

  return Array.from(dedupe.values());
};
