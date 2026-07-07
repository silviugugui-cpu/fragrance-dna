/**
 * Canonical Architecture v2
 * Pre-Step 6 Infrastructure
 *
 * Purpose:
 * Define event pipeline observability contracts and in-memory metrics collector.
 */

export type EventMetricsSnapshot = {
  eventsEmitted: number;
  eventsPersisted: number;
  eventsPublished: number;
  eventsFailed: number;
  eventsRetried: number;
  parityPassed: number;
  parityFailed: number;
  averageWriteTime: number;
  averageReplayTime: number;
  averageParityTime: number;
};

export interface EventMetrics {
  recordEventEmitted(): void;
  recordEventPersisted(): void;
  recordEventPublished(): void;
  recordEventFailed(): void;
  recordEventRetried(): void;
  recordParityResult(matches: boolean, durationMs: number): void;
  recordWriteDuration(durationMs: number): void;
  recordReplayDuration(durationMs: number): void;
  getSnapshot(): EventMetricsSnapshot;
  reset(): void;
}

type DurationTotals = {
  write: number;
  replay: number;
  parity: number;
};

type DurationCounts = {
  write: number;
  replay: number;
  parity: number;
};

export class InMemoryEventMetrics implements EventMetrics {
  private counters = {
    eventsEmitted: 0,
    eventsPersisted: 0,
    eventsPublished: 0,
    eventsFailed: 0,
    eventsRetried: 0,
    parityPassed: 0,
    parityFailed: 0,
  };

  private totals: DurationTotals = {
    write: 0,
    replay: 0,
    parity: 0,
  };

  private counts: DurationCounts = {
    write: 0,
    replay: 0,
    parity: 0,
  };

  recordEventEmitted(): void {
    this.counters.eventsEmitted += 1;
  }

  recordEventPersisted(): void {
    this.counters.eventsPersisted += 1;
  }

  recordEventPublished(): void {
    this.counters.eventsPublished += 1;
  }

  recordEventFailed(): void {
    this.counters.eventsFailed += 1;
  }

  recordEventRetried(): void {
    this.counters.eventsRetried += 1;
  }

  recordParityResult(matches: boolean, durationMs: number): void {
    if (matches) {
      this.counters.parityPassed += 1;
    } else {
      this.counters.parityFailed += 1;
    }

    this.totals.parity += durationMs;
    this.counts.parity += 1;
  }

  recordWriteDuration(durationMs: number): void {
    this.totals.write += durationMs;
    this.counts.write += 1;
  }

  recordReplayDuration(durationMs: number): void {
    this.totals.replay += durationMs;
    this.counts.replay += 1;
  }

  getSnapshot(): EventMetricsSnapshot {
    return {
      ...this.counters,
      averageWriteTime: average(this.totals.write, this.counts.write),
      averageReplayTime: average(this.totals.replay, this.counts.replay),
      averageParityTime: average(this.totals.parity, this.counts.parity),
    };
  }

  reset(): void {
    this.counters = {
      eventsEmitted: 0,
      eventsPersisted: 0,
      eventsPublished: 0,
      eventsFailed: 0,
      eventsRetried: 0,
      parityPassed: 0,
      parityFailed: 0,
    };

    this.totals = {
      write: 0,
      replay: 0,
      parity: 0,
    };

    this.counts = {
      write: 0,
      replay: 0,
      parity: 0,
    };
  }
}

export function createDefaultEventMetrics(): EventMetrics {
  return new InMemoryEventMetrics();
}

function average(total: number, count: number): number {
  if (count === 0) {
    return 0;
  }

  return total / count;
}
