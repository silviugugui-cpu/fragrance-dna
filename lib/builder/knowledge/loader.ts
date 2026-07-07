import type {
  KnowledgeCategoryDefinition,
  KnowledgeEntityModel,
} from "@/lib/builder/knowledge/types";
import {
  validateCategory,
  validateEntity,
} from "@/lib/builder/knowledge/validator";

export interface KnowledgeLoadResult {
  entities: KnowledgeEntityModel[];
  categories: KnowledgeCategoryDefinition[];
  errors: string[];
  warnings: string[];
}

export interface KnowledgeLoader {
  loadKnowledge(input: unknown): KnowledgeLoadResult;
}

export class PlaceholderKnowledgeLoader implements KnowledgeLoader {
  loadKnowledge(input: unknown): KnowledgeLoadResult {
    const errors: string[] = [];
    const warnings: string[] = [
      "Placeholder loader: no IO or source ingestion is executed in this milestone.",
    ];

    if (!input || typeof input !== "object") {
      return {
        entities: [],
        categories: [],
        errors: ["Expected object input for placeholder knowledge loading"],
        warnings,
      };
    }

    const payload = input as {
      entities?: unknown;
      categories?: unknown;
    };

    const entities = Array.isArray(payload.entities)
      ? (payload.entities as KnowledgeEntityModel[])
      : [];
    const categories = Array.isArray(payload.categories)
      ? (payload.categories as KnowledgeCategoryDefinition[])
      : [];

    for (const entity of entities) {
      const validation = validateEntity(entity);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    for (const category of categories) {
      const validation = validateCategory(category);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    return {
      entities,
      categories,
      errors,
      warnings,
    };
  }
}
