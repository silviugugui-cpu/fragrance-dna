import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getMasterFragranceDatabase } from "../lib/database/masterFragranceDatabase";
import { readBlobManifest, type BlobImageAssignment } from "../lib/database/blobImages";

const root = process.cwd();
const previousPath = path.join(root, "data", "generated", "vercel-blob-olfactive-score-manifest.csv");
const previous = fs.existsSync(previousPath) ? readBlobManifest(previousPath) : [];
const keysByHash = new Map(previous.map((item) => [item.image_sha256, item.target_blob_key]));
const database = getMasterFragranceDatabase();
const rows = database.prepare(`
  SELECT f.row_id, f.record_id, f.canonical_key, f.local_image_path, f.record_json, e.source_record_id
  FROM fragrances f LEFT JOIN editorial_fragrances e ON e.row_id = f.row_id
  WHERE f.local_image_path <> '' ORDER BY f.row_id
`).all() as Array<{ row_id: number; record_id: string; canonical_key: string; local_image_path: string; record_json: string; source_record_id: string | null }>;
const unique = new Map<string, BlobImageAssignment>();
const assets = new Map<string, { hash: string; size: number; extension: string }>();
for (const row of rows) {
  if (!/^\/images\/perfumes\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(row.local_image_path)) {
    throw new Error(`Unsupported local path: ${row.record_id}`);
  }
  let asset = assets.get(row.local_image_path);
  if (!asset) {
    const bytes = fs.readFileSync(path.join(root, "public", ...row.local_image_path.slice(1).split("/")));
    asset = { hash: createHash("sha256").update(bytes).digest("hex"), size: bytes.length, extension: bytes[0] === 255 ? "jpg" : bytes.toString("ascii", 0, 4) === "RIFF" ? "webp" : "png" };
    assets.set(row.local_image_path, asset);
  }
  const record = JSON.parse(row.record_json) as { blobImageUrl?: string };
  const assignedKey = record.blobImageUrl ? decodeURIComponent(new URL(record.blobImageUrl).pathname.slice(1)) : undefined;
  const existingKey = keysByHash.get(asset.hash);
  if (assignedKey && existingKey && assignedKey !== existingKey) throw new Error(`Conflicting existing Blob: ${row.record_id}`);
  if (assignedKey) keysByHash.set(asset.hash, assignedKey);
}
for (const row of rows) {
  const asset = assets.get(row.local_image_path);
  if (!asset) throw new Error(`Missing verified asset: ${row.record_id}`);
  const key = keysByHash.get(asset.hash) ?? `perfumes/catalog/${asset.hash}.${asset.extension}`;
  keysByHash.set(asset.hash, key);
  const item: BlobImageAssignment = {
    priority_rank: String(unique.size + 1), master_row_id: String(row.row_id),
    source_record_id: row.source_record_id ?? row.record_id, canonical_key: row.canonical_key,
    local_image_path: row.local_image_path, source_file_repo_relative: `public${row.local_image_path}`,
    target_blob_key: key, image_size_bytes: String(asset.size), image_sha256: asset.hash,
  };
  const identity = `${row.canonical_key}\n${row.local_image_path}`;
  if (!unique.has(identity)) unique.set(identity, item);
}
const items = [...unique.values()];
if (!items.length) throw new Error("No database-associated local images found.");
const columns = Object.keys(items[0]);
const csv = [columns.join(","), ...items.map((item) => columns.map((field) => `"${String(item[field as keyof BlobImageAssignment]).replace(/"/g, '""')}"`).join(","))].join("\n") + "\n";
const output = path.join(root, "data", "generated", "vercel-blob-full-catalog-manifest.csv");
fs.writeFileSync(output, csv);
const verified = readBlobManifest(output);
const objects = new Map(verified.map((item) => [item.target_blob_key, Number(item.image_size_bytes)]));
console.log(JSON.stringify({ canonicalRows: rows.length, fragranceIdentities: verified.length, uniqueObjects: objects.size, totalBytes: [...objects.values()].reduce((a, b) => a + b, 0), output }));
