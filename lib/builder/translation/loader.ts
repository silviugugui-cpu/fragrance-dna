import type { TranslationRuleModel } from "@/lib/builder/translation/types";
import { validateRule } from "@/lib/builder/translation/validator";

export interface TranslationRuleLoadResult {
  rules: TranslationRuleModel[];
  errors: string[];
  warnings: string[];
}

export interface TranslationRuleLoader {
  loadRules(input: unknown): TranslationRuleLoadResult;
}

export class PlaceholderTranslationRuleLoader implements TranslationRuleLoader {
  loadRules(input: unknown): TranslationRuleLoadResult {
    const errors: string[] = [];
    const warnings: string[] = [
      "Placeholder loader: no IO or ingestion source is executed in this milestone.",
    ];

    if (!Array.isArray(input)) {
      return {
        rules: [],
        errors: ["Expected array input for placeholder translation rule loading"],
        warnings,
      };
    }

    const rules: TranslationRuleModel[] = [];
    for (const candidate of input) {
      const rule = candidate as TranslationRuleModel;
      const validation = validateRule(rule);
      if (!validation.valid) {
        errors.push(...validation.errors);
        continue;
      }
      rules.push(rule);
    }

    return {
      rules,
      errors,
      warnings,
    };
  }
}
