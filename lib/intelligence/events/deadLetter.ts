/**
 * Canonical Architecture v2
 * Pre-Step 6 Infrastructure
 *
 * Purpose:
 * Define canonical failed-event contracts and dead-letter lifecycle interfaces.
 */

import type { EventEnvelope } from "@/lib/intelligence/events/types";

export type FailedEvent = {
  failureId: string;
  failedAt: string;
  reason: string;
  replayable: boolean;
  retryCount: number;
  maxRetryCount: number;
  originalEvent: EventEnvelope;
  lastErrorMessage?: string;
  metadata?: Record<string, unknown>;
};

export interface FailedEventRepository {
  save(failedEvent: FailedEvent): Promise<void>;
  getByFailureId(failureId: string): Promise<FailedEvent | null>;
  listReplayable(limit?: number): Promise<FailedEvent[]>;
  markReplayed(failureId: string, replayedAt: string): Promise<void>;
}

export interface DeadLetterQueue {
  enqueue(failedEvent: FailedEvent): Promise<void>;
  dequeue(): Promise<FailedEvent | null>;
  peek(limit?: number): Promise<FailedEvent[]>;
}

export class NoopFailedEventRepository implements FailedEventRepository {
  async save(_failedEvent: FailedEvent): Promise<void> {
    return;
  }

  async getByFailureId(_failureId: string): Promise<FailedEvent | null> {
    return null;
  }

  async listReplayable(_limit?: number): Promise<FailedEvent[]> {
    return [];
  }

  async markReplayed(_failureId: string, _replayedAt: string): Promise<void> {
    return;
  }
}

export class NoopDeadLetterQueue implements DeadLetterQueue {
  async enqueue(_failedEvent: FailedEvent): Promise<void> {
    return;
  }

  async dequeue(): Promise<FailedEvent | null> {
    return null;
  }

  async peek(_limit?: number): Promise<FailedEvent[]> {
    return [];
  }
}

export function createFailedEvent(input: {
  originalEvent: EventEnvelope;
  reason: string;
  maxRetryCount?: number;
  replayable?: boolean;
  lastErrorMessage?: string;
  metadata?: Record<string, unknown>;
}): FailedEvent {
  return {
    failureId: buildFailureId(),
    failedAt: new Date().toISOString(),
    reason: input.reason,
    replayable: input.replayable ?? true,
    retryCount: 0,
    maxRetryCount: input.maxRetryCount ?? 0,
    originalEvent: input.originalEvent,
    lastErrorMessage: input.lastErrorMessage,
    metadata: input.metadata,
  };
}

function buildFailureId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `failed_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
