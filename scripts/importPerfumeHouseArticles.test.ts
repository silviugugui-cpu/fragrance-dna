import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import Database from "better-sqlite3";
import { gunzipSync } from "node:zlib";
import { BADGE_CODES, BADGE_FAMILIES, badgeLevel, parseBadgeFilters, matchesBadgeFilters } from "../lib/fragranceBadges";
import { badgesFromColumns } from "../lib/database/fragranceBadgeStorage";
import { getDictionary } from "../lib/i18n/getDictionary";
import { LOCALES } from "../lib/i18n/config";

const root = process.cwd();
const script = path.join(root, "scripts", "importPerfumeHouseArticles.ts");
const tsx = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "house-articles-import-"));
  const databasePath = path.join(directory, "data", "generated", "fragrancedna.sqlite");
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
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
    id: "brand::perfume", canonicalKey: "brand::perfume", brand: "Brand", perfume: "Perfume",
    launchYear: "1990", perfumer: "Existing Perfumer", description: "Old description",
    notes: ["citrus", "musk", "woods"], imageUrl: "https://example.com/remote.jpg",
    localImagePath: "/images/perfumes/old.jpg", userDnaTestEnabled: true,
    userDnaProfiles: [{ testProfileId: "test", dna_axes: { Freshness: 70 }, canonicalLocalImagePath: "/images/perfumes/old.jpg" }],
  };
  database.prepare(`
    INSERT INTO fragrances (record_id, canonical_key, brand, perfume, launch_year, image_url, local_image_path, user_dna_test_enabled, record_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(original.id, original.canonicalKey, original.brand, original.perfume,
    original.launchYear, original.imageUrl, original.localImagePath, JSON.stringify(original));
  database.prepare(`
    INSERT INTO fragrances (record_id, canonical_key, brand, perfume, record_json)
    VALUES ('outside::perfume', 'outside::perfume', 'Outside', 'Perfume', ?)
  `).run(JSON.stringify({ id: "outside::perfume", brand: "Outside", perfume: "Perfume", notes: ["citrus", "musk", "woods"] }));
  const sourcePath = path.join(directory, "source.sqlite");
  const source = new Database(sourcePath);
  source.exec(fs.readFileSync(path.join(root, "docs", "PERFUME_HOUSE_ARTICLES_SCHEMA.sql"), "utf8")
    .replace("CREATE TABLE sqlite_sequence(name,seq);", ""));
  source.prepare(`
    INSERT INTO brands (
      brand_id, brand_name, selection_category, official_site_status, representative_perfume_name,
      catalog_completeness_status, editorial_description_ro, match_variants_json, created_date
    ) VALUES ('brand', 'Brand', 'Designer', 'needs_review', 'Perfume', 'partial', 'Draft', '[]', '2026-11-05')
  `).run();
  source.prepare(`
    INSERT INTO brand_art VALUES ('brand', '/images/brand-editorial/brand.svg', 'Brand', 'SVG', 'original', 'gold', '[]')
  `).run();
  const add = source.prepare(`
    INSERT INTO fragrances (
      source_record_id, source_row_id, canonical_key, brand_id, source_brand_name, perfume_name,
      description, notes_json, accords_json, project_image_path, image_exists, source_fields_json
    ) VALUES (?, ?, ?, 'brand', 'Brand', ?, 'New source description', '["vanilla","amber","wood"]', '["amber"]',
      '/images/perfumes/new.jpg', 1, '{}')
  `);
  add.run("brand::perfume", 1, "brand::perfume", "Perfume");
  add.run("brand::newperfume", 9, "brand::newperfume", "New Perfume");
  const definition = source.prepare("INSERT INTO fragrance_badge_definitions VALUES (?, ?, ?, ?, 'test', ?, ?, 'range', 'description')");
  for (const family of BADGE_FAMILIES) {
    const min = family === "popularity" ? [null, 1, 50, 200, 1000, 5000] : [null, 0, 60, 70, 80, 90];
    const max = family === "popularity" ? [null, 50, 200, 1000, 5000, null] : [null, 60, 70, 80, 90, null];
    BADGE_CODES[family].forEach((code, rank) => {
      definition.run(family === "community" ? "community_score" : family === "olfactive" ? "olfactive_score" : family,
        code, code, rank, min[rank], max[rank]);
    });
  }
  source.prepare(`INSERT INTO fragrance_badges VALUES
    ('brand::perfume', 'very_good', 'popular', 'noticed', 'all_defined', 'snapshot-v1', '2026-11-05'),
    ('brand::newperfume', 'undefined', 'iconic', 'undefined', 'partially_undefined', 'snapshot-v1', '2026-11-05')
  `).run();
  source.prepare(`
    INSERT INTO featured_fragrances (featured_id, brand_id, selected_perfume_name, source_record_id, match_status)
    VALUES ('featured', 'brand', 'Perfume', 'brand::perfume', 'matched')
  `).run();
  source.prepare(`
    INSERT INTO fragrance_territory_suggestions (
      source_record_id, territory_id, score, confidence, evidence_terms_json, method_id
    ) VALUES ('brand::perfume', 'amber', 8, 'moderate', '["note:amber"]', 'editorial-note-accord-rule-v1')
  `).run();
  for (const [name, content] of [
    ["images/brand-editorial/brand.svg", "<svg xmlns=\"http://www.w3.org/2000/svg\"/>"],
    ["images/perfumes/new.jpg", "fixture photo"],
  ]) {
    const filename = path.join(directory, "public", name);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, content);
  }
  const env = {
    ...process.env, FRAGRANCEDNA_SQLITE_PATH: databasePath, FRAGRANCEDNA_SQLITE_READONLY: "false", VERCEL: "",
  };
  const run = (apply = true) => spawnSync(process.execPath, [
    tsx, script, "--input", sourcePath, ...(apply ? ["--apply"] : []),
  ], { cwd: directory, env, encoding: "utf8", timeout: 30000 });
  return {
    directory, source, database, original, run,
    readRuntime: () => spawnSync(process.execPath, [tsx, "-e", `
      const {readPurchaseRecommendationFragrances,readEditorialHouseCatalog,readEditorialHouses} =
        require(${JSON.stringify(path.join(root, "lib", "database", "curatedCatalog.ts"))});
      const {searchMasterFragrances} =
        require(${JSON.stringify(path.join(root, "lib", "database", "masterFragranceDatabase.ts"))});
      console.log(JSON.stringify({
        ids:readPurchaseRecommendationFragrances().map(r=>r.id),
        houses:readEditorialHouses(),
        catalog:readEditorialHouseCatalog('brand','New',999),
        filteredHouses:readEditorialHouses({community:'very_good',popularity:'popular'}),
        disjointHouses:readEditorialHouses({community:'very_good',popularity:'iconic'}),
        filteredCatalog:readEditorialHouseCatalog('brand','',999,{community:'very_good',olfactive:'noticed'}),
        badgeSearch:searchMasterFragrances({badges:{community:'very_good',popularity:'popular'}}),
        undefinedSearch:searchMasterFragrances({badges:{community:'undefined'}}),
        unknown:readEditorialHouseCatalog('missing','',1)
      }));
    `], { cwd: directory, env, encoding: "utf8", timeout: 30000 }),
    cleanup: () => { source.close(); database.close(); fs.rmSync(directory, { recursive: true }); },
  };
}

test("imports into canonical records, inserts missing perfume, preserves missing fields and test DNA, restricts recommendations", () => {
  const f = fixture();
  try {
    const preview = f.run(false);
    assert.equal(preview.status, 0, preview.stderr);
    assert.equal(JSON.parse(preview.stdout).newFragrances, 1);
    assert.equal(f.database.prepare<[], { n: number }>("SELECT COUNT(*) AS n FROM fragrances").get()?.n, 2);
    assert.equal(f.database.prepare("SELECT name FROM sqlite_master WHERE name='editorial_houses'").get(), undefined);
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    const row = f.database.prepare("SELECT * FROM fragrances WHERE record_id='brand::perfume'").get() as {
      record_json: string; local_image_path: string; launch_year: string;
    };
    const record = JSON.parse(row.record_json);
    assert.equal(record.description, "New source description");
    assert.equal(record.launchYear, "1990");
    assert.equal(record.perfumer, "Existing Perfumer");
    assert.equal(row.launch_year, "1990");
    assert.equal(record.imageUrl, f.original.imageUrl);
    assert.equal(row.local_image_path, "/images/perfumes/new.jpg");
    assert.equal(record.userDnaProfiles[0].canonicalLocalImagePath, row.local_image_path);
    assert.deepEqual(record.userDnaProfiles[0].dna_axes, { Freshness: 70 });
    const storedDetails = (): Record<string, { previousValues: Record<string, unknown>; territories: Array<{ status: string }> }> =>
      JSON.parse(gunzipSync((f.database.prepare("SELECT details_blob FROM editorial_houses WHERE brand_id='brand'")
        .get() as { details_blob: Buffer }).details_blob).toString("utf8"));
    const details = storedDetails()["1"];
    assert.equal(details.previousValues.description, "Old description");
    assert.equal(details.territories[0].status, "editorial_review_pending");
    assert.equal(f.database.prepare<[], { n: number }>("SELECT COUNT(*) AS n FROM fragrances").get()?.n, 3);
    const runtime = f.readRuntime();
    assert.equal(runtime.status, 0, runtime.stderr);
    const data = JSON.parse(runtime.stdout);
    assert.deepEqual(data.ids.sort(), ["brand::newperfume", "brand::perfume"]);
    assert.equal(data.houses[0].count, 2);
    assert.equal(data.catalog.total, 1);
    assert.equal(data.catalog.page, 1);
    assert.equal(data.catalog.fragrances[0].record.perfume, "New Perfume");
    assert.ok(!("olfactiveScore" in data.catalog.fragrances[0].details));
    assert.ok(!("creatorCredits" in data.catalog.fragrances[0].details));
    assert.deepEqual(data.catalog.houseAccords, ["amber"]);
    assert.deepEqual(data.filteredCatalog.houseAccords, data.catalog.houseAccords);
    assert.deepEqual(data.catalog.fragrances[0].badges, { community: "undefined", popularity: "iconic", olfactive: "undefined" });
    assert.equal(data.filteredHouses[0].matchingCount, 1);
    assert.equal(data.disjointHouses[0].matchingCount, 0);
    assert.equal(data.filteredCatalog.total, 1);
    assert.equal(data.filteredCatalog.page, 1);
    assert.equal(data.filteredCatalog.fragrances[0].record.perfume, "Perfume");
    assert.deepEqual(data.badgeSearch.map((record: { id: string }) => record.id), ["brand::perfume"]);
    assert.deepEqual(data.undefinedSearch.map((record: { id: string }) => record.id).sort(), ["brand::newperfume", "outside::perfume"]);
    assert.deepEqual(data.badgeSearch[0].badges, { community: "very_good", popularity: "popular", olfactive: "noticed" });
    assert.equal(data.unknown, null);
    const repeated = f.run();
    assert.equal(repeated.status, 0, repeated.stderr);
    assert.equal(f.database.prepare<[], { n: number }>("SELECT COUNT(*) AS n FROM fragrances").get()?.n, 3);
    assert.equal(storedDetails()["1"].previousValues.description, "Old description");
    assert.ok(fs.existsSync(JSON.parse(result.stdout).backupPath));
  } finally { f.cleanup(); }
});

test("imports sourced creator roles and scores into canonical evidence without exposing raw scores", () => {
  const f = fixture();
  try {
    f.source.prepare("UPDATE fragrances SET perfumer='Alice and Bob', source_url='https://example.com/attribution' WHERE source_record_id='brand::perfume'").run();
    f.source.prepare(`INSERT INTO fragrance_ratings (
      source_record_id, source_rating_count, source_platform_count, fragrantiq_rating_100,
      evidence_level, rating_status, method_id, source_components_json, generated_date
    ) VALUES ('brand::perfume',1,1,80,'test','defined','snapshot-v1','[]','2026-11-05')`).run();
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    const details = JSON.parse(gunzipSync((f.database.prepare("SELECT details_blob FROM editorial_houses WHERE brand_id='brand'").get() as { details_blob: Buffer }).details_blob).toString("utf8"))["1"];
    assert.equal(details.olfactiveScore, 80);
    assert.deepEqual(details.creatorCredits, [
      { name: "Alice", role: "perfumer", source: "https://example.com/attribution" },
      { name: "Bob", role: "perfumer", source: "https://example.com/attribution" },
    ]);
    const runtime = f.readRuntime();
    assert.equal(runtime.status, 0, runtime.stderr);
    assert.ok(!("olfactiveScore" in JSON.parse(runtime.stdout).filteredCatalog.fragrances[0].details));
    f.source.prepare("UPDATE fragrance_ratings SET fragrantiq_rating_100=101").run();
    const invalid = f.run();
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /Invalid score/);
  } finally { f.cleanup(); }
});

test("duplicate canonical rows remain linked without duplicate editorial cards", () => {
  const f = fixture();
  try {
    f.database.prepare(`
      INSERT INTO fragrances (record_id, canonical_key, brand, perfume, record_json)
      SELECT record_id, canonical_key, brand, perfume, record_json FROM fragrances WHERE row_id=1
    `).run();
    const applied = f.run();
    assert.equal(applied.status, 0, applied.stderr);
    const runtime = f.readRuntime();
    assert.equal(runtime.status, 0, runtime.stderr);
    const data = JSON.parse(runtime.stdout);
    assert.equal(data.houses[0].count, 2);
    assert.equal(data.ids.filter((id: string) => id === "brand::perfume").length, 2);
    assert.equal(f.database.prepare<[], { n: number }>("SELECT COUNT(*) AS n FROM editorial_fragrances").get()?.n, 3);
  } finally { f.cleanup(); }
});

test("purchase recommendations fail explicitly before an editorial import", () => {
  const f = fixture();
  try {
    const runtime = f.readRuntime();
    assert.notEqual(runtime.status, 0);
    assert.match(runtime.stderr, /selected perfume-house catalog has not been imported/);
  } finally { f.cleanup(); }
});

test("retains sourced resemblance for a representative missing from the source catalog without fabricating a perfume", () => {
  const f = fixture();
  try {
    f.source.prepare("UPDATE featured_fragrances SET source_record_id=NULL, match_status='not_found_in_source_catalog'").run();
    f.source.prepare(`
      INSERT INTO dupe_similarities (
        subject_featured_id, subject_perfume_name, subject_brand_id, research_status,
        reference_brand, reference_perfume, evidence_source_url, evidence_source_type
      ) VALUES ('featured', 'Missing Edition', 'brand', 'brand_claimed_inspired_by',
        'Other House', 'Reference', 'https://example.com/inspiration', 'official_brand')
    `).run();
    const applied = f.run();
    assert.equal(applied.status, 0, applied.stderr);
    const runtime = f.readRuntime();
    assert.equal(runtime.status, 0, runtime.stderr);
    const data = JSON.parse(runtime.stdout);
    assert.equal(data.houses[0].featuredStatus, "not_found_in_source_catalog");
    assert.equal(data.houses[0].featuredSimilarities[0].status, "brand_claimed_inspired_by");
    assert.equal(data.houses[0].featuredSimilarities[0].referencePerfume, "Reference");
    assert.ok(!data.ids.includes("Missing Edition"));
  } finally { f.cleanup(); }
});

for (const scenario of ["mismatch", "missing-photo", "unsafe-url", "unknown-territory", "missing-badge", "unknown-badge", "badge-definition", "badge-status"] as const) {
  test(`rejects ${scenario} before changing the canonical records`, () => {
    const f = fixture();
    try {
      if (scenario === "mismatch") f.source.prepare("UPDATE fragrances SET source_brand_name='Other'").run();
      if (scenario === "missing-photo") fs.unlinkSync(path.join(f.directory, "public", "images", "perfumes", "new.jpg"));
      if (scenario === "unsafe-url") f.source.prepare("UPDATE brands SET official_site_url='javascript:alert(1)'").run();
      if (scenario === "unknown-territory") f.source.prepare("UPDATE fragrance_territory_suggestions SET territory_id='invented'").run();
      if (scenario === "missing-badge") f.source.prepare("DELETE FROM fragrance_badges WHERE source_record_id='brand::perfume'").run();
      if (scenario === "unknown-badge") f.source.prepare("UPDATE fragrance_badges SET community_badge_code='invented'").run();
      if (scenario === "badge-definition") f.source.prepare("UPDATE fragrance_badge_definitions SET min_value=59 WHERE badge_code='moderate'").run();
      if (scenario === "badge-status") f.source.prepare("UPDATE fragrance_badges SET badge_status='all_undefined'").run();
      const before = f.database.prepare("SELECT * FROM fragrances").all();
      const result = f.run();
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /import-house-articles/);
      assert.deepEqual(f.database.prepare("SELECT * FROM fragrances").all(), before);
      assert.equal(f.database.prepare("SELECT name FROM sqlite_master WHERE name='editorial_houses'").get(), undefined);
    } finally { f.cleanup(); }
  });
}

test("badge levels are ordinal, undefined is distinct from the lowest level, invalid filters are rejected", () => {
  for (const family of BADGE_FAMILIES) {
    BADGE_CODES[family].forEach((code, level) => assert.equal(badgeLevel(family, code), level));
  }
  assert.deepEqual(badgesFromColumns({ community_level: null, popularity_level: 1, olfactive_level: 5 }), {
    community: "undefined", popularity: "emerging", olfactive: "reference",
  });
  assert.throws(() => badgesFromColumns({ community_level: 9, popularity_level: 0, olfactive_level: 0 }), /Invalid stored/);
  assert.deepEqual(parseBadgeFilters(new URLSearchParams("community=undefined&popularity=iconic")), {
    community: "undefined", popularity: "iconic",
  });
  assert.throws(() => parseBadgeFilters(new URLSearchParams("community=iconic")), /Unknown community/);
  assert.equal(matchesBadgeFilters(undefined, { community: "undefined" }), true);
  assert.equal(matchesBadgeFilters(undefined, { community: "low" }), false);
  assert.equal(matchesBadgeFilters({ community: "good", popularity: "iconic", olfactive: "favorite" }, {
    community: "good", popularity: "popular",
  }), false);
});

test("reimport replaces badge levels and a later invalid snapshot preserves the applied data", () => {
  const f = fixture();
  try {
    const first = f.run();
    assert.equal(first.status, 0, first.stderr);
    f.source.prepare(`UPDATE fragrance_badges SET community_badge_code='undefined',
      popularity_badge_code='undefined', olfactive_badge_code='undefined', badge_status='all_undefined'`).run();
    const second = f.run();
    assert.equal(second.status, 0, second.stderr);
    const applied = f.database.prepare("SELECT * FROM fragrance_badges ORDER BY row_id").all();
    assert.deepEqual(applied, [
      { row_id: 1, community_level: 0, popularity_level: 0, olfactive_level: 0 },
      { row_id: 3, community_level: 0, popularity_level: 0, olfactive_level: 0 },
    ]);
    f.source.prepare("UPDATE fragrance_badges SET popularity_badge_code='invented'").run();
    const invalid = f.run();
    assert.notEqual(invalid.status, 0);
    assert.deepEqual(f.database.prepare("SELECT * FROM fragrance_badges ORDER BY row_id").all(), applied);
    assert.equal(f.database.prepare<[], { n: number }>("SELECT COUNT(*) AS n FROM editorial_fragrances").get()?.n, 2);
  } finally { f.cleanup(); }
});

test("house editorial overviews are localized in every supported language without workflow boilerplate", () => {
  const descriptions = new Set<string>();
  for (const locale of LOCALES) {
    const t = getDictionary(locale);
    const copy = t.articles.houses;
    const accords = ["woody", "amber", "warm spicy", "animalic"].map((accord) => {
        assert.ok(t.fragrances.accordLabels[accord], `${locale}: missing ${accord}`);
        return t.fragrances.accordLabels[accord];
      }).join(", ");
    const description = copy.editorialDescription("Amouage", accords);
    assert.ok(description.includes("Amouage"));
    assert.ok(description.includes(accords));
    assert.doesNotMatch(description, /draft|workbook|needs_review|Fragrantiq|Guidance|undefined/i);
    assert.ok(copy.description);
    assert.equal(copy.website, "Website");
    assert.doesNotMatch(copy.notice, /draft|website|site|needs_review/i);
    const noAccords = copy.editorialDescription("ALT Fragrances", "");
    assert.ok(noAccords.includes("ALT Fragrances"));
    assert.doesNotMatch(noAccords, /undefined|draft|workbook/i);
    assert.notEqual(description, noAccords);
    descriptions.add(description);
  }
  assert.equal(descriptions.size, LOCALES.length);
});

test("house overview accords use the full catalog, deduplicate perfumes and stay independent of filters", () => {
  const f = fixture();
  try {
    f.source.prepare(`UPDATE fragrances SET accords_json='["amber","woody","woody"]' WHERE source_record_id='brand::perfume'`).run();
    f.source.prepare(`UPDATE fragrances SET accords_json='["vanilla"]' WHERE source_record_id='brand::newperfume'`).run();
    f.database.prepare(`
      INSERT INTO fragrances (record_id, canonical_key, brand, perfume, record_json)
      SELECT record_id, canonical_key, brand, perfume, record_json FROM fragrances WHERE row_id=1
    `).run();
    const applied = f.run();
    assert.equal(applied.status, 0, applied.stderr);
    const runtime = f.readRuntime();
    assert.equal(runtime.status, 0, runtime.stderr);
    const data = JSON.parse(runtime.stdout);
    assert.deepEqual(data.catalog.houseAccords, ["amber", "vanilla", "woody"]);
    assert.deepEqual(data.filteredCatalog.houseAccords, data.catalog.houseAccords);
    assert.equal(data.catalog.total, 1);
    assert.equal(data.filteredCatalog.total, 1);
  } finally { f.cleanup(); }
});
