import "server-only";
import fs from "node:fs";
import path from "node:path";

interface EnrichmentRecord {
  canonicalKey?: string;
  id?: string;
  name?: string;
  brand?: string;
  imageUrl?: string;
  launchYear?: string;
  perfumer?: string;
  localImagePath?: string;
  [key: string]: unknown;
}

interface EnrichmentPayload {
  generatedAt?: string;
  records?: EnrichmentRecord[];
  [key: string]: unknown;
}

interface GoogleCseItem {
  title?: string;
  snippet?: string;
  link?: string;
}

interface EnrichmentSourcePayload {
  webItems: GoogleCseItem[];
  imageItems: GoogleCseItem[];
  sourceUrl: string;
}

const ROOT = process.cwd();
const INPUT_PATH = path.join(ROOT, "data", "generated", "merged-fragdb-local-db.json");
const OUTPUT_PATH = path.join(ROOT, "data", "generated", "merged-fragdb-local-db.google-enriched.json");
const REPORT_PATH = path.join(ROOT, "data", "generated", "google-cse-enrichment-report.json");
const IMAGE_REPORT_PATH = path.join(ROOT, "data", "generated", "google-cse-image-download-report.json");
const LOCAL_IMAGES_DIR = path.join(ROOT, "public", "images", "perfumes");
const LOCAL_IMAGES_WEB_BASE = "/images/perfumes";

const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY ?? "";
const GOOGLE_CSE_CX = process.env.GOOGLE_CSE_CX ?? "";
const ENRICH_LIMIT = Math.max(1, Number.parseInt(process.env.GOOGLE_ENRICH_LIMIT ?? "200", 10) || 200);
const REQUEST_DELAY_MS = Math.max(0, Number.parseInt(process.env.GOOGLE_ENRICH_DELAY_MS ?? "150", 10) || 150);
const WIKIPEDIA_RETRIES = Math.max(0, Number.parseInt(process.env.WIKIPEDIA_RETRIES ?? "3", 10) || 3);

const normalize = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const isMissing = (value: unknown): boolean => normalize(value).length === 0;

const slugify = (value: unknown): string =>
  normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

