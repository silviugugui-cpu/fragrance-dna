import type { BrandModel } from "@/lib/builder/brand/types";
import { validateBrand } from "@/lib/builder/brand/validation";

export interface BrandLoadResult {
  brands: BrandModel[];
  errors: string[];
  warnings: string[];
}

export interface BrandLoader {
  loadBrands(input: unknown): BrandLoadResult;
}

export class PlaceholderBrandLoader implements BrandLoader {
  loadBrands(input: unknown): BrandLoadResult {
    const errors: string[] = [];
    const warnings: string[] = [
      "Placeholder loader: no IO or source ingestion is executed in this milestone.",
    ];

    if (!Array.isArray(input)) {
      return {
        brands: [],
        errors: ["Expected array input for placeholder brand loading"],
        warnings,
      };
    }

    const brands: BrandModel[] = [];
    for (const candidate of input) {
      const brand = candidate as BrandModel;
      const validation = validateBrand(brand);
      if (!validation.valid) {
        errors.push(...validation.errors);
        continue;
      }
      brands.push(brand);
    }

    return {
      brands,
      errors,
      warnings,
    };
  }
}
