import type { BrandModel } from "@/lib/builder/brand/types";

export const BRAND_SCHEMA_VERSION = 1;
export const BRAND_VERSION_PLACEHOLDER = "0.1.0-foundation";

export interface BrandVersioningFields {
  version: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  generatedBy: string;
}

export const createBrandVersioningFields = (
  generatedBy: string,
  now: string = new Date().toISOString(),
): BrandVersioningFields => ({
  version: BRAND_VERSION_PLACEHOLDER,
  schemaVersion: BRAND_SCHEMA_VERSION,
  createdAt: now,
  updatedAt: now,
  generatedBy,
});

export const touchBrandVersion = (
  brand: BrandModel,
  generatedBy: string,
  now: string = new Date().toISOString(),
): BrandModel => ({
  ...brand,
  updatedAt: now,
  generatedBy,
});
