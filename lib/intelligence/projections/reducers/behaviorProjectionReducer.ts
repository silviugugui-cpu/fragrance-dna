/**
 * Canonical Architecture v2
 * Phase 1 - Step 7
 *
 * Purpose:
 * Reduce canonical behavior events into an independent behavior projection.
 */

import { resolveCanonicalAttribute } from "@/lib/intelligence/attributes";
import type {
  AttributeBehaviorSignalPayload,
  EventEnvelope,
  PreferenceStrengthChangedPayload,
} from "@/lib/intelligence/events/types";
import type {
  BehaviorAttributeState,
  BehaviorProjectionState,
} from "@/lib/intelligence/projections/models/behaviorProjection";
import type { ProjectionReducer } from "@/lib/intelligence/projections/types";
import type { OlfactoryVector } from "@/lib/types";

export const BEHAVIOR_PROJECTION_REDUCER: ProjectionReducer<BehaviorProjectionState> = {
  projectionName: "BehaviorProjection",
  reducerVersion: 1,
  supportedEvents: [
    "attribute_liked",
    "attribute_disliked",
    "attribute_ignored",
    "attribute_uncertain",
    "preference_strength_changed",
  ],
  reduce: (previousState: BehaviorProjectionState, event: EventEnvelope): BehaviorProjectionState => {
    switch (event.eventType) {
      case "attribute_liked":
      case "attribute_disliked":
      case "attribute_ignored":
      case "attribute_uncertain": {
        const payload = event.payload as AttributeBehaviorSignalPayload;
        return applyAttributeSignal(previousState, event, payload);
      }
      case "preference_strength_changed": {
        const payload = event.payload as PreferenceStrengthChangedPayload;
        return applyStrengthChange(previousState, event, payload);
      }
      default:
        return previousState;
    }
  },
};

function applyAttributeSignal(
  previousState: BehaviorProjectionState,
  event: EventEnvelope,
  payload: AttributeBehaviorSignalPayload
): BehaviorProjectionState {
  const current =
    previousState.attributes[payload.canonicalAttributeId] ??
    buildInitialAttributeState(payload.canonicalAttributeId, event.occurredAt);

  const next = { ...current };
  next.evidenceCount += 1;

  if (event.eventType === "attribute_liked") {
    next.likedCount += 1;
    next.affinity = clampSigned(next.affinity + 0.18);
    next.strength = clampSigned(next.strength + 0.12);
  }

  if (event.eventType === "attribute_disliked") {
    next.dislikedCount += 1;
    next.affinity = clampSigned(next.affinity - 0.18);
    next.strength = clampSigned(next.strength - 0.12);
  }

  if (event.eventType === "attribute_ignored") {
    next.ignoredCount += 1;
    next.strength = clampSigned(next.strength * 0.98);
  }

  if (event.eventType === "attribute_uncertain") {
    next.uncertainCount += 1;
    next.strength = clampSigned(next.strength * 0.96);
  }

  next.lastValue = payload.value;
  next.lastFragranceId = payload.fragranceId;
  next.lastUpdated = event.occurredAt;
  next.lastUpdatedAt = event.occurredAt;
  next.confidence = calculateAttributeConfidence(next);
  next.explorationPriority = calculateExplorationPriority(next);

  const attributes = {
    ...previousState.attributes,
    [payload.canonicalAttributeId]: next,
  };

  const behaviorVector = applyVectorSignal(
    previousState.behaviorVector,
    payload.canonicalAttributeId,
    signalFromEventType(event.eventType)
  );

  return {
    ...previousState,
    userId: event.userId,
    attributes,
    behaviorVector,
    confidence: {
      global: calculateGlobalConfidence(attributes),
      updates: previousState.confidence.updates + 1,
    },
  };
}

function applyStrengthChange(
  previousState: BehaviorProjectionState,
  event: EventEnvelope,
  payload: PreferenceStrengthChangedPayload
): BehaviorProjectionState {
  const current =
    previousState.attributes[payload.canonicalAttributeId] ??
    buildInitialAttributeState(payload.canonicalAttributeId, event.occurredAt);

  const next: BehaviorAttributeState = {
    ...current,
    strength: clampSigned(payload.currentStrength),
    confidence: clamp01(payload.confidence),
    affinity: clampSigned(payload.currentStrength),
    evidenceCount: Math.max(current.evidenceCount, 1),
    explorationPriority: clamp01(1 - payload.confidence),
    lastFragranceId: payload.fragranceId,
    lastUpdated: event.occurredAt,
    lastUpdatedAt: event.occurredAt,
  };

  const attributes = {
    ...previousState.attributes,
    [payload.canonicalAttributeId]: next,
  };

  return {
    ...previousState,
    userId: event.userId,
    attributes,
    confidence: {
      global: calculateGlobalConfidence(attributes),
      updates: previousState.confidence.updates + 1,
    },
  };
}

function buildInitialAttributeState(
  canonicalAttributeId: string,
  occurredAt: string
): BehaviorAttributeState {
  return {
    canonicalAttributeId,
    likedCount: 0,
    dislikedCount: 0,
    ignoredCount: 0,
    uncertainCount: 0,
    evidenceCount: 0,
    affinity: 0,
    strength: 0,
    confidence: 0,
    explorationPriority: 1,
    lastValue: 50,
    lastFragranceId: "",
    lastUpdated: occurredAt,
    lastUpdatedAt: occurredAt,
  };
}

function signalFromEventType(eventType: EventEnvelope["eventType"]): number {
  if (eventType === "attribute_liked") {
    return 1;
  }

  if (eventType === "attribute_disliked") {
    return -1;
  }

  return 0;
}

function applyVectorSignal(
  previous: OlfactoryVector,
  canonicalAttributeId: string,
  signal: number
): OlfactoryVector {
  if (signal === 0) {
    return { ...previous };
  }

  const resolved = resolveCanonicalAttribute(canonicalAttributeId);
  if (!resolved) {
    return { ...previous };
  }

  const next: OlfactoryVector = { ...previous };
  for (const axis of Object.keys(next) as Array<keyof OlfactoryVector>) {
    const axisWeight = resolved.vectorMapping[axis] ?? 0;
    next[axis] = clampSigned(next[axis] + signal * axisWeight * 0.1);
  }

  return next;
}

function calculateAttributeConfidence(attribute: BehaviorAttributeState): number {
  const totalSignals =
    attribute.likedCount +
    attribute.dislikedCount +
    attribute.ignoredCount +
    attribute.uncertainCount;

  if (totalSignals === 0) {
    return 0;
  }

  const uncertainRatio = attribute.uncertainCount / totalSignals;
  const signalScore = Math.min(1, totalSignals / 8);

  return clamp01(signalScore * (1 - uncertainRatio * 0.5));
}

function calculateExplorationPriority(attribute: BehaviorAttributeState): number {
  const evidencePressure = 1 - clamp01(attribute.evidenceCount / 8);
  const confidencePressure = 1 - attribute.confidence;
  const conflictPressure = Math.min(1, Math.abs(attribute.affinity - attribute.strength));

  return clamp01(evidencePressure * 0.5 + confidencePressure * 0.4 + conflictPressure * 0.1);
}

function calculateGlobalConfidence(attributes: Record<string, BehaviorAttributeState>): number {
  const values = Object.values(attributes);
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, item) => sum + item.confidence, 0);
  return clamp01(total / values.length);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampSigned(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
