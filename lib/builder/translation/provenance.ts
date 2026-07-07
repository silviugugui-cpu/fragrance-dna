import type {
  TranslationRuleModel,
  TranslationRuleProvenance,
} from "@/lib/builder/translation/types";

export interface CreateTranslationProvenanceInput {
  source: string;
  generator: string;
  method: string;
  confidence: number | null;
  timestamp?: string;
}

export const createTranslationRuleProvenance = (
  input: CreateTranslationProvenanceInput,
): TranslationRuleProvenance => ({
  source: input.source,
  generator: input.generator,
  method: input.method,
  confidence: input.confidence,
  timestamp: input.timestamp ?? new Date().toISOString(),
});

export const attachTranslationProvenance = (
  rule: TranslationRuleModel,
  provenance: TranslationRuleProvenance,
): TranslationRuleModel => ({
  ...rule,
  provenance,
  updatedAt: provenance.timestamp,
});
