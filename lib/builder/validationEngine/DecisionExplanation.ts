import type {
  FinalDecision,
  ValidationStatus,
} from "@/lib/builder/validationEngine/ValidationResult";

export interface RuleDecisionExplanation {
  ruleId: string;
  ruleName: string;
  status: ValidationStatus;
  decision: FinalDecision;
  whyExecuted: string;
  whyResult: string;
  whySkipped?: string;
}

export interface DecisionHistoryEntry {
  index: number;
  ruleId: string;
  previousDecision: FinalDecision;
  nextDecision: FinalDecision;
  reason: string;
}

export interface DecisionExplanation {
  summary: string;
  whyFinalDecisionReached: string;
  steps: RuleDecisionExplanation[];
  decisionHistory: DecisionHistoryEntry[];
}
