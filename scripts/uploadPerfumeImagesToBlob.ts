import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadEnvConfig } from "@next/env";
import { list, put, type ListBlobResultBlob } from "@vercel/blob";
import { assertBlobUploadLimits, readBlobManifest, readVerifiedImage, saveBlobImage, validateBlobAssignment, type BlobImageAssignment } from "../lib/database/blobImages";
import { getMasterFragranceDatabase, getMasterFragranceDatabasePath, isMasterFragranceDatabaseReadOnly } from "../lib/database/masterFragranceDatabase";

const CAPACITY_BYTES = 850_000_000;

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

async function verifyRemote(url: string, item: BlobImageAssignment): Promise<void> {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000), cache: "no-store" });
  if (!response.ok) throw new Error(`Blob verification HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== Number(item.image_size_bytes)
    || createHash("sha256").update(bytes).digest("hex") !== item.image_sha256) {
    throw new Error("Remote Blob size/hash does not match the manifest.");
  }
}

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());
  const { values } = parseArgs({
    options: {
      input: { type: "string", default: "data/generated/vercel-blob-olfactive-score-manifest.csv" },
      apply: { type: "boolean", default: false },
      "rights-confirmed": { type: "boolean", default: false },
      limit: { type: "string" },
      plan: { type: "string", default: "hobby" },
    },
    strict: true,
  });
  const root = process.cwd();
  const items = readBlobManifest(path.resolve(values.input ?? "data/generated/vercel-blob-olfactive-score-manifest.csv"));
  const database = getMasterFragranceDatabase();
  if (values.plan !== "hobby" && values.plan !== "pro") throw new Error("Invalid --plan; expected hobby or pro.");
  const plan = values.plan;
  const uniqueObjects = new Map(items.map((item) => [item.target_blob_key, Number(item.image_size_bytes)]));
  const totalBytes = [...uniqueObjects.values()].reduce((sum, bytes) => sum + bytes, 0);
  if (plan === "hobby" && totalBytes > CAPACITY_BYTES) throw new Error("Manifest exceeds the 850 MB operational limit.");
  for (const item of items) {
    validateBlobAssignment(item, database);
    readVerifiedImage(item, root);
  }
  const limit = values.limit === undefined ? items.length : Number(values.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > items.length) throw new Error("Invalid --limit.");
  console.log(JSON.stringify({ validatedImages: items.length, uniqueObjects: uniqueObjects.size, totalBytes, selected: limit, plan, mode: values.apply ? "apply" : "dry-run" }));
  if (!values.apply) return;
  if (!values["rights-confirmed"]) throw new Error("Public upload requires --rights-confirmed.");
  if (isMasterFragranceDatabaseReadOnly()) throw new Error("The canonical database must be writable.");
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  const selected = items.slice(0, limit);
  const existing = await inventory();
  assertBlobUploadLimits([...existing.values()], selected, new Date(), plan);
  const groups = new Map<string, BlobImageAssignment[]>();
  for (const item of selected) groups.set(item.target_blob_key, [...(groups.get(item.target_blob_key) ?? []), item]);
  const jobs = [...groups.values()];
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await database.backup(`${getMasterFragranceDatabasePath()}.before-blob-${timestamp}.bak`);
  const reportPath = path.join(root, "data", "generated", "vercel-blob-upload-events.jsonl");
  const errors: Array<{ sourceRecordId: string; error: string }> = [];
  let next = 0;
  let uploaded = 0;
  let reused = 0;
  let verifiedBytes = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const assignments = jobs[next++];
      const item = assignments[0];
      try {
        const bytes = readVerifiedImage(item, root);
        const previous = existing.get(item.target_blob_key);
        if (previous && previous.size !== bytes.length) throw new Error("Existing Blob size conflict; refusing overwrite.");
        const blob = previous ?? await put(item.target_blob_key, bytes, {
          access: "public", addRandomSuffix: false, allowOverwrite: false,
          contentType: bytes[0] === 255 ? "image/jpeg" : bytes.toString("ascii", 0, 4) === "RIFF" ? "image/webp" : "image/png",
          cacheControlMaxAge: 31_536_000,
        });
        await verifyRemote(blob.url, item);
        for (const assignment of assignments) {
          const canonicalRows = saveBlobImage(assignment, blob.url, database);
          fs.appendFileSync(reportPath, `${JSON.stringify({
            sourceRecordId: assignment.source_record_id, canonicalKey: assignment.canonical_key, url: blob.url,
            sha256: assignment.image_sha256, bytes: bytes.length, canonicalRows, reused: Boolean(previous), verifiedAt: new Date().toISOString(),
          })}\n`);
        }
        if (previous) reused++; else uploaded++;
        verifiedBytes += bytes.length;
        if ((uploaded + reused) % 100 === 0) console.log(JSON.stringify({ verified: uploaded + reused, uploaded, reused, errors: errors.length }));
      } catch (error: unknown) {
        const entry = { sourceRecordId: item.source_record_id, error: error instanceof Error ? error.message : String(error) };
        errors.push(entry);
        console.error(JSON.stringify(entry));
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(plan === "pro" ? 16 : 6, jobs.length) }, worker));
  const finalInventory = await inventory();
  const selectedBlobs = jobs.map(([item]) => finalInventory.get(item.target_blob_key)).filter((blob) => blob !== undefined);
  const finalBytes = selectedBlobs.reduce((sum, blob) => sum + blob.size, 0);
  const expectedBytes = jobs.reduce((sum, [item]) => sum + Number(item.image_size_bytes), 0);
  const summary = {
    manifestImages: items.length, selected: selected.length, uploaded, reused, verifiedBytes,
    objects: selectedBlobs.length, objectBytes: finalBytes, expectedBytes, errors,
    storeObjects: finalInventory.size,
    plan, monthlyImageLimit: plan === "hobby" ? 1800 : null,
    storeBytes: [...finalInventory.values()].reduce((sum, blob) => sum + blob.size, 0),
    completedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(root, "data", "generated", "vercel-blob-upload-summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  if (errors.length || selectedBlobs.length !== jobs.length || finalBytes !== expectedBytes || verifiedBytes !== expectedBytes) {
    throw new Error("Blob upload verification incomplete; inspect the summary and rerun to resume safely.");
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
