import { UserDNAProfile, OlfactoryVector, EvolutionStage, DriftSnapshot } from "@/lib/types";

const STORAGE_KEY = "fragrance_user_profile";
const MAX_DRIFT_HISTORY = 50; // Keep last 50 snapshots

/**
 * Initialize or retrieve user DNA profile
 * Uses localStorage for persistence (can be upgraded to DB later)
 */
export function getOrCreateUserProfile(userId?: string): UserDNAProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UserDNAProfile;
    }
  } catch (e) {
    console.warn("Failed to load user profile from storage:", e);
  }

  // Create default profile
  return createDefaultProfile(userId || generateUserId());
}

/**
 * Save user profile to storage
 */
export function saveUserProfile(profile: UserDNAProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save user profile:", e);
  }
}

/**
 * Update user vector and track evolution
 */
export function updateUserVector(
  profile: UserDNAProfile,
  newVector: OlfactoryVector,
  confidenceLevel: number
): UserDNAProfile {
  const now = Date.now();

  // Calculate stability index based on vector similarity to previous
  const similarity = vectorSimilarity(profile.dnaVector, newVector);
  const newStability = Math.min(1, (profile.dnaStabilityIndex + similarity) / 2);

  // Determine evolution stage based on interaction count and stability
  const evolutionStage = determineEvolutionStage(
    profile.totalInteractions + 1,
    newStability
  );

  // Add to drift history
  const newSnapshot: DriftSnapshot = {
    timestamp: now,
    vector: newVector,
    confidenceLevel,
  };

  const updatedHistory = [newSnapshot, ...profile.identityDriftHistory].slice(
    0,
    MAX_DRIFT_HISTORY
  );

  const updated: UserDNAProfile = {
    ...profile,
    dnaVector: newVector,
    confidenceLevel,
    dnaStabilityIndex: newStability,
    evolutionStage,
    identityDriftHistory: updatedHistory,
    totalInteractions: profile.totalInteractions + 1,
    lastInteractionAt: now,
    updatedAt: now,
  };

  saveUserProfile(updated);
  return updated;
}

/**
 * Update compatibility heatmap for a fragrance
 */
export function updateCompatibilityScore(
  profile: UserDNAProfile,
  fragranceId: string,
  score: number
): UserDNAProfile {
  const updated = {
    ...profile,
    compatibilityHeatmap: {
      ...profile.compatibilityHeatmap,
      [fragranceId]: Math.max(0, Math.min(1, score)),
    },
  };

  saveUserProfile(updated);
  return updated;
}

/**
 * Get user's dominant olfactory axis
 */
export function getDominantAxis(vector: OlfactoryVector): string {
  const axes: (keyof OlfactoryVector)[] = [
    "freshness",
    "warmth",
    "sweetness",
    "darkness",
    "cleanliness",
    "elegance",
  ];

  let maxAxis = axes[0];
  let maxValue = vector[maxAxis];

  for (const axis of axes.slice(1)) {
    if (vector[axis] > maxValue) {
      maxAxis = axis;
      maxValue = vector[axis];
    }
  }

  return maxAxis;
}

/**
 * Get compatibility heatmap visualization data
 */
export function getHeatmapData(
  profile: UserDNAProfile,
  topN: number = 10
): Array<{ fragranceId: string; score: number }> {
  return Object.entries(profile.compatibilityHeatmap)
    .map(([fragId, score]) => ({ fragranceId: fragId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/**
 * Get evolution timeline data for visualization
 */
export function getEvolutionTimeline(
  profile: UserDNAProfile
): DriftSnapshot[] {
  return [...profile.identityDriftHistory].reverse(); // oldest first
}

// ─── HELPERS ───

function createDefaultProfile(userId: string): UserDNAProfile {
  return {
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    dnaVector: {
      freshness: 0.5,
      warmth: 0.5,
      sweetness: 0.5,
      darkness: 0.5,
      cleanliness: 0.5,
      elegance: 0.5,
    },
    confidenceLevel: 0,
    dnaStabilityIndex: 0,
    evolutionStage: "early",
    scentAffinityClusters: [],
    compatibilityHeatmap: {},
    identityDriftHistory: [],
    totalInteractions: 0,
    lastInteractionAt: Date.now(),
  };
}

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function vectorSimilarity(a: OlfactoryVector, b: OlfactoryVector): number {
  const axes: (keyof OlfactoryVector)[] = [
    "freshness",
    "warmth",
    "sweetness",
    "darkness",
    "cleanliness",
    "elegance",
  ];

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const axis of axes) {
    const av = a[axis] ?? 0;
    const bv = b[axis] ?? 0;

    dot += av * bv;
    magA += av * av;
    magB += bv * bv;
  }

  const similarity = dot / (Math.sqrt(magA) * Math.sqrt(magB) + 1e-8);
  return Math.max(0, similarity); // clamp to [0, 1]
}

function determineEvolutionStage(
  totalInteractions: number,
  stability: number
): EvolutionStage {
  if (totalInteractions < 3) return "early";
  if (totalInteractions < 10 && stability < 0.6) return "forming";
  if (stability > 0.75) return "refined";
  return "stable";
}
