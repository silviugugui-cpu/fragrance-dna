import { getCanonicalAttributeRegistry, resolveCanonicalAttribute } from "@/lib/intelligence/attributes";
import { createFragranceIntelligenceService } from "@/lib/intelligence/fragranceIntelligence";
import { getBrowserUserId, getUserScopedStorageKey } from "@/lib/auth/userScope";
import { persistUserProfilePatch } from "@/lib/auth/persistentProfile";
import { Fuse } from "@/lib/intelligence/fusion";
import type {
  AnswerRecord,
  CompatibilitySnapshot,
  DNASessionSnapshot,
  DNASessionState,
  DNASummary,
  Fragrance,
  OlfactoryVector,
} from "@/lib/types";

const SESSION_STORAGE_KEY = "fragrance_dna_session";
const GROUNDING_VECTOR_KEY = "fragrance_vector";
export const TEST_BATCH_SIZE = 6;

export type GroundingConfidenceEvidence = {
  love: string[];
  neutral: string[];
  redFlag: string[];
};

export type DnaConfidenceContext = {
  groundingEvidence?: GroundingConfidenceEvidence;
  groundingVector?: OlfactoryVector;
  availableAttributeIds?: string[];
  completedFragranceIds?: string[];
};

export type DnaConfidenceBadge = {
  id: string;
  label: string;
  minimum: number;
  maximum: number;
  colorClass: string;
  imageSrc: string;
};

export const DNA_CONFIDENCE_BADGES: DnaConfidenceBadge[] = [
  { id: "hobby", label: "Hobby", minimum: 0, maximum: 34, colorClass: "bg-emerald-400", imageSrc: "/Badges/Botanical%20Gold%20Hobby%20Badge%20-%20black.png" },
  { id: "explorer", label: "Explorer", minimum: 35, maximum: 49, colorClass: "bg-sky-400", imageSrc: "/Badges/Explorer%20Compass%20Badge%20-%20Black.png" },
  { id: "enthusiast", label: "Enthusiast", minimum: 50, maximum: 64, colorClass: "bg-violet-400", imageSrc: "/Badges/Purple%20Gold%20Enthusiast%20Floral%20Badge%20-%20Black.png" },
  { id: "connoisseur", label: "Connoisseur", minimum: 65, maximum: 79, colorClass: "bg-orange-400", imageSrc: "/Badges/Golden%20Connoisseur%20Perfume%20Emblem%20-%20black.png" },
  { id: "expert", label: "Expert", minimum: 80, maximum: 89, colorClass: "bg-rose-400", imageSrc: "/Badges/Expert%20Ruby%20Crest%20Badge%20-%20Black.png" },
  { id: "olfactory-master", label: "Olfactive Master", minimum: 90, maximum: 100, colorClass: "bg-amber-300", imageSrc: "/Badges/Olfactory%20Master%20Golden%20Crest-%20black.png" },
];

export const getDnaConfidenceBadge = (confidence: number): DnaConfidenceBadge => {
  const score = Math.max(0, Math.min(100, Math.round(confidence)));
  return DNA_CONFIDENCE_BADGES.find((badge) => score >= badge.minimum && score <= badge.maximum)
    ?? DNA_CONFIDENCE_BADGES[DNA_CONFIDENCE_BADGES.length - 1];
};

const VECTOR_BASELINE: OlfactoryVector = {
  freshness: 0.5,
  warmth: 0.5,
  sweetness: 0.5,
  darkness: 0.5,
  cleanliness: 0.5,
  elegance: 0.5,
};

type AxisWeights = Partial<Record<keyof OlfactoryVector, number>>;

export function getInitialSessionState(): DNASessionState {
  return {
    answers: {},
    answeredOrder: [],
    currentIndex: 0,
    currentVector: { ...VECTOR_BASELINE },
    snapshots: [],
    lastUpdatedAt: Date.now(),
  };
}

export function loadDnaSession(userId?: string | null): DNASessionState {
  if (typeof window === "undefined") {
    return getInitialSessionState();
  }

  const scopedUserId = getBrowserUserId(userId);
  const scopedStorageKey = getUserScopedStorageKey(SESSION_STORAGE_KEY, scopedUserId);
  try {
    const stored = window.localStorage.getItem(scopedStorageKey);
    if (!stored) {
      if (!userId) {
        const legacyStored = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (legacyStored) {
          window.localStorage.setItem(scopedStorageKey, legacyStored);
          return JSON.parse(legacyStored) as DNASessionState;
        }
      }
      return getInitialSessionState();
    }

    const parsed = JSON.parse(stored) as Partial<DNASessionState>;
    return {
      ...getInitialSessionState(),
      ...parsed,
      currentVector: parsed.currentVector ?? { ...VECTOR_BASELINE },
      answeredOrder: parsed.answeredOrder ?? [],
      snapshots: parsed.snapshots ?? [],
      answers: parsed.answers ?? {},
    };
  } catch {
    return getInitialSessionState();
  }
}

