import { getBrowserUserId, getUserScopedStorageKey } from "@/lib/auth/userScope";
import { persistUserProfilePatch, hasProfileHydrationError } from "@/lib/auth/persistentProfile";
import { createFragranceIntelligenceService } from "@/lib/intelligence/fragranceIntelligence";
import { migrateEvaluationSession, projectEvaluationSession, readGroundingPrior } from "@/lib/test/evaluationSession";
import { NEUTRAL_VECTOR, groundingPriors, projectPreferences, type GroundingPrior } from "@/lib/test/preferenceLearning";
import type { AnswerRecord, DNASessionState, DNASummary, Fragrance, OlfactoryVector } from "@/lib/types";

const SESSION_STORAGE_KEY = "fragrance_dna_session";
export const TEST_BATCH_SIZE = 6;
export type GroundingConfidenceEvidence = GroundingPrior;
export type DnaConfidenceContext = {
  groundingEvidence?: GroundingPrior;
  groundingVector?: OlfactoryVector;
  availableAttributeIds?: string[];
  completedFragranceIds?: string[];
};
export type DnaConfidenceBadge = {
  id: string; label: string; minimum: number; maximum: number; colorClass: string; imageSrc: string;
};
export const DNA_CONFIDENCE_BADGES: DnaConfidenceBadge[] = [
  { id: "hobby", label: "Hobby", minimum: 0, maximum: 34, colorClass: "bg-emerald-400", imageSrc: "/Badges/OlfactiveDNA-Badges/01-hobby.png" },
  { id: "explorer", label: "Explorer", minimum: 35, maximum: 49, colorClass: "bg-sky-400", imageSrc: "/Badges/OlfactiveDNA-Badges/02-explorer.png" },
  { id: "enthusiast", label: "Enthusiast", minimum: 50, maximum: 64, colorClass: "bg-violet-400", imageSrc: "/Badges/OlfactiveDNA-Badges/03-enthusiast.png" },
  { id: "connoisseur", label: "Connoisseur", minimum: 65, maximum: 79, colorClass: "bg-orange-400", imageSrc: "/Badges/OlfactiveDNA-Badges/04-connoisseur.png" },
  { id: "expert", label: "Expert", minimum: 80, maximum: 89, colorClass: "bg-rose-400", imageSrc: "/Badges/OlfactiveDNA-Badges/05-expert.png" },
  { id: "olfactory-master", label: "Olfactive Master", minimum: 90, maximum: 100, colorClass: "bg-amber-300", imageSrc: "/Badges/OlfactiveDNA-Badges/06-olfactory-master.png" },
];
export const getDnaConfidenceBadge = (confidence: number): DnaConfidenceBadge => {
  const score = Math.max(0, Math.min(100, Math.round(confidence)));
  return DNA_CONFIDENCE_BADGES.find((badge) => score >= badge.minimum && score <= badge.maximum) ?? DNA_CONFIDENCE_BADGES[0];
};

export function getInitialSessionState(): DNASessionState {
  return { answers: {}, answeredOrder: [], currentIndex: 0, currentVector: { ...NEUTRAL_VECTOR }, snapshots: [], lastUpdatedAt: Date.now() };
}

export function loadDnaSession(userId?: string | null): DNASessionState {
  if (typeof window === "undefined") return getInitialSessionState();
  if (hasProfileHydrationError()) throw new Error("Persistent progress could not be loaded. Retry profile synchronization before editing.");
  const scopedId = getBrowserUserId(userId);
  const key = getUserScopedStorageKey(SESSION_STORAGE_KEY, scopedId);
  try {
    const stored = window.localStorage.getItem(key) ?? (!userId ? window.localStorage.getItem(SESSION_STORAGE_KEY) : null);
    const parsed = stored ? JSON.parse(stored) as Partial<DNASessionState> : getInitialSessionState();
    const rawGrounding = window.localStorage.getItem(getUserScopedStorageKey("fragrance_grounding", scopedId));
    const rawAnswers = window.localStorage.getItem(getUserScopedStorageKey("fragranceDNA-answers", scopedId));
    const migrated = migrateEvaluationSession(parsed, readGroundingPrior(rawGrounding ? JSON.parse(rawGrounding) : null),
      rawAnswers ? JSON.parse(rawAnswers) as Record<string, AnswerRecord> : {});
    if (parsed.schemaVersion !== 2) {
      window.localStorage.setItem(key, JSON.stringify(migrated));
      persistUserProfilePatch({ dnaSession: migrated });
    }
    return migrated;
  } catch (error) {
    console.error("[dna-session] Cannot load progress; saved raw data was not changed.", error);
    throw error;
  }
}

export function saveDnaSession(session: DNASessionState, userId?: string | null, localOnly = false): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getUserScopedStorageKey(SESSION_STORAGE_KEY, userId), JSON.stringify(session));
  if (!localOnly) persistUserProfilePatch({ dnaSession: session });
  window.dispatchEvent(new CustomEvent("fragrance-dna-session-updated", { detail: session }));
}

export function mergeGroundingVectorIntoSession(vector: OlfactoryVector, userId?: string | null,
  groundingEvidence: GroundingPrior = { love: [], neutral: [], redFlag: [] }): DNASessionState {
  const merged = projectEvaluationSession(loadDnaSession(userId), groundingEvidence);
  saveDnaSession(merged, userId);
  persistUserProfilePatch({ groundingVector: vector });
  return merged;
}

export function loadGroundingVector(userId?: string | null): OlfactoryVector | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(getUserScopedStorageKey("fragrance_grounding", userId));
  if (!raw) return null;
  const prior = readGroundingPrior(JSON.parse(raw));
  return Object.keys(groundingPriors(prior)).length ? projectPreferences([], prior).vector : null;
}

// Compatibility readers retain old raw sliders as perception, never preference.
export function buildSessionFromAnswers(answers: Record<string, AnswerRecord>, currentIndex: number,
  previousSession?: DNASessionState, fragrancePool?: Fragrance[], completedFragranceIds?: string[],
  context: DnaConfidenceContext = {}): DNASessionState {
  return migrateEvaluationSession({ ...(previousSession ?? getInitialSessionState()), answers },
    context.groundingEvidence ?? { love: [], neutral: [], redFlag: [] });
}
export function buildVectorFromAnswers(_answers: Record<string, AnswerRecord>, _pool?: Fragrance[]): OlfactoryVector {
  return { ...NEUTRAL_VECTOR };
}
export function calculateConfidenceScore(_answers: Record<string, AnswerRecord>, _pool?: Fragrance[], _grounding?: GroundingPrior,
  _available?: string[], _completed?: string[]): number { return 0; }
export function buildSummary(vector: OlfactoryVector, _answers: Record<string, AnswerRecord>, _pool?: Fragrance[],
  _grounding?: GroundingPrior, _available?: string[], _completed?: string[]): DNASummary {
  return { finalVector: vector, confidenceScore: 0, dominantAxes: [], compatibilitySnapshot: [], completedAt: Date.now(), answeredCount: 0 };
}
export function getFragranceList(): Fragrance[] {
  return createFragranceIntelligenceService().listSessionFragrances().map((item) => ({ id: item.fragranceId, name: item.displayName, notes: item.notes }));
}
export function findNextUnansweredIndex(answers: Record<string, AnswerRecord>, currentIndex: number): number {
  const pool = getFragranceList();
  for (let offset = 1; offset <= pool.length; offset++) {
    const index = (currentIndex + offset) % pool.length;
    if (!answers[pool[index].id]) return index;
  }
  return -1;
}
