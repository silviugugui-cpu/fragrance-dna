import assert from "node:assert/strict";
import { test } from "node:test";
import Database from "better-sqlite3";
import { emptyGroundingState, groundingChoices, restoreGroundingState, GROUNDING_TOKENS } from "../lib/engine/groundingPreferences";
import { buildUserVector } from "../lib/engine/userVectorBuilder";
import { buildSeed } from "../lib/engine/seedBuilder";
import { collectionTerritoryCoverage, reviewedTerritories } from "../lib/collection/territoryCoverage";
import { computePerfumerMatchScore } from "../lib/engine/perfumerAffinity";
import { fragranceRelationships, relationshipsFromEvidence, INSPIRATION_SQL } from "../lib/fragranceClassification";
import { territories } from "../lib/data/territories";
import { getDictionary } from "../lib/i18n/getDictionary";
import { LOCALES } from "../lib/i18n/config";
import { getCollectionDNACoverage } from "../lib/collection/selectors";

test("untouched grounding is unrated, persisted choices are explicit, legacy neutrals are not evidence", () => {
  const state = emptyGroundingState();
  assert.ok(Object.values(state).every((zone) => zone === "unrated"));
  assert.deepEqual(groundingChoices(state).neutral, []);
  state[GROUNDING_TOKENS[0]] = "love";
  state[GROUNDING_TOKENS[1]] = "hate";
  state[GROUNDING_TOKENS[2]] = "neutral";
  const input = groundingChoices(state);
  assert.equal(input.love.length + input.red_flag.length, 2);
  assert.equal(input.neutral.length, 1);
  assert.equal(input.strength.neutralWeight, 0);
  assert.deepEqual(restoreGroundingState(input), state);
  const legacy = restoreGroundingState({ love: [GROUNDING_TOKENS[0]], neutral: GROUNDING_TOKENS.slice(1) });
  assert.equal(legacy[GROUNDING_TOKENS[1]], "unrated");
  assert.equal(legacy[GROUNDING_TOKENS[0]], "love");
  assert.deepEqual(buildUserVector(buildSeed(input)), buildUserVector(buildSeed({ ...input, neutral: [] })));
});

test("coverage uses unique reviewed territories of owned perfumes, never collection length or wishlist", () => {
  const label = { territoryId: "amber", status: "reviewed" as const, source: "https://example.com/evidence", confidence: 0.8 };
  assert.equal(collectionTerritoryCoverage(Array.from({ length: 20 }, (_, i) => ({ fragranceId: String(i), owned: true }))).coverage, null);
  const result = collectionTerritoryCoverage([
    { fragranceId: "a", owned: true, reviewedTerritories: [label, label] },
    { fragranceId: "b", owned: true, reviewedTerritories: [label] },
    { fragranceId: "c", owned: false, reviewedTerritories: [{ ...label, territoryId: "musk" }] },
  ]);
  assert.equal(result.coverage, 10);
  assert.equal(result.represented, 1);
  assert.equal(result.classified, 2);
  assert.equal(getCollectionDNACoverage([{ id: "a", fragranceId: "a", owned: true }]), null);
  assert.deepEqual(reviewedTerritories([{ ...label, status: "suggested" }, { ...label, territoryId: "invented" }, { ...label, source: "" }, { ...label, confidence: 0 }]), []);
});

test("all territory axes use canonical names; perfumer scores and reasons ignore profile confidence", () => {
  const axes = getDictionary("en").common.axes;
  assert.ok(Object.values(territories).every((territory) => territory.dnaAxes.every((axis) => axis in axes)));
  const user = { Freshness: 80, Complexity: 70, Elegance: 60, Luxury: 50, Presence: 0 };
  const perfumer = { ...user, Freshness: 60, Presence: 100 };
  const match = computePerfumerMatchScore(user, perfumer);
  assert.equal(match.score, 95);
  assert.deepEqual(match, computePerfumerMatchScore({ ...user, Presence: 100 }, perfumer));
  assert.ok(match.axisDiffs.every((item) => item.axis !== "Presence"));
});

test("regional legacy category does not qualify as inspiration; sourced relationships do", () => {
  const evidence = { status: "brand_claimed_inspired_by", referenceBrand: "Original", referencePerfume: "Reference", source: "https://example.com/product", confidence: 0.99 };
  const relationship = relationshipsFromEvidence([evidence])[0];
  assert.equal(relationship.type, "inspired_by");
  assert.deepEqual(Object.keys(relationship).sort(), ["confidence", "referenceBrand", "referencePerfume", "source", "type"]);
  assert.equal(relationshipsFromEvidence([{ ...evidence, status: "documented_resemblance" }])[0].type, "resembles");
  assert.deepEqual(fragranceRelationships([{ ...relationship, confidence: null }]), []);
  const db = new Database(":memory:");
  try {
    db.exec("CREATE TABLE fragrances(record_json TEXT)");
    const add = db.prepare("INSERT INTO fragrances VALUES (?)");
    add.run(JSON.stringify({ brandType: "Dupe/Middle Eastern", originRegion: "middle-east" }));
    add.run(JSON.stringify({ relationships: [{ ...relationship, type: "resembles" }] }));
    add.run(JSON.stringify({ relationships: [relationship] }));
    add.run(JSON.stringify({ relationships: ["invalid", null, { ...relationship, confidence: "0.99" }] }));
    assert.equal((db.prepare(`SELECT count(*) AS n FROM fragrances WHERE ${INSPIRATION_SQL}`).get() as { n: number }).n, 1);
  } finally { db.close(); }
});

test("all locales describe review volume rather than popularity or iconic status", () => {
  for (const locale of LOCALES) {
    const copy = getDictionary(locale).fragrances;
    assert.doesNotMatch(copy.categoryOptions.dupe, /Middle|Moyen|Medio|Médio|Naher|Mijlociu/);
    assert.ok(copy.badges.note.includes("Fragrantica") && copy.badges.note.includes("Parfumo"));
    assert.equal(copy.badges.popularityLevels.length, 5);
    assert.doesNotMatch(copy.badges.popularityLevels.join(" "), /icon|ikon|emerg/i);
  }
});
