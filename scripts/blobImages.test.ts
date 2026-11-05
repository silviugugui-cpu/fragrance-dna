import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { test } from "node:test";
import Database from "better-sqlite3";
import { assertBlobUploadLimits, readBlobManifest, readVerifiedImage, saveBlobImage, validateBlobAssignment, type BlobImageAssignment } from "../lib/database/blobImages";
import { getPerfumeImageCandidates, resolvePerfumeImageSrc } from "../lib/design/perfumeImage";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "blob-image-test-"));
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE fragrances (row_id INTEGER PRIMARY KEY, canonical_key TEXT, local_image_path TEXT, record_json TEXT, record_id TEXT DEFAULT 'canonical-record');
    CREATE TABLE editorial_fragrances (row_id INTEGER, source_record_id TEXT);
  `);
  const bytes = Buffer.from([255, 216, 255, 224, 0, 0, 255, 217]);
  const item: BlobImageAssignment = {
    priority_rank: "1", master_row_id: "1", source_record_id: "editorial-9", canonical_key: "brand::perfume",
    local_image_path: "/images/perfumes/photo.jpg", source_file_repo_relative: "public/images/perfumes/photo.jpg",
    target_blob_key: "perfumes/brand/perfume--abc.jpg", image_size_bytes: String(bytes.length),
    image_sha256: createHash("sha256").update(bytes).digest("hex"),
  };
  fs.mkdirSync(path.join(root, "public", "images", "perfumes"), { recursive: true });
  fs.writeFileSync(path.join(root, ...item.source_file_repo_relative.split("/")), bytes);
  const original = {
    brand: "Brand", perfume: "Perfume", imageUrl: "https://example.com/original.jpg",
    localImagePath: item.local_image_path, badges: { olfactive: "reference" }, score: 93.45,
    userDnaProfiles: [{ testProfileId: "test", dna_axes: { Freshness: 70 }, canonicalLocalImagePath: item.local_image_path }],
  };
  db.prepare("INSERT INTO fragrances (row_id, canonical_key, local_image_path, record_json) VALUES (1, ?, ?, ?)").run(item.canonical_key, item.local_image_path, JSON.stringify(original));
  db.prepare("INSERT INTO fragrances (row_id, canonical_key, local_image_path, record_json) VALUES (2, ?, ?, ?)").run(item.canonical_key, item.local_image_path, JSON.stringify(original));
  db.prepare("INSERT INTO editorial_fragrances VALUES (1, ?)").run(item.source_record_id);
  const dispose = () => { db.close(); fs.rmSync(root, { recursive: true }); };
  return { root, db, bytes, item, original, dispose };
}

test("validates exact hashes and IDs before upload; rejects mismatch, unsafe paths and duplicate assets", () => {
  const f = fixture();
  try {
    assert.deepEqual(readVerifiedImage(f.item, f.root), f.bytes);
    validateBlobAssignment(f.item, f.db);
    assert.throws(() => readVerifiedImage({ ...f.item, image_sha256: "a".repeat(64) }, f.root), /hash mismatch/);
    assert.throws(() => validateBlobAssignment({ ...f.item, master_row_id: "2" }, f.db), /mapping mismatch/);
    assert.doesNotThrow(() => validateBlobAssignment({ ...f.item, master_row_id: "2", source_record_id: "canonical-record" }, f.db));
    assert.throws(() => validateBlobAssignment({ ...f.item, source_record_id: "wrong" }, f.db), /mapping mismatch/);
    const csv = path.join(f.root, "manifest.csv");
    const write = (rows: BlobImageAssignment[]) => fs.writeFileSync(csv, `${Object.keys(f.item).join(",")}\n${rows.map((row) => Object.values(row).join(",")).join("\n")}`);
    write([f.item]);
    assert.deepEqual(readBlobManifest(csv), [f.item]);
    write([f.item, { ...f.item, priority_rank: "2" }]);
    assert.throws(() => readBlobManifest(csv), /Duplicate/);
    write([f.item, { ...f.item, priority_rank: "2", canonical_key: "brand::second", master_row_id: "2" }]);
    assert.equal(readBlobManifest(csv).length, 2);
    write([f.item, { ...f.item, priority_rank: "2", canonical_key: "brand::second", image_sha256: "a".repeat(64) }]);
    assert.throws(() => readBlobManifest(csv), /Duplicate/);
    write([f.item, { ...f.item, priority_rank: "2", canonical_key: "brand::second", target_blob_key: "perfumes/brand/other.jpg" }]);
    assert.throws(() => readBlobManifest(csv), /Duplicate/);
    write([{ ...f.item, source_file_repo_relative: "public/images/perfumes/../../secret.jpg" }]);
    assert.throws(() => readBlobManifest(csv), /Unsafe/);
  } finally { f.dispose(); }
});

test("persists only verified Blob associations, preserves local paths, scores, badges, metadata and embedded DNA", () => {
  const f = fixture();
  try {
    const url = `https://store.public.blob.vercel-storage.com/${f.item.target_blob_key}`;
    assert.throws(() => saveBlobImage(f.item, "https://example.com/photo.jpg", f.db), /Unexpected/);
    assert.equal(saveBlobImage(f.item, url, f.db), 2);
    const rows = f.db.prepare("SELECT local_image_path, record_json FROM fragrances").all() as Array<{ local_image_path: string; record_json: string }>;
    for (const row of rows) {
      assert.equal(row.local_image_path, f.item.local_image_path);
      assert.deepEqual(JSON.parse(row.record_json), {
        ...f.original, blobImageUrl: url,
        userDnaProfiles: f.original.userDnaProfiles.map((profile) => ({ ...profile, canonicalBlobImageUrl: url })),
      });
    }
    assert.equal(saveBlobImage(f.item, url, f.db), 2);
    assert.deepEqual(f.db.prepare("SELECT local_image_path, record_json FROM fragrances").all(), rows);
    assert.throws(() => saveBlobImage(f.item, url.replace("store.public", "other.public"), f.db), /conflicting/);
  } finally { f.dispose(); }
});

