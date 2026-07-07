import type { OlfactoryVector } from "../../types";

export type DNAFusionConfidence = {
  global: number;
  axes?: Partial<Record<keyof OlfactoryVector, number>>;
};

export type DNAFusionInput = {
  grounding: OlfactoryVector;
  behavior: OlfactoryVector;
  confidence: DNAFusionConfidence;
};

export type DNAFusionWeightingProfile = {
  minimumBehaviorInfluence: number;
  maximumBehaviorInfluence: number;
  confidenceCurveExponent: number;
  axisConfidenceInfluence: number;
};