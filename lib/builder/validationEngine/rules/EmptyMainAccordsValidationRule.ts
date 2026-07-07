import { RULE_PRIORITY } from "@/lib/builder/validationEngine/RulePriority";
import type { RuleVersion } from "@/lib/builder/validationEngine/RuleVersion";
import { createBaseValidationRule } from "@/lib/builder/validationEngine/ValidationRule";
import type { ValidationResult } from "@/lib/builder/validationEngine/ValidationResult";
import {
  parseMainAccordsList,
  type ValidationPackPerfumeRecord,
} from "@/lib/builder/validationEngine/rules/ValidationPackTypes";

export interface EmptyMainAccordsValidationInput {
  record: ValidationPackPerfumeRecord;
}

export const EMPTY_MAIN_ACCORDS_VALIDATION_RULE_VERSION: RuleVersion = {
  ruleId: "empty-main-accords-validation-rule",
  ruleName: "EmptyMainAccordsValidationRule",
  version: "1.0.0",
  description: "Flags rows where main accords are empty or malformed.",
  author: "FragranceDNA Builder",
  createdAt: "2026-07-07T00:00:00.000Z",
  updatedAt: "2026-07-07T00:00:00.000Z",
};

export const createEmptyMainAccordsValidationRule = () =>
  createBaseValidationRule<EmptyMainAccordsValidationInput>({
    version: EMPTY_MAIN_ACCORDS_VALIDATION_RULE_VERSION,
    priority: RULE_PRIORITY.HIGH,
    group: "sprint-1-validation-pack",
    execute: (context): ValidationResult => {
      const parsed = parseMainAccordsList(context.inputEntity.record.mainAccordsRaw);

      if (parsed.items.length > 0) {
        return {
          ruleId: EMPTY_MAIN_ACCORDS_VALIDATION_RULE_VERSION.ruleId,
          ruleName: EMPTY_MAIN_ACCORDS_VALIDATION_RULE_VERSION.ruleName,
          ruleVersion: EMPTY_MAIN_ACCORDS_VALIDATION_RULE_VERSION.version,
          priority: RULE_PRIORITY.HIGH,
          status: "PASSED",
          decision: "AUTO_APPROVED",
          explanation: "Main accords field contains values.",
          executionTimeMs: 0,
          metadata: {
            severity: "none" as const,
            accordsCount: parsed.items.length,
          },
        };
      }

      const issueType = parsed.isInvalidStructure
        ? "INVALID_MAIN_ACCORDS_FORMAT"
        : "MAIN_ACCORDS_EMPTY";

      return {
        ruleId: EMPTY_MAIN_ACCORDS_VALIDATION_RULE_VERSION.ruleId,
        ruleName: EMPTY_MAIN_ACCORDS_VALIDATION_RULE_VERSION.ruleName,
        ruleVersion: EMPTY_MAIN_ACCORDS_VALIDATION_RULE_VERSION.version,
        priority: RULE_PRIORITY.HIGH,
        status: "FAILED",
        decision: "AUTO_REJECTED",
        explanation: `Main accords issue detected: ${issueType}.`,
        executionTimeMs: 0,
        metadata: {
          severity: "error" as const,
          issueType,
        },
      };
    },
  });
