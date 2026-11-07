import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadEnvConfig } from "@next/env";
import { list, put, type ListBlobResultBlob } from "@vercel/blob";
import Database from "better-sqlite3";
import { getMasterFragranceDatabase, getMasterFragranceDatabasePath, isMasterFragranceDatabaseReadOnly, type MasterFragranceRecord } from "../lib/database/masterFragranceDatabase";

interface RepairImageRow {
  row_id: number;
  image_url: string;
  local_path: string;
  sha256: string;
}

interface ImageAssignment extends RepairImageRow {
  record_id: string;
  canonical_key: string;
  filename: string;
  size: number;
  extension: string;
  blobKey: string;
}

const imageDirectory = "images/repaired-catalog";

function blobKeyFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return undefined;
    return decodeURIComponent(parsed.pathname.slice(1));
  } catch {
    return undefined;
  }
}

function getImageFormat(bytes: Buffer, rowId: number): "jpg" | "png" | "webp" {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpg";
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  throw new Error(`Unsupported image format for repaired row ${rowId}.`);
}

async function inventory(): Promise<Map<string, ListBlobResultBlob>> {
  const blobs = new Map<string, ListBlobResultBlob>();
  let cursor: string | undefined;
  do {
    const result = await list({ limit: 1000, cursor });
    for (const blob of result.blobs) blobs.set(blob.pathname, blob);
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);
  return blobs;
}

function readVerifiedImage(item: ImageAssignment): Buffer {
  const bytes = fs.readFileSync(item.filename);
  if (bytes.length !== item.size || createHash("sha256").update(bytes).digest("hex") !== item.sha256) {
    throw new Error(`Image size/hash mismatch for repaired row ${item.row_id}.`);
  }
  if (getImageFormat(bytes, item.row_id) !== item.extension) {
    throw new Error(`Image extension/signature mismatch for repaired row ${item.row_id}.`);
  }
  return bytes;
}

