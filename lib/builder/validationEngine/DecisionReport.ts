import type { ValidationContext } from "@/lib/builder/validationEngine/ValidationContext";
import type {
  DecisionExplanation,
  DecisionHistoryEntry,
} from "@/lib/builder/validationEngine/DecisionExplanation";
import type { DecisionStatistics } from "@/lib/builder/validationEngine/DecisionStatistics";
import type {
  FinalDecision,
  ValidationResult,
} from "@/lib/builder/validationEngine/ValidationResult";

export interface DecisionReport<TInput = unknown> {
  runId: string;
  startedAt: string;
  finishedAt: string;
  inputEntity: TInput;
  executedRules: ValidationResult[];
  executionOrder: string[];
  decisionHistory: DecisionHistoryEntry[];
  finalDecision: FinalDecision;
  decisionExplanation: DecisionExplanation;
  statistics: DecisionStatistics;
}

export const createBaseDecisionReport = <TInput = unknown>(
  context: ValidationContext<TInput>,
): DecisionReport<TInput> => ({
  runId: context.runId,
  startedAt: context.startedAt,
  finishedAt: context.startedAt,
  inputEntity: context.inputEntity,
  executedRules: [],
  executionOrder: [],
  decisionHistory: [],
  finalDecision: "UNKNOWN",
  decisionExplanation: {
    summary: "No rules executed.",
    whyFinalDecisionReached: "No decision path available.",
    steps: [],
    decisionHistory: [],
  },
  statistics: {
    rulesExecuted: 0,
    rulesSkipped: 0,
    executionTimeMs: 0,
    decisionCounts: {
      AUTO_APPROVED: 0,
      AUTO_REJECTED: 0,
      REQUIRES_REVIEW: 0,
      CONFLICT: 0,
      UNKNOWN: 0,
      SKIPPED: 0,
    },
    approvalRate: 0,
    reviewRate: 0,
    conflictRate: 0,
  },
});
