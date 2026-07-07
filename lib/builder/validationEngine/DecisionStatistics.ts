import type { FinalDecision } from "@/lib/builder/validationEngine/ValidationResult";

export interface DecisionCountStatistics {
  AUTO_APPROVED: number;
  AUTO_REJECTED: number;
  REQUIRES_REVIEW: number;
  CONFLICT: number;
  UNKNOWN: number;
  SKIPPED: number;
}

export interface DecisionStatistics {
  rulesExecuted: number;
  rulesSkipped: number;
  executionTimeMs: number;
  decisionCounts: DecisionCountStatistics;
  approvalRate: number;
  reviewRate: number;
  conflictRate: number;
}

export const createDecisionCountStatistics = (): DecisionCountStatistics => ({
  AUTO_APPROVED: 0,
  AUTO_REJECTED: 0,
  REQUIRES_REVIEW: 0,
  CONFLICT: 0,
  UNKNOWN: 0,
  SKIPPED: 0,
});

export const incrementDecisionCount = (
  stats: DecisionCountStatistics,
  decision: FinalDecision,
): void => {
  stats[decision] += 1;
};

export const calculateRate = (count: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }

  return Number(((count / total) * 100).toFixed(2));
};
