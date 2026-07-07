export type CanonicalFragranceAttribute = {
  canonicalAttributeId: string;
  displayName: string;
  source: "core" | "supporting" | "derived";
  metadata?: {
    family?: string;
    description?: string;
    localizationKey?: string;
  };
  confidence?: number;
  importance?: number;
};

export type CanonicalFragranceModel = {
  fragranceId: string;
  displayName: string;
  coreAttributes: CanonicalFragranceAttribute[];
  supportingAttributes: CanonicalFragranceAttribute[];
};

export type EvaluationFragranceRef = {
  fragranceId: string;
  displayName: string;
};

export type SessionFragranceRef = {
  fragranceId: string;
  displayName: string;
  notes: string[];
};

export interface FragranceIntelligenceService {
  listEvaluationFragrances(): EvaluationFragranceRef[];
  listSessionFragrances(): SessionFragranceRef[];
  getCanonicalFragrance(fragranceId: string): CanonicalFragranceModel | null;
}