export function saveDnaSession(session: DNASessionState, userId?: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getUserScopedStorageKey(SESSION_STORAGE_KEY, userId), JSON.stringify(session));
  persistUserProfilePatch({ dnaSession: session });
  window.dispatchEvent(new CustomEvent("fragrance-dna-session-updated", { detail: session }));
}

export function mergeGroundingVectorIntoSession(
  vector: OlfactoryVector,
  userId?: string | null,
  groundingEvidence: GroundingConfidenceEvidence = { love: [], neutral: [], redFlag: [] },
): DNASessionState {
  const current = loadDnaSession(userId);
  const committedAnswers = Object.fromEntries(
    current.answeredOrder.flatMap((fragranceId) => current.answers[fragranceId] ? [[fragranceId, current.answers[fragranceId]]] : []),
  );
  const confidenceScore = calculateConfidenceScore(current.answers, fragranceList, groundingEvidence, undefined, current.answeredOrder);
  const behaviorVector = buildVectorFromAnswers(committedAnswers, fragranceList);
  const currentVector = current.answeredOrder.length > 0
    ? Fuse({ grounding: vector, behavior: behaviorVector, confidence: { global: confidenceScore / 100 } })
    : vector;
  const summary = buildSummary(currentVector, committedAnswers, fragranceList, groundingEvidence, undefined, current.answeredOrder);
  const merged: DNASessionState = {
    ...current,
    currentVector,
    summary: { ...summary, answeredCount: current.answeredOrder.length },
    lastUpdatedAt: Date.now(),
  };

  saveDnaSession(merged, userId);
  persistUserProfilePatch({ groundingVector: vector });
  return merged;
}

export function loadGroundingVector(userId?: string | null): OlfactoryVector | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getUserScopedStorageKey(GROUNDING_VECTOR_KEY, userId));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as OlfactoryVector;
  } catch {
    return null;
  }
}

export function buildSessionFromAnswers(
  answers: Record<string, AnswerRecord>,
  currentIndex: number,
  previousSession?: DNASessionState,
  fragrancePool: Fragrance[] = fragranceList,
  completedFragranceIds?: string[],
  confidenceContext: DnaConfidenceContext = {},
): DNASessionState {
  const completedIds = new Set(completedFragranceIds ?? Object.keys(answers));
  const completedAnswers = Object.fromEntries(
    Object.entries(answers).filter(([fragranceId]) => completedIds.has(fragranceId)),
  );
  const answeredOrder = fragrancePool
    .filter((fragrance) => Boolean(completedAnswers[fragrance.id]))
    .map((fragrance) => fragrance.id);

  const behaviorVector = buildVectorFromAnswers(completedAnswers, fragrancePool);
  const confidence = calculateConfidenceScore(
    completedAnswers,
    fragrancePool,
    confidenceContext.groundingEvidence,
    confidenceContext.availableAttributeIds,
    answeredOrder,
  );
  const currentVector = confidenceContext.groundingVector
    ? Fuse({
        grounding: confidenceContext.groundingVector,
        behavior: behaviorVector,
        confidence: { global: confidence / 100 },
      })
    : behaviorVector;
  const snapshots = buildSnapshots(completedAnswers, fragrancePool, confidenceContext);

  return {
    answers,
    behaviorProjection: previousSession?.behaviorProjection,
    answeredOrder,
    currentIndex,
    currentVector,
    snapshots,
      summary: buildSummary(
        currentVector,
        completedAnswers,
        fragrancePool,
        confidenceContext.groundingEvidence,
        confidenceContext.availableAttributeIds,
        answeredOrder,
      ),
    lastUpdatedAt: Date.now(),
  };
}

export function buildVectorFromAnswers(
  answers: Record<string, AnswerRecord>,
  fragrancePool: Fragrance[] = fragranceList
): OlfactoryVector {
  const entries = fragrancePool.flatMap((fragrance) =>
    answers[fragrance.id] ? [answers[fragrance.id]] : [],
  );
  if (entries.length === 0) {
    return { ...VECTOR_BASELINE };
  }

  const accumulated: OlfactoryVector = {
    freshness: 0,
    warmth: 0,
    sweetness: 0,
    darkness: 0,
    cleanliness: 0,
    elegance: 0,
  };

  for (const answer of entries) {
    for (const [attributeKey, value] of Object.entries(answer) as Array<[string, number]>) {
      const influence = (value - 50) / 50;
      const weights = resolveAttributeWeights(attributeKey);
      if (!weights) {
        continue;
      }

      for (const axis of Object.keys(weights) as Array<keyof OlfactoryVector>) {
        accumulated[axis] += influence * (weights[axis] ?? 0);
      }
    }
  }

  const normalized = { ...VECTOR_BASELINE };
  const sampleCount = entries.length;
  for (const axis of Object.keys(normalized) as Array<keyof OlfactoryVector>) {
    normalized[axis] = clamp01(VECTOR_BASELINE[axis] + accumulated[axis] / sampleCount / 2);
  }

  return normalized;
}

