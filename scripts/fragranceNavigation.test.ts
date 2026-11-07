import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import Database from "better-sqlite3";
import { getFragranceHref, getFragranceSearchHref, getPerfumerFragranceHref } from "../lib/fragranceNavigation";
import { getFragranceReferenceHref, readCanonicalFragrance } from "../lib/database/fragrancePages";
import { toPublicFragrance } from "../lib/database/publicFragrances";
import { getMasterFragranceDatabase, searchMasterFragrances } from "../lib/database/masterFragranceDatabase";
import { readEvidencedPerfumerProfiles } from "../lib/database/perfumerProfiles";
import { readEditorialHouseCatalog, readEditorialHouses } from "../lib/database/curatedCatalog";
import { getFragrancePageCopy } from "../lib/i18n/fragrancePageCopy";
import { LOCALES } from "../lib/i18n/config";

test("URL builder encodes internal IDs and never substitutes an external destination", () => {
  const id = "brand::perfume / extrait?#%";
  assert.equal(decodeURIComponent(getFragranceHref(id).split("/").pop()!), id);
  assert.equal(getFragranceHref(null, "Brand", "Perfume"), "/fragrances?q=Brand+Perfume");
  assert.equal(getFragranceHref("https://example.com/perfume/123", "Brand", "Perfume"), "/fragrances?q=Brand+Perfume");
  assert.equal(new URL(getFragranceSearchHref("Hermès", "Un Jardin"), "http://localhost:3000").searchParams.get("q"), "Hermès Un Jardin");
});

test("perfumer navigation retains internal identity and search fallback with explicit return context", () => {
  const href = new URL(getPerfumerFragranceHref("hermes::terre", "Hermès", "Terre", "jean-claude-ellena"), "http://localhost:3000");
  assert.equal(decodeURIComponent(href.pathname), "/fragrances/hermes::terre");
  assert.equal(href.searchParams.get("fromPerfumer"), "jean-claude-ellena");
  const fallback = new URL(getPerfumerFragranceHref(null, "Hermès", "Terre", "jean-claude-ellena"), "http://localhost:3000");
  assert.equal(fallback.pathname, "/fragrances");
  assert.equal(fallback.searchParams.get("q"), "Hermès Terre");
  assert.equal(fallback.searchParams.get("fromPerfumer"), "jean-claude-ellena");
});

test("indexed record IDs, canonical keys and editorial aliases resolve without using external IDs", () => {
  const db = new Database(":memory:");
  try {
    db.exec(`
      CREATE TABLE fragrances (row_id INTEGER PRIMARY KEY, record_id TEXT, canonical_key TEXT, record_json TEXT);
      CREATE TABLE editorial_fragrances (row_id INTEGER, source_record_id TEXT);
      CREATE TABLE fragrance_badges (row_id INTEGER, community_level INTEGER, popularity_level INTEGER, olfactive_level INTEGER);
    `);
    const record = { externalId: "123", externalUrl: "https://example.com/perfume", brand: "Hérmès", perfume: "Un Jardin", notes: ["musk"] };
    const add = db.prepare("INSERT INTO fragrances VALUES (?, ?, ?, ?)");
    add.run(1, "internal-record-7", "hermes::unjardin", JSON.stringify(record));
    add.run(2, "internal-record-7", "hermes::unjardin", JSON.stringify(record));
    db.prepare("INSERT INTO editorial_fragrances VALUES (1, 'editorial-source-9')").run();
    for (const identity of ["internal-record-7", "hermes::unjardin", "editorial-source-9"]) {
      const found = readCanonicalFragrance(identity, db);
      assert.equal(found?.record.id, "internal-record-7");
      assert.equal(found?.record.perfume, "Un Jardin");
    }
    assert.equal(readCanonicalFragrance("123", db), null);
    assert.equal(readCanonicalFragrance(record.externalUrl, db), null);
    assert.equal(readCanonicalFragrance("' OR 1=1 --", db), null);
    assert.equal(getFragranceReferenceHref("HERMÈS", "Un Jardin", db), "/fragrances/internal-record-7");
    assert.equal(getFragranceReferenceHref("Other Brand", "Un Jardin", db), "/fragrances?q=Other+Brand+Un+Jardin");
    assert.equal(getFragranceReferenceHref("Hérmès", "Un Jardin Intense", db), "/fragrances?q=H%C3%A9rm%C3%A8s+Un+Jardin+Intense");
    const publicRecord = toPublicFragrance(readCanonicalFragrance("internal-record-7", db)!.record);
    assert.equal(publicRecord.id, "internal-record-7");
    assert.deepEqual(publicRecord.notes, ["musk"]);
    assert.ok(!("externalId" in publicRecord));
    assert.ok(!("rating" in publicRecord));
    add.run(3, "internal-record-7", "other::perfume", JSON.stringify({ brand: "Other", perfume: "Perfume" }));
    assert.throws(() => readCanonicalFragrance("internal-record-7", db), /Ambiguous/);
  } finally { db.close(); }
});

test("public fragrance profiles remove opaque codes without discarding real terms", () => {
  const fragrance = toPublicFragrance({
    id: "dior::sauvage",
    brand: "Dior",
    perfume: "Sauvage",
    mainAccords: ["fresh spicy", "a34", "citrus"],
    notes: ["Calabrian bergamot", "n1963"],
    notesByStage: { top: ["Bergamot", "n213"], heart: [], base: ["Ambroxan"] },
  });

  assert.deepEqual(fragrance.mainAccords, ["fresh spicy", "citrus"]);
  assert.deepEqual(fragrance.notes, ["Calabrian bergamot"]);
  assert.deepEqual(fragrance.notesByStage, { top: ["Bergamot"], heart: [], base: ["Ambroxan"] });
  assert.ok([...fragrance.mainAccords, ...fragrance.notes, ...(fragrance.notesByStage?.top ?? [])]
    .every((term) => !/^[an]\d+$/i.test(term)));
});

