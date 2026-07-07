import type {
  KnowledgeAliasEntry,
  KnowledgeCategoryDefinition,
  KnowledgeDuplicateIssue,
  KnowledgeEntityModel,
  KnowledgeRelationship,
  KnowledgeValidationResult,
} from "@/lib/builder/knowledge/types";

const emptyResult = (): KnowledgeValidationResult => ({
  valid: true,
  errors: [],
  warnings: [],
});

export const validateEntity = (
  entity: KnowledgeEntityModel,
): KnowledgeValidationResult => {
  const result = emptyResult();

  if (!entity.entityId.trim()) {
    result.valid = false;
    result.errors.push("entityId is required");
  }

  if (!entity.canonicalName.trim()) {
    result.valid = false;
    result.errors.push("canonicalName is required");
  }

  if (!entity.description.trim()) {
    result.valid = false;
    result.errors.push("description is required");
  }

  if (!entity.version.trim()) {
    result.valid = false;
    result.errors.push("version is required");
  }

  if (!entity.generatedBy.trim()) {
    result.valid = false;
    result.errors.push("generatedBy is required");
  }

  result.warnings.push(
    "Placeholder validation: vocabulary semantics and governance constraints are deferred.",
  );
  return result;
};

export const validateAlias = (
  aliasEntry: KnowledgeAliasEntry,
): KnowledgeValidationResult => {
  const result = emptyResult();

  if (!aliasEntry.alias.trim()) {
    result.valid = false;
    result.errors.push("alias is required");
  }

  if (aliasEntry.locale && !aliasEntry.locale.trim()) {
    result.valid = false;
    result.errors.push("alias locale must be non-empty when provided");
  }

  result.warnings.push(
    "Placeholder validation: alias normalization and locale policy are deferred.",
  );
  return result;
};

export const validateRelationship = (
  relationship: KnowledgeRelationship,
): KnowledgeValidationResult => {
  const result = emptyResult();

  if (!relationship.targetEntityId.trim()) {
    result.valid = false;
    result.errors.push("targetEntityId is required");
  }

  result.warnings.push(
    "Placeholder validation: relationship integrity and inference policies are deferred.",
  );
  return result;
};

export const validateCategory = (
  category: KnowledgeCategoryDefinition,
): KnowledgeValidationResult => {
  const result = emptyResult();

  if (!category.displayName.trim()) {
    result.valid = false;
    result.errors.push("displayName is required");
  }

  if (!category.description.trim()) {
    result.valid = false;
    result.errors.push("description is required");
  }

  if (!category.version.trim()) {
    result.valid = false;
    result.errors.push("category version is required");
  }

  result.warnings.push(
    "Placeholder validation: category taxonomy and lifecycle policies are deferred.",
  );
  return result;
};

export const validateKnowledgeDataset = (
  entities: KnowledgeEntityModel[],
): KnowledgeValidationResult => {
  const result = emptyResult();

  const duplicateIssues = detectDatasetDuplicates(entities);
  for (const issue of duplicateIssues) {
    result.valid = false;
    if (issue.type === "duplicate-entity-id") {
      result.errors.push(`Duplicate entityId detected: ${issue.entityId}`);
      continue;
    }

    if (issue.type === "duplicate-canonical-name") {
      result.errors.push(
        `Duplicate canonicalName detected: ${issue.canonicalName}`,
      );
      continue;
    }

    result.errors.push(
      `Duplicate alias detected: ${issue.alias ?? "unknown alias"}`,
    );
  }

  const availableEntityIds = new Set(
    entities.map((entity) => entity.entityId.trim().toLowerCase()),
  );

  for (const entity of entities) {
    for (const relationship of entity.relationships) {
      const targetId = relationship.targetEntityId.trim().toLowerCase();
      if (!availableEntityIds.has(targetId)) {
        result.valid = false;
        result.errors.push(
          `Relationship integrity failed: ${entity.entityId} references missing target ${relationship.targetEntityId}`,
        );
      }
    }
  }

  result.warnings.push(
    "Dataset validation is strict for uniqueness and relationship integrity; semantic quality constraints remain extensible.",
  );

  return result;
};

const detectDatasetDuplicates = (
  entities: KnowledgeEntityModel[],
): KnowledgeDuplicateIssue[] => {
  const issues: KnowledgeDuplicateIssue[] = [];
  const idSeen = new Set<string>();
  const canonicalSeen = new Set<string>();
  const aliasSeen = new Set<string>();

  for (const entity of entities) {
    const normalizedId = entity.entityId.trim().toLowerCase();
    const normalizedCanonical = normalizeText(entity.canonicalName);

    if (idSeen.has(normalizedId)) {
      issues.push({
        type: "duplicate-entity-id",
        entityId: entity.entityId,
        canonicalName: entity.canonicalName,
      });
    }

    if (canonicalSeen.has(normalizedCanonical)) {
      issues.push({
        type: "duplicate-canonical-name",
        entityId: entity.entityId,
        canonicalName: entity.canonicalName,
      });
    }

    idSeen.add(normalizedId);
    canonicalSeen.add(normalizedCanonical);

    for (const aliasEntry of entity.aliases) {
      const normalizedAlias = normalizeText(aliasEntry.alias);
      if (aliasSeen.has(normalizedAlias)) {
        issues.push({
          type: "duplicate-alias",
          entityId: entity.entityId,
          canonicalName: entity.canonicalName,
          alias: aliasEntry.alias,
        });
      }
      aliasSeen.add(normalizedAlias);
    }
  }

  return issues;
};

const normalizeText = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");