export function buildSummary(
  vector: OlfactoryVector,
  answers: Record<string, AnswerRecord>,
  fragrancePool: Fragrance[] = fragranceList,
  groundingEvidence?: GroundingConfidenceEvidence,
  availableAttributeIds?: string[],
  completedFragranceIds?: string[],
): DNASummary {
  return {
    finalVector: vector,
    confidenceScore: calculateConfidenceScore(answers, fragrancePool, groundingEvidence, availableAttributeIds, completedFragranceIds),
    dominantAxes: getDominantAxes(vector),
    compatibilitySnapshot: buildCompatibilitySnapshot(vector, fragrancePool),
    completedAt: Date.now(),
    answeredCount: fragrancePool.filter((fragrance) =>
      Boolean(answers[fragrance.id]) && (!completedFragranceIds || completedFragranceIds.includes(fragrance.id)),
    ).length,
  };
}

export function calculateConfidenceScore(
  answers: Record<string, AnswerRecord>,
  fragrancePool: Fragrance[] = fragranceList,
  groundingEvidence: GroundingConfidenceEvidence = { love: [], neutral: [], redFlag: [] },
  availableAttributeIds?: string[],
  completedFragranceIds?: string[],
): number {
  const expandGrounding = (tokens: string[]): Set<string> => {
    const expanded = new Set<string>();
    for (const token of tokens) {
      const attribute = resolveCanonicalAttribute(token);
      if (!attribute) continue;
      const expansionTokens = attribute.metadata.groundingExpansionTokens ?? [token];
      for (const expandedToken of expansionTokens) {
        const expandedAttribute = resolveCanonicalAttribute(expandedToken);
        if (expandedAttribute && expandedAttribute.metadata.category !== "grounding") {
          expanded.add(expandedAttribute.canonicalAttributeId);
        }
      }
    }
    return expanded;
  };

  const groundingAttributes = expandGrounding([
    ...groundingEvidence.love,
    ...groundingEvidence.redFlag,
  ]);
  const observationsByAttribute = new Map<string, number[]>();
  let evidenceCount = 0;
  const committedIds = new Set(completedFragranceIds ?? Object.keys(answers));
  for (const fragrance of fragrancePool) {
    if (!committedIds.has(fragrance.id)) continue;
    const answer = answers[fragrance.id];
    if (!answer) continue;
    for (const [attributeKey, value] of Object.entries(answer)) {
      const attribute = resolveCanonicalAttribute(attributeKey);
      if (!attribute || !Number.isFinite(value)) continue;
      const observations = observationsByAttribute.get(attribute.canonicalAttributeId) ?? [];
      observations.push(value);
      observationsByAttribute.set(attribute.canonicalAttributeId, observations);
      evidenceCount += 1;
    }
  }

  const observedAttributeIds = new Set(observationsByAttribute.keys());
  const evidenceAttributeIds = new Set([...groundingAttributes, ...observedAttributeIds]);
  const defaultAvailableIds = getCanonicalAttributeRegistry()
    .filter((attribute) => attribute.metadata.category !== "grounding")
    .map((attribute) => attribute.canonicalAttributeId);
  const availableIds = new Set(availableAttributeIds?.length ? availableAttributeIds : defaultAvailableIds);
  const coverage = availableIds.size > 0
    ? clamp01([...evidenceAttributeIds].filter((id) => availableIds.has(id)).length / availableIds.size)
    : 0;

  const repeatedEvidence = [...observationsByAttribute.values()].filter((observations) => observations.length > 1);
  const consistency = repeatedEvidence.length > 0
    ? repeatedEvidence.reduce((sum, observations) => {
        const positive = observations.filter((value) => value > 50).length;
        const negative = observations.filter((value) => value < 50).length;
        const neutral = observations.length - positive - negative;
        return sum + Math.max(positive, negative, neutral) / observations.length;
      }, 0) / repeatedEvidence.length
    : 0;

  const registeredAttributeCount = getCanonicalAttributeRegistry()
    .filter((attribute) => attribute.metadata.category !== "grounding")
    .length;
  const initialGroundingConfidence = Math.min(
    35,
    Math.round(35 * clamp01(groundingAttributes.size / Math.min(12, Math.max(1, registeredAttributeCount)))),
  );
  if (evidenceCount === 0) return initialGroundingConfidence;

  const dataVolume = clamp01(1 - Math.exp(-evidenceCount / 30));
  const evidenceQuality = clamp01(0.4 * coverage + 0.3 * consistency + 0.3 * dataVolume);
  return Math.round(initialGroundingConfidence + (100 - initialGroundingConfidence) * evidenceQuality);
}

