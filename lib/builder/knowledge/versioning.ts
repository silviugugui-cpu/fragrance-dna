import type {
  KnowledgeCategoryDefinition,
  KnowledgeEntityModel,
} from "@/lib/builder/knowledge/types";

export const KNOWLEDGE_SCHEMA_VERSION = 1;
export const KNOWLEDGE_VERSION_PLACEHOLDER = "0.1.0-foundation";

export interface KnowledgeVersioningFields {
  version: string;
  schemaVersion: number;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export const createKnowledgeVersioningFields = (
  generatedBy: string,
  now: string = new Date().toISOString(),
): KnowledgeVersioningFields => ({
  version: KNOWLEDGE_VERSION_PLACEHOLDER,
  schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
  generatedBy,
  createdAt: now,
  updatedAt: now,
});

export const touchKnowledgeEntityVersion = (
  entity: KnowledgeEntityModel,
  generatedBy: string,
  now: string = new Date().toISOString(),
): KnowledgeEntityModel => ({
  ...entity,
  generatedBy,
  updatedAt: now,
});

export const touchKnowledgeCategoryVersion = (
  category: KnowledgeCategoryDefinition,
  generatedBy: string,
  now: string = new Date().toISOString(),
): KnowledgeCategoryDefinition => ({
  ...category,
  generatedBy,
  updatedAt: now,
});
