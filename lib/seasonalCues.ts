export const SEASON_ACCORDS = {
  spring: ["floral", "white floral", "green", "rose", "iris", "violet", "powdery", "lavender", "yellow floral", "tuberose"],
  summer: ["citrus", "fresh", "aquatic", "marine", "ozonic", "tropical", "fresh spicy", "herbal", "salty"],
  autumn: ["woody", "earthy", "mossy", "leather", "patchouli", "warm spicy", "soft spicy", "smoky", "oud"],
  winter: ["vanilla", "sweet", "amber", "balsamic", "caramel", "honey", "cinnamon", "tobacco", "lactonic"],
};

export type CueSeason = keyof typeof SEASON_ACCORDS;

export function isCueSeason(value: string): value is CueSeason {
  return Object.prototype.hasOwnProperty.call(SEASON_ACCORDS, value);
}

export function seasonalCueAccords(accords: string[], season: CueSeason): string[] {
  const expected = new Set(SEASON_ACCORDS[season]);
  return [...new Set(accords.map((accord) => accord.trim().toLowerCase()))].filter((accord) => expected.has(accord));
}
