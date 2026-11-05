import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { getMasterFragranceDatabase, isMasterFragranceDatabaseReadOnly, type MasterFragranceRecord } from "./masterFragranceDatabase";

export interface BlobImageAssignment {
  priority_rank: string;
  master_row_id: string;
  source_record_id: string;
  canonical_key: string;
  local_image_path: string;
  source_file_repo_relative: string;
  target_blob_key: string;
  image_size_bytes: string;
  image_sha256: string;
}

type Database = ReturnType<typeof getMasterFragranceDatabase>;

export function assertBlobUploadLimits(
  existing: Array<{ pathname: string; size: number; uploadedAt: Date }>,
  selected: BlobImageAssignment[],
  now = new Date(),
  plan: "hobby" | "pro" = "hobby",
): void {
  const keys = new Set(existing.map((blob) => blob.pathname));
  const newItems = [...new Map(selected.filter((item) => !keys.has(item.target_blob_key)).map((item) => [item.target_blob_key, item])).values()];
  const windowStart = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
  const recent = existing.filter((blob) => blob.uploadedAt >= windowStart).length;
  if (plan === "hobby" && recent + newItems.length > 1800) {
    throw new Error(`Free-tier safety limit: ${recent} existing uploads in the last 31 days plus ${newItems.length} new images exceeds 1800. Use a smaller cumulative --limit.`);
  }
  const bytes = existing.reduce((sum, blob) => sum + blob.size, 0)
    + newItems.reduce((sum, item) => sum + Number(item.image_size_bytes), 0);
  if (plan === "hobby" && bytes > 850_000_000) throw new Error("Existing store plus upload exceeds 850 MB.");
}

export function readBlobManifest(filename: string): BlobImageAssignment[] {
  const rows: unknown = parse(fs.readFileSync(filename), { columns: true, skip_empty_lines: true, bom: true });
  if (!Array.isArray(rows) || !rows.length) throw new Error("Empty Blob upload manifest.");
  const identities = new Set<string>();
  const keys = new Map<string, string>();
  const hashes = new Map<string, string>();
  return rows.map((row: Record<string, string>, index) => {
    for (const field of ["priority_rank", "master_row_id", "source_record_id", "canonical_key", "local_image_path",
      "source_file_repo_relative", "target_blob_key", "image_size_bytes", "image_sha256"]) {
      if (typeof row[field] !== "string" || !row[field].trim()) throw new Error(`Missing ${field} at manifest row ${index + 1}.`);
    }
    if (Number(row.priority_rank) !== index + 1 || !/^[1-9]\d*$/.test(row.master_row_id)
      || !/^[1-9]\d*$/.test(row.image_size_bytes) || !/^[a-f0-9]{64}$/.test(row.image_sha256)) {
      throw new Error(`Invalid rank, row ID, size or hash: ${row.source_record_id}`);
    }
    if (!/^public\/images\/perfumes\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(row.source_file_repo_relative)
      || row.local_image_path !== row.source_file_repo_relative.replace(/^public/, "")
      || !/^perfumes\/[a-z0-9-]+\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/.test(row.target_blob_key)) {
      throw new Error(`Unsafe or inconsistent image path: ${row.source_record_id}`);
    }
    const identity = `${row.canonical_key}\n${row.local_image_path}`;
    if (identities.has(identity)
      || (keys.has(row.target_blob_key) && keys.get(row.target_blob_key) !== row.image_sha256)
      || (hashes.has(row.image_sha256) && hashes.get(row.image_sha256) !== row.target_blob_key)) {
      throw new Error(`Duplicate identity, Blob key or image hash: ${row.source_record_id}`);
    }
    identities.add(identity);
    keys.set(row.target_blob_key, row.image_sha256);
    hashes.set(row.image_sha256, row.target_blob_key);
    return {
      priority_rank: row.priority_rank, master_row_id: row.master_row_id,
      source_record_id: row.source_record_id, canonical_key: row.canonical_key,
      local_image_path: row.local_image_path, source_file_repo_relative: row.source_file_repo_relative,
      target_blob_key: row.target_blob_key, image_size_bytes: row.image_size_bytes, image_sha256: row.image_sha256,
    };
  });
}

export function readVerifiedImage(assignment: BlobImageAssignment, root: string): Buffer {
  const filename = fs.realpathSync(path.join(root, ...assignment.source_file_repo_relative.split("/")));
  const imageRoot = fs.realpathSync(path.join(root, "public", "images", "perfumes")) + path.sep;
  if (!filename.startsWith(imageRoot)) throw new Error(`Image escapes library: ${assignment.source_record_id}`);
  const bytes = fs.readFileSync(filename);
  if (bytes.length !== Number(assignment.image_size_bytes)
    || createHash("sha256").update(bytes).digest("hex") !== assignment.image_sha256) {
    throw new Error(`Image size/hash mismatch: ${assignment.source_record_id}`);
  }
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!jpeg && !png && !webp) throw new Error(`Not a JPEG/PNG/WebP image: ${assignment.source_record_id}`);
  return bytes;
}

export function validateBlobAssignment(item: BlobImageAssignment, database: Database): void {
  const row = database.prepare(`
    SELECT f.canonical_key, f.local_image_path, f.record_id, e.source_record_id FROM fragrances f
    LEFT JOIN editorial_fragrances e ON e.row_id = f.row_id WHERE f.row_id = ?
  `).get(Number(item.master_row_id)) as { canonical_key: string; local_image_path: string; record_id: string; source_record_id: string | null } | undefined;
  if (!row || row.canonical_key !== item.canonical_key || (row.source_record_id ?? row.record_id) !== item.source_record_id
    || row.local_image_path !== item.local_image_path) {
    throw new Error(`Canonical/editorial/image mapping mismatch: ${item.source_record_id}`);
  }
}

export function saveBlobImage(item: BlobImageAssignment, url: string, database: Database): number {
  if (isMasterFragranceDatabaseReadOnly()) throw new Error("Cannot publish image mappings to a read-only database.");
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".public.blob.vercel-storage.com")
    || decodeURIComponent(parsed.pathname.slice(1)) !== item.target_blob_key) {
    throw new Error(`Unexpected public Blob URL: ${item.source_record_id}`);
  }
  return database.transaction(() => {
    validateBlobAssignment(item, database);
    const rows = database.prepare("SELECT row_id, record_json FROM fragrances WHERE canonical_key = ? AND local_image_path = ? ORDER BY row_id")
      .all(item.canonical_key, item.local_image_path) as Array<{ row_id: number; record_json: string }>;
    const save = database.prepare("UPDATE fragrances SET record_json = ? WHERE row_id = ?");
    for (const row of rows) {
      const record = JSON.parse(row.record_json) as MasterFragranceRecord;
      if (record.blobImageUrl && record.blobImageUrl !== url) throw new Error(`Refusing conflicting Blob URL: ${item.source_record_id}`);
      record.blobImageUrl = url;
      if (record.userDnaProfiles) {
        record.userDnaProfiles = record.userDnaProfiles.map((profile) => ({ ...profile, canonicalBlobImageUrl: url }));
      }
      save.run(JSON.stringify(record), row.row_id);
    }
    return rows.length;
  })();
}
