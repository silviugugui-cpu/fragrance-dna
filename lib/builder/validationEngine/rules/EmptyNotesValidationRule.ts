import { RULE_PRIORITY } from "@/lib/builder/validationEngine/RulePriority";
import type { RuleVersion } from "@/lib/builder/validationEngine/RuleVersion";
import { createBaseValidationRule } from "@/lib/builder/validationEngine/ValidationRule";
import type { ValidationResult } from "@/lib/builder/validationEngine/ValidationResult";
import {
  parseNotesList,
  type ValidationPackPerfumeRecord,
} from "@/lib/builder/validationEngine/rules/ValidationPackTypes";

export interface EmptyNotesValidationInput {
  record: ValidationPackPerfumeRecord;
}

export const EMPTY_NOTES_VALIDATION_RULE_VERSION: RuleVersion = {
  ruleId: "empty-notes-validation-rule",
  ruleName: "EmptyNotesValidationRule",
  version: "1.0.0",
  description: "Flags rows where notes are empty or malformed.",
  author: "FragranceDNA Builder",
  createdAt: "2026-07-07T00:00:00.000Z",
  updatedAt: "2026-07-07T00:00:00.000Z",
};

export const createEmptyNotesValidationRule = () =>
  createBaseValidationRule<EmptyNotesValidationInput>({
    version: EMPTY_NOTES_VALIDATION_RULE_VERSION,
    priority: RULE_PRIORITY.HIGH,
    group: "sprint-1-validation-pack",
    execute: (context): ValidationResult => {
      const parsed = parseNotesList(context.inputEntity.record.notesRaw);

      if (parsed.items.length > 0) {
        return {
          ruleId: EMPTY_NOTES_VALIDATION_RULE_VERSION.ruleId,
          ruleName: EMPTY_NOTES_VALIDATION_RULE_VERSION.ruleName,
          ruleVersion: EMPTY_NOTES_VALIDATION_RULE_VERSION.version,
          priority: RULE_PRIORITY.HIGH,
          status: "PASSED",
          decision: "AUTO_APPROVED",
          explanation: "Notes field contains values.",
          executionTimeMs: 0,
          metadata: {
            severity: "none" as const,
            notesCount: parsed.items.length,
          },
        };
      }

      const issueType = parsed.isInvalidStructure ? "INVALID_NOTES_FORMAT" : "NOTES_EMPTY";

      return {
        ruleId: EMPTY_NOTES_VALIDATION_RULE_VERSION.ruleId,
        ruleName: EMPTY_NOTES_VALIDATION_RULE_VERSION.ruleName,
        ruleVersion: EMPTY_NOTES_VALIDATION_RULE_VERSION.version,
        priority: RULE_PRIORITY.HIGH,
        status: "FAILED",
        decision: "AUTO_REJECTED",
        explanation: `Notes issue detected: ${issueType}.`,
        executionTimeMs: 0,
        metadata: {
          severity: "error" as const,
          issueType,
        },
      };
    },
  });
