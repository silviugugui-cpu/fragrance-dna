import type {
  TranslationCompatibilityResult,
  TranslationExecutionResult,
  TranslationRuleModel,
  TranslationRuleValidationResult,
} from "@/lib/builder/translation/types";

const emptyResult = (): TranslationRuleValidationResult => ({
  valid: true,
  errors: [],
  warnings: [],
});

export const validateRule = (
  rule: TranslationRuleModel,
): TranslationRuleValidationResult => {
  const result = emptyResult();

  if (!rule.ruleId.trim()) {
    result.valid = false;
    result.errors.push("ruleId is required");
  }

  if (!rule.version.trim()) {
    result.valid = false;
    result.errors.push("version is required");
  }

  if (!rule.generatedBy.trim()) {
    result.valid = false;
    result.errors.push("generatedBy is required");
  }

  if (!Number.isFinite(rule.priority)) {
    result.valid = false;
    result.errors.push("priority must be a finite number");
  }

  result.warnings.push(
    "Placeholder validation: rule semantics and deterministic mapping constraints are deferred.",
  );
  return result;
};

export const validateRegistry = (
  rules: TranslationRuleModel[],
): TranslationRuleValidationResult => {
  const result = emptyResult();
  const ids = new Set<string>();

  for (const rule of rules) {
    const normalized = rule.ruleId.trim().toLowerCase();
    if (ids.has(normalized)) {
      result.valid = false;
      result.errors.push(`Duplicate ruleId detected: ${rule.ruleId}`);
    }
    ids.add(normalized);
  }

  result.warnings.push(
    "Placeholder validation: registry conflict and dependency policies are deferred.",
  );
  return result;
};

export const validateExecution = (
  execution: TranslationExecutionResult,
): TranslationRuleValidationResult => {
  const result = emptyResult();

  if (execution.matched && !execution.ruleId) {
    result.valid = false;
    result.errors.push("Execution with matched=true must include ruleId");
  }

  if (execution.matched && !execution.provenance) {
    result.valid = false;
    result.errors.push("Execution with matched=true must include provenance");
  }

  result.warnings.push(
    "Placeholder validation: execution confidence semantics are deferred.",
  );
  return result;
};

export const validateCompatibility = (
  compatibility: TranslationCompatibilityResult,
): TranslationRuleValidationResult => {
  const result = emptyResult();

  if (!compatibility.compatible && compatibility.errors.length === 0) {
    result.valid = false;
    result.errors.push("Incompatible result must provide at least one error");
  }

  result.warnings.push(
    "Placeholder validation: compatibility taxonomy and upgrade paths are deferred.",
  );
  return result;
};
