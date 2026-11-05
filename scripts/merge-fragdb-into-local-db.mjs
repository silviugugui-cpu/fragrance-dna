import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const ROOT = process.cwd();
const LOCAL_DB_PATH = path.join(ROOT, "data", "generated", "complete-fragrance-database.json");
const OUTPUT_PATH = path.join(ROOT, "data", "generated", "merged-fragdb-local-db.json");
const FRAGDB_LOCAL_PATH = path.join(ROOT, "data", "fragdb", "fragrances.csv");
const FRAGDB_FULL_URL = "https://raw.githubusercontent.com/FragDB/fragrance-database/main/fragrances.csv";
const FRAGDB_SAMPLE_URL = "https://raw.githubusercontent.com/FragDB/fragrance-database/main/samples/fragrances.csv";
const LOCAL_IMAGES_DIR = path.join(ROOT, "public", "images", "perfumes");
const LOCAL_IMAGES_WEB_BASE = "/images/perfumes";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const canonicalKey = (brand, name) => `${normalize(brand)}::${normalize(name)}`;

const slugify = (value) =>
  normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

const imageExtFromUrl = (value) => {
  const url = String(value ?? "").trim().toLowerCase();
  const match = url.match(/\.(jpg|jpeg|png|webp|gif)(?:\?|$)/i);
  if (!match) {
    return "jpg";
  }

  return match[1] === "jpeg" ? "jpg" : match[1].toLowerCase();
};

const fileSafeSegment = (value, fallback) => {
  const result = slugify(value);
  return result.length > 0 ? result : fallback;
};

const imageFileNameForRecord = (record) => {
  const left = fileSafeSegment(record.id, "fragdb");
  const right = fileSafeSegment(`${record.brand}-${record.name}`, "fragrance");
  const ext = imageExtFromUrl(record.imageUrl);
  return `${left}-${right}.${ext}`;
};

