import type { BrandModel } from "@/lib/builder/brand/types";

export interface BrandInheritanceContract {
  brandId: string;
  defaults: {
    defaultAvailability: BrandModel["defaultAvailability"];
    defaultAccessibility: BrandModel["defaultAccessibility"];
    defaultPopularity: BrandModel["defaultPopularity"];
    defaultLuxuryLevel: BrandModel["defaultLuxuryLevel"];
    defaultMarketPresence: BrandModel["defaultMarketPresence"];
    defaultDistribution: BrandModel["defaultDistribution"];
    defaultMetadata: BrandModel["defaultMetadata"];
  };
  overridePolicy: "fragrance-level-explicit-only";
  resolutionContract: "contract-only-no-resolution-implementation";
}

export const buildBrandInheritanceContract = (
  brand: BrandModel,
): BrandInheritanceContract => ({
  brandId: brand.brandId,
  defaults: {
    defaultAvailability: brand.defaultAvailability,
    defaultAccessibility: brand.defaultAccessibility,
    defaultPopularity: brand.defaultPopularity,
    defaultLuxuryLevel: brand.defaultLuxuryLevel,
    defaultMarketPresence: brand.defaultMarketPresence,
    defaultDistribution: brand.defaultDistribution,
    defaultMetadata: brand.defaultMetadata,
  },
  overridePolicy: "fragrance-level-explicit-only",
  resolutionContract: "contract-only-no-resolution-implementation",
});
