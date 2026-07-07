import type {
  KnowledgeAliasEntry,
  KnowledgeEntityStatus,
  KnowledgeProvenance,
} from "@/lib/builder/knowledge/types";

export const CANONICAL_NOTE_ENTITY_SCHEMA_VERSION = 1;
export const CANONICAL_NOTE_ENTITY_MODEL_VERSION = "1.0.0";

export type NoteIngredientTypeCore =
  | "natural"
  | "synthetic-molecule"
  | "accord"
  | "abstract-material"
  | "unknown";

export interface NoteIngredientType {
  value: string;
  canonicalCore?: NoteIngredientTypeCore;
  taxonomyId?: string;
  metadata?: Record<string, unknown>;
}

export type NoteTypicalPositionCore =
  | "top"
  | "middle"
  | "base"
  | "multiple"
  | "unknown";

export interface NoteTypicalPosition {
  value: string;
  canonicalCore?: NoteTypicalPositionCore;
  taxonomyId?: string;
  metadata?: Record<string, unknown>;
}

export interface NoteLanguageVariant {
  locale: string;
  value: string;
  script?: string;
  metadata?: Record<string, unknown>;
}

export interface NoteAlternativeSpelling {
  value: string;
  locale?: string;
  metadata?: Record<string, unknown>;
}

export interface NoteTag {
  value: string;
  taxonomyId?: string;
  metadata?: Record<string, unknown>;
}

export interface NoteRelationshipRef {
  noteId: string;
  relationshipType:
    | "related-note"
    | "opposite-note"
    | "parent-family"
    | "child-note";
  metadata?: Record<string, unknown>;
}

export interface NoteTranslationMetadata {
  translationKey?: string;
  translationNamespace?: string;
  languageVariants: NoteLanguageVariant[];
  metadata?: Record<string, unknown>;
}

export interface NoteKnowledgeMetadata {
  confidence: number | null;
  sources: string[];
  reviewStatus?: "draft" | "reviewed" | "approved" | "deprecated";
  metadata?: Record<string, unknown>;
}

export interface NoteBuilderMetadata {
  schemaVersion: number;
  modelVersion: string;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface NoteGovernanceMetadata {
  owner: string;
  contractStatus: "pass" | "warn" | "fail";
  validationErrors: string[];
  validationWarnings: string[];
  provenance: KnowledgeProvenance;
  metadata?: Record<string, unknown>;
}

export interface CanonicalNoteEntityV1 {
  identity: {
    noteId: string;
    canonicalName: string;
    status: KnowledgeEntityStatus;
  };
  aliases: {
    aliases: KnowledgeAliasEntry[];
    alternativeSpellings: NoteAlternativeSpelling[];
    languageVariants: NoteLanguageVariant[];
  };
  classification: {
    ingredientType: NoteIngredientType;
    olfactoryFamily: string;
    olfactorySubfamily?: string;
    typicalPosition: NoteTypicalPosition;
    semanticTags: NoteTag[];
  };
  relationships: {
    relatedNotes: NoteRelationshipRef[];
    oppositeNotes: NoteRelationshipRef[];
    parentFamily?: NoteRelationshipRef;
    childNotes: NoteRelationshipRef[];
  };
  translationMetadata: NoteTranslationMetadata;
  knowledgeMetadata: NoteKnowledgeMetadata;
  builderMetadata: NoteBuilderMetadata;
  governanceMetadata: NoteGovernanceMetadata;
  extensions?: Record<string, unknown>;
}
