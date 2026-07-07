import { RULE_PRIORITY } from "@/lib/builder/validationEngine/RulePriority";
import type { RuleVersion } from "@/lib/builder/validationEngine/RuleVersion";
import { createBaseValidationRule } from "@/lib/builder/validationEngine/ValidationRule";
import type { ValidationResult } from "@/lib/builder/validationEngine/ValidationResult";

export type VoteDistribution = Record<string, number>;

export interface PerformanceEvidenceValidationInput {
  longevityVoteDistribution: VoteDistribution;
  sillageVoteDistribution: VoteDistribution;
}

export type PerformanceDataQuality = "UNKNOWN" | "VALID";

export interface PerformanceEvidenceValidationOutput {
  hasPerformanceData: boolean;
  performanceDataQuality: PerformanceDataQuality;
}

export const PERFORMANCE_EVIDENCE_VALIDATION_RULE_VERSION: RuleVersion = {
  ruleId: "performance-evidence-validation-rule",
  ruleName: "PerformanceEvidenceValidationRule",
  version: "1.0.0",
  description:
    "Validates whether raw performance vote distributions contain any non-zero evidence without deriving labels.",
  author: "FragranceDNA Builder",
  createdAt: "2026-07-06T00:00:00.000Z",
  updatedAt: "2026-07-06T00:00:00.000Z",
};

const isAllZeroDistribution = (distribution: VoteDistribution): boolean =>
  Object.values(distribution).every((value) => value === 0);

export const evaluatePerformanceEvidence = (
  input: PerformanceEvidenceValidationInput,
): PerformanceEvidenceValidationOutput => {
  const allLongevityZero = isAllZeroDistribution(input.longevityVoteDistribution);
  const allSillageZero = isAllZeroDistribution(input.sillageVoteDistribution);

  if (allLongevityZero && allSillageZero) {
    return {
      hasPerformanceData: false,
      performanceDataQuality: "UNKNOWN",
    };
  }

  return {
    hasPerformanceData: true,
    performanceDataQuality: "VALID",
  };
};

export const createPerformanceEvidenceValidationRule = () =>
  createBaseValidationRule<PerformanceEvidenceValidationInput>({
    version: PERFORMANCE_EVIDENCE_VALIDATION_RULE_VERSION,
    priority: RULE_PRIORITY.HIGH,
    group: "performance",
    execute: (context): ValidationResult => {
      const output = evaluatePerformanceEvidence(context.inputEntity);

      return {
        ruleId: PERFORMANCE_EVIDENCE_VALIDATION_RULE_VERSION.ruleId,
        ruleName: PERFORMANCE_EVIDENCE_VALIDATION_RULE_VERSION.ruleName,
        ruleVersion: PERFORMANCE_EVIDENCE_VALIDATION_RULE_VERSION.version,
        priority: RULE_PRIORITY.HIGH,
        status: "PASSED",
        decision: output.hasPerformanceData ? "AUTO_APPROVED" : "UNKNOWN",
        explanation: output.hasPerformanceData
          ? "Performance evidence found in raw vote distributions. Raw distributions were preserved without deriving labels."
          : "No performance evidence found: all longevity and sillage vote values are zero. Raw distributions were preserved without deriving labels.",
        executionTimeMs: 0,
        metadata: {
          hasPerformanceData: output.hasPerformanceData,
          performanceDataQuality: output.performanceDataQuality,
          longevityVoteDistribution: context.inputEntity.longevityVoteDistribution,
          sillageVoteDistribution: context.inputEntity.sillageVoteDistribution,
        },
      };
    },
  });