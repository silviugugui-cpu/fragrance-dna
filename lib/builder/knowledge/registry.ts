import type {
  KnowledgeCompatibilityResult,
  KnowledgeDuplicateIssue,
  KnowledgeEntityModel,
  KnowledgeIdentifierValidation,
} from "@/lib/builder/knowledge/types";

const ENTITY_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export class KnowledgeRegistry {
  private readonly byId = new Map<string, KnowledgeEntityModel>();
  private readonly entityIdsByAlias = new Map<string, Set<string>>();
  private readonly entityIdsByCategory = new Map<string, Set<string>>();
  private readonly entityIdByCanonicalName = new Map<string, string>();

  validateIdentifier(entityId: string): KnowledgeIdentifierValidation {
    const normalizedId = this.normalizeEntityId(entityId);
    const errors: string[] = [];

    if (!normalizedId) {
      errors.push("entityId cannot be empty");
    }

    if (normalizedId && !ENTITY_ID_PATTERN.test(normalizedId)) {
      errors.push(
        "entityId must match pattern: lowercase alphanumeric and hyphen",
      );
    }

    return {
      valid: errors.length === 0,
      normalizedId,
      errors,
    };
  }

  register(entity: KnowledgeEntityModel): void {
    const normalizedId = this.normalizeEntityId(entity.entityId);
    this.byId.set(normalizedId, entity);
    this.reindexEntity(entity);
  }

  update(entity: KnowledgeEntityModel): void {
    const existing = this.lookup(entity.entityId);
    if (existing) {
      this.unindexEntity(existing);
    }
    this.register(entity);
  }

  remove(entityId: string): boolean {
    const existing = this.lookup(entityId);
    if (!existing) {
      return false;
    }

    this.unindexEntity(existing);
    return this.byId.delete(this.normalizeEntityId(entityId));
  }

  lookup(entityId: string): KnowledgeEntityModel | null {
    return this.byId.get(this.normalizeEntityId(entityId)) ?? null;
  }

  listEntities(): KnowledgeEntityModel[] {
    return [...this.byId.values()];
  }

  findByAlias(alias: string): KnowledgeEntityModel[] {
    const entityIds = this.entityIdsByAlias.get(this.normalizeAlias(alias));
    if (!entityIds || entityIds.size === 0) {
      return [];
    }

    return [...entityIds]
      .map((entityId) => this.byId.get(entityId))
      .filter((entity): entity is KnowledgeEntityModel => Boolean(entity));
  }

  findByCategory(categoryId: KnowledgeEntityModel["entityType"]): KnowledgeEntityModel[] {
    const entityIds = this.entityIdsByCategory.get(categoryId);
    if (!entityIds || entityIds.size === 0) {
      return [];
    }

    return [...entityIds]
      .map((entityId) => this.byId.get(entityId))
      .filter((entity): entity is KnowledgeEntityModel => Boolean(entity));
  }

  detectDuplicates(entities: KnowledgeEntityModel[]): KnowledgeDuplicateIssue[] {
    const issues: KnowledgeDuplicateIssue[] = [];
    const idSeen = new Set<string>();
    const nameSeen = new Set<string>();
    const aliasSeen = new Set<string>();

    for (const entity of entities) {
      const normalizedId = this.normalizeEntityId(entity.entityId);
      const normalizedCanonicalName = this.normalizeCanonicalName(entity.canonicalName);

      if (idSeen.has(normalizedId)) {
        issues.push({
          type: "duplicate-entity-id",
          entityId: entity.entityId,
          canonicalName: entity.canonicalName,
        });
      }

      if (nameSeen.has(normalizedCanonicalName)) {
        issues.push({
          type: "duplicate-canonical-name",
          entityId: entity.entityId,
          canonicalName: entity.canonicalName,
        });
      }

      idSeen.add(normalizedId);
      nameSeen.add(normalizedCanonicalName);

      for (const aliasEntry of entity.aliases) {
        const normalizedAlias = this.normalizeAlias(aliasEntry.alias);
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
  }

  isVersionCompatible(
    entityId: string,
    supportedSchemaVersions: number[],
  ): KnowledgeCompatibilityResult {
    const entity = this.lookup(entityId);
    if (!entity) {
      return {
        compatible: false,
        errors: ["Entity not found for compatibility check"],
        warnings: [],
      };
    }

    const compatible = supportedSchemaVersions.includes(entity.schemaVersion);
    return {
      compatible,
      errors: compatible ? [] : ["Knowledge entity schema version is not compatible"],
      warnings: compatible
        ? []
        : ["Compatibility policy remains placeholder-level in this milestone"],
    };
  }

  count(): number {
    return this.byId.size;
  }

  private reindexEntity(entity: KnowledgeEntityModel): void {
    const normalizedId = this.normalizeEntityId(entity.entityId);
    this.entityIdByCanonicalName.set(
      this.normalizeCanonicalName(entity.canonicalName),
      normalizedId,
    );

    this.addCategoryIndex(entity.entityType, normalizedId);

    for (const aliasEntry of entity.aliases) {
      this.addAliasIndex(this.normalizeAlias(aliasEntry.alias), normalizedId);
    }
  }

  private unindexEntity(entity: KnowledgeEntityModel): void {
    const normalizedId = this.normalizeEntityId(entity.entityId);

    this.entityIdByCanonicalName.delete(
      this.normalizeCanonicalName(entity.canonicalName),
    );

    const categorySet = this.entityIdsByCategory.get(entity.entityType);
    if (categorySet) {
      categorySet.delete(normalizedId);
      if (categorySet.size === 0) {
        this.entityIdsByCategory.delete(entity.entityType);
      }
    }

    for (const aliasEntry of entity.aliases) {
      const normalizedAlias = this.normalizeAlias(aliasEntry.alias);
      const aliasSet = this.entityIdsByAlias.get(normalizedAlias);
      if (!aliasSet) {
        continue;
      }

      aliasSet.delete(normalizedId);
      if (aliasSet.size === 0) {
        this.entityIdsByAlias.delete(normalizedAlias);
      }
    }
  }

  private addAliasIndex(alias: string, entityId: string): void {
    const existing = this.entityIdsByAlias.get(alias) ?? new Set<string>();
    existing.add(entityId);
    this.entityIdsByAlias.set(alias, existing);
  }

  private addCategoryIndex(categoryId: string, entityId: string): void {
    const existing = this.entityIdsByCategory.get(categoryId) ?? new Set<string>();
    existing.add(entityId);
    this.entityIdsByCategory.set(categoryId, existing);
  }

  private normalizeEntityId(entityId: string): string {
    return entityId.trim().toLowerCase();
  }

  private normalizeAlias(alias: string): string {
    return alias.trim().toLowerCase().replace(/\s+/g, " ");
  }

  private normalizeCanonicalName(canonicalName: string): string {
    return canonicalName.trim().toLowerCase().replace(/\s+/g, " ");
  }
}