test("Blob has priority but local and original remote candidates stay available as fallbacks", () => {
  const record = { blobImageUrl: "https://store.public.blob.vercel-storage.com/p.jpg", localImagePath: "/images/perfumes/local.jpg", imageUrl: "https://example.com/original.jpg" };
  const sources = getPerfumeImageCandidates(record);
  assert.deepEqual(sources, [record.blobImageUrl, record.localImagePath, record.imageUrl]);
  assert.equal(resolvePerfumeImageSrc(...sources).src, record.blobImageUrl);
  assert.equal(resolvePerfumeImageSrc(...sources.slice(1)).src, record.localImagePath);
});

test("free-tier guard enforces 1800 images per rolling 31 days and an 850 MB store ceiling", () => {
  const f = fixture();
  try {
    const now = new Date("2026-11-05T00:00:00Z");
    const items = Array.from({ length: 1800 }, (_, index) => ({ ...f.item, target_blob_key: `perfumes/brand/${index}.jpg` }));
    assert.doesNotThrow(() => assertBlobUploadLimits([], items, now));
    assert.throws(() => assertBlobUploadLimits([], [...items, { ...f.item, target_blob_key: "extra" }], now), /exceeds 1800/);
    const existing = items.map((item) => ({ pathname: item.target_blob_key, size: Number(item.image_size_bytes), uploadedAt: now }));
    assert.doesNotThrow(() => assertBlobUploadLimits(existing, items, now));
    assert.throws(() => assertBlobUploadLimits(existing, [f.item], now), /exceeds 1800/);
    assert.doesNotThrow(() => assertBlobUploadLimits(existing.map((item) => ({ ...item, uploadedAt: new Date("2026-10-01") })), [f.item], now));
    assert.throws(() => assertBlobUploadLimits([{ pathname: "other", size: 850_000_000, uploadedAt: now }], [f.item], now), /850 MB/);
    assert.doesNotThrow(() => assertBlobUploadLimits([], [...items, { ...f.item, target_blob_key: "extra" }], now, "pro"));
    assert.doesNotThrow(() => assertBlobUploadLimits([{ pathname: "other", size: 850_000_000, uploadedAt: now }], [f.item], now, "pro"));
  } finally { f.dispose(); }
});

test("full-catalog imports preserve distinct images on duplicate canonical rows and support WebP", () => {
  const f = fixture();
  try {
    const secondPath = "/images/perfumes/second.webp";
    f.db.prepare("UPDATE fragrances SET local_image_path = ? WHERE row_id = 2").run(secondPath);
    const url = `https://store.public.blob.vercel-storage.com/${f.item.target_blob_key}`;
    assert.equal(saveBlobImage(f.item, url, f.db), 1);
    const second = f.db.prepare("SELECT record_json FROM fragrances WHERE row_id = 2").get() as { record_json: string };
    assert.equal(JSON.parse(second.record_json).blobImageUrl, undefined);
    const webp = Buffer.from("RIFF0000WEBPVP8 ");
    const item = {
      ...f.item, master_row_id: "2", source_record_id: "canonical-record",
      local_image_path: secondPath, source_file_repo_relative: `public${secondPath}`,
      target_blob_key: "perfumes/catalog/second.webp", image_size_bytes: String(webp.length),
      image_sha256: createHash("sha256").update(webp).digest("hex"),
    };
    fs.writeFileSync(path.join(f.root, ...item.source_file_repo_relative.split("/")), webp);
    assert.deepEqual(readVerifiedImage(item, f.root), webp);
    assert.equal(saveBlobImage(item, `https://store.public.blob.vercel-storage.com/${item.target_blob_key}`, f.db), 1);
  } finally { f.dispose(); }
});
