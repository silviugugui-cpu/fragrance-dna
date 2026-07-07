export type BrandFieldState = "known" | "estimated" | "unknown" | "not-applicable";

export interface BrandPropertyProvenance {
  source: string;
  generator: string;
  method: string;
  confidence: number | null;
  timestamp: string;
}

export interface BrandMetadataField<TValue = unknown> {
  state: BrandFieldState;
  value?: TValue;
  provenance?: BrandPropertyProvenance;
}

export interface BrandBuilderMetadata {
  status: "placeholder" | "ready";
  notes: string[];
  tags: string[];
}

export interface BrandProvenanceBundle {
  properties: Partial<Record<keyof Omit<BrandModel, "provenance">, BrandPropertyProvenance>>;
}

export interface BrandModel {
  brandId: string;
  brandName: string;
  origin: string;
  brandCategory: BrandMetadataField<string>;
  defaultAvailability: BrandMetadataField<unknown>;
  defaultAccessibility: BrandMetadataField<unknown>;
  defaultPopularity: BrandMetadataField<unknown>;
  defaultLuxuryLevel: BrandMetadataField<unknown>;
  defaultMarketPresence: BrandMetadataField<unknown>;
  defaultDistribution: BrandMetadataField<unknown>;
  defaultMetadata: Record<string, BrandMetadataField<unknown>>;
  builderMetadata: BrandBuilderMetadata;
  provenance: BrandProvenanceBundle;
  version: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  generatedBy: string;
}

export interface BrandValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BrandDuplicateIssue {
  type: "duplicate-id" | "duplicate-name";
  brandId: string;
  brandName: string;
}

export interface BrandIdentifierValidation {
  valid: boolean;
  normalizedId: string;
  errors: string[];
}
