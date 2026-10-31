import "server-only";
import fs from "node:fs";
import path from "node:path";

export interface ManufacturerSiteConfig {
  brand: string;
  domain: string;
  sitemapPath?: string;
}

export interface ManufacturerSnapshot {
  externalId: string;
  externalUrl: string;
  perfumeName: string;
  brand: string;
  confidence: number;
  fetchedAt: string;
  source: string;
}

export interface ManufacturerTruthRecord {
  source: string;
  externalUrl: string;
  perfumeName: string;
  brand: string;
  launchYear: string;
  perfumer: string;
  availability: string;
  releaseStatus: string;
}

const CONFIG_PATH = path.join(process.cwd(), "data", "generated", "manufacturer-sites.json");

const normalize = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, " ");

const readSiteConfig = (): ManufacturerSiteConfig[] => {
  if (!fs.existsSync(CONFIG_PATH)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { sites?: ManufacturerSiteConfig[] };
    return Array.isArray(parsed.sites) ? parsed.sites : [];
  } catch {
    return [];
  }
};

const fetchText = async (url: string, timeoutMs: number): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "FragranceDNA-Connector/1.0",
        accept: "text/html,application/xml,text/xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Manufacturer fetch failed ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
};

const parseSitemapUrls = (xml: string): string[] => {
  const urls: string[] = [];
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/gi);
  for (const match of matches) {
    const value = (match[1] ?? "").trim();
    if (value.length > 0) {
      urls.push(value);
    }
  }
  return urls;
};

const titleFromUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const last = parsed.pathname
      .split("/")
      .filter((part) => part.length > 0)
      .slice(-1)[0] ?? "";

    return last
      .replace(/[-_]+/g, " ")
      .replace(/\.(html|php)$/i, "")
      .trim();
  } catch {
    return "";
  }
};

const scoreSnapshot = (perfumeName: string, brand: string): number => {
  let score = 0.5;
  if (perfumeName.length > 0) score += 0.2;
  if (brand.length > 0) score += 0.2;
  return Number(Math.min(0.93, score).toFixed(2));
};

const extractFirst = (html: string, regexes: RegExp[]): string => {
  for (const regex of regexes) {
    const match = html.match(regex);
    const value = (match?.[1] ?? "").trim();
    if (value.length > 0) {
      return value;
    }
  }

  return "";
};

const extractLaunchYear = (html: string): string =>
  extractFirst(html, [
    /(?:launched|released|introduced|from)\D{0,24}((?:19|20)\d{2})/i,
    /\b((?:19|20)\d{2})\b/, 
  ]);

const extractPerfumer = (html: string): string =>
  extractFirst(html, [
    /(?:perfumer|nose|created by)\D{0,24}([A-Z][A-Za-z.'\-]+(?:\s+[A-Z][A-Za-z.'\-]+){0,4})/,
  ]);

const detectReleaseStatus = (html: string): string => {
  const text = html.toLowerCase();
  if (/discontinued|no longer available|retired/.test(text)) {
    return "discontinued";
  }

  return "";
};

const detectAvailability = (html: string): string => {
  const text = html.toLowerCase();
  if (/out of stock|sold out|unavailable/.test(text)) {
    return "limited";
  }

  return "";
};

export const loadManufacturerSites = (): ManufacturerSiteConfig[] => readSiteConfig();

export const resolveManufacturerTruth = async (
  brand: string,
  perfumeName: string,
  timeoutMs: number,
): Promise<ManufacturerTruthRecord | null> => {
  const normalizedBrand = normalize(brand);
  const normalizedPerfume = normalize(perfumeName);
  const site = readSiteConfig().find((entry) => normalize(entry.brand) === normalizedBrand) ?? null;
  if (!site) {
    return null;
  }

  const candidates = await searchManufacturerFragrances(site, 24, timeoutMs);
  const best =
    candidates.find((item) => normalize(item.perfumeName) === normalizedPerfume) ??
    candidates.find((item) => normalize(item.perfumeName).includes(normalizedPerfume)) ??
    candidates.find((item) => normalizedPerfume.includes(normalize(item.perfumeName))) ??
    null;

  if (!best) {
    return null;
  }

  let html = "";
  try {
    html = await fetchText(best.externalUrl, timeoutMs);
  } catch {
    return {
      source: best.source,
      externalUrl: best.externalUrl,
      perfumeName: best.perfumeName,
      brand: best.brand,
      launchYear: "",
      perfumer: "",
      availability: "",
      releaseStatus: "",
    };
  }

  return {
    source: best.source,
    externalUrl: best.externalUrl,
    perfumeName: best.perfumeName,
    brand: best.brand,
    launchYear: extractLaunchYear(html),
    perfumer: extractPerfumer(html),
    availability: detectAvailability(html),
    releaseStatus: detectReleaseStatus(html),
  };
};

export const searchManufacturerFragrances = async (
  site: ManufacturerSiteConfig,
  limit: number,
  timeoutMs: number,
): Promise<ManufacturerSnapshot[]> => {
  const sitemapPath = site.sitemapPath?.trim() || "/sitemap.xml";
  const sitemapUrl = `https://${site.domain}${sitemapPath.startsWith("/") ? sitemapPath : `/${sitemapPath}`}`;

  let xml = "";
  try {
    xml = await fetchText(sitemapUrl, timeoutMs);
  } catch {
    return [];
  }

  const urls = parseSitemapUrls(xml)
    .filter((url) => /perfume|fragrance|parfum/i.test(url))
    .slice(0, Math.max(1, limit * 4));

  const snapshots: ManufacturerSnapshot[] = [];
  const seen = new Set<string>();

  for (const url of urls) {
    const perfumeName = titleFromUrl(url);
    if (!perfumeName || seen.has(normalize(perfumeName))) {
      continue;
    }

    seen.add(normalize(perfumeName));
    snapshots.push({
      externalId: normalize(`${site.brand}:${perfumeName}`),
      externalUrl: url,
      perfumeName,
      brand: site.brand,
      confidence: scoreSnapshot(perfumeName, site.brand),
      fetchedAt: new Date().toISOString(),
      source: `Manufacturer (${site.domain})`,
    });

    if (snapshots.length >= limit) {
      break;
    }
  }

  return snapshots;
};
