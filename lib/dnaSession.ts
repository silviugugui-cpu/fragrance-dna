import { resolveCanonicalAttribute } from "@/lib/intelligence/attributes";
import { createFragranceIntelligenceService } from "@/lib/intelligence/fragranceIntelligence";
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

export function loadDnaSession(): DNASessionState {
  if (typeof window === "undefined") {
    return getInitialSessionState();
  }

  try {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
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

export function saveDnaSession(session: DNASessionState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("fragrance-dna-session-updated", { detail: session }));
}

export function mergeGroundingVectorIntoSession(vector: OlfactoryVector): DNASessionState {
  const current = loadDnaSession();
  const merged: DNASessionState = {
    ...current,
    currentVector: vector,
    summary: current.answeredOrder.length === fragranceList.length ? current.summary : undefined,
    lastUpdatedAt: Date.now(),
  };

  saveDnaSession(merged);
  return merged;
}

export function loadGroundingVector(): OlfactoryVector | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(GROUNDING_VECTOR_KEY);
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
  previousSession?: DNASessionState
): DNASessionState {
  const answeredOrder = fragranceList
    .filter((fragrance) => Boolean(answers[fragrance.id]))
    .map((fragrance) => fragrance.id);

  const currentVector = buildVectorFromAnswers(answers);
  const snapshots = buildSnapshots(answers);

  return {
    answers,
    answeredOrder,
    currentIndex,
    currentVector,
    snapshots,
    summary:
      answeredOrder.length === fragranceList.length
        ? buildSummary(currentVector, answers)
        : previousSession?.summary,
    lastUpdatedAt: Date.now(),
  };
}

export function buildVectorFromAnswers(
  answers: Record<string, AnswerRecord>
): OlfactoryVector {
  const entries = Object.values(answers);
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
  answers: Record<string, AnswerRecord>
): DNASummary {
  return {
    finalVector: vector,
    confidenceScore: calculateConfidenceScore(answers),
    dominantAxes: getDominantAxes(vector),
    compatibilitySnapshot: buildCompatibilitySnapshot(vector),
    completedAt: Date.now(),
    answeredCount: Object.keys(answers).length,
  };
}

export function calculateConfidenceScore(
  answers: Record<string, AnswerRecord>
): number {
  const records = Object.values(answers);
  if (records.length === 0) {
    return 0;
  }

  const completionScore = records.length / fragranceList.length;
  const conviction =
    records.reduce((sum, record) => sum + averageDistanceFromCenter(record), 0) /
    records.length /
    50;

  return Math.round(clamp01(completionScore * 0.7 + conviction * 0.3) * 100);
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
  answers: Record<string, AnswerRecord>
): DNASessionSnapshot[] {
  const progressiveAnswers: Record<string, AnswerRecord> = {};
  const snapshots: DNASessionSnapshot[] = [];

  for (const fragrance of fragranceList) {
    const answer = answers[fragrance.id];
    if (!answer) {
      continue;
    }

    progressiveAnswers[fragrance.id] = answer;
    snapshots.push({
      fragranceId: fragrance.id,
      fragranceName: fragrance.name,
      vector: buildVectorFromAnswers(progressiveAnswers),
      confidenceScore: calculateConfidenceScore(progressiveAnswers),
      completedAt: Date.now() + snapshots.length,
    });
  }

  return snapshots;
}

function buildCompatibilitySnapshot(
  vector: OlfactoryVector
): CompatibilitySnapshot {
  return fragranceList
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