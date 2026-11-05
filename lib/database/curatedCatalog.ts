import { getMasterFragranceDatabase, type MasterFragranceRecord } from "./masterFragranceDatabase";
import { gunzipSync } from "node:zlib";
import type { BadgeFilters, FragranceBadges } from "../fragranceBadges";
import { badgeFilterSql, badgesFromColumns, type BadgeColumns } from "./fragranceBadgeStorage";
import type { CreatorCredit } from "../data/perfumerEvidence";
import { getFragranceReferenceHref } from "./fragrancePages";

export const curatedCatalogSchema = `
  CREATE TABLE IF NOT EXISTS editorial_houses (
    brand_id TEXT PRIMARY KEY,
    brand_name TEXT NOT NULL,
    category TEXT NOT NULL,
    data_json TEXT NOT NULL,
    details_blob BLOB NOT NULL
  );
  CREATE TABLE IF NOT EXISTS editorial_fragrances (
    row_id INTEGER PRIMARY KEY REFERENCES fragrances(row_id) ON DELETE CASCADE,
    brand_id TEXT NOT NULL REFERENCES editorial_houses(brand_id),
    source_record_id TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_editorial_fragrances_brand ON editorial_fragrances(brand_id);
`;

export interface EditorialHouse {
  id: string;
  name: string;
  category: string;
  description: string;
  descriptionStatus: string;
  website: string | null;
  websiteStatus: string;
  image: string;
  imageAlt: string;
  representative: string;
  featuredRecordId: string | null;
  featuredStatus: string;
  featuredSimilarities: DupeEvidence[];
  completeness: string;
  count: number;
  matchingCount?: number;
}

export interface TerritorySuggestion {
  id: string;
  score: number;
  confidence: string;
  status: string;
  evidence: string[];
  source: string | null;
  method: string;
}

export interface DupeEvidence {
  referenceHref?: string;
  status: string;
  referenceBrand: string | null;
  referencePerfume: string | null;
  source: string | null;
  sourceType: string | null;
  summary: string | null;
  confidence: number | null;
}

export interface EditorialFragranceDetails {
  olfactiveScore?: number | null;
  creatorCredits?: CreatorCredit[];
  sourceRecordId: string;
  sourceUrl: string | null;
  importedAt: string;
  previousValues: Record<string, unknown>;
  territories: TerritorySuggestion[];
  similarities: DupeEvidence[];
}

export interface EditorialFragrance {
  rowId: number;
  record: MasterFragranceRecord;
  details: EditorialFragranceDetails;
  badges: FragranceBadges;
}

export function decodeEditorialDetails(blob: Buffer): Record<string, EditorialFragranceDetails> {
  return JSON.parse(gunzipSync(blob).toString("utf8")) as Record<string, EditorialFragranceDetails>;
}

export function readEditorialHouses(filters: BadgeFilters = {}): EditorialHouse[] {
  const badgeFilters = badgeFilterSql(filters);
  const predicate = badgeFilters.clauses.join(" AND ") || "1";
  const rows = getMasterFragranceDatabase().prepare(`
    SELECT h.data_json, COUNT(DISTINCT f.source_record_id) AS count,
      COUNT(DISTINCT CASE WHEN ${predicate} THEN f.source_record_id END) AS matching_count
    FROM editorial_houses h
    LEFT JOIN editorial_fragrances f ON f.brand_id = h.brand_id
    LEFT JOIN fragrance_badges b ON b.row_id = f.row_id
    GROUP BY h.brand_id ORDER BY h.brand_name COLLATE NOCASE
  `).all(...badgeFilters.params) as Array<{ data_json: string; count: number; matching_count: number }>;
  return rows.map((row) => ({
    ...JSON.parse(row.data_json) as EditorialHouse, count: row.count, matchingCount: row.matching_count,
  }));
}

