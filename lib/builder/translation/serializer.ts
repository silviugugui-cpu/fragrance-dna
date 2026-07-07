import type { TranslationRuleModel } from "@/lib/builder/translation/types";

export interface TranslationRuleSerializer {
  serializeRule(rule: TranslationRuleModel): string;
  serializeRules(rules: TranslationRuleModel[]): string;
  deserializeRule(serialized: string): TranslationRuleModel;
  deserializeRules(serialized: string): TranslationRuleModel[];
}

export class PlaceholderTranslationRuleSerializer
  implements TranslationRuleSerializer
{
  serializeRule(rule: TranslationRuleModel): string {
    return JSON.stringify(rule);
  }

  serializeRules(rules: TranslationRuleModel[]): string {
    return JSON.stringify(rules);
  }

  deserializeRule(serialized: string): TranslationRuleModel {
    return JSON.parse(serialized) as TranslationRuleModel;
  }

  deserializeRules(serialized: string): TranslationRuleModel[] {
    const parsed = JSON.parse(serialized) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as TranslationRuleModel[];
  }
}
