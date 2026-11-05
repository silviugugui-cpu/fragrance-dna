import { getCanonicalAttributeRegistry, resolveCanonicalAttribute } from "../intelligence/attributes";
import type { FragranceIntelligenceService, EvaluationFragranceRef } from "../intelligence/fragranceIntelligence/types";
import type { OlfactoryVector } from "../types";

export type Liking = -2 | -1 | 0 | 1 | 2;
export type Perception = 0 | 1 | 2 | 3;
export type GroundingPrior = { love: string[]; neutral: string[]; redFlag: string[] };
export type AttributeResponse = { attributeId: string; perception: Perception | null; preference: Liking | null };
export type SelectionReason = "confirm" | "clarify" | "explore" | "fallback" | "composition";
export type EvaluationDraft = {
  schemaVersion: 2;
  id: string;
  fragranceId: string;
  canonicalFragranceId: string;
  displayName: string;
  attributeIds: string[];
  questions: AttributeResponse[];
  overall: Liking | null;
  unable: boolean;
  reason: SelectionReason;
  reasonAttributeId: string | null;
  startedAt: number;
};
export type FragranceEvaluation = Omit<EvaluationDraft, "unable"> & {
  status: "completed" | "unable";
  submittedAt: number;
};
export type PreferenceEvidence = {
  affinity: number;
  explicitCount: number;
  confidence: number;
  contradictory: boolean;
  groundingPrior: number | null;
  groundingConflictResolved: boolean;
};
export type LearningProjection = {
  schemaVersion: 2;
  attributes: Record<string, PreferenceEvidence>;
  perception: Record<string, { observations: number; noticed: number; mean: number }>;
  overall: Array<{ fragranceId: string; canonicalFragranceId: string; attributeIds: string[]; liking: Liking }>;
  vector: OlfactoryVector;
  confidence: number;
};
export const EMPTY_GROUNDING: GroundingPrior = { love: [], neutral: [], redFlag: [] };
export const NEUTRAL_VECTOR: OlfactoryVector = { freshness: .5, warmth: .5, sweetness: .5, darkness: .5, cleanliness: .5, elegance: .5 };
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const isLiking = (value: unknown): value is Liking => typeof value === "number" && [-2, -1, 0, 1, 2].includes(value);

export function groundingPriors(grounding: GroundingPrior): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [tokens, strength] of [[grounding.neutral, 0], [grounding.love, .6], [grounding.redFlag, -.6]] as const) {
    for (const token of tokens) {
      const definition = resolveCanonicalAttribute(token);
      for (const expanded of definition?.metadata.groundingExpansionTokens ?? [token]) {
        const attribute = resolveCanonicalAttribute(expanded);
        if (attribute && attribute.metadata.category !== "grounding") result[attribute.canonicalAttributeId] = strength;
      }
    }
  }
  return result;
}

export function validateEvaluation(draft: EvaluationDraft): void {
  if (draft.schemaVersion !== 2 || !draft.id || !draft.fragranceId || !draft.canonicalFragranceId
    || !Number.isFinite(draft.startedAt) || draft.questions.length > 2
    || draft.attributeIds.some((id) => !knownAttributeIds().has(id))
    || new Set(draft.questions.map((question) => question.attributeId)).size !== draft.questions.length
    || draft.questions.some((question) => !draft.attributeIds.includes(question.attributeId))) throw new Error("Invalid evaluation identity or questions.");
  if (draft.unable) {
    if (draft.overall !== null || draft.questions.some((question) => question.perception !== null || question.preference !== null)) throw new Error("Unable evaluations cannot contain learning signals.");
    return;
  }
  if (!isLiking(draft.overall)) throw new Error("An overall fragrance rating is required.");
  for (const answer of draft.questions) {
    if (answer.perception === null || ![0, 1, 2, 3].includes(answer.perception)) throw new Error("Perception is required for displayed questions.");
    if (answer.perception === 0 && answer.preference !== null) throw new Error("Not noticed is not a preference.");
    if (answer.perception > 0 && !isLiking(answer.preference)) throw new Error("An explicit preference is required for noticed attributes.");
  }
}

export function submitEvaluation(draft: EvaluationDraft, submittedAt = Date.now()): FragranceEvaluation {
  validateEvaluation(draft);
  const { unable, ...value } = draft;
  return { ...value, attributeIds: [...value.attributeIds], questions: value.questions.map((question) => ({ ...question })), status: unable ? "unable" : "completed", submittedAt };
}

