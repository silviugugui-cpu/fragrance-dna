import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const outputPath = process.argv[2];
if (!outputPath || path.extname(outputPath).toLowerCase() !== ".sqlite") {
  throw new Error("Usage: npx tsx scripts/exportMissingFragranceImages.ts OUTPUT.sqlite");
}
const destination = path.resolve(outputPath);
if (fs.existsSync(destination)) throw new Error(`Refusing to overwrite ${destination}`);
if (!fs.existsSync(path.dirname(destination))) throw new Error("Output directory does not exist.");

const sourcePath = process.env.FRAGRANCEDNA_SQLITE_PATH
  ? path.resolve(process.env.FRAGRANCEDNA_SQLITE_PATH)
  : path.join(process.cwd(), "data", "generated", "fragrancedna.sqlite");
const source = new Database(sourcePath, { readonly: true, fileMustExist: true });
const output = new Database(destination);

try {
  output.exec(`
    CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE fragrances (
      canonical_key TEXT PRIMARY KEY,
      record_ids_json TEXT NOT NULL,
      brand TEXT NOT NULL,
      perfume TEXT NOT NULL,
      brand_type TEXT NOT NULL,
      launch_year TEXT NOT NULL,
      reference_url TEXT NOT NULL,
      search_query TEXT NOT NULL,
      image_url TEXT NOT NULL DEFAULT '',
      image_source_url TEXT NOT NULL DEFAULT '',
      image_rights_note TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX idx_export_category_brand ON fragrances(brand_type, brand, perfume);
  `);
  const rows = source.prepare(`
    SELECT f.canonical_key,
      json_group_array(DISTINCT f.record_id) AS record_ids_json,
      f.brand, f.perfume, f.brand_type, f.launch_year,
      COALESCE(json_extract(f.record_json, '$.externalUrl'), '') AS reference_url,
      f.brand || ' ' || f.perfume || ' perfume bottle official product image' AS search_query
    FROM fragrances f
    WHERE lower(trim(f.brand_type)) IN ('niche', 'designer', 'dupe/middle eastern')
      AND trim(f.image_url) = '' AND trim(f.local_image_path) = ''
      AND NOT EXISTS (
        SELECT 1 FROM fragrances pictured
        WHERE pictured.canonical_key = f.canonical_key
          AND (trim(pictured.image_url) <> '' OR trim(pictured.local_image_path) <> '')
      )
    GROUP BY f.canonical_key
    ORDER BY f.brand_type, f.brand COLLATE NOCASE, f.perfume COLLATE NOCASE, f.row_id
  `).all();
  const insert = output.prepare(`
    INSERT INTO fragrances (
      canonical_key, record_ids_json, brand, perfume, brand_type,
      launch_year, reference_url, search_query
    ) VALUES (
      @canonical_key, @record_ids_json, @brand, @perfume, @brand_type,
      @launch_year, @reference_url, @search_query
    )
  `);
  output.transaction(() => {
    for (const row of rows) insert.run(row);
    const meta = output.prepare("INSERT INTO metadata (key, value) VALUES (?, ?)");
    meta.run("exported_at", new Date().toISOString());
    meta.run("selection", "Niche, Designer, Dupe/Middle Eastern; both image fields empty; exclude canonical identities with any existing image; one row per canonical_key.");
    meta.run("instructions", "Find authentic product photos, preferably official brand sources. Fill image_url, image_source_url and image_rights_note. Keep canonical_key and record_ids_json unchanged. Do not invent URLs; leave unknowns empty. Public availability does not grant redistribution rights; record licensing or permission.");
    meta.run("excluded", "Unclassified N/A brands; personal/user data; source descriptions; records with an existing image reference.");
  })();
  const integrity = output.pragma("integrity_check", { simple: true });
  if (integrity !== "ok") throw new Error(`SQLite integrity check failed: ${String(integrity)}`);
  console.log(JSON.stringify({
    file: destination,
    count: output.prepare("SELECT count(*) AS total FROM fragrances").get(),
    categories: output.prepare("SELECT brand_type, count(*) AS total FROM fragrances GROUP BY brand_type").all(),
    integrity,
  }, null, 2));
} finally {
  output.close();
  source.close();
}
