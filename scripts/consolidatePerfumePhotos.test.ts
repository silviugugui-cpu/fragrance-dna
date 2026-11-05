import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import Database from "better-sqlite3";
import { normalizePerfumeImagePath } from "../lib/design/perfumeImage";

const script = path.join(process.cwd(), "scripts", "consolidatePerfumePhotos.ts");
const tsx = path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");

for (const scenario of ["success", "conflict", "missing"] as const) {
  test(`photo consolidation: ${scenario}`, () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "perfume-consolidation-"));
    const databasePath = path.join(directory, "data", "generated", "fragrancedna.sqlite");
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    const database = new Database(databasePath);
    try {
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
      for (const source of ["master-db", "product-photos"]) {
        const folder = path.join(directory, "public", "images", source);
        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(path.join(folder, "same.jpg"), source);
      }
      const previous = "/images/master-db/same.jpg";
      const current = "/images/perfumes/master-db--same.jpg";
      const record = {
        brand: "Brand", perfume: "Perfume", imageUrl: "https://example.com/image.jpg",
        localImagePath: previous,
        userDnaProfiles: [{ canonicalLocalImagePath: previous, dna_axes: { Warmth: 75 } }],
      };
      database.prepare(`
        INSERT INTO fragrances (record_id, canonical_key, brand, perfume, local_image_path, record_json)
        VALUES ('id', 'key', 'Brand', 'Perfume', ?, ?)
      `).run(previous, JSON.stringify(record));
      const reference = path.join(path.dirname(databasePath), "product-photo-import-report.json");
      fs.writeFileSync(reference, JSON.stringify({ localImagePath: previous, notes: "Keep provenance" }));
      if (scenario === "conflict") {
        const target = path.join(directory, "public", "images", "perfumes");
        fs.mkdirSync(target);
        fs.writeFileSync(path.join(target, "master-db--same.jpg"), "different");
      }
      if (scenario === "missing") fs.unlinkSync(path.join(directory, "public", "images", "master-db", "same.jpg"));
      const run = (apply: boolean) => spawnSync(process.execPath, [
        tsx, script, ...(apply ? ["--apply"] : []),
      ], {
        cwd: directory, encoding: "utf8", timeout: 30000,
        env: { ...process.env, FRAGRANCEDNA_SQLITE_PATH: databasePath, FRAGRANCEDNA_SQLITE_READONLY: "false", VERCEL: "" },
      });
      if (scenario !== "success") {
        const result = run(true);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /Conflicting destination|Missing source image/);
        assert.equal(database.prepare<[], { image: string }>("SELECT local_image_path AS image FROM fragrances").get()?.image, previous);
        assert.equal(fs.readFileSync(reference, "utf8"), JSON.stringify({ localImagePath: previous, notes: "Keep provenance" }));
        return;
      }
      const preview = run(false);
      assert.equal(preview.status, 0, preview.stderr);
      assert.equal(fs.existsSync(path.join(directory, "public", "images", "perfumes")), false);
      const applied = run(true);
      assert.equal(applied.status, 0, applied.stderr);
      const row = database.prepare<[], { image: string; json: string }>(
        "SELECT local_image_path AS image, record_json AS json FROM fragrances",
      ).get();
      assert.equal(row?.image, current);
      assert.deepEqual(JSON.parse(row?.json ?? ""), {
        ...record, localImagePath: current,
        userDnaProfiles: [{ canonicalLocalImagePath: current, dna_axes: { Warmth: 75 } }],
      });
      assert.deepEqual(JSON.parse(fs.readFileSync(reference, "utf8")), { localImagePath: current, notes: "Keep provenance" });
      for (const source of ["master-db", "product-photos"]) {
        assert.equal(fs.existsSync(path.join(directory, "public", "images", source)), false);
        assert.equal(fs.readFileSync(path.join(directory, "public", "images", "perfumes", `${source}--same.jpg`), "utf8"), source);
      }
      const repeated = run(true);
      assert.equal(repeated.status, 0, repeated.stderr);
      assert.equal(JSON.parse(repeated.stdout).files, 0);
      assert.ok(fs.readdirSync(path.dirname(databasePath)).some((name) => name.includes(".before-photo-consolidation-")));
    } finally {
      database.close();
      fs.rmSync(directory, { recursive: true });
    }
  });
}

test("cached legacy photo paths resolve to the consolidated library", () => {
  assert.equal(normalizePerfumeImagePath("/images/master-db/photo.jpg"), "/images/perfumes/master-db--photo.jpg");
  assert.equal(normalizePerfumeImagePath("/images/product-photos/photo.png"), "/images/perfumes/product-photos--photo.png");
  assert.equal(normalizePerfumeImagePath("/images/perfumes/photo.jpg"), "/images/perfumes/photo.jpg");
  assert.equal(normalizePerfumeImagePath("https://example.com/photo.jpg"), "https://example.com/photo.jpg");
  assert.equal(normalizePerfumeImagePath("/Background/photo.jpg"), "/Background/photo.jpg");
});
