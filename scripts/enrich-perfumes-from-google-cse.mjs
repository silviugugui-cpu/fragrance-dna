import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INPUT_PATH = path.join(ROOT, "data", "generated", "merged-fragdb-local-db.json");
const REPORT_PATH = path.join(ROOT, "data", "generated", "google-cse-enrichment-report.json");
const OUTPUT_PATH = path.join(ROOT, "data", "generated", "merged-fragdb-local-db.google-enriched.json");

const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY ?? "";
const GOOGLE_CSE_CX = process.env.GOOGLE_CSE_CX ?? "";
const ENRICH_LIMIT = Math.max(1, Number.parseInt(process.env.GOOGLE_ENRICH_LIMIT ?? "200", 10) || 200);
const REQUEST_DELAY_MS = Math.max(0, Number.parseInt(process.env.GOOGLE_ENRICH_DELAY_MS ?? "150", 10) || 150);
const WIKIPEDIA_RETRIES = Math.max(0, Number.parseInt(process.env.WIKIPEDIA_RETRIES ?? "3", 10) || 3);

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const isMissing = (value) => normalize(value).length === 0;

const sleep = async (ms) => {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const parseRetryAfterSeconds = (value) => {
  if (!value) return 0;
  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
};

const fetchJsonWith429Retry = async ({ url, userAgent }) => {
  let attempt = 0;

  while (true) {
    const response = await fetch(url, {
      headers: {
        "user-agent": userAgent,
        accept: "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
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

const buildSearchUrl = ({ query, image }) => {
  const base = new URL("https://www.googleapis.com/customsearch/v1");
  base.searchParams.set("key", GOOGLE_CSE_API_KEY);
  base.searchParams.set("cx", GOOGLE_CSE_CX);
  base.searchParams.set("q", query);
  base.searchParams.set("num", "5");
  base.searchParams.set("safe", "active");
  base.searchParams.set("hl", "en");

  if (image) {
    base.searchParams.set("searchType", "image");
    // Prefer images with permissive licenses where possible.
    base.searchParams.set("rights", "cc_publicdomain|cc_attribute|cc_sharealike");
  }

  return base.toString();
};

const fetchGoogleResults = async ({ query, image }) => {
  const url = buildSearchUrl({ query, image });
  const response = await fetch(url, {
    headers: {
      "user-agent": "FragranceDNA-Google-Enrichment/1.0",
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Google CSE request failed ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload.items) ? payload.items : [];
};

const stripHtml = (value) => String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const fetchWikipediaFallback = async ({ query }) => {
  const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("list", "search");
  searchUrl.searchParams.set("srsearch", query);
  searchUrl.searchParams.set("srlimit", "1");
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("utf8", "1");

  const searchPayload = await fetchJsonWith429Retry({
    url: searchUrl.toString(),
    userAgent: "FragranceDNA-Wikipedia-Enrichment/1.0",
  });
  const first = searchPayload?.query?.search?.[0];
  if (!first?.pageid) {
    return { webItems: [], imageItems: [] };
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

  const detailPayload = await fetchJsonWith429Retry({
    url: detailUrl.toString(),
    userAgent: "FragranceDNA-Wikipedia-Enrichment/1.0",
  });
  const page = detailPayload?.query?.pages?.[String(first.pageid)] ?? {};
  const pageTitle = String(page.title ?? first.title ?? "").trim();
  const pageSnippet = stripHtml(String(first.snippet ?? ""));
  const pageExtract = String(page.extract ?? "").trim();
  const imageUrl = String(page?.thumbnail?.source ?? "").trim();
  const sourceUrl = `https://en.wikipedia.org/?curid=${first.pageid}`;

  const webItems = [
    {
      title: pageTitle,
      snippet: `${pageSnippet}. ${pageExtract}`,
      link: sourceUrl,
    },
  ];

  const imageItems = imageUrl
    ? [
        {
          title: `${pageTitle} image`,
          snippet: pageSnippet,
          link: imageUrl,
        },
      ]
    : [];

  return { webItems, imageItems };
};

const extractYear = (items) => {
  for (const item of items) {
    const text = `${item.title ?? ""} ${item.snippet ?? ""}`;
    const matches = text.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/g) ?? [];
    const year = matches
      .map((token) => Number.parseInt(token, 10))
      .find((value) => Number.isFinite(value) && value >= 1850 && value <= new Date().getFullYear());

    if (year) {
      return String(year);
    }
  }

  return "";
};

const extractPerfumer = (items) => {
  const patterns = [
    /(?:perfumer|nose)\s*(?:is|:|-)?\s*([A-Z][A-Za-z .'-]{2,60})/i,
    /created by\s+([A-Z][A-Za-z .'-]{2,60})/i,
  ];

  for (const item of items) {
    const text = `${item.title ?? ""}. ${item.snippet ?? ""}`;

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const candidate = match[1].trim();
        if (candidate.length >= 3) {
          return candidate;
        }
      }
    }
  }

  return "";
};

const firstImageUrl = (items) => {
  for (const item of items) {
    const link = String(item.link ?? "").trim();
    if (link.startsWith("http://") || link.startsWith("https://")) {
      return link;
    }
  }

  return "";
};

const main = async () => {
  const canUseGoogle = GOOGLE_CSE_API_KEY.length > 0 && GOOGLE_CSE_CX.length > 0;
  const source = canUseGoogle ? "google-cse" : "wikipedia-free";
  const effectiveDelayMs = canUseGoogle ? REQUEST_DELAY_MS : Math.max(REQUEST_DELAY_MS, 1200);

  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(`Input file not found: ${INPUT_PATH}`);
  }

  const input = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  const records = Array.isArray(input.records) ? input.records : [];

  const candidates = records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => isMissing(record.imageUrl) || isMissing(record.launchYear) || isMissing(record.perfumer))
    .slice(0, ENRICH_LIMIT);

  const reportRows = [];
  let enrichedImage = 0;
  let enrichedYear = 0;
  let enrichedPerfumer = 0;
  let failures = 0;

  for (const { record, index } of candidates) {
    const queryBase = `${record.brand ?? ""} ${record.name ?? ""} perfume`;
    const reportItem = {
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
            webItems: await fetchGoogleResults({ query: `${queryBase} notes year perfumer`, image: false }),
            imageItems: isMissing(record.imageUrl)
              ? await fetchGoogleResults({ query: `${queryBase} bottle image`, image: true })
              : [],
          }
        : await fetchWikipediaFallback({ query: `${queryBase} notes year perfumer` });

      const webItems = payload.webItems;
      const imageItems = payload.imageItems;

      const detectedYear = isMissing(record.launchYear) ? extractYear(webItems) : "";
      const detectedPerfumer = isMissing(record.perfumer) ? extractPerfumer(webItems) : "";
      const detectedImage = isMissing(record.imageUrl) ? firstImageUrl(imageItems) : "";

      if (detectedYear) {
        record.launchYear = detectedYear;
        reportItem.launchYearUpdated = true;
        enrichedYear += 1;
      }

      if (detectedPerfumer) {
        record.perfumer = detectedPerfumer;
        reportItem.perfumerUpdated = true;
        enrichedPerfumer += 1;
      }

      if (detectedImage) {
        record.imageUrl = detectedImage;
        reportItem.imageUpdated = true;
        enrichedImage += 1;
      }

      reportItem.sourceUrl = String(webItems[0]?.link ?? imageItems[0]?.link ?? "");
    } catch (error) {
      failures += 1;
      reportItem.error = error instanceof Error ? error.message : "Unknown enrichment error";
    }

    reportRows.push(reportItem);
    await sleep(effectiveDelayMs);
  }

  const output = {
    ...input,
    generatedAt: new Date().toISOString(),
    enrichment: {
      source,
      attemptedRecords: candidates.length,
      imageUpdated: enrichedImage,
      launchYearUpdated: enrichedYear,
      perfumerUpdated: enrichedPerfumer,
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
    imageUpdated: enrichedImage,
    launchYearUpdated: enrichedYear,
    perfumerUpdated: enrichedPerfumer,
    failures,
    rows: reportRows,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(
    JSON.stringify(
      {
        reportPath: REPORT_PATH,
        outputPath: OUTPUT_PATH,
        ...report,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
