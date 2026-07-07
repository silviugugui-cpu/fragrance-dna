import { RULE_PRIORITY } from "@/lib/builder/validationEngine/RulePriority";
import type { RuleVersion } from "@/lib/builder/validationEngine/RuleVersion";
import { createBaseValidationRule } from "@/lib/builder/validationEngine/ValidationRule";
import type { ValidationResult } from "@/lib/builder/validationEngine/ValidationResult";
import type {
  ValidationIssueSeverity,
  ValidationPackPerfumeRecord,
} from "@/lib/builder/validationEngine/rules/ValidationPackTypes";

export interface LaunchYearValidationInput {
  record: ValidationPackPerfumeRecord;
}

type LaunchYearIssueType = "MISSING" | "INVALID_FORMAT" | "PRE_1800" | "IN_FUTURE";

const CURRENT_YEAR = new Date().getUTCFullYear();

export const LAUNCH_YEAR_VALIDATION_RULE_VERSION: RuleVersion = {
  ruleId: "launch-year-validation-rule",
  ruleName: "LaunchYearValidationRule",
  version: "1.0.0",
  description: "Flags missing, malformed, pre-1800, and future launch years.",
  author: "FragranceDNA Builder",
  createdAt: "2026-07-07T00:00:00.000Z",
  updatedAt: "2026-07-07T00:00:00.000Z",
};

const parseLaunchYear = (raw: unknown): number | null => {
  if (raw === null || raw === undefined) {
    return null;
  }

  const text = String(raw).trim();
  if (text.length === 0) {
    return null;
  }

  if (!/^\d{1,4}$/.test(text)) {
    return Number.NaN;
  }

  return Number.parseInt(text, 10);
};

const getSeverity = (issueType: LaunchYearIssueType): ValidationIssueSeverity => {
  if (issueType === "PRE_1800" || issueType === "IN_FUTURE") {
    return "error";
  }

  return "warning";
};

export const createLaunchYearValidationRule = () =>
  createBaseValidationRule<LaunchYearValidationInput>({
    version: LAUNCH_YEAR_VALIDATION_RULE_VERSION,
    priority: RULE_PRIORITY.HIGH,
    group: "sprint-1-validation-pack",
    execute: (context): ValidationResult => {
      const parsed = parseLaunchYear(context.inputEntity.record.launchYearRaw);

      let issueType: LaunchYearIssueType | null = null;
      if (parsed === null) {
        issueType = "MISSING";
      } else if (!Number.isFinite(parsed)) {
        issueType = "INVALID_FORMAT";
      } else if (parsed < 1800) {
        issueType = "PRE_1800";
      } else if (parsed > CURRENT_YEAR) {
        issueType = "IN_FUTURE";
      }

      if (issueType === null) {
        return {
          ruleId: LAUNCH_YEAR_VALIDATION_RULE_VERSION.ruleId,
          ruleName: LAUNCH_YEAR_VALIDATION_RULE_VERSION.ruleName,
          ruleVersion: LAUNCH_YEAR_VALIDATION_RULE_VERSION.version,
          priority: RULE_PRIORITY.HIGH,
          status: "PASSED",
          decision: "AUTO_APPROVED",
          explanation: "Launch year is valid.",
          executionTimeMs: 0,
          metadata: {
            severity: "none" as const,
            launchYear: parsed,
          },
        };
      }

      const severity = getSeverity(issueType);

      return {
        ruleId: LAUNCH_YEAR_VALIDATION_RULE_VERSION.ruleId,
        ruleName: LAUNCH_YEAR_VALIDATION_RULE_VERSION.ruleName,
        ruleVersion: LAUNCH_YEAR_VALIDATION_RULE_VERSION.version,
        priority: RULE_PRIORITY.HIGH,
        status: "FAILED",
        decision: severity === "error" ? "AUTO_REJECTED" : "REQUIRES_REVIEW",
        explanation: `Launch year issue detected: ${issueType}.`,
        executionTimeMs: 0,
        metadata: {
          severity,
          issueType,
          launchYearRaw: context.inputEntity.record.launchYearRaw,
          currentYear: CURRENT_YEAR,
        },
      };
    },
  });
