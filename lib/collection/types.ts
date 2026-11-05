import type { Fragrance } from '@/lib/types';
import type { FragranceBadges } from '@/lib/fragranceBadges';

export type CollectionFragrance = {
  id: string;
  fragranceId: string;
  name?: string;
  brand?: string;
  image?: string;
  personalRating?: number;
  owned: boolean;
  wishlist?: boolean;
  purchaseDate?: string;
  notes?: string;
};

export type CollectionFragranceView = CollectionFragrance & {
  name: string;
  brand: string;
  image?: string;
  imageCandidates?: Array<string | undefined>;
  launchYear?: string;
  brandType?: string;
  canonicalNotes: string[];
  mainAccords: string[];
  perfumer?: string;
  description?: string;
  confidence?: number;
  badges?: FragranceBadges;
  reviewedTerritories?: import("./territoryCoverage").ReviewedTerritory[];
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