const downloadFragDbImages = async (records) => {
  fs.mkdirSync(LOCAL_IMAGES_DIR, { recursive: true });

  const stats = {
    eligible: 0,
    downloaded: 0,
    reused: 0,
    failed: 0,
  };

  for (const record of records) {
    if (record.source !== "FRAGDB" || normalize(record.imageUrl).length === 0) {
      continue;
    }

    stats.eligible += 1;
    const fileName = `fragdb--${imageFileNameForRecord(record)}`;
    const localFsPath = path.join(LOCAL_IMAGES_DIR, fileName);
    const localWebPath = `${LOCAL_IMAGES_WEB_BASE}/${fileName}`;

    if (fs.existsSync(localFsPath)) {
      record.localImagePath = localWebPath;
      stats.reused += 1;
      continue;
    }

    try {
      const response = await fetch(record.imageUrl, {
        headers: {
          "user-agent": "FragranceDNA-Merge-Utility/1.0",
          accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`Image fetch failed ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(localFsPath, buffer);
      record.localImagePath = localWebPath;
      stats.downloaded += 1;
    } catch (_error) {
      stats.failed += 1;
    }
  }

  return stats;
};

const loadLocalDb = () => {
  const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  const records = Array.isArray(parsed) ? parsed : parsed.records;
  if (!Array.isArray(records)) {
    throw new Error("Canonical local DB does not contain a records array.");
  }

  return records.map((item) => ({
    id: String(item.id ?? item.canonicalKey ?? ""),
    name: String(item.perfume ?? item.name ?? "").trim(),
    brand: String(item.brand ?? "").trim(),
    notes: Array.isArray(item.notes) ? item.notes.map((n) => String(n)) : [],
    source: String(item.source ?? "local-db"),
  }));
};

const fetchFragDbCsv = async () => {
  if (fs.existsSync(FRAGDB_LOCAL_PATH)) {
    return {
      mode: "local",
      csv: fs.readFileSync(FRAGDB_LOCAL_PATH, "utf-8"),
    };
  }

  const headers = {
    "user-agent": "FragranceDNA-Merge-Utility/1.0",
    accept: "text/csv,text/plain;q=0.9,*/*;q=0.8",
  };

  try {
    const fullResponse = await fetch(FRAGDB_FULL_URL, { headers });
    if (fullResponse.ok) {
      return {
        mode: "remote-full",
        csv: await fullResponse.text(),
      };
    }
  } catch {
    // Fall through to sample fallback.
  }

  const sampleResponse = await fetch(FRAGDB_SAMPLE_URL, { headers });
  if (!sampleResponse.ok) {
    throw new Error(`Failed to fetch FragDB sample: ${sampleResponse.status}`);
  }

  return {
    mode: "sample",
    csv: await sampleResponse.text(),
  };
};

const parseFragDb = (csv) => {
  const rows = parse(csv, {
    columns: true,
    delimiter: "|",
    quote: '"',
    relax_quotes: true,
    skip_empty_lines: true,
    bom: true,
  });

  return rows
    .map((row) => {
      const brandField = String(row.brand ?? "");
      const brand = brandField.split(";")[0]?.trim() ?? "";
      const name = String(row.name ?? "").trim();
      if (!brand || !name) {
        return null;
      }

      const noteIds = (String(row.notes_pyramid ?? "").match(/n\d+/gi) ?? []).map((n) => n.toLowerCase());
      const uniqueNotes = Array.from(new Set(noteIds));

      return {
        id: `fragdb-${String(row.pid ?? "").trim() || slugify(`${brand}-${name}`)}`,
        name,
        brand,
        notes: uniqueNotes,
        source: "FRAGDB",
        externalUrl: String(row.url ?? "").trim(),
        imageUrl: String(row.main_photo ?? "").trim(),
        launchYear: String(row.year ?? "").trim(),
        gender: String(row.gender ?? "").trim(),
        rating: String(row.rating ?? "").trim(),
      };
    })
    .filter(Boolean);
};

const mergePreferFragDb = (localDbRows, fragDbRows) => {
  const merged = new Map();
  let duplicatesResolvedForFragDb = 0;

  for (const row of localDbRows) {
    merged.set(canonicalKey(row.brand, row.name), row);
  }

  for (const row of fragDbRows) {
    const key = canonicalKey(row.brand, row.name);
    if (merged.has(key)) {
      duplicatesResolvedForFragDb += 1;
    }
    merged.set(key, row);
  }

  const records = Array.from(merged.entries())
    .map(([key, row]) => ({
      canonicalKey: key,
      ...row,
    }))
    .sort((a, b) => a.canonicalKey.localeCompare(b.canonicalKey));

  return {
    records,
    duplicatesResolvedForFragDb,
  };
};

const main = async () => {
  const localDbRows = loadLocalDb();
  const fragDbPayload = await fetchFragDbCsv();
  const fragDbRows = parseFragDb(fragDbPayload.csv);
  const merged = mergePreferFragDb(localDbRows, fragDbRows);
  const imageDownloadStats = await downloadFragDbImages(merged.records);
  const fragDbWithImages = fragDbRows.filter((row) => normalize(row.imageUrl).length > 0).length;
  const combinedWithImages = merged.records.filter((row) => normalize(row.imageUrl).length > 0).length;
  const combinedWithLocalImages = merged.records.filter((row) => normalize(row.localImagePath).length > 0).length;

  const output = {
    generatedAt: new Date().toISOString(),
    mergePolicy: "dedupe by canonicalKey (brand+name), keep FRAGDB on duplicates",
    fragDbMode: fragDbPayload.mode,
    totalLocalDbRecords: localDbRows.length,
    totalFragDbRecords: fragDbRows.length,
    fragDbRecordsWithImage: fragDbWithImages,
    duplicatesResolvedInFavorOfFragDb: merged.duplicatesResolvedForFragDb,
    totalCombinedRecords: merged.records.length,
    combinedRecordsWithImage: combinedWithImages,
    combinedRecordsWithLocalImage: combinedWithLocalImages,
    imageDownloadStats,
    records: merged.records,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(JSON.stringify({
    outputPath: OUTPUT_PATH,
    ...output,
  }, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
