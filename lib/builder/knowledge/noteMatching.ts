import type { KnowledgeProvenance, KnowledgeValidationResult } from "@/lib/builder/knowledge/types";

export const NOTE_MATCHING_FRAMEWORK_VERSION = "1.0.0";
export const NOTE_MATCHING_SCHEMA_VERSION = 1;

export interface RawNoteInput {
  rawValue: string;
  sourceRowKey?: string;
  sourceField?: string;
  sourcePosition?: number;
  metadata?: Record<string, unknown>;
}

export interface CanonicalNoteReference {
  canonicalEntityId: string;
  canonicalName?: string;
  metadata?: Record<string, unknown>;
}

export type NoteMatchMethod =
  | "exact"
  | "alias"
  | "case-insensitive"
  | "future-rule-based"
  | "future-semantic"
  | "unknown";

export type NoteMatchStatus =
  | "matched"
  | "unknown"
  | "multiple-candidates"
  | "unresolved";

export type NoteMatchValidationState =
  | "not-required"
  | "required"
  | "approved"
  | "rejected"
  | "pending";

export interface NoteMatchProvenance {
  source: string;
  generator: string;
  method: string;
  confidence: number | null;
  timestamp: string;
  frameworkVersion: string;
}

export interface NoteMatchResult {
  rawValue: string;
  canonicalEntityId?: string;
  matchStatus: NoteMatchStatus;
  matchMethod: NoteMatchMethod;
  confidence: number | null;
  provenance: NoteMatchProvenance;
  validationState: NoteMatchValidationState;
  notes: string[];
  candidateMatches?: CanonicalNoteReference[];
  metadata?: Record<string, unknown>;
}

export interface NoteMatchingContractEnvelope {
  frameworkVersion: string;
  schemaVersion: number;
  rawNote: RawNoteInput;
  result: NoteMatchResult;
  metadata?: Record<string, unknown>;
}

const emptyValidation = (): KnowledgeValidationResult => ({
  valid: true,
  errors: [],
  warnings: [],
});

export const validateNoteMatchResult = (
  result: NoteMatchResult,
): KnowledgeValidationResult => {
  const validation = emptyValidation();

  if (!result.rawValue.trim()) {
    validation.valid = false;
    validation.errors.push("rawValue is required");
  }

  if (result.confidence !== null && (result.confidence < 0 || result.confidence > 1)) {
    validation.valid = false;
    validation.errors.push("confidence must be null or between 0 and 1");
  }

  if (!result.provenance.source.trim()) {
    validation.valid = false;
    validation.errors.push("provenance.source is required");
  }

  if (!result.provenance.generator.trim()) {
    validation.valid = false;
    validation.errors.push("provenance.generator is required");
  }

  if (!result.provenance.method.trim()) {
    validation.valid = false;
    validation.errors.push("provenance.method is required");
  }

  if (!result.provenance.timestamp.trim()) {
    validation.valid = false;
    validation.errors.push("provenance.timestamp is required");
  }

  if (!result.provenance.frameworkVersion.trim()) {
    validation.valid = false;
    validation.errors.push("provenance.frameworkVersion is required");
  }

  if (result.matchStatus === "matched" && !result.canonicalEntityId?.trim()) {
    validation.valid = false;
    validation.errors.push("canonicalEntityId is required when matchStatus is matched");
  }

  if (result.matchStatus === "multiple-candidates") {
    const count = result.candidateMatches?.length ?? 0;
    if (count < 2) {
      validation.valid = false;
      validation.errors.push("candidateMatches must contain at least 2 entries for multiple-candidates status");
    }
  }

  if (result.matchStatus === "unknown" && result.matchMethod !== "unknown") {
    validation.warnings.push("unknown status is usually paired with unknown method");
  }

  validation.warnings.push(
    "Note matching framework validates contracts only; matching algorithms, normalization, and semantic resolution are intentionally out of scope.",
  );

  return validation;
};

export const validateNoteMatchingEnvelope = (
  envelope: NoteMatchingContractEnvelope,
): KnowledgeValidationResult => {
  const validation = validateNoteMatchResult(envelope.result);

  if (!envelope.frameworkVersion.trim()) {
    validation.valid = false;
    validation.errors.push("frameworkVersion is required");
  }

  if (envelope.schemaVersion < 1) {
    validation.valid = false;
    validation.errors.push("schemaVersion must be >= 1");
  }

  if (!envelope.rawNote.rawValue.trim()) {
    validation.valid = false;
    validation.errors.push("rawNote.rawValue is required");
  }

  if (envelope.result.rawValue !== envelope.rawNote.rawValue) {
    validation.valid = false;
    validation.errors.push("result.rawValue must equal rawNote.rawValue");
  }

  return validation;
};

export const createUnknownNoteMatch = (
  rawValue: string,
  provenance: KnowledgeProvenance,
): NoteMatchingContractEnvelope => ({
  frameworkVersion: NOTE_MATCHING_FRAMEWORK_VERSION,
  schemaVersion: NOTE_MATCHING_SCHEMA_VERSION,
  rawNote: {
    rawValue,
  },
  result: {
    rawValue,
    matchStatus: "unknown",
    matchMethod: "unknown",
    confidence: null,
    provenance: {
      ...provenance,
      frameworkVersion: NOTE_MATCHING_FRAMEWORK_VERSION,
    },
    validationState: "required",
    notes: ["No match candidate selected."],
  },
});
