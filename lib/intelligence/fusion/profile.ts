import type { DNAFusionWeightingProfile } from "./types";

export const DEFAULT_DNA_FUSION_WEIGHTING_PROFILE: DNAFusionWeightingProfile = {
  minimumBehaviorInfluence: 0,
  maximumBehaviorInfluence: 0.85,
  confidenceCurveExponent: 1.4,
  axisConfidenceInfluence: 0.65,
};