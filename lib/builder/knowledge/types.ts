export type KnowledgeEntityStatus =
  | "active"
  | "deprecated"
  | "experimental"
  | "archived";

export type KnowledgeRelationshipType =
  | "parent"
  | "child"
  | "synonym"
  | "related"
  | "opposite"
  | "derived_from";

export type KnowledgeCategoryId =
  | "notes"
  | "accords"
  | "olfactory-families"
  | "facets"
  | "materials"
  | "ingredients"
  | "brands"
  | "concentrations"
  | "gender-directions"
  | "seasonality"
  | "occasions"
  | "performance-terms"
  | "relationship-types"
  | "translation-vocabulary"
  | "metadata-terms"
  | "builder-concepts";

export interface KnowledgeProvenance {
  source: string;
  generator: string;
  method: string;
  confidence: number | null;
  timestamp: string;
}

export interface KnowledgeAliasEntry {
  alias: string;
  aliasType?:
    | "language"
    | "spelling"
    | "commercial"
    | "historical"
    | "builder";
  locale?: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeRelationship {
  relationshipType: KnowledgeRelationshipType;
  targetEntityId: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeEntityModel {
  entityId: string;
  entityType: KnowledgeCategoryId;
  canonicalName: string;
  aliases: KnowledgeAliasEntry[];
  description: string;
  status: KnowledgeEntityStatus;
  version: string;
  schemaVersion: number;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
  provenance: KnowledgeProvenance;
  metadata: Record<string, unknown>;
  relationships: KnowledgeRelationship[];
}

export interface KnowledgeCategoryDefinition {
  categoryId: KnowledgeCategoryId;
  displayName: string;
  description: string;
  version: string;
  schemaVersion: number;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
  provenance: KnowledgeProvenance;
  metadata: Record<string, unknown>;
}

export interface KnowledgeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface KnowledgeDuplicateIssue {
  type:
    | "duplicate-entity-id"
    | "duplicate-canonical-name"
    | "duplicate-alias";
  entityId: string;
  canonicalName: string;
  alias?: string;
}

export interface KnowledgeIdentifierValidation {
  valid: boolean;
  normalizedId: string;
  errors: string[];
}

export interface KnowledgeCompatibilityResult {
  compatible: boolean;
  errors: string[];
  warnings: string[];
}