export function projectPreferences(records: FragranceEvaluation[], grounding: GroundingPrior): LearningProjection {
  const priors = groundingPriors(grounding);
  const attributes: LearningProjection["attributes"] = {};
  const perception: LearningProjection["perception"] = {};
  const explicit = new Map<string, Liking[]>();
  const overall: LearningProjection["overall"] = [];
  for (const record of [...records].sort((a, b) => a.submittedAt - b.submittedAt || a.id.localeCompare(b.id))) {
    validateEvaluation({ ...record, unable: record.status === "unable" });
    if (record.status !== "completed") continue;
    if (record.overall !== null) overall.push({ fragranceId: record.fragranceId, canonicalFragranceId: record.canonicalFragranceId, attributeIds: record.attributeIds, liking: record.overall });
    for (const response of record.questions) {
      if (response.perception === null) continue;
      const old = perception[response.attributeId] ?? { observations: 0, noticed: 0, mean: 0 };
      perception[response.attributeId] = {
        observations: old.observations + 1,
        noticed: old.noticed + Number(response.perception > 0),
        mean: (old.mean * old.observations + response.perception) / (old.observations + 1),
      };
      if (response.perception > 0 && response.preference !== null) {
        explicit.set(response.attributeId, [...(explicit.get(response.attributeId) ?? []), response.preference]);
      }
    }
  }
  for (const id of new Set([...Object.keys(priors), ...explicit.keys()])) {
    const observations = explicit.get(id) ?? [];
    const last = observations.at(-1);
    const recent = observations.slice(-3);
    const contradictory = recent.length > 1 && new Set(recent.map(Math.sign)).size > 1
      && Math.sign(recent.at(-1)!) !== Math.sign(recent.at(-2)!);
    attributes[id] = {
      // Direct liking evidence replaces, rather than locks in, the declared prior.
      affinity: last === undefined ? priors[id] : last / 2,
      explicitCount: observations.length,
      confidence: observations.length ? clamp(observations.length / 3) * (contradictory ? .35 : 1) : 0,
      contradictory,
      groundingPrior: priors[id] ?? null,
      groundingConflictResolved: last !== undefined && priors[id] !== undefined && Math.sign(last) !== Math.sign(priors[id]),
    };
  }
  const vector = { ...NEUTRAL_VECTOR };
  for (const axis of Object.keys(vector) as Array<keyof OlfactoryVector>) {
    let signed = 0;
    let weight = 0;
    for (const [id, evidence] of Object.entries(attributes)) {
      const mapping = resolveCanonicalAttribute(id)?.vectorMapping[axis];
      if (!mapping || (evidence.explicitCount === 0 && evidence.affinity === 0)) continue;
      const reliability = evidence.explicitCount ? 1 : .35;
      signed += evidence.affinity * mapping * reliability;
      weight += Math.abs(mapping) * reliability;
    }
    vector[axis] = weight ? clamp(.5 + .45 * signed / weight) : .5;
  }
  const explicitCount = [...explicit.values()].reduce((sum, values) => sum + values.length, 0);
  const meanConfidence = Object.values(attributes).filter((value) => value.explicitCount).reduce((sum, value) => sum + value.confidence, 0) / Math.max(1, explicit.size);
  return { schemaVersion: 2, attributes, perception, overall, vector,
    confidence: Math.round(100 * (1 - Math.exp(-explicitCount / 16)) * (.5 + .5 * meanConfidence)) };
}

export function preferenceCompatibility(ids: string[], canonicalId: string, projection: LearningProjection): number {
  const attributes = ids.flatMap((id) => projection.attributes[id] ? [projection.attributes[id]] : []);
  const affinity = attributes.reduce((sum, item) => sum + item.affinity * (item.explicitCount ? 1 : .35), 0)
    / Math.max(1, attributes.reduce((sum, item) => sum + (item.explicitCount ? 1 : .35), 0));
  let overallSignal = 0;
  let similarityWeight = 0;
  for (const rated of projection.overall) {
    const intersection = rated.attributeIds.filter((id) => ids.includes(id)).length;
    const union = new Set([...ids, ...rated.attributeIds]).size;
    const similarity = rated.canonicalFragranceId === canonicalId ? 1 : union ? intersection / union : 0;
    if (similarity < .2) continue;
    overallSignal += rated.liking / 2 * similarity;
    similarityWeight += similarity;
  }
  return clamp(.5 + .3 * affinity + .2 * overallSignal / Math.max(1, similarityWeight));
}

