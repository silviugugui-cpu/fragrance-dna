import { BrandRegistry } from "@/lib/builder/brand/registry";
import type { BrandModel } from "@/lib/builder/brand/types";
import { validateBrand } from "@/lib/builder/brand/validation";

export interface BrandRepository {
  getBrand(brandId: string): BrandModel | null;
  getAllBrands(): BrandModel[];
  registerBrand(brand: BrandModel): BrandModel;
  updateBrand(brandId: string, updates: Partial<BrandModel>): BrandModel | null;
  removeBrand(brandId: string): boolean;
}

export class InMemoryBrandRepository implements BrandRepository {
  private readonly registry: BrandRegistry;

  constructor(registry: BrandRegistry = new BrandRegistry()) {
    this.registry = registry;
  }

  getBrand(brandId: string): BrandModel | null {
    const item = this.registry.getByBrandId(brandId);
    return item ? deepClone(item) : null;
  }

  getAllBrands(): BrandModel[] {
    return this.registry.listBrands().map((item) => deepClone(item));
  }

  registerBrand(brand: BrandModel): BrandModel {
    const identifier = this.registry.validateIdentifier(brand.brandId);
    if (!identifier.valid) {
      throw new Error(identifier.errors.join("; "));
    }

    if (this.registry.hasBrandId(identifier.normalizedId)) {
      throw new Error(`Duplicate brandId: ${identifier.normalizedId}`);
    }

    if (this.registry.getByBrandName(brand.brandName)) {
      throw new Error(`Duplicate brandName: ${brand.brandName}`);
    }

    const validation = validateBrand(brand);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    this.registry.register(deepClone(brand));
    return deepClone(brand);
  }

  updateBrand(brandId: string, updates: Partial<BrandModel>): BrandModel | null {
    const existing = this.registry.getByBrandId(brandId);
    if (!existing) {
      return null;
    }

    const next: BrandModel = {
      ...existing,
      ...updates,
      brandId: existing.brandId,
      updatedAt: updates.updatedAt ?? new Date().toISOString(),
    };

    const validation = validateBrand(next);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = this.registry.getByBrandName(next.brandName);
    if (existingByName && existingByName.brandId !== existing.brandId) {
      throw new Error(`Duplicate brandName: ${next.brandName}`);
    }

    this.registry.update(deepClone(next));
    return deepClone(next);
  }

  removeBrand(brandId: string): boolean {
    return this.registry.remove(brandId);
  }

  getRegistry(): BrandRegistry {
    return this.registry;
  }
}

export const createInMemoryBrandRepository = (): InMemoryBrandRepository =>
  new InMemoryBrandRepository();

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
