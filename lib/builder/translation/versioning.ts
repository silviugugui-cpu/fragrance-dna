import type { TranslationRuleModel } from "@/lib/builder/translation/types";

export const TRANSLATION_RULE_SCHEMA_VERSION = 1;
export const TRANSLATION_RULE_VERSION_PLACEHOLDER = "0.1.0-foundation";

export interface TranslationRuleVersioningFields {
  version: string;
  schemaVersion: number;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export const createTranslationRuleVersioningFields = (
  generatedBy: string,
  now: string = new Date().toISOString(),
): TranslationRuleVersioningFields => ({
  version: TRANSLATION_RULE_VERSION_PLACEHOLDER,
  schemaVersion: TRANSLATION_RULE_SCHEMA_VERSION,
  generatedBy,
  createdAt: now,
  updatedAt: now,
});

export const touchTranslationRuleVersion = (
  rule: TranslationRuleModel,
  generatedBy: string,
  now: string = new Date().toISOString(),
): TranslationRuleModel => ({
  ...rule,
  generatedBy,
  updatedAt: now,
});
