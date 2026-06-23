import type { Fragrance } from '@/lib/types';

export type CollectionFragrance = {
  id: string;
  fragranceId: string;
  name: string;
  brand: string;
  image?: string;
  personalRating?: number;
  owned: boolean;
  wishlist?: boolean;
  purchaseDate?: string;
  notes?: string;
};

export type CollectionFilter = 'all' | 'owned' | 'wishlist';
export type CollectionSortKey = 'name' | 'brand' | 'rating';

export type CollectionBrandDistribution = Array<{
  brand: string;
  count: number;
  percentage: number;
}>;

export type CollectionSummary = {
  size: number;
  averageRating: number | null;
  topBrand: string | null;
  diversity: 'Low' | 'Moderate' | 'High' | null;
  dnaCoverage: number | null;
};

export type CollectionSeedOptions = {
  source?: Fragrance[];
  count?: number;
};