test("the ten documented records retain canonical identities and expose researched notes and images", () => {
  const expectedKeys = [
    "chanel::cocomademoiselle",
    "dior::sauvage",
    "dolcegabbana::lightblue",
    "lancome::lavieestbelle",
    "mugler::alien",
    "mugler::angel",
    "tomford::blackorchid",
    "tomford::tobaccovanille",
    "versace::eros",
    "yvessaintlaurent::blackopium",
  ];
  const db = getMasterFragranceDatabase();
  const placeholders = expectedKeys.map(() => "?").join(", ");
  const rows = db.prepare(`
    SELECT row_id, record_id, canonical_key, source, rating, image_url, local_image_path, record_json
    FROM fragrances WHERE canonical_key IN (${placeholders}) ORDER BY canonical_key
  `).all(...expectedKeys) as Array<{
    row_id: number; record_id: string; canonical_key: string; source: string;
    rating: string; image_url: string; local_image_path: string; record_json: string;
  }>;

  assert.equal(rows.length, expectedKeys.length);
  for (const row of rows) {
    const record = JSON.parse(row.record_json) as Record<string, unknown>;
    const fragrance = toPublicFragrance(record);
    assert.ok(expectedKeys.includes(row.canonical_key));
    assert.equal(row.record_id, row.canonical_key);
    assert.equal(row.source, "documented-research");
    assert.equal(row.rating, "");
    assert.equal(row.image_url, "");
    assert.ok(row.local_image_path.startsWith("/images/documented-perfumes/"));
    assert.ok(fs.existsSync(path.join(process.cwd(), "public", row.local_image_path.slice(1))));
    assert.ok(fragrance.mainAccords.length > 0);
    assert.ok(fragrance.notes.length > 0);
    assert.ok([...fragrance.mainAccords, ...fragrance.notes]
      .every((term) => !/^[an]\d+$/i.test(term)));
    assert.equal(JSON.stringify(record).toLowerCase().includes("fragdb"), false);
  }

  const dior = rows.find((row) => row.canonical_key === "dior::sauvage");
  assert.ok(dior);
  const diorProfile = toPublicFragrance(JSON.parse(dior.record_json) as Record<string, unknown>);
  assert.deepEqual(diorProfile.mainAccords, ["citrus", "fresh spicy", "aromatic", "amber", "woody"]);
  assert.deepEqual(diorProfile.notes, [
    "Calabrian bergamot", "Sichuan pepper", "Ambroxan", "Elemi", "Woody notes",
  ]);
  assert.equal(fs.readdirSync(path.join(process.cwd(), "public", "images", "documented-perfumes")).length, 11);
});

test("all perfumer works navigate to their actual canonical catalog record, preserving statistics identities", () => {
  const db = getMasterFragranceDatabase();
  const profiles = readEvidencedPerfumerProfiles();
  assert.equal(profiles.length, 15);
  let works = 0;
  for (const profile of profiles) {
    assert.ok(!("portraitSourceUrl" in profile));
    assert.ok(!("biographySourceUrl" in profile));
    for (const work of profile.works) {
      for (const credit of work.credits) {
        assert.ok(!("source" in credit));
      }
      const mapping = db.prepare(`SELECT f.record_id FROM editorial_fragrances e
        JOIN fragrances f ON f.row_id = e.row_id WHERE e.source_record_id = ? ORDER BY e.row_id LIMIT 1`)
        .get(work.id) as { record_id: string } | undefined;
      assert.equal(work.recordId, mapping?.record_id);
      const found = readCanonicalFragrance(work.recordId!);
      assert.equal(found?.record.brand, work.brand);
      assert.equal(found?.record.perfume, work.name);
      works++;
    }
  }
  assert.ok(works > 0);
});

test("house catalogs, search results and evidence references use canonical internal destinations", () => {
  const house = readEditorialHouses().find((item) => item.count > 0)!;
  const catalog = readEditorialHouseCatalog(house.id, "", 1)!;
  for (const { record } of catalog.fragrances) {
    assert.ok(record.id);
    assert.equal(readCanonicalFragrance(record.id!)?.record.perfume, record.perfume);
  }
  const results = searchMasterFragrances({ query: "Creed Aventus" }, 10).map(toPublicFragrance);
  assert.ok(results.length > 0);
  for (const result of results) {
    assert.equal(readCanonicalFragrance(result.id)?.record.perfume, result.perfume);
  }
  const inspiration = getMasterFragranceDatabase().prepare(`
    SELECT f.record_id FROM fragrances f, json_each(f.record_json, '$.relationships') r
    WHERE json_extract(r.value, '$.type') = 'inspired_by' LIMIT 1
  `).get() as { record_id: string };
  assert.ok(inspiration);
  const publicRecord = toPublicFragrance(readCanonicalFragrance(inspiration.record_id)!.record);
  assert.ok(publicRecord.relationships.length);
  for (const relation of publicRecord.relationships) {
    assert.match(relation.href, /^\/fragrances(?:\/|\?q=)/);
    assert.match(relation.source, /^https?:\/\//);
    if (!relation.href.includes("?")) {
      const reference = readCanonicalFragrance(decodeURIComponent(relation.href.split("/").pop()!))!;
      assert.ok(reference);
    }
  }
});

test("source, evidence and attribution labels are distinct in every locale", () => {
  for (const locale of LOCALES) {
    const copy = getFragrancePageCopy(locale);
    assert.equal(new Set([copy.source, copy.evidence, copy.attribution]).size, 3);
  }
});
