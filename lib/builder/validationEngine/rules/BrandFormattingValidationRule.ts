import { RULE_PRIORITY } from "@/lib/builder/validationEngine/RulePriority";
import type { RuleVersion } from "@/lib/builder/validationEngine/RuleVersion";
import { createBaseValidationRule } from "@/lib/builder/validationEngine/ValidationRule";
import type { ValidationResult } from "@/lib/builder/validationEngine/ValidationResult";
import {
  normalizeBrandFormattingKey,
  type ValidationPackPerfumeRecord,
} from "@/lib/builder/validationEngine/rules/ValidationPackTypes";

export interface BrandFormattingValidationInput {
  record: ValidationPackPerfumeRecord;
}

export const BRAND_FORMATTING_VALIDATION_RULE_VERSION: RuleVersion = {
  ruleId: "brand-formatting-validation-rule",
  ruleName: "BrandFormattingValidationRule",
  version: "1.0.0",
  description: "Detects brand-formatting inconsistencies across equivalent brands.",
  author: "FragranceDNA Builder",
  createdAt: "2026-07-07T00:00:00.000Z",
  updatedAt: "2026-07-07T00:00:00.000Z",
};

export const createBrandFormattingValidationRule = () =>
  createBaseValidationRule<BrandFormattingValidationInput>({
    version: BRAND_FORMATTING_VALIDATION_RULE_VERSION,
    priority: RULE_PRIORITY.NORMAL,
    group: "sprint-1-validation-pack",
    execute: (context): ValidationResult => {
      const rawBrand = context.inputEntity.record.brand.trim();

      if (rawBrand.length === 0) {
        return {
          ruleId: BRAND_FORMATTING_VALIDATION_RULE_VERSION.ruleId,
          ruleName: BRAND_FORMATTING_VALIDATION_RULE_VERSION.ruleName,
          ruleVersion: BRAND_FORMATTING_VALIDATION_RULE_VERSION.version,
          priority: RULE_PRIORITY.NORMAL,
          status: "FAILED",
          decision: "REQUIRES_REVIEW",
          explanation: "Brand value is empty.",
          executionTimeMs: 0,
          metadata: {
            severity: "warning" as const,
            issueType: "BRAND_EMPTY",
          },
        };
      }

      const preferred = context.inputEntity.record.preferredBrandFormatting;
      if (!preferred) {
        return {
          ruleId: BRAND_FORMATTING_VALIDATION_RULE_VERSION.ruleId,
          ruleName: BRAND_FORMATTING_VALIDATION_RULE_VERSION.ruleName,
          ruleVersion: BRAND_FORMATTING_VALIDATION_RULE_VERSION.version,
          priority: RULE_PRIORITY.NORMAL,
          status: "PASSED",
          decision: "AUTO_APPROVED",
          explanation: "No canonical brand formatting reference available.",
          executionTimeMs: 0,
          metadata: {
            severity: "none" as const,
            normalizedBrand: normalizeBrandFormattingKey(rawBrand),
          },
        };
      }

      if (preferred === rawBrand) {
        return {
          ruleId: BRAND_FORMATTING_VALIDATION_RULE_VERSION.ruleId,
          ruleName: BRAND_FORMATTING_VALIDATION_RULE_VERSION.ruleName,
          ruleVersion: BRAND_FORMATTING_VALIDATION_RULE_VERSION.version,
          priority: RULE_PRIORITY.NORMAL,
          status: "PASSED",
          decision: "AUTO_APPROVED",
          explanation: "Brand formatting is consistent.",
          executionTimeMs: 0,
          metadata: {
            severity: "none" as const,
            preferredBrandFormatting: preferred,
          },
        };
      }

      return {
        ruleId: BRAND_FORMATTING_VALIDATION_RULE_VERSION.ruleId,
        ruleName: BRAND_FORMATTING_VALIDATION_RULE_VERSION.ruleName,
        ruleVersion: BRAND_FORMATTING_VALIDATION_RULE_VERSION.version,
        priority: RULE_PRIORITY.NORMAL,
        status: "FAILED",
        decision: "REQUIRES_REVIEW",
        explanation: "Brand formatting inconsistency detected.",
        executionTimeMs: 0,
        metadata: {
          severity: "warning" as const,
          issueType: "BRAND_FORMAT_INCONSISTENT",
          preferredBrandFormatting: preferred,
          rawBrandFormatting: rawBrand,
        },
      };
    },
  });
