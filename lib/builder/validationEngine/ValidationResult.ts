import type { RulePriority } from "@/lib/builder/validationEngine/RulePriority";

export type FinalDecision =
  | "AUTO_APPROVED"
  | "AUTO_REJECTED"
  | "REQUIRES_REVIEW"
  | "CONFLICT"
  | "UNKNOWN"
  | "SKIPPED";

export type ValidationStatus = "PASSED" | "FAILED" | "SKIPPED" | "ERROR";

export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  ruleVersion: string;
  priority: RulePriority;
  status: ValidationStatus;
  decision: FinalDecision;
  explanation: string;
  executionTimeMs: number;
  metadata: Record<string, unknown>;
}

export const createSkippedValidationResult = (
  input: {
    ruleId: string;
    ruleName: string;
    ruleVersion: string;
    priority: RulePriority;
    explanation: string;
    metadata?: Record<string, unknown>;
  },
): ValidationResult => ({
  ruleId: input.ruleId,
  ruleName: input.ruleName,
  ruleVersion: input.ruleVersion,
  priority: input.priority,
  status: "SKIPPED",
  decision: "SKIPPED",
  explanation: input.explanation,
  executionTimeMs: 0,
  metadata: input.metadata ?? {},
});
