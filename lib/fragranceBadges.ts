export const BADGE_CODES = {
  community: ["undefined", "low", "moderate", "good", "very_good", "top_rated"],
  popularity: ["undefined", "emerging", "growing", "popular", "very_popular", "iconic"],
  olfactive: ["undefined", "discovery", "promising", "noticed", "favorite", "reference"],
} as const;

export type BadgeFamily = keyof typeof BADGE_CODES;
export const BADGE_FAMILIES: BadgeFamily[] = ["community", "popularity", "olfactive"];
export type FragranceBadges = { [K in BadgeFamily]: (typeof BADGE_CODES)[K][number] };
export type BadgeFilters = Partial<Record<BadgeFamily, string>>;
export const UNDEFINED_BADGES: FragranceBadges = {
  community: "undefined", popularity: "undefined", olfactive: "undefined",
};
export class BadgeFilterError extends Error {}

export function badgeLevel(family: BadgeFamily, code: string): number {
  const level = BADGE_CODES[family].findIndex((item) => item === code);
  if (level < 0) throw new BadgeFilterError(`Unknown ${family} badge: ${code}`);
  return level;
}

export function parseBadgeFilters(params: Pick<URLSearchParams, "get">): BadgeFilters {
  const filters: BadgeFilters = {};
  for (const family of BADGE_FAMILIES) {
    const value = params.get(family);
    if (value) {
      badgeLevel(family, value);
      filters[family] = value;
    }
  }
  return filters;
}

export function matchesBadgeFilters(badges: FragranceBadges = UNDEFINED_BADGES, filters: BadgeFilters): boolean {
  return BADGE_FAMILIES.every((family) => !filters[family] || badges[family] === filters[family]);
}
