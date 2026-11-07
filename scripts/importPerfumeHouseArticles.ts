import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { parseArgs } from "node:util";
import { loadEnvConfig } from "@next/env";
import {
  getMasterFragranceDatabase, getMasterFragranceDatabasePath,
  insertMasterFragrance, isMasterFragranceDatabaseReadOnly, type MasterFragranceRecord,
} from "../lib/database/masterFragranceDatabase";
import {
  curatedCatalogSchema, decodeEditorialDetails, type EditorialHouse, type EditorialFragranceDetails,
  type TerritorySuggestion, type DupeEvidence,
} from "../lib/database/curatedCatalog";
import { territories } from "../lib/data/territories";
import { relationshipsFromEvidence } from "../lib/fragranceClassification";
import { normalizeMasterBrandName } from "../lib/database/brandNames";
import { BADGE_CODES, BADGE_FAMILIES, badgeLevel, type BadgeFamily } from "../lib/fragranceBadges";
import { fragranceBadgeSchema } from "../lib/database/fragranceBadgeStorage";
import { creatorCredits } from "../lib/data/perfumerEvidence";

interface SourceHouse {
  brand_id: string; brand_name: string; selection_category: string;
  official_site_url: string | null; official_site_status: string;
  editorial_description_ro: string; description_status: string;
  representative_perfume_name: string; catalog_completeness_status: string;
  asset_path: string; alt_text_ro: string;
  source_record_id: string | null; match_status: string;
}
interface SourceFragrance {
  source_record_id: string; canonical_key: string; brand_id: string; source_brand_name: string;
  perfume_name: string; launch_year: string | null; perfumer: string | null; gender: string | null;
  source_name: string | null; source_url: string | null; description: string | null;
  rating: string | null; vote_count: string | null;
  accords_json: string; notes_json: string; project_image_path: string | null; image_exists: number;
}
interface CanonicalRow {
  row_id: number; record_id: string; canonical_key: string; brand: string; perfume: string; record_json: string;
}
const normalize = (value: string): string =>
  value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const list = (value: string): string[] => {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
    throw new Error("Expected an array of strings in source catalog.");
  }
  return parsed;
};
const safeUrl = (value: string | null): string | null => {
  if (!value) return null;
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error(`Unsupported URL: ${value}`);
  return url.href;
};
const validateAsset = (value: string, prefix: string): void => {
  if (!value.startsWith(prefix) || value.includes("\\") || value.includes("..")
    || !fs.statSync(path.join(process.cwd(), "public", value)).isFile()) {
    throw new Error(`Invalid or missing local asset: ${value}`);
  }
};

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());
  const { values } = parseArgs({
    options: { input: { type: "string" }, apply: { type: "boolean", default: false } },
    strict: true, allowPositionals: false,
  });
  if (!values.input) throw new Error("Usage: --input SOURCE.sqlite [--apply]");
  const sourcePath = path.resolve(values.input);
  if (sourcePath === getMasterFragranceDatabasePath()) throw new Error("Source must not be the canonical database.");
  const source = new Database(sourcePath, { readonly: true, fileMustExist: true });
  try {
    const hasScores = source.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='fragrance_ratings'").get();
    const scoreRows = hasScores ? source.prepare("SELECT source_record_id, fragrantiq_rating_100 AS score FROM fragrance_ratings").all() as Array<{ source_record_id: string; score: number | null }> : [];
    const scores = new Map(scoreRows.map((row) => {
      if (row.score !== null && (!Number.isFinite(row.score) || row.score < 0 || row.score > 100)) throw new Error(`Invalid score: ${row.source_record_id}`);
      return [row.source_record_id, row.score] as const;
    }));
    const houses = source.prepare(`
      SELECT b.*, a.asset_path, a.alt_text_ro, f.source_record_id, f.match_status
      FROM brands b JOIN brand_art a ON a.brand_id = b.brand_id
      JOIN featured_fragrances f ON f.brand_id = b.brand_id ORDER BY b.brand_id
    `).all() as SourceHouse[];
    if (!houses.length) throw new Error("The source contains no editorial houses.");
    const sourceHouseCount = (source.prepare("SELECT COUNT(*) AS count FROM brands").get() as { count: number }).count;
    if (new Set(houses.map((house) => house.brand_id)).size !== sourceHouseCount || houses.length !== sourceHouseCount) {
      throw new Error("Every house must have exactly one artwork and representative selection.");
    }
    const houseIds = new Set(houses.map((house) => house.brand_id));
    for (const house of houses) {
      if (!house.brand_name.trim() || !["Nișă", "Dupe", "Designer"].includes(house.selection_category)) {
        throw new Error(`Invalid house: ${house.brand_id}`);
      }
      safeUrl(house.official_site_url);
      validateAsset(house.asset_path, "/images/brand-editorial/");
    }
    const database = getMasterFragranceDatabase();
    const find = database.prepare(`
      SELECT row_id, record_id, canonical_key, brand, perfume, record_json FROM fragrances
      WHERE record_id = ? OR canonical_key = ?
    `);
    const records = source.prepare("SELECT * FROM fragrances ORDER BY source_row_id").all() as SourceFragrance[];
    if (!records.length) throw new Error("The source contains no fragrances.");
    const definitions = source.prepare("SELECT * FROM fragrance_badge_definitions").all() as Array<{
      badge_family: string; badge_code: string; rank: number; min_value: number | null; max_value_exclusive: number | null;
    }>;
    const sourceFamilies: Record<BadgeFamily, string> = {
      community: "community_score", popularity: "popularity", olfactive: "olfactive_score",
    };
    for (const family of BADGE_FAMILIES) {
      const minimums = family === "popularity" ? [null, 1, 50, 200, 1000, 5000] : [null, 0, 60, 70, 80, 90];
      const maximums = family === "popularity" ? [null, 50, 200, 1000, 5000, null] : [null, 60, 70, 80, 90, null];
      for (const [rank, code] of BADGE_CODES[family].entries()) {
        const definition = definitions.find((item) => item.badge_family === sourceFamilies[family] && item.badge_code === code);
        if (!definition || definition.rank !== rank || definition.min_value !== minimums[rank]
          || definition.max_value_exclusive !== maximums[rank]) {
          throw new Error(`Unexpected badge definition: ${family}/${code}`);
        }
      }
    }
    if (definitions.length !== 18) throw new Error("Expected exactly 18 badge definitions.");
    const badgeRows = source.prepare("SELECT * FROM fragrance_badges").all() as Array<{
      source_record_id: string; community_badge_code: string; popularity_badge_code: string;
      olfactive_badge_code: string; badge_status: string; method_id: string; generated_date: string;
    }>;
    const sourceIds = new Set(records.map((record) => record.source_record_id));
    const badges = new Map<string, number[]>();
    for (const row of badgeRows) {
      const levels = [
        badgeLevel("community", row.community_badge_code),
        badgeLevel("popularity", row.popularity_badge_code),
        badgeLevel("olfactive", row.olfactive_badge_code),
      ];
      const defined = levels.filter((level) => level > 0).length;
      const status = defined === 3 ? "all_defined" : defined === 0 ? "all_undefined" : "partially_undefined";
      if (!sourceIds.has(row.source_record_id) || badges.has(row.source_record_id) || row.badge_status !== status
        || !row.method_id.trim() || !row.generated_date.trim()) {
        throw new Error(`Invalid badge identity, status or provenance: ${row.source_record_id}`);
      }
      badges.set(row.source_record_id, levels);
    }
    if (badges.size !== records.length) throw new Error("Every source fragrance must have exactly one badge row.");
    const claimedRows = new Set<number>();
    const assignments = records.map((record) => {
      if (!houseIds.has(record.brand_id) || !record.source_record_id.trim() || !record.canonical_key.trim()
        || !record.source_brand_name.trim() || !record.perfume_name.trim()) throw new Error("Invalid source identity.");
      const rows = find.all(record.source_record_id, record.canonical_key) as CanonicalRow[];
      for (const row of rows) {
        if (normalize(row.brand) !== normalize(record.source_brand_name)
          || normalize(row.perfume) !== normalize(record.perfume_name)) {
          throw new Error(`Canonical identity mismatch: ${record.source_record_id}`);
        }
        if (claimedRows.has(row.row_id)) throw new Error(`Overlapping source identities: ${record.source_record_id}`);
        claimedRows.add(row.row_id);
      }
      const patch: MasterFragranceRecord = {};
      for (const [field, value] of Object.entries({
        launchYear: record.launch_year, perfumer: record.perfumer, gender: record.gender,
        description: record.description, rating: record.rating, voteCount: record.vote_count,
        externalUrl: safeUrl(record.source_url),
      })) {
        if (typeof value === "string" && value.trim()) patch[field] = value.trim();
      }
      const notes = list(record.notes_json);
      const accords = list(record.accords_json);
      if (notes.length) patch.notes = notes;
      if (accords.length) patch.mainAccords = accords;
      if (record.image_exists === 1) {
        if (!record.project_image_path) throw new Error("Source marks a missing photo as available.");
        validateAsset(record.project_image_path, "/images/perfumes/");
        patch.localImagePath = record.project_image_path;
      }
      return { record, rows, patch };
    });
    const validTerritories = new Set(Object.values(territories).map((territory) => territory.id));
    const suggestions = new Map<string, TerritorySuggestion[]>();
    for (const row of source.prepare("SELECT * FROM fragrance_territory_suggestions").all() as Array<{
      source_record_id: string; territory_id: string; score: number; confidence: string;
      review_status: string; evidence_terms_json: string; evidence_source_url: string | null; method_id: string;
    }>) {
      if (!validTerritories.has(row.territory_id)) throw new Error(`Unknown territory: ${row.territory_id}`);
      const items = suggestions.get(row.source_record_id) ?? [];
      items.push({
        id: row.territory_id, score: row.score, confidence: row.confidence, status: row.review_status,
        evidence: list(row.evidence_terms_json), source: safeUrl(row.evidence_source_url), method: row.method_id,
      });
      suggestions.set(row.source_record_id, items);
    }
    const similarities = new Map<string, DupeEvidence[]>();
    const featuredSimilarities = new Map<string, DupeEvidence[]>();
    for (const row of source.prepare(`
      SELECT d.*, COALESCE(d.subject_source_record_id, f.source_record_id) AS resolved_record_id
      FROM dupe_similarities d LEFT JOIN featured_fragrances f ON f.featured_id = d.subject_featured_id
    `).all() as Array<{
      resolved_record_id: string | null; subject_brand_id: string;
      research_status: string; reference_brand: string | null;
      reference_perfume: string | null; evidence_source_url: string | null; evidence_source_type: string | null;
      evidence_summary: string | null; confidence: number | null;
    }>) {
      const target = row.resolved_record_id ? similarities : featuredSimilarities;
      const key = row.resolved_record_id ?? row.subject_brand_id;
      const items = target.get(key) ?? [];
      items.push({
        status: row.research_status, referenceBrand: row.reference_brand, referencePerfume: row.reference_perfume,
        source: safeUrl(row.evidence_source_url), sourceType: row.evidence_source_type,
        summary: row.evidence_summary, confidence: row.confidence,
      });
      target.set(key, items);
    }
    const importedAt = new Date().toISOString();
    const digest = createHash("sha256").update(fs.readFileSync(sourcePath)).digest("hex");
    const summary = {
      houses: houses.length, sourceFragrances: records.length, existingCanonicalRows: claimedRows.size,
      newFragrances: assignments.filter((assignment) => assignment.rows.length === 0).length,
      badgeRows: badges.size,
      badgeMethods: [...new Set(badgeRows.map((row) => row.method_id))],
      badgeDates: [...new Set(badgeRows.map((row) => row.generated_date))],
      sourceSha256: digest, importedAt,
    };
    if (!values.apply) { console.log(JSON.stringify({ mode: "dry-run", ...summary }, null, 2)); return; }
    if (isMasterFragranceDatabaseReadOnly()) throw new Error("Cannot import into a read-only database.");
    const backupPath = `${getMasterFragranceDatabasePath()}.before-editorial-${importedAt.replace(/[:.]/g, "-")}.bak`;
    await database.backup(backupPath);
    database.transaction(() => {
      const priorDetails = new Map<number, EditorialFragranceDetails>();
      const columns = database.prepare("PRAGMA table_info(editorial_fragrances)").all() as Array<{ name: string }>;
      if (columns.some((column) => column.name === "data_json")) {
        const old = database.prepare("SELECT row_id, data_json FROM editorial_fragrances").all() as Array<{ row_id: number; data_json: string }>;
        for (const row of old) priorDetails.set(row.row_id, JSON.parse(row.data_json) as EditorialFragranceDetails);
      } else if (columns.length) {
        const old = database.prepare("SELECT details_blob FROM editorial_houses").all() as Array<{ details_blob: Buffer }>;
        for (const house of old) {
          for (const [rowId, details] of Object.entries(decodeEditorialDetails(house.details_blob))) {
            priorDetails.set(Number(rowId), details);
          }
        }
      }
      database.exec("DROP TABLE IF EXISTS editorial_fragrances; DROP TABLE IF EXISTS editorial_houses;");
      database.exec(curatedCatalogSchema);
      database.exec(fragranceBadgeSchema);
      database.exec("DELETE FROM fragrance_badges");
      const saveBadges = database.prepare("INSERT INTO fragrance_badges VALUES (?, ?, ?, ?)");
      const saveHouse = database.prepare("INSERT INTO editorial_houses VALUES (?, ?, ?, ?, ?)");
      const detailsByHouse = new Map<string, Record<string, EditorialFragranceDetails>>();
      for (const house of houses) {
        const data: EditorialHouse = {
          id: house.brand_id, name: normalizeMasterBrandName(house.brand_name), category: house.selection_category,
          description: house.editorial_description_ro, descriptionStatus: house.description_status,
          website: safeUrl(house.official_site_url), websiteStatus: house.official_site_status,
          image: house.asset_path, imageAlt: house.alt_text_ro, representative: house.representative_perfume_name,
          featuredRecordId: house.source_record_id, featuredStatus: house.match_status,
          featuredSimilarities: featuredSimilarities.get(house.brand_id) ?? [],
          completeness: house.catalog_completeness_status, count: 0,
        };
        saveHouse.run(data.id, data.name, data.category, JSON.stringify(data), gzipSync("{}"));
        detailsByHouse.set(data.id, {});
      }
      const saveRecord = database.prepare(`
        UPDATE fragrances SET launch_year = ?, rating = ?, image_url = ?, local_image_path = ?, record_json = ? WHERE row_id = ?
      `);
      const saveMembership = database.prepare("INSERT INTO editorial_fragrances VALUES (?, ?, ?)");
      for (const { record, patch } of assignments) {
        let rows = find.all(record.source_record_id, record.canonical_key) as CanonicalRow[];
        if (!rows.length) {
          insertMasterFragrance({
            id: record.source_record_id, canonicalKey: record.canonical_key,
            brand: record.source_brand_name, perfume: record.perfume_name,
            source: record.source_name ?? "editorial-import", ...patch,
          });
          rows = find.all(record.source_record_id, record.canonical_key) as CanonicalRow[];
        }
        for (const row of rows) {
          if (normalize(row.brand) !== normalize(record.source_brand_name)
            || normalize(row.perfume) !== normalize(record.perfume_name)) {
            throw new Error(`Canonical identity changed during import: ${record.source_record_id}`);
          }
          const current = JSON.parse(row.record_json) as MasterFragranceRecord;
          const previousValues = priorDetails.get(row.row_id)?.previousValues ?? {};
          for (const key of Object.keys(patch)) {
            if (JSON.stringify(current[key]) !== JSON.stringify(patch[key]) && !(key in previousValues)) {
              previousValues[key] = current[key] ?? null;
            }
          }
          const next = { ...current, ...patch };
          const relationships = relationshipsFromEvidence(similarities.get(record.source_record_id) ?? []);
          if (relationships.length) next.relationships = relationships;
          if (patch.localImagePath && next.userDnaProfiles) {
            next.userDnaProfiles = next.userDnaProfiles.map((profile) => ({
              ...profile, canonicalLocalImagePath: patch.localImagePath,
            }));
          }
          saveRecord.run(String(next.launchYear ?? ""), String(next.rating ?? ""),
            String(next.imageUrl ?? ""), String(next.localImagePath ?? ""), JSON.stringify(next), row.row_id);
          const details: EditorialFragranceDetails = {
            olfactiveScore: scores.get(record.source_record_id) ?? null,
            creatorCredits: creatorCredits(record.perfumer, safeUrl(record.source_url)),
            sourceRecordId: record.source_record_id, sourceUrl: safeUrl(record.source_url), importedAt,
            previousValues, territories: suggestions.get(record.source_record_id) ?? [],
            similarities: similarities.get(record.source_record_id) ?? [],
          };
          saveMembership.run(row.row_id, record.brand_id, record.source_record_id);
          const levels = badges.get(record.source_record_id);
          if (!levels) throw new Error(`Missing badges: ${record.source_record_id}`);
          saveBadges.run(row.row_id, ...levels);
          const houseDetails = detailsByHouse.get(record.brand_id);
          if (!houseDetails) throw new Error(`Missing editorial house: ${record.brand_id}`);
          houseDetails[row.row_id] = details;
        }
      }
      const saveDetails = database.prepare("UPDATE editorial_houses SET details_blob = ? WHERE brand_id = ?");
      for (const [brandId, details] of detailsByHouse) {
        saveDetails.run(gzipSync(JSON.stringify(details)), brandId);
      }
      database.prepare("INSERT OR REPLACE INTO metadata VALUES ('editorial_catalog_import', ?)").run(JSON.stringify(summary));
    })();
    database.exec("VACUUM");
    console.log(JSON.stringify({ mode: "apply", ...summary, backupPath }, null, 2));
  } finally { source.close(); }
}

main().catch((error: unknown) => {
  console.error(`[import-house-articles] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
