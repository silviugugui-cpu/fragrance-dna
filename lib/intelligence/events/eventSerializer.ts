/**
 * Canonical Architecture v2
 * Phase 1 - Step 4
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 *
 * Purpose:
 * Serialize events deterministically for canonical persistence and replay safety.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";

export function serializeEventDeterministically(event: EventEnvelope): string {
  const normalized = normalizeValue(event) as Record<string, unknown>;
  return JSON.stringify(normalized);
}

function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    const sortedKeys = Object.keys(objectValue).sort((left, right) => left.localeCompare(right));
    const normalizedObject: Record<string, unknown> = {};

    for (const key of sortedKeys) {
      normalizedObject[key] = normalizeValue(objectValue[key]);
    }

    return normalizedObject;
  }

  return value;
}
