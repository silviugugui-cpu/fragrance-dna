import type {
  BrandMetadataField,
  BrandModel,
  BrandValidationResult,
} from "@/lib/builder/brand/types";
import type { BrandInheritanceContract } from "@/lib/builder/brand/inheritance";

const emptyResult = (): BrandValidationResult => ({
  valid: true,
  errors: [],
  warnings: [],
});

export const validateBrand = (brand: BrandModel): BrandValidationResult => {
  const result = emptyResult();

  if (!brand.brandId.trim()) {
    result.valid = false;
    result.errors.push("brandId is required");
  }

  if (!brand.brandName.trim()) {
    result.valid = false;
    result.errors.push("brandName is required");
  }

  if (!brand.origin.trim()) {
    result.valid = false;
    result.errors.push("origin is required");
  }

  if (!brand.version.trim()) {
    result.valid = false;
    result.errors.push("version is required");
  }

  if (!brand.generatedBy.trim()) {
    result.valid = false;
    result.errors.push("generatedBy is required");
  }

  result.warnings.push("Placeholder validation: extend domain constraints in future milestones.");
  return result;
};

export const validateInheritance = (
  contract: BrandInheritanceContract,
): BrandValidationResult => {
  const result = emptyResult();

  if (!contract.brandId.trim()) {
    result.valid = false;
    result.errors.push("inheritance contract requires brandId");
  }

  if (contract.overridePolicy !== "fragrance-level-explicit-only") {
    result.valid = false;
    result.errors.push("invalid overridePolicy");
  }

  result.warnings.push("Placeholder validation: inheritance resolution is contract-only in this milestone.");
  return result;
};

export const validateMetadata = (
  metadata: Record<string, BrandMetadataField<unknown>>,
): BrandValidationResult => {
  const result = emptyResult();

  for (const [key, field] of Object.entries(metadata)) {
    if (!key.trim()) {
      result.valid = false;
      result.errors.push("metadata key must not be empty");
    }

    if (!field.state) {
      result.valid = false;
      result.errors.push(`metadata field ${key} missing state`);
    }
  }

  result.warnings.push("Placeholder validation: metadata taxonomy constraints deferred.");
  return result;
};
