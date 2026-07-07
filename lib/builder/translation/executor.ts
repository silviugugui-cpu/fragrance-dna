import type {
  TranslationExecutionResult,
  TranslationRuleModel,
} from "@/lib/builder/translation/types";

export interface TranslationExecutionInput {
  ruleType: TranslationRuleModel["ruleType"];
  sourceValue: unknown;
  sourceContext?: Record<string, unknown>;
}

export interface TranslationRuleExecutor {
  execute(
    rule: TranslationRuleModel,
    input: TranslationExecutionInput,
  ): TranslationExecutionResult;
}

export class PlaceholderTranslationRuleExecutor implements TranslationRuleExecutor {
  execute(
    rule: TranslationRuleModel,
    _input: TranslationExecutionInput,
  ): TranslationExecutionResult {
    return {
      matched: false,
      confidence: null,
      canonicalValue: null,
      ruleId: rule.ruleId,
      provenance: rule.provenance,
    };
  }
}