const sleep = async (ms: number): Promise<void> => {
  if (ms <= 0) {
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const parseRetryAfterSeconds = (value: string | null): number => {
  if (!value) {
    return 0;
  }

  const seconds = Number.parseInt(value, 10);
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds;
  }

  return 0;
};

const fetchJsonWith429Retry = async <T>(url: string, userAgent: string): Promise<T> => {
  let attempt = 0;

  while (true) {
    const response = await fetch(url, {
      headers: {
        "user-agent": userAgent,
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.ok) {
      return (await response.json()) as T;
    }

    if (response.status !== 429 || attempt >= WIKIPEDIA_RETRIES) {
      throw new Error(`Wikipedia request failed ${response.status}`);
    }

    const retryAfter = parseRetryAfterSeconds(response.headers.get("retry-after"));
    const baseDelayMs = retryAfter > 0 ? retryAfter * 1000 : 1000;
    const backoffMs = baseDelayMs * (attempt + 1);
    await sleep(backoffMs);
    attempt += 1;
  }
};

const buildSearchUrl = (query: string, image: boolean): string => {
  const base = new URL("https://www.googleapis.com/customsearch/v1");
  base.searchParams.set("key", GOOGLE_CSE_API_KEY);
  base.searchParams.set("cx", GOOGLE_CSE_CX);
  base.searchParams.set("q", query);
  base.searchParams.set("num", "5");
  base.searchParams.set("safe", "active");
  base.searchParams.set("hl", "en");

  if (image) {
    base.searchParams.set("searchType", "image");
    base.searchParams.set("rights", "cc_publicdomain|cc_attribute|cc_sharealike");
  }

  return base.toString();
};

const fetchGoogleResults = async (query: string, image: boolean): Promise<GoogleCseItem[]> => {
  const response = await fetch(buildSearchUrl(query, image), {
    headers: {
      "user-agent": "FragranceDNA-Google-Enrichment/1.0",
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google CSE request failed ${response.status}`);
  }

  const payload = (await response.json()) as { items?: GoogleCseItem[] };
  return Array.isArray(payload.items) ? payload.items : [];
};

const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const fetchWikipediaFallback = async (query: string): Promise<EnrichmentSourcePayload> => {
  const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("list", "search");
  searchUrl.searchParams.set("srsearch", query);
  searchUrl.searchParams.set("srlimit", "1");
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("utf8", "1");

  const searchPayload = await fetchJsonWith429Retry<{
    query?: { search?: Array<{ pageid?: number; title?: string; snippet?: string }> };
  }>(searchUrl.toString(), "FragranceDNA-Wikipedia-Enrichment/1.0");

  const first = searchPayload.query?.search?.[0];
  if (!first?.pageid) {
    return { webItems: [], imageItems: [], sourceUrl: "" };
  }

  const detailUrl = new URL("https://en.wikipedia.org/w/api.php");
  detailUrl.searchParams.set("action", "query");
  detailUrl.searchParams.set("prop", "extracts|pageimages");
  detailUrl.searchParams.set("exintro", "1");
  detailUrl.searchParams.set("explaintext", "1");
  detailUrl.searchParams.set("piprop", "thumbnail");
  detailUrl.searchParams.set("pithumbsize", "800");
  detailUrl.searchParams.set("pageids", String(first.pageid));
  detailUrl.searchParams.set("format", "json");

  const detailPayload = await fetchJsonWith429Retry<{
    query?: {
      pages?: Record<
        string,
        {
          title?: string;
          extract?: string;
          thumbnail?: { source?: string };
        }
      >;
    };
  }>(detailUrl.toString(), "FragranceDNA-Wikipedia-Enrichment/1.0");

  const page = detailPayload.query?.pages?.[String(first.pageid)];
  const pageTitle = String(page?.title ?? first.title ?? "").trim();
  const pageSnippet = stripHtml(String(first.snippet ?? ""));
  const pageExtract = String(page?.extract ?? "").trim();
  const imageUrl = String(page?.thumbnail?.source ?? "").trim();
  const sourceUrl = `https://en.wikipedia.org/?curid=${first.pageid}`;

  const webItems: GoogleCseItem[] = [
    {
      title: pageTitle,
      snippet: `${pageSnippet}. ${pageExtract}`,
      link: sourceUrl,
    },
  ];

  const imageItems: GoogleCseItem[] = imageUrl
    ? [
        {
          title: `${pageTitle} image`,
          snippet: pageSnippet,
          link: imageUrl,
        },
      ]
    : [];

  return { webItems, imageItems, sourceUrl };
};

const extractYear = (items: GoogleCseItem[]): string => {
  for (const item of items) {
    const text = `${item.title ?? ""} ${item.snippet ?? ""}`;
    const candidates = text.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/g) ?? [];

    for (const token of candidates) {
      const value = Number.parseInt(token, 10);
      if (Number.isFinite(value) && value >= 1850 && value <= new Date().getFullYear()) {
        return String(value);
      }
    }
  }

  return "";
};

const extractPerfumer = (items: GoogleCseItem[]): string => {
  const patterns = [
    /(?:perfumer|nose)\s*(?:is|:|-)?\s*([A-Z][A-Za-z .'-]{2,60})/i,
    /created by\s+([A-Z][A-Za-z .'-]{2,60})/i,
  ];

  for (const item of items) {
    const text = `${item.title ?? ""}. ${item.snippet ?? ""}`;
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
  }

  return "";
};

const firstImageUrl = (items: GoogleCseItem[]): string => {
  for (const item of items) {
    const value = String(item.link ?? "").trim();
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }
  }
  return "";
};

const readPayload = (filePath: string): EnrichmentPayload => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as EnrichmentPayload;
};

const writeJson = (filePath: string, payload: unknown): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
};

const imageExtFromUrl = (value: string): string => {
  const match = value.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)(?:\?|$)/);
  if (!match) {
    return "jpg";
  }

  return match[1] === "jpeg" ? "jpg" : match[1];
};

const localImageFileName = (record: EnrichmentRecord): string => {
  const safeId = slugify(record.id ?? record.canonicalKey ?? "record") || "record";
  const safeName = slugify(`${record.brand ?? ""}-${record.name ?? ""}`) || "perfume";
  const ext = imageExtFromUrl(String(record.imageUrl ?? ""));
  return `${safeId}-${safeName}.${ext}`;
};

const isApprovedImageUrl = (url: string): boolean => {
  const parsed = (() => {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  })();

  if (!parsed) {
    return false;
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== "https:" && protocol !== "http:") {
    return false;
  }

  // Allow-list hosts that are common for product or openly indexed images.
  const hostname = parsed.hostname.toLowerCase();
  const allowed = [
    "fimgs.net",
    "fragrantica.com",
    "wikimedia.org",
    "upload.wikimedia.org",
    "unsplash.com",
    "images.unsplash.com",
  ];

  return allowed.some((host) => hostname === host || hostname.endsWith(`.${host}`));
};

export const runGoogleCseEnrichment = async (): Promise<{
  attemptedRecords: number;
  imageUpdated: number;
  launchYearUpdated: number;
  perfumerUpdated: number;
  failures: number;
  outputPath: string;
  reportPath: string;
}> => {
  const canUseGoogle = GOOGLE_CSE_API_KEY.length > 0 && GOOGLE_CSE_CX.length > 0;
  const source = canUseGoogle ? "google-cse" : "wikipedia-free";
  const effectiveDelayMs = canUseGoogle ? REQUEST_DELAY_MS : Math.max(REQUEST_DELAY_MS, 1200);

  const payload = readPayload(INPUT_PATH);
  const records = Array.isArray(payload.records) ? payload.records : [];

  const candidates = records
    .map((record, index) => ({ record, index }))
    .filter(
      ({ record }) => isMissing(record.imageUrl) || isMissing(record.launchYear) || isMissing(record.perfumer),
    )
    .slice(0, ENRICH_LIMIT);

  let imageUpdated = 0;
  let launchYearUpdated = 0;
  let perfumerUpdated = 0;
  let failures = 0;

  const rows: Array<Record<string, unknown>> = [];

  for (const { record, index } of candidates) {
    const queryBase = `${record.brand ?? ""} ${record.name ?? ""} perfume`;
    const report: Record<string, unknown> = {
      index,
      canonicalKey: record.canonicalKey ?? "",
      query: queryBase,
      imageUpdated: false,
      launchYearUpdated: false,
      perfumerUpdated: false,
      sourceUrl: "",
      error: "",
    };

    try {
      const payload = canUseGoogle
        ? {
            webItems: await fetchGoogleResults(`${queryBase} year perfumer`, false),
            imageItems: isMissing(record.imageUrl)
              ? await fetchGoogleResults(`${queryBase} bottle image`, true)
              : [],
            sourceUrl: "",
          }
        : await fetchWikipediaFallback(`${queryBase} year perfumer`);

      const webItems = payload.webItems;
      const imageItems = payload.imageItems;

      const year = isMissing(record.launchYear) ? extractYear(webItems) : "";
      const perfumer = isMissing(record.perfumer) ? extractPerfumer(webItems) : "";
      const imageUrl = isMissing(record.imageUrl) ? firstImageUrl(imageItems) : "";

      if (year) {
        record.launchYear = year;
        report.launchYearUpdated = true;
        launchYearUpdated += 1;
      }

      if (perfumer) {
        record.perfumer = perfumer;
        report.perfumerUpdated = true;
        perfumerUpdated += 1;
      }

      if (imageUrl) {
        record.imageUrl = imageUrl;
        report.imageUpdated = true;
        imageUpdated += 1;
      }

      report.sourceUrl = String(payload.sourceUrl || webItems[0]?.link || imageItems[0]?.link || "");
    } catch (error) {
      failures += 1;
      report.error = error instanceof Error ? error.message : "Unknown enrichment error";
    }

    rows.push(report);
    await sleep(effectiveDelayMs);
  }

  const output: EnrichmentPayload = {
    ...payload,
    generatedAt: new Date().toISOString(),
    enrichment: {
      source,
      attemptedRecords: candidates.length,
      imageUpdated,
      launchYearUpdated,
      perfumerUpdated,
      failures,
      limit: ENRICH_LIMIT,
      delayMs: effectiveDelayMs,
    },
    records,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    source,
    attemptedRecords: candidates.length,
    imageUpdated,
    launchYearUpdated,
    perfumerUpdated,
    failures,
    rows,
  };

  writeJson(OUTPUT_PATH, output);
  writeJson(REPORT_PATH, report);

  return {
    attemptedRecords: candidates.length,
    imageUpdated,
    launchYearUpdated,
    perfumerUpdated,
    failures,
    outputPath: OUTPUT_PATH,
    reportPath: REPORT_PATH,
  };
};

export const downloadApprovedEnrichedImages = async (): Promise<{
  attempted: number;
  downloaded: number;
  reused: number;
  failed: number;
  reportPath: string;
  outputPath: string;
}> => {
  const sourcePath = fs.existsSync(OUTPUT_PATH) ? OUTPUT_PATH : INPUT_PATH;
  const payload = readPayload(sourcePath);
  const records = Array.isArray(payload.records) ? payload.records : [];

  fs.mkdirSync(LOCAL_IMAGES_DIR, { recursive: true });

  let attempted = 0;
  let downloaded = 0;
  let reused = 0;
  let failed = 0;
  const rows: Array<Record<string, unknown>> = [];

  for (const record of records) {
    const imageUrl = String(record.imageUrl ?? "").trim();
    if (!imageUrl || !isApprovedImageUrl(imageUrl)) {
      continue;
    }

    attempted += 1;
    const fileName = `google-enriched--${localImageFileName(record)}`;
    const diskPath = path.join(LOCAL_IMAGES_DIR, fileName);
    const webPath = `${LOCAL_IMAGES_WEB_BASE}/${fileName}`;

    if (fs.existsSync(diskPath)) {
      record.localImagePath = webPath;
      reused += 1;
      rows.push({ canonicalKey: record.canonicalKey ?? "", status: "reused", localImagePath: webPath });
      continue;
    }

    try {
      const response = await fetch(imageUrl, {
        headers: {
          "user-agent": "FragranceDNA-Image-Downloader/1.0",
          accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`image fetch failed ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(diskPath, buffer);
      record.localImagePath = webPath;
      downloaded += 1;
      rows.push({ canonicalKey: record.canonicalKey ?? "", status: "downloaded", localImagePath: webPath });
    } catch (error) {
      failed += 1;
      rows.push({
        canonicalKey: record.canonicalKey ?? "",
        status: "failed",
        imageUrl,
        error: error instanceof Error ? error.message : "unknown",
      });
    }

    await sleep(REQUEST_DELAY_MS);
  }

  const output: EnrichmentPayload = {
    ...payload,
    generatedAt: new Date().toISOString(),
    imageLocalization: {
      source: "google-cse",
      attempted,
      downloaded,
      reused,
      failed,
      approvedHostsOnly: true,
    },
    records,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    source: "google-cse",
    attempted,
    downloaded,
    reused,
    failed,
    rows,
  };

  writeJson(OUTPUT_PATH, output);
  writeJson(IMAGE_REPORT_PATH, report);

  return {
    attempted,
    downloaded,
    reused,
    failed,
    reportPath: IMAGE_REPORT_PATH,
    outputPath: OUTPUT_PATH,
  };
};
