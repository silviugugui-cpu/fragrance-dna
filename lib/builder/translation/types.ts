export type TranslationRuleType =
  | "brand-normalization"
  | "note-normalization"
  | "accord-normalization"
  | "concentration-normalization"
  | "gender-normalization"
  | "family-normalization"
  | "metadata-normalization"
  | "relationship-normalization";

export interface TranslationRuleProvenance {
  source: string;
  generator: string;
  method: string;
  confidence: number | null;
  timestamp: string;
}

export interface TranslationRuleModel {
  ruleId: string;
  ruleType: TranslationRuleType;
  inputPattern: unknown;
  outputValue: unknown;
  priority: number;
  enabled: boolean;
  version: string;
  schemaVersion: number;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
  provenance: TranslationRuleProvenance;
}

export interface TranslationExecutionResult {
  matched: boolean;
  confidence: number | null;
  canonicalValue: unknown;
  ruleId: string | null;
  provenance: TranslationRuleProvenance | null;
}

export interface TranslationRuleValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TranslationCompatibilityResult {
  compatible: boolean;
  errors: string[];
  warnings: string[];
}

export interface TranslationRuleDuplicateIssue {
  type: "duplicate-rule-id";
  ruleId: string;
}