async function verifyRemote(url: string, item: ImageAssignment): Promise<void> {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000), cache: "no-store" });
  if (!response.ok) throw new Error(`Blob verification HTTP ${response.status} for repaired row ${item.row_id}.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== item.size || createHash("sha256").update(bytes).digest("hex") !== item.sha256) {
    throw new Error(`Remote Blob size/hash mismatch for repaired row ${item.row_id}.`);
  }
}

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());
  const { values } = parseArgs({
    options: {
      "repair-db": { type: "string" },
      "public-root": { type: "string" },
      apply: { type: "boolean", default: false },
      "rights-confirmed": { type: "boolean", default: false },
      limit: { type: "string" },
    },
    strict: true,
  });
  if (!values["repair-db"] || !values["public-root"]) {
    throw new Error("Provide --repair-db and --public-root for the verified repair package.");
  }
  if (values.apply && !values["rights-confirmed"]) {
    throw new Error("Public upload requires --rights-confirmed.");
  }
  if (values.apply && isMasterFragranceDatabaseReadOnly()) {
    throw new Error("The canonical database must be writable.");
  }
  if (values.apply && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }

  const repairDb = new Database(path.resolve(values["repair-db"]), { readonly: true, fileMustExist: true });
  const database = getMasterFragranceDatabase();
  const imageRoot = fs.realpathSync(path.resolve(values["public-root"], imageDirectory));
  const images = repairDb.prepare(`
    SELECT row_id, image_url, local_path, sha256
    FROM repair_images ORDER BY row_id
  `).all() as RepairImageRow[];
  const findActive = database.prepare(`
    SELECT record_id, canonical_key, record_json
    FROM fragrances WHERE row_id = ?
  `);
  const findRepaired = repairDb.prepare(`
    SELECT record_id, canonical_key FROM fragrances WHERE row_id = ?
  `);
  const assignments: ImageAssignment[] = [];
  const skippedIdentityRows: number[] = [];

  try {
    for (const image of images) {
      if (!image.local_path.startsWith(`/${imageDirectory}/`) || !/^[a-f0-9]{64}$/.test(image.sha256)) {
        throw new Error(`Unsafe repair image mapping at row ${image.row_id}.`);
      }
      const active = findActive.get(image.row_id) as {
        record_id: string; canonical_key: string; record_json: string;
      } | undefined;
      const repaired = findRepaired.get(image.row_id) as {
        record_id: string; canonical_key: string;
      } | undefined;
      if (!active || !repaired || active.record_id !== repaired.record_id
        || active.canonical_key !== repaired.canonical_key) {
        skippedIdentityRows.push(image.row_id);
        continue;
      }

      const filename = fs.realpathSync(path.resolve(values["public-root"], `.${image.local_path}`));
      if (!filename.startsWith(`${imageRoot}${path.sep}`)) {
        throw new Error(`Repair image escapes its approved directory at row ${image.row_id}.`);
      }
      const sourceExtension = path.extname(filename).slice(1).toLowerCase();
      if (!["jpg", "jpeg", "png", "webp"].includes(sourceExtension)) {
        throw new Error(`Unsupported repair image extension at row ${image.row_id}.`);
      }
      const size = fs.statSync(filename).size;
      const extension = getImageFormat(fs.readFileSync(filename), image.row_id);
      const blobKey = `perfumes/catalog/${image.sha256}.${extension}`;
      const record = JSON.parse(active.record_json) as MasterFragranceRecord;
      if (record.blobImageUrl && blobKeyFromUrl(record.blobImageUrl) !== blobKey) {
        throw new Error(`Refusing to overwrite an existing Blob image for row ${image.row_id}.`);
      }
      const assignment = { ...image, record_id: active.record_id, canonical_key: active.canonical_key, filename, size, extension, blobKey };
      readVerifiedImage(assignment);
      assignments.push(assignment);
    }

    const limit = values.limit === undefined ? assignments.length : Number(values.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > assignments.length) {
      throw new Error("Invalid --limit.");
    }
    const selected = assignments.slice(0, limit);
    const objects = new Map<string, ImageAssignment>();
    const assignmentsByBlobKey = new Map<string, ImageAssignment[]>();
    for (const item of selected) {
      const existing = objects.get(item.blobKey);
      if (existing && existing.sha256 !== item.sha256) {
        throw new Error(`Conflicting hashes for Blob key ${item.blobKey}.`);
      }
      objects.set(item.blobKey, item);
      assignmentsByBlobKey.set(item.blobKey, [...(assignmentsByBlobKey.get(item.blobKey) ?? []), item]);
    }
    const totalBytes = [...objects.values()].reduce((sum, item) => sum + item.size, 0);
    console.log(JSON.stringify({
      mode: values.apply ? "apply" : "dry-run",
      plan: "pro",
      repairImages: images.length,
      safeAssignments: assignments.length,
      excludedIdentityRows: skippedIdentityRows.length,
      uniqueBlobObjects: objects.size,
      totalBytes,
      selectedRows: selected.length,
      selectedObjects: objects.size,
      excludedRowIds: skippedIdentityRows,
    }, null, 2));
    if (!values.apply) return;

    const existing = await inventory();
    const now = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${getMasterFragranceDatabasePath()}.before-repaired-blob-${now}.bak`;
    await database.backup(backupPath);

    const save = database.prepare("UPDATE fragrances SET record_json = ? WHERE row_id = ? AND record_id = ? AND canonical_key = ?");
    const errors: Array<{ rowId: number; error: string }> = [];
    let uploaded = 0;
    let reused = 0;
    let verifiedBytes = 0;
    const jobs = [...objects.values()];
    let next = 0;
    const worker = async () => {
      while (next < jobs.length) {
        const item = jobs[next++];
        try {
          const bytes = readVerifiedImage(item);
          const previous = existing.get(item.blobKey);
          if (previous && previous.size !== bytes.length) {
            throw new Error(`Existing Blob size conflict: ${item.blobKey}`);
          }
          const blob = previous ?? await put(item.blobKey, bytes, {
            access: "public",
            addRandomSuffix: false,
            allowOverwrite: false,
            contentType: item.extension === "webp" ? "image/webp" : item.extension === "png" ? "image/png" : "image/jpeg",
            cacheControlMaxAge: 31_536_000,
          });
          await verifyRemote(blob.url, item);
          const rows = assignmentsByBlobKey.get(item.blobKey) ?? [];
          database.transaction(() => {
            for (const assignment of rows) {
              const active = findActive.get(assignment.row_id) as {
                record_id: string; canonical_key: string; record_json: string;
              } | undefined;
              if (!active || active.record_id !== assignment.record_id
                || active.canonical_key !== assignment.canonical_key) {
                throw new Error(`Canonical identity changed for row ${assignment.row_id}.`);
              }
              const record = JSON.parse(active.record_json) as MasterFragranceRecord;
              if (record.blobImageUrl && blobKeyFromUrl(record.blobImageUrl) !== item.blobKey) {
                throw new Error(`Refusing to replace a different Blob URL for row ${assignment.row_id}.`);
              }
              record.blobImageUrl = blob.url;
              if (record.userDnaProfiles) {
                record.userDnaProfiles = record.userDnaProfiles.map((profile) => ({
                  ...profile,
                  canonicalBlobImageUrl: blob.url,
                }));
              }
              const result = save.run(JSON.stringify(record), assignment.row_id, assignment.record_id, assignment.canonical_key);
              if (result.changes !== 1) throw new Error(`Failed to save Blob mapping for row ${assignment.row_id}.`);
            }
          })();
          if (previous) reused++; else uploaded++;
          verifiedBytes += bytes.length;
          if ((uploaded + reused) % 100 === 0) {
            console.log(JSON.stringify({ verifiedObjects: uploaded + reused, uploaded, reused }));
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push({ rowId: item.row_id, error: message });
          console.error(JSON.stringify({ rowId: item.row_id, error: message }));
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(16, jobs.length) }, worker));
    const finalInventory = await inventory();
    const verifiedObjects = jobs.filter((item) => finalInventory.has(item.blobKey)).length;
    const summary = {
      repairImages: images.length,
      selectedRows: selected.length,
      uniqueObjects: jobs.length,
      uploaded,
      reused,
      verifiedObjects,
      verifiedBytes,
      expectedBytes: totalBytes,
      errors,
      excludedIdentityRows: skippedIdentityRows,
      backupPath,
      plan: "pro",
      completedAt: new Date().toISOString(),
    };
    fs.writeFileSync(
      path.join(process.cwd(), "data", "generated", "vercel-blob-repaired-catalog-summary.json"),
      JSON.stringify(summary, null, 2),
    );
    console.log(JSON.stringify(summary, null, 2));
    if (errors.length || verifiedObjects !== jobs.length || verifiedBytes !== totalBytes) {
      throw new Error("Blob upload verification incomplete; inspect the summary and rerun to resume safely.");
    }
  } finally {
    repairDb.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