export function questionPriority(id: string, projection: LearningProjection): number {
  const item = projection.attributes[id];
  if (!item) return 2;
  if (!item.explicitCount && item.groundingPrior !== null && item.groundingPrior !== 0) return 5;
  if (item.contradictory) return 4;
  if (item.explicitCount >= 3 && item.confidence >= .75) return 0;
  return 3 * (1 - item.confidence);
}

export type AdaptiveCandidate = EvaluationFragranceRef & { attributeIds: string[]; questionIds: string[]; reason: SelectionReason; reasonAttributeId: string | null; score: number };

export function selectAdaptiveCandidate(service: FragranceIntelligenceService, records: FragranceEvaluation[], grounding: GroundingPrior,
  excludedIds: string[] = [], excludedCanonicalIds: string[] = []): AdaptiveCandidate | null {
  const projection = projectPreferences(records, grounding);
  const refs = service.listEvaluationFragrances();
  const used = new Set([...excludedIds, ...records.map((record) => record.fragranceId)]);
  const usedCanonical = new Set([...excludedCanonicalIds, ...records.map((record) => record.canonicalFragranceId),
    ...refs.filter((ref) => used.has(ref.fragranceId)).map((ref) => ref.canonicalFragranceId || ref.fragranceId)]);
  const first = !records.some((record) => record.status === "completed");
  const priorIds = groundingPriors(grounding);
  const candidates = refs.flatMap((ref): AdaptiveCandidate[] => {
    const canonicalId = ref.canonicalFragranceId || ref.fragranceId;
    if (used.has(ref.fragranceId) || usedCanonical.has(canonicalId)) return [];
    const model = service.getCanonicalFragrance(ref.fragranceId);
    if (!model) return [];
    const ids = [...new Set(model.coreAttributes.map((attribute) => attribute.canonicalAttributeId))];
    if (!ids.length) return [];
    const sorted = ids.map((id) => ({ id, priority: questionPriority(id, projection) })).filter((item) => item.priority > 0)
      .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
    const loved = ids.find((id) => priorIds[id] > 0 && !projection.attributes[id]?.explicitCount);
    const uncertain = ids.find((id) => !projection.attributes[id]?.explicitCount && id !== loved);
    const firstFit = first && loved && uncertain;
    const questions = firstFit ? [loved, uncertain] : sorted.slice(0, 2).map((item) => item.id);
    const target = questions[0] ?? null;
    const state = target ? projection.attributes[target] : undefined;
    const reason: SelectionReason = !target ? "composition" : state?.contradictory ? "clarify"
      : state?.groundingPrior !== undefined && state.groundingPrior !== null && !state.explicitCount && state.groundingPrior !== 0 ? "confirm"
        : state?.explicitCount ? "clarify" : "explore";
    const novelty = ids.filter((id) => !projection.perception[id]).length / ids.length;
    const recentBrands = records.slice(-3).map((record) => refs.find((ref) => ref.fragranceId === record.fragranceId)?.brand);
    const diversity = recentBrands.includes(ref.brand) ? 0 : .15;
    const information = sorted.slice(0, 2).reduce((sum, item) => sum + item.priority, 0) / 10;
    const score = (firstFit ? 10 : 0) + .5 * preferenceCompatibility(ids, canonicalId, projection) + .35 * information + .15 * novelty + diversity;
    return [{ ...ref, attributeIds: ids, questionIds: questions, reason: first && !firstFit ? "fallback" : reason, reasonAttributeId: target, score }];
  });
  return candidates.sort((a, b) => b.score - a.score || a.fragranceId.localeCompare(b.fragranceId))[0] ?? null;
}

export function draftForCandidate(candidate: AdaptiveCandidate, id: string, startedAt = Date.now()): EvaluationDraft {
  return { schemaVersion: 2, id, fragranceId: candidate.fragranceId, canonicalFragranceId: candidate.canonicalFragranceId || candidate.fragranceId,
    displayName: candidate.displayName, attributeIds: candidate.attributeIds, questions: candidate.questionIds.map((attributeId) => ({ attributeId, perception: null, preference: null })),
    overall: null, unable: false, reason: candidate.reason, reasonAttributeId: candidate.reasonAttributeId, startedAt };
}

export const knownAttributeIds = () => new Set(getCanonicalAttributeRegistry().filter((item) => item.metadata.category !== "grounding").map((item) => item.canonicalAttributeId));
