import { BADGE_CODES, BADGE_FAMILIES, badgeLevel, type BadgeFilters, type FragranceBadges } from "../fragranceBadges";

export const fragranceBadgeSchema = `
  CREATE TABLE IF NOT EXISTS fragrance_badges (
    row_id INTEGER PRIMARY KEY REFERENCES fragrances(row_id) ON DELETE CASCADE,
    community_level INTEGER NOT NULL CHECK(community_level BETWEEN 0 AND 5),
    popularity_level INTEGER NOT NULL CHECK(popularity_level BETWEEN 0 AND 5),
    olfactive_level INTEGER NOT NULL CHECK(olfactive_level BETWEEN 0 AND 5)
  );
`;

export interface BadgeColumns {
  community_level: number | null;
  popularity_level: number | null;
  olfactive_level: number | null;
}

export function badgesFromColumns(row: BadgeColumns): FragranceBadges {
  for (const family of BADGE_FAMILIES) {
    const level = row[`${family}_level`];
    if (level !== null && (!Number.isInteger(level) || level < 0 || level > 5)) {
      throw new Error(`Invalid stored ${family} badge level.`);
    }
  }
  return {
    community: BADGE_CODES.community[row.community_level ?? 0],
    popularity: BADGE_CODES.popularity[row.popularity_level ?? 0],
    olfactive: BADGE_CODES.olfactive[row.olfactive_level ?? 0],
  };
}

export function badgeFilterSql(filters: BadgeFilters, alias = "b"): { clauses: string[]; params: number[] } {
  const clauses: string[] = [];
  const params: number[] = [];
  for (const family of BADGE_FAMILIES) {
    const code = filters[family];
    if (code) {
      clauses.push(`COALESCE(${alias}.${family}_level, 0) = ?`);
      params.push(badgeLevel(family, code));
    }
  }
  return { clauses, params };
}
