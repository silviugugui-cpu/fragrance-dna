import type {
  BrandModel,
  BrandPropertyProvenance,
  BrandProvenanceBundle,
} from "@/lib/builder/brand/types";

export interface CreateBrandProvenanceInput {
  source: string;
  generator: string;
  method: string;
  confidence: number | null;
  timestamp?: string;
}

export const createBrandPropertyProvenance = (
  input: CreateBrandProvenanceInput,
): BrandPropertyProvenance => ({
  source: input.source,
  generator: input.generator,
  method: input.method,
  confidence: input.confidence,
  timestamp: input.timestamp ?? new Date().toISOString(),
});

export const createEmptyBrandProvenanceBundle = (): BrandProvenanceBundle => ({
  properties: {},
});

export const attachBrandPropertyProvenance = <
  TField extends keyof Omit<BrandModel, "provenance">
>(
  bundle: BrandProvenanceBundle,
  field: TField,
  provenance: BrandPropertyProvenance,
): BrandProvenanceBundle => ({
  properties: {
    ...bundle.properties,
    [field]: provenance,
  },
});
