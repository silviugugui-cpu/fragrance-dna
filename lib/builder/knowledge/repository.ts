import { KnowledgeRegistry } from "@/lib/builder/knowledge/registry";
import type { KnowledgeEntityModel } from "@/lib/builder/knowledge/types";
import {
  validateAlias,
  validateEntity,
  validateKnowledgeDataset,
  validateRelationship,
} from "@/lib/builder/knowledge/validator";

export interface KnowledgeRepository {
  registerEntities(entities: KnowledgeEntityModel[]): KnowledgeEntityModel[];
  registerEntity(entity: KnowledgeEntityModel): KnowledgeEntityModel;
  updateEntity(
    entityId: string,
    updates: Partial<KnowledgeEntityModel>,
  ): KnowledgeEntityModel | null;
  removeEntity(entityId: string): boolean;
  getEntity(entityId: string): KnowledgeEntityModel | null;
  findByAlias(alias: string): KnowledgeEntityModel[];
  findByCategory(
    categoryId: KnowledgeEntityModel["entityType"],
  ): KnowledgeEntityModel[];
}

export class InMemoryKnowledgeRepository implements KnowledgeRepository {
  private readonly registry: KnowledgeRegistry;

  constructor(registry: KnowledgeRegistry = new KnowledgeRegistry()) {
    this.registry = registry;
  }

  registerEntities(entities: KnowledgeEntityModel[]): KnowledgeEntityModel[] {
    const datasetValidation = validateKnowledgeDataset(entities);
    if (!datasetValidation.valid) {
      throw new Error(datasetValidation.errors.join("; "));
    }

    for (const entity of entities) {
      if (this.registry.lookup(entity.entityId)) {
        throw new Error(`Duplicate entityId: ${entity.entityId}`);
      }
    }

    for (const entity of entities) {
      this.registry.register(deepClone(entity));
    }

    return entities.map((entity) => deepClone(entity));
  }

  registerEntity(entity: KnowledgeEntityModel): KnowledgeEntityModel {
    const identifierValidation = this.registry.validateIdentifier(entity.entityId);
    if (!identifierValidation.valid) {
      throw new Error(identifierValidation.errors.join("; "));
    }

    if (this.registry.lookup(entity.entityId)) {
      throw new Error(`Duplicate entityId: ${entity.entityId}`);
    }

    const entityValidation = validateEntity(entity);
    if (!entityValidation.valid) {
      throw new Error(entityValidation.errors.join("; "));
    }

    for (const aliasEntry of entity.aliases) {
      const aliasValidation = validateAlias(aliasEntry);
      if (!aliasValidation.valid) {
        throw new Error(aliasValidation.errors.join("; "));
      }
    }

    for (const relationship of entity.relationships) {
      const relationshipValidation = validateRelationship(relationship);
      if (!relationshipValidation.valid) {
        throw new Error(relationshipValidation.errors.join("; "));
      }
    }

    const duplicateIssues = this.registry.detectDuplicates([
      ...this.registry.listEntities(),
      entity,
    ]);
    if (duplicateIssues.length > 0) {
      throw new Error(
        duplicateIssues
          .map((issue) =>
            issue.type === "duplicate-alias"
              ? `Duplicate alias: ${issue.alias}`
              : `Duplicate ${issue.type}: ${issue.entityId}`,
          )
          .join("; "),
      );
    }

    this.registry.register(deepClone(entity));
    return deepClone(entity);
  }

  updateEntity(
    entityId: string,
    updates: Partial<KnowledgeEntityModel>,
  ): KnowledgeEntityModel | null {
    const existing = this.registry.lookup(entityId);
    if (!existing) {
      return null;
    }

    const next: KnowledgeEntityModel = {
      ...existing,
      ...updates,
      entityId: existing.entityId,
      updatedAt: updates.updatedAt ?? new Date().toISOString(),
    };

    const validation = validateEntity(next);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    for (const aliasEntry of next.aliases) {
      const aliasValidation = validateAlias(aliasEntry);
      if (!aliasValidation.valid) {
        throw new Error(aliasValidation.errors.join("; "));
      }
    }

    for (const relationship of next.relationships) {
      const relationshipValidation = validateRelationship(relationship);
      if (!relationshipValidation.valid) {
        throw new Error(relationshipValidation.errors.join("; "));
      }
    }

    const withoutCurrent = this.registry
      .listEntities()
      .filter((entity) => entity.entityId !== existing.entityId);
    const duplicateIssues = this.registry.detectDuplicates([
      ...withoutCurrent,
      next,
    ]);
    if (duplicateIssues.length > 0) {
      throw new Error(
        duplicateIssues
          .map((issue) =>
            issue.type === "duplicate-alias"
              ? `Duplicate alias: ${issue.alias}`
              : `Duplicate ${issue.type}: ${issue.entityId}`,
          )
          .join("; "),
      );
    }

    this.registry.update(deepClone(next));
    return deepClone(next);
  }

  removeEntity(entityId: string): boolean {
    return this.registry.remove(entityId);
  }

  getEntity(entityId: string): KnowledgeEntityModel | null {
    const item = this.registry.lookup(entityId);
    return item ? deepClone(item) : null;
  }

  findByAlias(alias: string): KnowledgeEntityModel[] {
    return this.registry.findByAlias(alias).map((entity) => deepClone(entity));
  }

  findByCategory(
    categoryId: KnowledgeEntityModel["entityType"],
  ): KnowledgeEntityModel[] {
    return this.registry
      .findByCategory(categoryId)
      .map((entity) => deepClone(entity));
  }

  getAllEntities(): KnowledgeEntityModel[] {
    return this.registry.listEntities().map((entity) => deepClone(entity));
  }

  getRegistry(): KnowledgeRegistry {
    return this.registry;
  }
}

export const createInMemoryKnowledgeRepository = (): InMemoryKnowledgeRepository =>
  new InMemoryKnowledgeRepository();

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
