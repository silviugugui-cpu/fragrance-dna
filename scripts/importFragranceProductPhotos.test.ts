import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import Database from "better-sqlite3";

const root = process.cwd();
const script = path.join(root, "scripts", "importFragranceProductPhotos.ts");
const tsx = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");
const image = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  "base64",
);

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "fragrance-photo-import-"));
  const input = path.join(directory, "transfer");
  const databasePath = path.join(directory, "data", "generated", "fragrancedna.sqlite");
  fs.mkdirSync(path.join(input, "images"), { recursive: true });
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  fs.writeFileSync(path.join(input, "images", "photo.png"), image);
  const record = {
    fragrance_id: "brand::perfume",
    brand: "Brand",
    perfume: "Perfume",
    image_file: "images/photo.png",
    image_url: "https://example.com/photo.png",
    source_page: "https://example.com/perfume",
    notes: "Supplied photograph",
  };
  const saveManifest = (records = [record]) =>
    fs.writeFileSync(path.join(input, "manifest.json"), JSON.stringify({
      schema_version: 1, record_count: records.length, records,
    }));
  saveManifest();
  const database = new Database(databasePath);
  database.exec(`
    CREATE TABLE fragrances (
      row_id INTEGER PRIMARY KEY, record_id TEXT NOT NULL, canonical_key TEXT NOT NULL,
      brand TEXT NOT NULL, brand_type TEXT NOT NULL DEFAULT 'Niche', perfume TEXT NOT NULL,
      launch_year TEXT NOT NULL DEFAULT '', rating TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '',
      local_image_path TEXT NOT NULL DEFAULT '', user_dna_test_enabled INTEGER NOT NULL DEFAULT 0,
      record_json TEXT NOT NULL
    );
  `);
  const original = {
    id: record.fragrance_id, brand: record.brand, perfume: record.perfume,
    imageUrl: "https://example.com/existing.png",
    userDnaProfiles: [{ testProfileId: "test-profile", canonicalLocalImagePath: "" }],
  };
  database.prepare(`
    INSERT INTO fragrances (record_id, canonical_key, brand, perfume, image_url, record_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(record.fragrance_id, record.fragrance_id, record.brand, record.perfume,
    original.imageUrl, JSON.stringify(original));

  const run = (apply = true) => spawnSync(process.execPath, [
    tsx, script, "--input", input, ...(apply ? ["--apply"] : []),
  ], {
    cwd: directory,
    env: { ...process.env, FRAGRANCEDNA_SQLITE_PATH: databasePath, FRAGRANCEDNA_SQLITE_READONLY: "false", VERCEL: "" },
    encoding: "utf8",
    timeout: 30000,
  });
  return {
    directory, database, record, saveManifest, run,
    cleanup: () => { database.close(); fs.rmSync(directory, { recursive: true }); },
  };
}

test("dry-run, canonical import, provenance, backup and idempotent reimport", () => {
  const fixtureData = fixture();
  const { directory, database, run } = fixtureData;
  try {
    const dryRun = run(false);
    assert.equal(dryRun.status, 0, dryRun.stderr);
    assert.equal(fs.existsSync(path.join(directory, "public")), false);
    assert.equal(database.prepare<[], { path: string }>("SELECT local_image_path AS path FROM fragrances").get()?.path, "");

    const applied = run();
    assert.equal(applied.status, 0, applied.stderr);
    const row = database.prepare("SELECT local_image_path, image_url, record_json FROM fragrances").get() as {
      local_image_path: string; image_url: string; record_json: string;
    };
    const record = JSON.parse(row.record_json);
    assert.match(row.local_image_path, /^\/images\/product-photos\/[a-f0-9]{64}\.png$/);
    assert.equal(record.localImagePath, row.local_image_path);
    assert.equal(record.userDnaProfiles[0].canonicalLocalImagePath, row.local_image_path);
    assert.equal(row.image_url, "https://example.com/existing.png");
    assert.deepEqual(fs.readFileSync(path.join(directory, "public", row.local_image_path)), image);
    const report = JSON.parse(fs.readFileSync(
      path.join(directory, "data", "generated", "product-photo-import-report.json"), "utf8",
    ));
    assert.equal(report.records[0].source_page, "https://example.com/perfume");
    const backup = new Database(report.backupPath, { readonly: true });
    try {
      assert.equal(backup.prepare<[], { path: string }>("SELECT local_image_path AS path FROM fragrances").get()?.path, "");
    } finally { backup.close(); }
    const repeated = run();
    assert.equal(repeated.status, 0, repeated.stderr);
    assert.equal(fs.readdirSync(path.join(directory, "public", "images", "product-photos")).length, 1);
    assert.equal(database.prepare<[], { count: number }>("SELECT COUNT(*) AS count FROM fragrances").get()?.count, 1);
  } finally { fixtureData.cleanup(); }
});

for (const scenario of ["missing-id", "wrong-brand", "unsafe-path", "duplicate-id", "existing-image", "invalid-image"] as const) {
  test(`rejects ${scenario} before changing canonical image associations`, () => {
    const fixtureData = fixture();
    const { directory, database, record, saveManifest, run } = fixtureData;
    try {
      if (scenario === "missing-id") saveManifest([record, { ...record, fragrance_id: "missing::perfume" }]);
      if (scenario === "wrong-brand") saveManifest([{ ...record, brand: "Wrong brand" }]);
      if (scenario === "unsafe-path") saveManifest([{ ...record, image_file: "../photo.png" }]);
      if (scenario === "duplicate-id") saveManifest([record, record]);
      if (scenario === "existing-image") database.prepare("UPDATE fragrances SET local_image_path = '/images/existing.png'").run();
      if (scenario === "invalid-image") fs.writeFileSync(path.join(directory, "transfer", "images", "photo.png"), "invalid");
      const before = database.prepare("SELECT record_json, local_image_path FROM fragrances").get();
      const result = run();
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /\[import-product-photos\]/);
      assert.deepEqual(database.prepare("SELECT record_json, local_image_path FROM fragrances").get(), before);
      assert.equal(fs.existsSync(path.join(directory, "public")), false);
    } finally { fixtureData.cleanup(); }
  });
}
