import "server-only";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

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

interface FragDbFragranceRow extends Record<string, string> {
  pid: string;
  url: string;
  brand: string;
  name: string;
  year: string;
  gender: string;
  main_photo: string;
  accords: string;
  notes_pyramid: string;
  perfumers: string;
  rating: string;
}

interface FragDbRecord {
  pid: string;
  url: string;
  brand: string;
  name: string;
  year: string;
  gender: string;
  imageUrl: string;
  accords: string[];
  notes: string[];
  perfumers: string[];
  rating: string;
  voteCount: string;
}

interface FragDbCache {
  loadedAt: number;
  mode: "local" | "remote-full" | "sample";
  records: FragDbRecord[];
}

const FRAGDB_REMOTE_FULL_CSV = "https://raw.githubusercontent.com/FragDB/fragrance-database/main/fragrances.csv";
const FRAGDB_REMOTE_SAMPLE_CSV = "https://raw.githubusercontent.com/FragDB/fragrance-database/main/samples/fragrances.csv";
const FRAGDB_LOCAL_DIR =
  process.env.FRAGDB_LOCAL_DIR ?? path.join(process.cwd(), "data", "fragdb");
const FRAGDB_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_FETCH_RETRIES = 3;

let cache: FragDbCache | null = null;

const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const wait = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const fetchText = async (url: string, timeoutMs: number): Promise<string> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_FETCH_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
        headers: {
          "user-agent": "FragranceDNA-FragDB-Connector/1.0",
          accept: "text/csv,text/plain;q=0.9,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`FragDB fetch failed ${response.status} for ${url}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown FragDB fetch error");
      if (attempt < MAX_FETCH_RETRIES - 1) {
        await wait(300 * Math.pow(2, attempt));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error(`FragDB fetch failed for ${url}`);
};

const parsePipeCsv = <T extends Record<string, string>>(content: string): T[] =>
  parse(content, {
    columns: true,
    delimiter: "|",
    quote: '"',
    relax_quotes: true,
    skip_empty_lines: true,
    bom: true,
  }) as T[];

const parseBrandName = (brandField: string): string => {
  const [name] = brandField.split(";");
  return name?.trim() ?? "";
};

const parsePerfumers = (value: string): string[] =>
  value
    .split(";")
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && !/^p\d+$/i.test(token));

const parseAccords = (value: string): string[] =>
  value
    .split(";")
    .map((token) => token.split(":")[0]?.trim() ?? "")
    .filter((token) => token.length > 0);

const parseNotes = (value: string): string[] => {
  const ids = value.match(/n\d+/gi) ?? [];
  return Array.from(new Set(ids.map((item) => item.toLowerCase())));
};

const parseRating = (value: string): { rating: string; voteCount: string } => {
  const [rating, votes] = value.split(";");
  return {
    rating: (rating ?? "").trim(),
    voteCount: (votes ?? "").trim(),
  };
};

const mapGender = (value: string): string => {
  const normalized = normalize(value);
  if (normalized.includes("women_and_men") || normalized.includes("unisex")) {
    return "unisex";
  }
  if (normalized.includes("for_women") || normalized.includes("female") || normalized.includes("women")) {
    return "feminine";
  }
  if (normalized.includes("for_men") || normalized.includes("male") || normalized.includes("men")) {
    return "masculine";
  }
  return "unknown";
};

const computeConfidence = (record: FragDbRecord): number => {
  let score = 0.55;
  if (record.name.length > 0) score += 0.1;
  if (record.brand.length > 0) score += 0.1;
  if (/^\d{4}$/.test(record.year)) score += 0.06;
  if (record.accords.length > 0) score += 0.06;
  if (record.notes.length > 0) score += 0.06;
  if (record.rating.length > 0) score += 0.04;
  return Number(Math.min(0.98, score).toFixed(2));
};

const toSnapshot = (record: FragDbRecord): FragranticaSnapshot => ({
  externalId: `fragdb-${record.pid}`,
  externalUrl: record.url,
  perfumeName: record.name,
  brand: record.brand,
  launchYear: record.year,
  perfumer: record.perfumers.join(", "),
  gender: mapGender(record.gender),
  mainAccords: record.accords,
  notes: record.notes,
  imageUrl: record.imageUrl,
  rating: record.rating,
  voteCount: record.voteCount,
  releaseStatus: "active",
  availability: "available",
  confidence: computeConfidence(record),
  fetchedAt: new Date().toISOString(),
  source: "FragDB",
});

