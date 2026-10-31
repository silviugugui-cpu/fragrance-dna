import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadEnvConfig } from "@next/env";
import {
  getMasterFragranceDatabase,
  getMasterFragranceDatabasePath,
  isMasterFragranceDatabaseReadOnly,
  updateMasterFragranceLocalImage,
} from "../lib/database/masterFragranceDatabase";

interface TransferRecord {
  fragrance_id: string;
  brand: string;
  perfume: string;
  image_file: string;
  image_url: string;
  source_page: string;
  notes: string;
}

interface MatchedRow {
  row_id: number;
  brand: string;
  perfume: string;
  local_image_path: string;
}

const normalizeIdentity = (value: string): string =>
  value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

const readManifest = (directory: string): TransferRecord[] => {
  const manifest: unknown = JSON.parse(fs.readFileSync(path.join(directory, "manifest.json"), "utf8"));
  if (!manifest || typeof manifest !== "object"
    || !("schema_version" in manifest) || manifest.schema_version !== 1
    || !("records" in manifest) || !Array.isArray(manifest.records)
    || !("record_count" in manifest) || manifest.record_count !== manifest.records.length
    || manifest.records.length === 0) {
    throw new Error("Invalid or empty schema v1 photo manifest.");
  }

  const ids = new Set<string>();
  return manifest.records.map((value: unknown) => {
    if (!value || typeof value !== "object") throw new Error("Invalid manifest record.");
    const record = value as Record<string, unknown>;
    const text = (field: string): string => {
      const fieldValue = record[field];
      if (typeof fieldValue !== "string") throw new Error(`Invalid manifest field: ${field}`);
      return fieldValue;
    };
    const item: TransferRecord = {
      fragrance_id: text("fragrance_id"),
      brand: text("brand"),
      perfume: text("perfume"),
      image_file: text("image_file"),
      image_url: text("image_url"),
      source_page: text("source_page"),
      notes: text("notes"),
    };
    if (!item.fragrance_id.trim() || !item.brand.trim() || !item.perfume.trim()) {
      throw new Error("Manifest fragrance identity must not be empty.");
    }
    if (ids.has(item.fragrance_id)) throw new Error(`Duplicate fragrance ID: ${item.fragrance_id}`);
    ids.add(item.fragrance_id);
    return item;
  });
};

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());
  const { values } = parseArgs({
    options: { input: { type: "string" }, apply: { type: "boolean", default: false } },
    strict: true,
    allowPositionals: false,
  });
  if (!values.input) throw new Error("Usage: --input EXTRACTED_TRANSFER_DIRECTORY [--apply]");
  const inputDirectory = fs.realpathSync(path.resolve(values.input));
  const records = readManifest(inputDirectory);
  const database = getMasterFragranceDatabase();
  const find = database.prepare(`
    SELECT row_id, brand, perfume, local_image_path FROM fragrances
    WHERE record_id = ? OR canonical_key = ?
  `);
  const countRows = (): number =>
    (database.prepare("SELECT COUNT(*) AS count FROM fragrances").get() as { count: number }).count;
  const rowCountBefore = countRows();
  const matchedRowIds = new Set<number>();
  const assets = new Map<string, { bytes: Buffer; destination: string }>();
  const publicDirectory = path.join(process.cwd(), "public", "images", "product-photos");
  const assignments = records.map((record) => {
    if (!/^images\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png)$/i.test(record.image_file)) {
      throw new Error(`Unsafe or unsupported image path: ${record.image_file}`);
    }
    const sourcePath = fs.realpathSync(path.join(inputDirectory, ...record.image_file.split("/")));
    if (!sourcePath.startsWith(`${inputDirectory}${path.sep}`)) {
      throw new Error(`Image escapes transfer directory: ${record.image_file}`);
    }
    const bytes = fs.readFileSync(sourcePath);
    const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isJpeg = bytes.length > 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    if (!isPng && !isJpeg) throw new Error(`Invalid JPEG/PNG image: ${record.image_file}`);
    const digest = createHash("sha256").update(bytes).digest("hex");
    const filename = `${digest}.${isPng ? "png" : "jpg"}`;
    const localImagePath = `/images/product-photos/${filename}`;
    const destination = path.join(publicDirectory, filename);
    if (fs.existsSync(destination) && !fs.readFileSync(destination).equals(bytes)) {
      throw new Error(`Conflicting local asset: ${destination}`);
    }
    assets.set(filename, { bytes, destination });

    const rows = find.all(record.fragrance_id, record.fragrance_id) as MatchedRow[];
    if (rows.length === 0) throw new Error(`No canonical match for: ${record.fragrance_id}`);
    for (const row of rows) {
      if (normalizeIdentity(row.brand) !== normalizeIdentity(record.brand)
        || normalizeIdentity(row.perfume) !== normalizeIdentity(record.perfume)) {
        throw new Error(`Brand/perfume mismatch for: ${record.fragrance_id}`);
      }
      if (matchedRowIds.has(row.row_id)) throw new Error(`Ambiguous row assignment: ${row.row_id}`);
      matchedRowIds.add(row.row_id);
      if (row.local_image_path && row.local_image_path !== localImagePath) {
        throw new Error(`Refusing to overwrite an existing local image: ${record.fragrance_id}`);
      }
    }
    return { ...record, localImagePath, sha256: digest, rowIds: rows.map((row) => row.row_id) };
  });

  const summary = {
    mode: values.apply ? "apply" : "dry-run",
    fragranceAssociations: assignments.length,
    canonicalRows: matchedRowIds.size,
    uniqueFiles: assets.size,
    totalBytes: [...assets.values()].reduce((total, asset) => total + asset.bytes.length, 0),
    rowCountBefore,
  };
  if (!values.apply) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }
  if (isMasterFragranceDatabaseReadOnly()) throw new Error("Cannot import into a read-only database.");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${getMasterFragranceDatabasePath()}.before-product-photos-${timestamp}.bak`;
  await database.backup(backupPath);
  fs.mkdirSync(publicDirectory, { recursive: true });
  for (const { bytes, destination } of assets.values()) {
    if (!fs.existsSync(destination)) fs.writeFileSync(destination, bytes, { flag: "wx" });
  }
  database.transaction(() => {
    for (const assignment of assignments) {
      const currentRows = find.all(assignment.fragrance_id, assignment.fragrance_id) as MatchedRow[];
      if (currentRows.length !== assignment.rowIds.length
        || currentRows.some((row) => !assignment.rowIds.includes(row.row_id)
          || normalizeIdentity(row.brand) !== normalizeIdentity(assignment.brand)
          || normalizeIdentity(row.perfume) !== normalizeIdentity(assignment.perfume)
          || (row.local_image_path && row.local_image_path !== assignment.localImagePath))) {
        throw new Error(`Canonical record changed during import: ${assignment.fragrance_id}`);
      }
      const updated = updateMasterFragranceLocalImage(assignment.fragrance_id, assignment.localImagePath);
      if (updated !== assignment.rowIds.length) throw new Error(`Incomplete update: ${assignment.fragrance_id}`);
    }
    if (countRows() !== rowCountBefore) throw new Error("Import unexpectedly changed the fragrance count.");
  })();

  const reportPath = path.join(process.cwd(), "data", "generated", "product-photo-import-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({
    ...summary,
    importedAt: new Date().toISOString(),
    backupPath,
    rowCountAfter: countRows(),
    records: assignments,
  }, null, 2));
  console.log(JSON.stringify({ ...summary, backupPath, reportPath }, null, 2));
}

main().catch((error: unknown) => {
  console.error(`[import-product-photos] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
