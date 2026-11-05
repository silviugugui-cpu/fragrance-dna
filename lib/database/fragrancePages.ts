import { getMasterFragranceDatabase, normalizeIdentity, type MasterFragranceRecord } from "./masterFragranceDatabase";
import { badgesFromColumns, type BadgeColumns } from "./fragranceBadgeStorage";
import { getFragranceHref } from "../fragranceNavigation";

type Database = ReturnType<typeof getMasterFragranceDatabase>;
type CanonicalRow = {
  row_id: number;
  record_id: string;
  canonical_key: string;
  record_json: string;
} & BadgeColumns;

export function readCanonicalFragrance(identity: string, database: Database = getMasterFragranceDatabase()) {
  const rows = database.prepare(`
    SELECT f.row_id, f.record_id, f.canonical_key, f.record_json,
      b.community_level, b.popularity_level, b.olfactive_level
    FROM fragrances f
    LEFT JOIN fragrance_badges b ON b.row_id = f.row_id
    WHERE f.record_id = ? OR f.canonical_key = ?
      OR f.row_id IN (SELECT row_id FROM editorial_fragrances WHERE source_record_id = ?)
    ORDER BY CASE WHEN f.record_id = ? THEN 0 WHEN f.canonical_key = ? THEN 1 ELSE 2 END, f.row_id
  `).all(identity, identity, identity, identity, identity) as CanonicalRow[];
  if (!rows.length) return null;
  // Duplicate storage rows are valid, but an identity spanning different perfumes is not.
  if (new Set(rows.map((row) => row.canonical_key)).size !== 1) {
    throw new Error(`Ambiguous canonical fragrance identity: ${identity}`);
  }
  const row = rows[0];
  return {
    rowId: row.row_id,
    record: {
      ...JSON.parse(row.record_json) as MasterFragranceRecord,
      id: row.record_id,
      canonicalKey: row.canonical_key,
      badges: badgesFromColumns(row),
    },
  };
}

export function getFragranceReferenceHref(brand: string, perfume: string, database: Database = getMasterFragranceDatabase()): string {
  const key = `${normalizeIdentity(brand)}::${normalizeIdentity(perfume)}`;
  const found = readCanonicalFragrance(key, database);
  return getFragranceHref(found?.record.id, brand, perfume);
}
