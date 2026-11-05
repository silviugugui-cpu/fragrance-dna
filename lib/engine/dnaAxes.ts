import type { OlfactoryVector } from "../types";

// Presence is reserved for an independently measured olfactive signal, not confidence.
export const DNA_AXES = [
  "Freshness", "Warmth", "Complexity", "Elegance", "Character",
  "Comfort", "Uniqueness", "Versatility", "Luxury", "Formality",
] as const;
export type DnaAxis = (typeof DNA_AXES)[number];
export type DnaAxisValues = Partial<Record<DnaAxis, number>>;

export function buildDnaAxisValues(vector: OlfactoryVector): Record<DnaAxis, number> {
  const score = (value: number) => Math.max(0, Math.min(100, Math.round(value * 100)));
  const freshness = score(vector.freshness);
  const warmth = score(vector.warmth);
  const sweetness = score(vector.sweetness);
  const darkness = score(vector.darkness);
  const cleanliness = score(vector.cleanliness);
  const elegance = score(vector.elegance);
  return {
    Freshness: freshness, Warmth: warmth, Elegance: elegance,
    Complexity: Math.round(elegance * .5 + darkness * .3 + warmth * .2),
    Character: Math.round(warmth * .42 + darkness * .4 + sweetness * .18),
    Comfort: Math.round(cleanliness * .62 + sweetness * .38),
    Uniqueness: Math.round(darkness * .58 + elegance * .42),
    Versatility: Math.max(0, Math.min(100, Math.round(100 - Math.abs(warmth - freshness) * .6))),
    Luxury: Math.round(elegance * .68 + warmth * .32),
    Formality: Math.round(elegance * .62 + cleanliness * .38),
  };
}
