import type {
  KnowledgeCategoryDefinition,
  KnowledgeEntityModel,
} from "@/lib/builder/knowledge/types";

export interface KnowledgeSerializer {
  serializeEntity(entity: KnowledgeEntityModel): string;
  serializeEntities(entities: KnowledgeEntityModel[]): string;
  serializeCategories(categories: KnowledgeCategoryDefinition[]): string;
  deserializeEntity(serialized: string): KnowledgeEntityModel;
  deserializeEntities(serialized: string): KnowledgeEntityModel[];
  deserializeCategories(serialized: string): KnowledgeCategoryDefinition[];
}

export class PlaceholderKnowledgeSerializer implements KnowledgeSerializer {
  serializeEntity(entity: KnowledgeEntityModel): string {
    return JSON.stringify(entity);
  }

  serializeEntities(entities: KnowledgeEntityModel[]): string {
    return JSON.stringify(entities);
  }

  serializeCategories(categories: KnowledgeCategoryDefinition[]): string {
    return JSON.stringify(categories);
  }

  deserializeEntity(serialized: string): KnowledgeEntityModel {
    return JSON.parse(serialized) as KnowledgeEntityModel;
  }

  deserializeEntities(serialized: string): KnowledgeEntityModel[] {
    const parsed = JSON.parse(serialized) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as KnowledgeEntityModel[];
  }

  deserializeCategories(serialized: string): KnowledgeCategoryDefinition[] {
    const parsed = JSON.parse(serialized) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as KnowledgeCategoryDefinition[];
  }
}
