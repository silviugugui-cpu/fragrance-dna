import type {
  KnowledgeCategoryDefinition,
  KnowledgeEntityModel,
  KnowledgeProvenance,
} from "@/lib/builder/knowledge/types";

export interface CreateKnowledgeProvenanceInput {
  source: string;
  generator: string;
  method: string;
  confidence: number | null;
  timestamp?: string;
}

export const createKnowledgeProvenance = (
  input: CreateKnowledgeProvenanceInput,
): KnowledgeProvenance => ({
  source: input.source,
  generator: input.generator,
  method: input.method,
  confidence: input.confidence,
  timestamp: input.timestamp ?? new Date().toISOString(),
});

export const attachKnowledgeEntityProvenance = (
  entity: KnowledgeEntityModel,
  provenance: KnowledgeProvenance,
): KnowledgeEntityModel => ({
  ...entity,
  provenance,
  updatedAt: provenance.timestamp,
});

export const attachKnowledgeCategoryProvenance = (
  category: KnowledgeCategoryDefinition,
  provenance: KnowledgeProvenance,
): KnowledgeCategoryDefinition => ({
  ...category,
  provenance,
  updatedAt: provenance.timestamp,
});
