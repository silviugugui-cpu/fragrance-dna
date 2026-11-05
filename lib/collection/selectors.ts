import type { CollectionBrandDistribution, CollectionFragrance, CollectionFragranceView, CollectionSummary } from '@/lib/collection/types';

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

export function getTopBrands(collection: Array<CollectionFragrance | CollectionFragranceView>, limit = 3): Array<{ brand: string; count: number }> {
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

export function getCollectionBrandDistribution(collection: Array<CollectionFragrance | CollectionFragranceView>): CollectionBrandDistribution {
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

export function getCollectionDiversity(collection: Array<CollectionFragrance | CollectionFragranceView>): 'Low' | 'Moderate' | 'High' | null {
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

export function getCollectionDNACoverage(_collection: Array<CollectionFragrance | CollectionFragranceView>): number | null {
  // Notes alone do not establish measured DNA-axis coverage.
  return null;
}

export function buildCollectionSummary(collection: Array<CollectionFragrance | CollectionFragranceView>): CollectionSummary {
  return {
    size: getCollectionSize(collection),
    averageRating: getAverageRating(collection),
    topBrand: getTopBrands(collection, 1)[0]?.brand ?? null,
    diversity: getCollectionDiversity(collection),
    dnaCoverage: getCollectionDNACoverage(collection),
  };
}
