import { getFragranceCatalog } from '@/lib/collection/catalog';
import type { CollectionBrandDistribution, CollectionFragrance, CollectionSummary } from '@/lib/collection/types';

const AXIS_TERMS: Record<string, string[]> = {
  freshness: ['citrus', 'green', 'tea', 'water', 'bergamot', 'lemon', 'lavender'],
  warmth: ['amber', 'honey', 'spice', 'tobacco', 'wood', 'musk', 'oud'],
  sweetness: ['honey', 'rose', 'vanilla', 'amber'],
  darkness: ['oud', 'smoke', 'tobacco', 'woody', 'wood'],
  cleanliness: ['citrus', 'water', 'musk', 'lavender', 'tea'],
  elegance: ['rose', 'tea', 'lavender', 'musk', 'wood', 'bergamot'],
  character: ['oud', 'tobacco', 'smoke', 'amber', 'spice'],
  presence: ['tobacco', 'oud', 'amber', 'spice', 'musk'],
  comfort: ['musk', 'water', 'lavender', 'tea', 'wood', 'amber'],
  uniqueness: ['oud', 'smoke', 'tea', 'green', 'herb', 'water'],
  versatility: ['citrus', 'water', 'tea', 'musk', 'lavender', 'wood'],
  luxury: ['oud', 'amber', 'rose', 'musk', 'wood'],
  formality: ['musk', 'rose', 'lavender', 'wood', 'tea', 'amber'],
};

type CanonicalAxis = keyof typeof AXIS_TERMS;

export function getCollectionSize(collection: CollectionFragrance[]): number {
  return collection.length;
}

export function getAverageRating(collection: CollectionFragrance[]): number | null {
  const ratings = collection
    .map((item) => item.personalRating)
    .filter((rating): rating is number => typeof rating === 'number');

  if (ratings.length === 0) {
    return null;
  }

  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return Math.round(average * 10) / 10;
}

export function getTopBrands(collection: CollectionFragrance[], limit = 3): Array<{ brand: string; count: number }> {
  const counts = new Map<string, number>();

  for (const item of collection) {
    const brand = item.brand || 'Independent';
    counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([brand, count]) => ({ brand, count }))
    .sort((left, right) => right.count - left.count || left.brand.localeCompare(right.brand))
    .slice(0, limit);
}

export function getCollectionBrandDistribution(collection: CollectionFragrance[]): CollectionBrandDistribution {
  if (collection.length === 0) {
    return [];
  }

  const counts = new Map<string, number>();
  for (const item of collection) {
    const brand = item.brand || 'Independent';
    counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([brand, count]) => ({
      brand,
      count,
      percentage: Math.round((count / collection.length) * 100),
    }))
    .sort((left, right) => right.count - left.count || left.brand.localeCompare(right.brand));
}

export function getCollectionDiversity(collection: CollectionFragrance[]): 'Low' | 'Moderate' | 'High' | null {
  if (collection.length === 0) {
    return null;
  }

  const uniqueBrands = new Set(collection.map((item) => item.brand || 'Independent')).size;
  const topBrandShare = getCollectionBrandDistribution(collection)[0]?.percentage ?? 0;

  if (uniqueBrands >= 6 && topBrandShare <= 30) {
    return 'High';
  }
  if (uniqueBrands >= 3 || topBrandShare <= 60) {
    return 'Moderate';
  }
  return 'Low';
}

export function getCollectionDNACoverage(collection: CollectionFragrance[]): number | null {
  const ownedCollection = collection.filter((item) => item.owned);

  if (ownedCollection.length === 0) {
    return null;
  }

  const catalog = getFragranceCatalog();
  const fragranceLookup = new Map(catalog.map((fragrance) => [fragrance.id, fragrance]));
  const coveredAxes = new Set<CanonicalAxis>();

  for (const item of ownedCollection) {
    const fragrance = fragranceLookup.get(item.fragranceId);
    if (!fragrance?.notes) {
      continue;
    }

    for (const [axis, terms] of Object.entries(AXIS_TERMS) as Array<[CanonicalAxis, string[]]>) {
      const hit = fragrance.notes.some((note) => terms.some((term) => note.toLowerCase().includes(term)));
      if (hit) {
        coveredAxes.add(axis);
      }
    }
  }

  return Math.round((coveredAxes.size / Object.keys(AXIS_TERMS).length) * 100);
}

export function buildCollectionSummary(collection: CollectionFragrance[]): CollectionSummary {
  return {
    size: getCollectionSize(collection),
    averageRating: getAverageRating(collection),
    topBrand: getTopBrands(collection, 1)[0]?.brand ?? null,
    diversity: getCollectionDiversity(collection),
    dnaCoverage: getCollectionDNACoverage(collection),
  };
}
