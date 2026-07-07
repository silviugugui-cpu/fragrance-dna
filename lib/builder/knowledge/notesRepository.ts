import {
  createCanonicalNotesKnowledgeEntities,
} from "@/lib/builder/knowledge/canonicalNotes";
import {
  createInMemoryKnowledgeRepository,
  type InMemoryKnowledgeRepository,
} from "@/lib/builder/knowledge/repository";
import type { KnowledgeEntityModel } from "@/lib/builder/knowledge/types";

export interface NotesRepository {
  registerNote(note: KnowledgeEntityModel): KnowledgeEntityModel;
  updateNote(
    entityId: string,
    updates: Partial<KnowledgeEntityModel>,
  ): KnowledgeEntityModel | null;
  removeNote(entityId: string): boolean;
  getNote(entityId: string): KnowledgeEntityModel | null;
  getAllNotes(): KnowledgeEntityModel[];
  findByAlias(alias: string): KnowledgeEntityModel[];
  findByCanonicalName(canonicalName: string): KnowledgeEntityModel | null;
}

export class InMemoryNotesRepository implements NotesRepository {
  private readonly repository: InMemoryKnowledgeRepository;

  constructor(
    repository: InMemoryKnowledgeRepository = createInMemoryKnowledgeRepository(),
  ) {
    this.repository = repository;
  }

  registerNote(note: KnowledgeEntityModel): KnowledgeEntityModel {
    this.ensureNotesEntity(note);
    return this.repository.registerEntity(note);
  }

  updateNote(
    entityId: string,
    updates: Partial<KnowledgeEntityModel>,
  ): KnowledgeEntityModel | null {
    const existing = this.repository.getEntity(entityId);
    if (!existing) {
      return null;
    }

    this.ensureNotesEntity(existing);
    if (updates.entityType && updates.entityType !== "notes") {
      throw new Error("Notes repository only supports notes entityType");
    }

    return this.repository.updateEntity(entityId, updates);
  }

  removeNote(entityId: string): boolean {
    const existing = this.repository.getEntity(entityId);
    if (!existing || existing.entityType !== "notes") {
      return false;
    }

    return this.repository.removeEntity(entityId);
  }

  getNote(entityId: string): KnowledgeEntityModel | null {
    const entity = this.repository.getEntity(entityId);
    if (!entity || entity.entityType !== "notes") {
      return null;
    }

    return entity;
  }

  getAllNotes(): KnowledgeEntityModel[] {
    return this.repository.findByCategory("notes");
  }

  findByAlias(alias: string): KnowledgeEntityModel[] {
    return this.repository
      .findByAlias(alias)
      .filter((entity) => entity.entityType === "notes");
  }

  findByCanonicalName(canonicalName: string): KnowledgeEntityModel | null {
    const normalizedCanonicalName = normalizeName(canonicalName);
    return (
      this.getAllNotes().find(
        (entity) => normalizeName(entity.canonicalName) === normalizedCanonicalName,
      ) ?? null
    );
  }

  seedCanonicalNotes(
    generatedBy: string,
    now: string = new Date().toISOString(),
  ): KnowledgeEntityModel[] {
    const entities = createCanonicalNotesKnowledgeEntities(generatedBy, now);
    this.repository.registerEntities(entities);

    return this.getAllNotes();
  }

  getKnowledgeRepository(): InMemoryKnowledgeRepository {
    return this.repository;
  }

  private ensureNotesEntity(entity: KnowledgeEntityModel): void {
    if (entity.entityType !== "notes") {
      throw new Error("Notes repository only accepts entityType=notes");
    }
  }
}

export const createInMemoryNotesRepository = (): InMemoryNotesRepository =>
  new InMemoryNotesRepository();

const normalizeName = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");
