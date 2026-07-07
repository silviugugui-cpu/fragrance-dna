import { RULE_PRIORITY } from "@/lib/builder/validationEngine/RulePriority";
import type { RuleVersion } from "@/lib/builder/validationEngine/RuleVersion";
import { createBaseValidationRule } from "@/lib/builder/validationEngine/ValidationRule";
import type { ValidationResult } from "@/lib/builder/validationEngine/ValidationResult";
import {
  evaluatePerformanceEvidence,
  type PerformanceEvidenceValidationInput,
} from "@/lib/builder/validationEngine/rules/PerformanceEvidenceValidationRule";
import {
  parseVoteDistribution,
  type ValidationPackPerfumeRecord,
} from "@/lib/builder/validationEngine/rules/ValidationPackTypes";

export interface PerformanceEvidencePackValidationInput {
  record: ValidationPackPerfumeRecord;
}

export const PERFORMANCE_EVIDENCE_PACK_VALIDATION_RULE_VERSION: RuleVersion = {
  ruleId: "performance-evidence-pack-validation-rule",
  ruleName: "PerformanceEvidencePackValidationRule",
  version: "1.0.0",
  description:
    "Validates presence of longevity/sillage performance evidence for Sprint 1 pack execution.",
  author: "FragranceDNA Builder",
  createdAt: "2026-07-07T00:00:00.000Z",
  updatedAt: "2026-07-07T00:00:00.000Z",
};

export const createPerformanceEvidencePackValidationRule = () =>
  createBaseValidationRule<PerformanceEvidencePackValidationInput>({
    version: PERFORMANCE_EVIDENCE_PACK_VALIDATION_RULE_VERSION,
    priority: RULE_PRIORITY.HIGH,
    group: "sprint-1-validation-pack",
    execute: (context): ValidationResult => {
      const input: PerformanceEvidenceValidationInput = {
        longevityVoteDistribution: parseVoteDistribution(context.inputEntity.record.longevityRaw),
        sillageVoteDistribution: parseVoteDistribution(context.inputEntity.record.sillageRaw),
      };

      const output = evaluatePerformanceEvidence(input);

      return {
        ruleId: PERFORMANCE_EVIDENCE_PACK_VALIDATION_RULE_VERSION.ruleId,
        ruleName: PERFORMANCE_EVIDENCE_PACK_VALIDATION_RULE_VERSION.ruleName,
        ruleVersion: PERFORMANCE_EVIDENCE_PACK_VALIDATION_RULE_VERSION.version,
        priority: RULE_PRIORITY.HIGH,
        status: output.hasPerformanceData ? "PASSED" : "FAILED",
        decision: output.hasPerformanceData ? "AUTO_APPROVED" : "REQUIRES_REVIEW",
        explanation: output.hasPerformanceData
          ? "Performance evidence found in raw vote distributions."
          : "No performance evidence found: all longevity and sillage votes are zero.",
        executionTimeMs: 0,
        metadata: {
          severity: output.hasPerformanceData ? ("none" as const) : ("warning" as const),
          hasPerformanceData: output.hasPerformanceData,
          performanceDataQuality: output.performanceDataQuality,
          longevityVoteDistribution: input.longevityVoteDistribution,
          sillageVoteDistribution: input.sillageVoteDistribution,
        },
      };
    },
  });
