import type {
  BrandDuplicateIssue,
  BrandIdentifierValidation,
  BrandModel,
} from "@/lib/builder/brand/types";

const BRAND_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export class BrandRegistry {
  private readonly byId = new Map<string, BrandModel>();
  private readonly idByNormalizedName = new Map<string, string>();

  validateIdentifier(brandId: string): BrandIdentifierValidation {
    const normalizedId = this.normalizeBrandId(brandId);
    const errors: string[] = [];

    if (!normalizedId) {
      errors.push("brandId cannot be empty");
    }

    if (normalizedId && !BRAND_ID_PATTERN.test(normalizedId)) {
      errors.push("brandId must match pattern: lowercase alphanumeric and hyphen");
    }

    return {
      valid: errors.length === 0,
      normalizedId,
      errors,
    };
  }

  hasBrandId(brandId: string): boolean {
    return this.byId.has(this.normalizeBrandId(brandId));
  }

  getByBrandId(brandId: string): BrandModel | null {
    return this.byId.get(this.normalizeBrandId(brandId)) ?? null;
  }

  getByBrandName(brandName: string): BrandModel | null {
    const id = this.idByNormalizedName.get(this.normalizeBrandName(brandName));
    if (!id) {
      return null;
    }

    return this.byId.get(id) ?? null;
  }

  listBrands(): BrandModel[] {
    return [...this.byId.values()];
  }

  detectDuplicates(brands: BrandModel[]): BrandDuplicateIssue[] {
    const issues: BrandDuplicateIssue[] = [];
    const idSeen = new Set<string>();
    const nameSeen = new Set<string>();

    for (const brand of brands) {
      const normalizedId = this.normalizeBrandId(brand.brandId);
      const normalizedName = this.normalizeBrandName(brand.brandName);

      if (idSeen.has(normalizedId)) {
        issues.push({
          type: "duplicate-id",
          brandId: brand.brandId,
          brandName: brand.brandName,
        });
      }

      if (nameSeen.has(normalizedName)) {
        issues.push({
          type: "duplicate-name",
          brandId: brand.brandId,
          brandName: brand.brandName,
        });
      }

      idSeen.add(normalizedId);
      nameSeen.add(normalizedName);
    }

    return issues;
  }

  register(brand: BrandModel): void {
    const normalizedId = this.normalizeBrandId(brand.brandId);
    const normalizedName = this.normalizeBrandName(brand.brandName);

    this.byId.set(normalizedId, brand);
    this.idByNormalizedName.set(normalizedName, normalizedId);
  }

  update(brand: BrandModel): void {
    const existing = this.getByBrandId(brand.brandId);
    if (existing) {
      const oldName = this.normalizeBrandName(existing.brandName);
      this.idByNormalizedName.delete(oldName);
    }

    this.register(brand);
  }

  remove(brandId: string): boolean {
    const normalizedId = this.normalizeBrandId(brandId);
    const existing = this.byId.get(normalizedId);
    if (!existing) {
      return false;
    }

    this.byId.delete(normalizedId);
    this.idByNormalizedName.delete(this.normalizeBrandName(existing.brandName));
    return true;
  }

  count(): number {
    return this.byId.size;
  }

  private normalizeBrandId(brandId: string): string {
    return brandId.trim().toLowerCase();
  }

  private normalizeBrandName(brandName: string): string {
    return brandName.trim().toLowerCase().replace(/\s+/g, " ");
  }
}
