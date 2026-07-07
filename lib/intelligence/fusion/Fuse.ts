import type { OlfactoryVector } from "../../types";
import { DEFAULT_DNA_FUSION_WEIGHTING_PROFILE } from "./profile";
import type { DNAFusionConfidence, DNAFusionInput, DNAFusionWeightingProfile } from "./types";

export function Fuse(input: DNAFusionInput): OlfactoryVector {
  const next = { ...input.grounding };

  for (const axis of Object.keys(next) as Array<keyof OlfactoryVector>) {
    const behaviorInfluence = resolveBehaviorInfluence(axis, input.confidence, DEFAULT_DNA_FUSION_WEIGHTING_PROFILE);
    const groundingInfluence = 1 - behaviorInfluence;

    next[axis] = clamp01(
      input.grounding[axis] * groundingInfluence + input.behavior[axis] * behaviorInfluence
    );
  }

  return next;
}

function resolveBehaviorInfluence(
  axis: keyof OlfactoryVector,
  confidence: DNAFusionConfidence,
  profile: DNAFusionWeightingProfile
): number {
  const globalConfidence = clamp01(confidence.global);
  const axisConfidence = clamp01(confidence.axes?.[axis] ?? globalConfidence);
  const effectiveConfidence = clamp01(
    globalConfidence * (1 - profile.axisConfidenceInfluence) +
      axisConfidence * profile.axisConfidenceInfluence
  );
  const curvedConfidence = Math.pow(effectiveConfidence, profile.confidenceCurveExponent);

  return clamp01(
    profile.minimumBehaviorInfluence +
      (profile.maximumBehaviorInfluence - profile.minimumBehaviorInfluence) * curvedConfidence
  );
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}