const loadFragDbData = async (timeoutMs: number): Promise<FragDbRecord[]> => {
  const now = Date.now();
  if (cache && now - cache.loadedAt < FRAGDB_CACHE_TTL_MS) {
    return cache.records;
  }

  let fragrancesCsv: string;
  let mode: "local" | "remote-full" | "sample" = "sample";

  const localFragrancesPath = path.join(FRAGDB_LOCAL_DIR, "fragrances.csv");
  if (fs.existsSync(localFragrancesPath)) {
    fragrancesCsv = fs.readFileSync(localFragrancesPath, "utf-8");
    mode = "local";
  } else {
    try {
      fragrancesCsv = await fetchText(FRAGDB_REMOTE_FULL_CSV, timeoutMs);
      mode = "remote-full";
    } catch {
      fragrancesCsv = await fetchText(FRAGDB_REMOTE_SAMPLE_CSV, timeoutMs);
      mode = "sample";
    }
  }

  const parsed = parsePipeCsv<FragDbFragranceRow>(fragrancesCsv);
  const records: FragDbRecord[] = parsed
    .map((row) => {
      const rating = parseRating(row.rating ?? "");
      return {
        pid: (row.pid ?? "").trim(),
        url: (row.url ?? "").trim(),
        brand: parseBrandName(row.brand ?? ""),
        name: (row.name ?? "").trim(),
        year: (row.year ?? "").trim(),
        gender: (row.gender ?? "").trim(),
        imageUrl: (row.main_photo ?? "").trim(),
        accords: parseAccords(row.accords ?? ""),
        notes: parseNotes(row.notes_pyramid ?? ""),
        perfumers: parsePerfumers(row.perfumers ?? ""),
        rating: rating.rating,
        voteCount: rating.voteCount,
      };
    })
    .filter((row) => row.pid.length > 0 && row.name.length > 0 && row.brand.length > 0);

  cache = {
    loadedAt: now,
    mode,
    records,
  };

  return records;
};

export const getFragranticaDatasetStats = async (
  timeoutMs: number,
): Promise<{ totalRecords: number; mode: "local" | "remote-full" | "sample" }> => {
  const records = await loadFragDbData(timeoutMs);
  return {
    totalRecords: records.length,
    mode: cache?.mode ?? "sample",
  };
};

export const getCachedFragranticaDatasetStats = (): {
  totalRecords: number;
  mode: "local" | "remote-full" | "sample";
} | null => {
  if (!cache) {
    return null;
  }

  return {
    totalRecords: cache.records.length,
    mode: cache.mode,
  };
};

export const listFragranticaSnapshots = async (
  cursor: number,
  limit: number,
  timeoutMs: number,
): Promise<{
  items: FragranticaSnapshot[];
  nextCursor: number;
  totalRecords: number;
  wrapped: boolean;
  mode: "local" | "remote-full" | "sample";
}> => {
  const records = await loadFragDbData(timeoutMs);
  const totalRecords = records.length;
  if (totalRecords === 0) {
    return {
      items: [],
      nextCursor: 0,
      totalRecords: 0,
      wrapped: false,
      mode: cache?.mode ?? "sample",
    };
  }

  const safeLimit = Math.max(1, Math.min(limit, totalRecords));
  const start = ((cursor % totalRecords) + totalRecords) % totalRecords;
  const items: FragranticaSnapshot[] = [];
  for (let offset = 0; offset < safeLimit; offset += 1) {
    items.push(toSnapshot(records[(start + offset) % totalRecords]));
  }

  const nextCursor = (start + safeLimit) % totalRecords;
  return {
    items,
    nextCursor,
    totalRecords,
    wrapped: nextCursor <= start,
    mode: cache?.mode ?? "sample",
  };
};

export const getAllFragranticaSnapshots = async (
  timeoutMs: number,
): Promise<{ items: FragranticaSnapshot[]; mode: "local" | "remote-full" | "sample" }> => {
  const records = await loadFragDbData(timeoutMs);
  return {
    items: records.map((record) => toSnapshot(record)),
    mode: cache?.mode ?? "sample",
  };
};

export const fetchFragranticaSnapshot = async (
  pageUrl: string,
  timeoutMs: number,
): Promise<FragranticaSnapshot | null> => {
  const records = await loadFragDbData(timeoutMs);
  const normalizedUrl = normalize(pageUrl);

  const match = records.find((record) => normalize(record.url) === normalizedUrl);
  return match ? toSnapshot(match) : null;
};

export const searchFragranticaFragrances = async (
  query: string,
  limit: number,
  timeoutMs: number,
): Promise<FragranticaSnapshot[]> => {
  const records = await loadFragDbData(timeoutMs);
  const max = Math.max(1, limit);
  const normalizedQuery = normalize(query);
  const tokens = normalizedQuery.split(" ").filter((token) => token.length > 0);

  const scored = records
    .map((record) => {
      const normalizedName = normalize(record.name);
      const normalizedBrand = normalize(record.brand);
      const haystack = `${normalizedName} ${normalizedBrand}`;

      if (tokens.length === 0) {
        return { record, score: 1 };
      }

      let score = 0;
      if (normalizedName.includes(normalizedQuery)) score += 6;
      if (normalizedBrand.includes(normalizedQuery)) score += 4;

      for (const token of tokens) {
        if (normalizedName.includes(token)) score += 2;
        if (normalizedBrand.includes(token)) score += 1;
        if (haystack.includes(token)) score += 0.2;
      }

      const ratingValue = Number(record.rating || "0");
      if (Number.isFinite(ratingValue) && ratingValue > 0) {
        score += Math.min(1.5, ratingValue / 4);
      }

      return { record, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  return scored.slice(0, max).map((item) => toSnapshot(item.record));
};
