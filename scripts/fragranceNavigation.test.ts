import assert from "node:assert/strict";
import { test } from "node:test";
import Database from "better-sqlite3";
import { getFragranceHref, getFragranceSearchHref } from "../lib/fragranceNavigation";
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
  assert.equal(getFragranceHref("https://www.fragrantica.com/perfume/123", "Brand", "Perfume"), "/fragrances?q=Brand+Perfume");
  assert.equal(new URL(getFragranceSearchHref("Hermès", "Un Jardin"), "http://localhost:3000").searchParams.get("q"), "Hermès Un Jardin");
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

test("all perfumer works navigate to their actual canonical catalog record, preserving statistics identities", () => {
  const db = getMasterFragranceDatabase();
  const profiles = readEvidencedPerfumerProfiles();
  assert.equal(profiles.length, 15);
  let works = 0;
  for (const profile of profiles) {
    for (const work of profile.works) {
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
