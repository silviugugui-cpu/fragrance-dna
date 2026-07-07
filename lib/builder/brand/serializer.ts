import type { BrandModel } from "@/lib/builder/brand/types";

export interface BrandSerializer {
  serializeBrand(brand: BrandModel): string;
  serializeBrands(brands: BrandModel[]): string;
  deserializeBrand(serialized: string): BrandModel;
  deserializeBrands(serialized: string): BrandModel[];
}

export class PlaceholderBrandSerializer implements BrandSerializer {
  serializeBrand(brand: BrandModel): string {
    return JSON.stringify(brand);
  }

  serializeBrands(brands: BrandModel[]): string {
    return JSON.stringify(brands);
  }

  deserializeBrand(serialized: string): BrandModel {
    return JSON.parse(serialized) as BrandModel;
  }

  deserializeBrands(serialized: string): BrandModel[] {
    const parsed = JSON.parse(serialized) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as BrandModel[];
  }
}