export function findNextUnansweredIndex(
  answers: Record<string, AnswerRecord>,
  currentIndex: number
): number {
  for (let offset = 1; offset <= fragranceList.length; offset += 1) {
    const nextIndex = (currentIndex + offset) % fragranceList.length;
    if (!answers[fragranceList[nextIndex].id]) {
      return nextIndex;
    }
  }

  return -1;
}

export function getFragranceList(): Fragrance[] {
  return fragranceList;
}

function buildSnapshots(
  answers: Record<string, AnswerRecord>,
  fragrancePool: Fragrance[] = fragranceList,
  confidenceContext: DnaConfidenceContext = {},
): DNASessionSnapshot[] {
  const progressiveAnswers: Record<string, AnswerRecord> = {};
  const snapshots: DNASessionSnapshot[] = [];

  for (const fragrance of fragrancePool) {
    const answer = answers[fragrance.id];
    if (!answer) {
      continue;
    }

    progressiveAnswers[fragrance.id] = answer;
    const behaviorVector = buildVectorFromAnswers(progressiveAnswers, fragrancePool);
    const confidenceScore = calculateConfidenceScore(
      progressiveAnswers,
      fragrancePool,
      confidenceContext.groundingEvidence,
      confidenceContext.availableAttributeIds,
    );
    const vector = confidenceContext.groundingVector
      ? Fuse({
          grounding: confidenceContext.groundingVector,
          behavior: behaviorVector,
          confidence: { global: confidenceScore / 100 },
        })
      : behaviorVector;
    snapshots.push({
      fragranceId: fragrance.id,
      fragranceName: fragrance.name,
      vector,
      confidenceScore,
      completedAt: Date.now() + snapshots.length,
    });
  }

  return snapshots;
}

function buildCompatibilitySnapshot(
  vector: OlfactoryVector,
  fragrancePool: Fragrance[] = fragranceList
): CompatibilitySnapshot {
  return fragrancePool
    .map((fragrance) => ({
      fragranceId: fragrance.id,
      fragranceName: fragrance.name,
      score: scoreVectorCompatibility(vector, mapFragranceToVector(fragrance)),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
}

function mapFragranceToVector(fragrance: Fragrance): OlfactoryVector {
  const mapped: OlfactoryVector = { ...VECTOR_BASELINE };
  const notes = fragrance.notes ?? [];
  if (notes.length === 0) {
    return mapped;
  }

  const accumulator: OlfactoryVector = {
    freshness: 0,
    warmth: 0,
    sweetness: 0,
    darkness: 0,
    cleanliness: 0,
    elegance: 0,
  };

  for (const note of notes) {
    const weights = resolveAttributeWeights(note);
    if (!weights) {
      continue;
    }
    for (const axis of Object.keys(weights) as Array<keyof OlfactoryVector>) {
      accumulator[axis] += weights[axis] ?? 0;
    }
  }

  for (const axis of Object.keys(mapped) as Array<keyof OlfactoryVector>) {
    mapped[axis] = clamp01(mapped[axis] + accumulator[axis] / Math.max(1, notes.length));
  }

  return mapped;
}

function scoreVectorCompatibility(
  left: OlfactoryVector,
  right: OlfactoryVector
): number {
  const axes = Object.keys(left) as Array<keyof OlfactoryVector>;
  const averageDifference =
    axes.reduce((sum, axis) => sum + Math.abs(left[axis] - right[axis]), 0) / axes.length;
  return clamp01(1 - averageDifference);
}

function getDominantAxes(vector: OlfactoryVector): string[] {
  return (Object.keys(vector) as Array<keyof OlfactoryVector>)
    .map((axis) => ({ axis, distance: Math.abs(vector[axis] - 0.5) }))
    .sort((left, right) => right.distance - left.distance)
    .slice(0, 2)
    .map(({ axis }) => axis.charAt(0).toUpperCase() + axis.slice(1));
}

function averageDistanceFromCenter(answer: AnswerRecord): number {
  const values = Object.values(answer);
  return values.reduce((sum, value) => sum + Math.abs(value - 50), 0) / values.length;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function resolveAttributeWeights(attributeKey: string): AxisWeights | undefined {
  const resolved = resolveCanonicalAttribute(attributeKey);
  if (!resolved) {
    return undefined;
  }

  return resolved.vectorMapping;
}

const FRAGRANCE_INTELLIGENCE = createFragranceIntelligenceService();
const fragranceList: Fragrance[] = FRAGRANCE_INTELLIGENCE.listSessionFragrances().map((item) => ({
  id: item.fragranceId,
  name: item.displayName,
  notes: [...item.notes],
}));