export function readEditorialHouseCatalog(brandId: string, query: string, requestedPage: number, filters: BadgeFilters = {}) {
  const database = getMasterFragranceDatabase();
  const house = readEditorialHouses().find((item) => item.id === brandId);
  if (!house) return null;
  const badgeFilters = badgeFilterSql(filters);
  const params = [brandId, query.trim(), query.trim(), brandId, ...badgeFilters.params];
  const where = `e.brand_id = ? AND (? = '' OR instr(lower(f.perfume), lower(?)) > 0)
    AND e.row_id IN (SELECT MIN(row_id) FROM editorial_fragrances WHERE brand_id = ? GROUP BY source_record_id)
    ${badgeFilters.clauses.length ? `AND ${badgeFilters.clauses.join(" AND ")}` : ""}`;
  const total = (database.prepare(`
    SELECT COUNT(*) AS count FROM editorial_fragrances e JOIN fragrances f ON f.row_id = e.row_id
    LEFT JOIN fragrance_badges b ON b.row_id = e.row_id
    WHERE ${where}
  `).get(...params) as { count: number }).count;
  const pageSize = 24;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(pages, Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1));
  const rows = database.prepare(`
    SELECT f.row_id, f.record_id, f.canonical_key, f.record_json, b.community_level, b.popularity_level, b.olfactive_level FROM editorial_fragrances e
    JOIN fragrances f ON f.row_id = e.row_id
    LEFT JOIN fragrance_badges b ON b.row_id = e.row_id WHERE ${where}
    ORDER BY CASE WHEN e.source_record_id = ? THEN 0 ELSE 1 END, f.perfume COLLATE NOCASE, f.row_id
    LIMIT ? OFFSET ?
  `).all(...params, house.featuredRecordId ?? "", pageSize, (page - 1) * pageSize) as Array<{
    row_id: number; record_id: string; canonical_key: string; record_json: string;
  } & BadgeColumns>;
  const stored = database.prepare("SELECT details_blob FROM editorial_houses WHERE brand_id = ?")
    .get(brandId) as { details_blob: Buffer };
  const details = decodeEditorialDetails(stored.details_blob);
  const accords = database.prepare(`
    SELECT lower(trim(a.value)) AS accord, COUNT(DISTINCT e.source_record_id) AS count
    FROM editorial_fragrances e JOIN fragrances f ON f.row_id = e.row_id,
      json_each(f.record_json, '$.mainAccords') a
    WHERE e.brand_id = ? AND a.type = 'text' AND trim(a.value) <> ''
    GROUP BY lower(trim(a.value)) ORDER BY count DESC, accord LIMIT 4
  `).all(brandId) as Array<{ accord: string; count: number }>;
  return {
    house, total, page, pages, houseAccords: accords.map((row) => row.accord),
    fragrances: rows.map((row): EditorialFragrance => {
      if (!details[row.row_id]) throw new Error(`Missing editorial provenance for canonical row ${row.row_id}.`);
      const record = JSON.parse(row.record_json) as MasterFragranceRecord;
      return {
        rowId: row.row_id,
        record: {
          id: row.record_id, canonicalKey: row.canonical_key, brand: record.brand, perfume: record.perfume, launchYear: record.launchYear,
          perfumer: record.perfumer, description: record.description, mainAccords: record.mainAccords,
          notes: record.notes, localImagePath: record.localImagePath, imageUrl: record.imageUrl, blobImageUrl: record.blobImageUrl,
        },
        details: {
          sourceRecordId: details[row.row_id].sourceRecordId,
          sourceUrl: details[row.row_id].sourceUrl,
          importedAt: details[row.row_id].importedAt,
          previousValues: {},
          territories: details[row.row_id].territories,
          similarities: details[row.row_id].similarities.map((item) => ({
            ...item, referenceHref: getFragranceReferenceHref(item.referenceBrand ?? "", item.referencePerfume ?? ""),
          })),
        },
        badges: badgesFromColumns(row),
      };
    }),
  };
}

export function readEditorialFragranceDetails(rowId: number): EditorialFragranceDetails | null {
  const stored = getMasterFragranceDatabase().prepare(`
    SELECT h.details_blob FROM editorial_houses h
    JOIN editorial_fragrances e ON e.brand_id = h.brand_id WHERE e.row_id = ?
  `).get(rowId) as { details_blob: Buffer } | undefined;
  if (!stored) return null;
  const details = decodeEditorialDetails(stored.details_blob)[rowId];
  if (!details) throw new Error(`Missing editorial provenance for canonical row ${rowId}.`);
  return details;
}

export function readPurchaseRecommendationFragrances(filters: BadgeFilters = {}): MasterFragranceRecord[] {
  const database = getMasterFragranceDatabase();
  const imported = database.prepare("SELECT value FROM metadata WHERE key = 'editorial_catalog_import'").get();
  if (!imported) throw new Error("The selected perfume-house catalog has not been imported.");
  const badgeFilters = badgeFilterSql(filters);
  const rows = database.prepare(`
    SELECT f.record_json, b.community_level, b.popularity_level, b.olfactive_level FROM fragrances f
    JOIN editorial_fragrances e ON e.row_id = f.row_id
    LEFT JOIN fragrance_badges b ON b.row_id = f.row_id
    ${badgeFilters.clauses.length ? `WHERE ${badgeFilters.clauses.join(" AND ")}` : ""}
    ORDER BY f.row_id
  `).all(...badgeFilters.params) as Array<{ record_json: string } & BadgeColumns>;
  return rows.map((row) => ({ ...JSON.parse(row.record_json) as MasterFragranceRecord, badges: badgesFromColumns(row) }));
}
