import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import Database from "better-sqlite3";
import { filterPerfumerProfiles, topPerfumerProfiles } from "../lib/data/topPerfumerProfiles";
import { getPerfumerText } from "../lib/data/topPerfumerTranslations";
import { readEvidencedPerfumerProfiles } from "../lib/database/perfumerProfiles";
import { calculatePerfumerStatistics, creatorCredits, normalizeCreator, percentile67 } from "../lib/data/perfumerEvidence";
import { LOCALES } from "../lib/i18n/config";
import { getDictionary } from "../lib/i18n/getDictionary";
import { getDiscoveryCopy } from "../lib/i18n/discoveryCopy";
import { isCueSeason, seasonalCueAccords, SEASON_ACCORDS } from "../lib/seasonalCues";
import sitemap from "../app/sitemap";

test("15 curated people have unique profiles, sourced biographies, portraits and seven translations", () => {
  assert.equal(topPerfumerProfiles.length, 15);
  assert.equal(new Set(topPerfumerProfiles.map((profile) => profile.slug)).size, 15);
  assert.ok(topPerfumerProfiles.every((profile) => profile.name !== "Houbigant"));
  for (const profile of topPerfumerProfiles) {
    assert.match(profile.slug, /^[a-z]+(?:-[a-z]+)*$/);
    for (const url of [profile.portraitUrl, profile.portraitSourceUrl, profile.biographySourceUrl]) assert.equal(new URL(url).protocol, "https:");
    assert.doesNotMatch(profile.portraitUrl, /\/pshero\//);
    const biographies = new Set<string>();
    for (const locale of LOCALES) {
      const text = getPerfumerText(profile, locale);
      assert.ok(text.bio.length > 40);
      assert.ok(text.approach.length > 30);
      biographies.add(text.bio);
    }
    assert.equal(biographies.size, 7);
  }
  assert.equal(topPerfumerProfiles.find((profile) => profile.slug === "francis-kurkdjian")?.portraitPosition, "72% 25%");
});

test("percentile 67 uses linear interpolation, valid zero scores and inclusive cutoff ties", () => {
  assert.equal(percentile67([]), null);
  assert.equal(percentile67([0]), 0);
  assert.equal(percentile67([0, 100]), 67);
  assert.equal(percentile67([1, 2, 2, 2]), 2);
  for (const values of [[NaN], [-1], [101], [Infinity]]) assert.throws(() => percentile67(values));
});

test("ranking deduplicates creations, credits every co-creator and uses denominator before exact ties", () => {
  const people = ["A", "B", "C", "D"].map((name) => ({ name, slug: name }));
  const rows = Array.from({ length: 100 }, (_, i) => ({
    id: String(i), brand: "House", name: `Perfume ${i}`, score: i,
    credits: creatorCredits(i >= 90 ? "A, B and C & D" : i < 10 ? "A, B, C" : i < 20 ? "A" : null, "https://example.com/credits"),
  }));
  const result = calculatePerfumerStatistics(people, [...rows, rows[99]]);
  assert.equal(result.evaluated, 100);
  assert.equal(result.cutoff, 66.33);
  assert.equal(result.qualifying, 33);
  const [a, b, c, d] = result.statistics;
  assert.deepEqual([a.topCreations, a.evaluatedCreations, a.rank], [10, 30, 3]);
  assert.deepEqual([b.topCreations, b.evaluatedCreations, b.rank], [10, 20, 1]);
  assert.equal(c.rank, 1);
  assert.equal(d.rank, null);
  assert.equal(b.works.length, 10);
  assert.equal(b.works[0].credits.length, 4);
  assert.ok(b.works.every((work) => !("score" in work)));
  assert.deepEqual(creatorCredits("A", null), []);
  assert.throws(() => creatorCredits("A", "file:///private"));
  assert.throws(() => calculatePerfumerStatistics(people, [rows[0], { ...rows[0], score: 100 }]));
});

test("localized labels distinguish catalog, personal affinities and editorial explanation", () => {
  for (const locale of LOCALES) {
    const t = getDictionary(locale);
    const c = getDiscoveryCopy(locale);
    assert.equal(new Set([c.guide, c.affinities, c.explained]).size, 3);
    assert.equal(t.articles.menu.items.perfumeCreators.label, c.profiles);
    assert.equal(t.articles.menu.items.scentTerritories.label, c.explained);
    assert.equal(t.territories.pageTitle, c.guide);
    assert.equal(t.dna.territoriesTitle, c.affinities);
    assert.equal(t.fragrances.search.season, c.seasonal);
    assert.ok(c.affinityHelp.includes("100"));
    assert.ok(c.rankingHelp.includes("15"));
  }
});

test("seasonal cue evidence exactly matches accord filters, never unsupported notes", () => {
  assert.equal(isCueSeason("constructor"), false);
  assert.equal(isCueSeason("fall"), false);
  for (const season of Object.keys(SEASON_ACCORDS)) {
    assert.ok(isCueSeason(season));
    assert.deepEqual(seasonalCueAccords(SEASON_ACCORDS[season], season), SEASON_ACCORDS[season]);
  }
  assert.deepEqual(seasonalCueAccords([" AMBER ", "amber", "citrus", "invented"], "winter"), ["amber"]);
  assert.deepEqual(seasonalCueAccords(["woody"], "summer"), []);
});

test("all person routes remain in the canonical sitemap; no house receives a person route", () => {
  const urls = sitemap().map((entry) => entry.url);
  for (const { slug } of topPerfumerProfiles) assert.equal(urls.filter((url) => url === `https://olfactivedna.com/articles/perfumers/${slug}`).length, 1);
  assert.ok(!urls.some((url) => url.endsWith("/perfumers/houbigant")));
});

const sourcePath = path.join(process.cwd(), "data", "generated", "perfume-house-articles.sqlite");
test("runtime canonical counts, denominators, works and rankings match the supplied attribution evidence",
  { skip: !fs.existsSync(sourcePath) }, () => {
    const profiles = readEvidencedPerfumerProfiles();
    const source = new Database(sourcePath, { readonly: true });
    try {
      const rows = source.prepare(`SELECT f.source_record_id AS id, f.source_brand_name AS brand, f.perfume_name AS name,
        f.perfumer, f.source_url, r.fragrantiq_rating_100 AS score
        FROM fragrances f JOIN fragrance_ratings r USING(source_record_id)`).all() as Array<{
          id: string; brand: string; name: string; perfumer: string | null; source_url: string | null; score: number | null;
        }>;
      const scores = rows.flatMap((row) => row.score === null ? [] : [row.score]).sort((a, b) => a - b);
      assert.equal(scores.length, 8768);
      const cutoff = percentile67(scores);
      assert.equal(cutoff, 77.36);
      assert.equal(rows.filter((row) => row.score !== null && row.score >= cutoff!).length, 2896);
      for (const profile of profiles) {
        const evaluated = rows.filter((row) => row.score !== null && row.source_url && creatorCredits(row.perfumer, row.source_url)
          .some((credit) => normalizeCreator(credit.name) === normalizeCreator(profile.name)));
        const top: typeof rows = evaluated.filter((row) => row.score !== null && cutoff !== null && row.score >= cutoff);
        assert.equal(profile.evaluatedCreations, evaluated.length, profile.name);
        assert.equal(profile.topCreations, top.length, profile.name);
        assert.deepEqual(profile.works.map((work) => work.id).sort(), top.map((row) => row.id).sort());
        assert.ok(profile.works.every((work) =>
          work.credits.length > 0 &&
          work.credits.every((credit) => credit.role === "perfumer" && !("source" in credit)),
        ));
      }
      assert.equal(profiles.find((profile) => profile.slug === "olivier-polge")?.rank, 12);
      assert.equal(profiles.find((profile) => profile.slug === "daniela-andrier")?.rank, 13);
      assert.equal(profiles.find((profile) => profile.slug === "marie-salamagne")?.rank, 14);
      const original = profiles.map((profile) => profile.slug);
      assert.equal(filterPerfumerProfiles("", 25, "count", "en", profiles).length, 7);
      assert.equal(filterPerfumerProfiles("", 50, "count", "en", profiles).length, 2);
      assert.equal(filterPerfumerProfiles("francois", 0, "name", "en", profiles)[0].slug, "francois-demachy");
      assert.equal(filterPerfumerProfiles("no-such-name", 0, "name", "en", profiles).length, 0);
      assert.deepEqual(profiles.map((profile) => profile.slug), original);
    } finally { source.close(); }
  });
