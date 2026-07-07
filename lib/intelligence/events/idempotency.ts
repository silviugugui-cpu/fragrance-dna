import type { Phase1EventType } from "@/lib/intelligence/events/types";

type IdempotencyInput = {
  userId: string;
  eventType: Phase1EventType;
  actionId: string;
  sessionId?: string;
};

export function buildIdempotencyKey(input: IdempotencyInput): string {
  const sessionPart = input.sessionId ? `:${input.sessionId}` : "";
  return `${input.userId}:${input.eventType}:${input.actionId}${sessionPart}`;
}

export function buildActionId(prefix: string, value: string): string {
  const normalizedPrefix = prefix.trim().replace(/\s+/g, "-").toLowerCase();
  const normalizedValue = value.trim().replace(/\s+/g, "-").toLowerCase();
  return `${normalizedPrefix}-${normalizedValue}`;
}
