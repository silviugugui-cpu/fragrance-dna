import type { OlfactoryVector } from "@/lib/types";

export type BehaviorPreferenceSummary = {
  canonicalAttributeId: string;
  strength: number;
  confidence: number;
  evidenceCount: number;
  explorationPriority: number;
  lastUpdated: string;
  disposition: "liked" | "disliked" | "uncertain";
  signals: {
    liked: number;
    disliked: number;
    ignored: number;
    uncertain: number;
  };
};

export type LearningApi = {
  getAttributePreference: (canonicalAttributeId: string) => BehaviorPreferenceSummary;
  getAttributeConfidence: (canonicalAttributeId: string) => number;
  getAttributesNeedingExploration: (limit?: number) => string[];
  getUncertainAttributes: (limit?: number) => string[];
  getHighlyEnjoyableFragrances: (limit?: number) => string[];
  getLearningMaximizingFragrances: (limit?: number) => string[];
  explainNextSelection: (fragranceId: string) => string;
  deriveCurrentDna: (groundingVector: OlfactoryVector) => OlfactoryVector;
};
