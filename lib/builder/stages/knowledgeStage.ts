import { createArtifact } from "@/lib/builder/artifacts";
import {
  createInMemoryNotesRepository,
  createKnowledgeCategoriesFoundation,
  getCanonicalNotesCount,
  PlaceholderKnowledgeLoader,
  PlaceholderKnowledgeSerializer,
  validateCategory,
  validateKnowledgeDataset,
} from "@/lib/builder/knowledge";
import type {
  PipelineStageModule,
  StageValidationResult,
} from "@/lib/builder/contracts";

const valid = (warnings: string[] = []): StageValidationResult => ({
  valid: true,
  errors: [],
  warnings,
});

const invalid = (errors: string[]): StageValidationResult => ({
  valid: false,
  errors,
  warnings: [],
});

export const knowledgeStage: PipelineStageModule<
  "BrandArtifact",
  "KnowledgeArtifact"
> = {
  name: "knowledge",
  inputContract: {
    artifactType: "BrandArtifact",
    description: "Consumes brand artifact and prepares Knowledge Base contracts.",
  },
  outputContract: {
    artifactType: "KnowledgeArtifact",
    description: "Emits Knowledge Base contract artifact without enrichment logic.",
  },
  async execute(input, context) {
    const notesRepository = createInMemoryNotesRepository();
    const loader = new PlaceholderKnowledgeLoader();
    const serializer = new PlaceholderKnowledgeSerializer();
    const categories = createKnowledgeCategoriesFoundation(context.generatedBy);
    const notesCategory = categories.find((category) => category.categoryId === "notes");
    const seededNotes = notesRepository.seedCanonicalNotes(context.generatedBy);
    const entities = notesRepository.getAllNotes();
    const datasetValidation = validateKnowledgeDataset(entities);
    const duplicateDetectionIssues = notesRepository
      .getKnowledgeRepository()
      .getRegistry()
      .detectDuplicates(entities);
    const loaded = loader.loadKnowledge({
      entities,
      categories: notesCategory ? [notesCategory] : [],
    });

    return createArtifact({
      artifactType: "KnowledgeArtifact",
      stageName: "knowledge",
      runId: context.runId,
      stageRunIndex: context.stageRunIndex,
      artifactVersion: "1.0.0",
      pipelineVersion: context.pipelineVersion,
      generatedBy: context.generatedBy,
      source: context.source,
      parentArtifactId: input.artifactId,
      payload: {
        knowledgeBaseNotesV1: {
          datasetId: "canonical-notes-v1",
          domain: "notes",
          entities,
          totalEntities: entities.length,
          expectedCanonicalNotes: getCanonicalNotesCount(),
          seededCount: seededNotes.length,
          category: notesCategory ?? null,
          categoryValidation: notesCategory
            ? validateCategory(notesCategory)
            : {
                valid: false,
                errors: ["Notes category missing from category foundation"],
                warnings: [],
              },
          relationships: {
            supportedTypes: [
              "parent",
              "child",
              "synonym",
              "related",
              "derived_from",
            ],
            inference: "not-implemented",
          },
          aliases: {
            policy: "unlimited",
            supportedTypes: [
              "language",
              "spelling",
              "commercial",
              "historical",
              "builder",
            ],
          },
          validation: {
            dataset: datasetValidation,
            duplicates: duplicateDetectionIssues,
          },
          registry: {
            totalRegisteredEntities: notesRepository
              .getKnowledgeRepository()
              .getRegistry()
              .count(),
            duplicateDetectionIssues,
            compatibilitySample: notesRepository
              .getKnowledgeRepository()
              .getRegistry()
              .isVersionCompatible("note-citrus", [1]),
          },
          loader: {
            errors: loaded.errors,
            warnings: loaded.warnings,
          },
          serializer: {
            entitiesSerializedPreview: serializer.serializeEntities(entities),
          },
          notes: [
            "Knowledge Base v1: canonical Notes dataset is populated.",
            "No accords, families, facets, translation rules, or enrichment logic are implemented in this milestone.",
          ],
        },
        knowledgeBaseFoundation: {
          entities,
          totalEntities: entities.length,
          categories,
          totalCategories: categories.length,
          aliases: {
            policy: "unlimited",
            notes: [
              "Aliases are vocabulary only and are not translation rules.",
            ],
          },
          relationships: {
            supportedTypes: [
              "parent",
              "child",
              "synonym",
              "related",
              "opposite",
              "derived_from",
            ],
            inference: "not-implemented",
          },
          registry: {
            totalRegisteredEntities: notesRepository
              .getKnowledgeRepository()
              .getRegistry()
              .count(),
            duplicateDetectionIssues: notesRepository
              .getKnowledgeRepository()
              .getRegistry()
              .detectDuplicates(entities),
            compatibilitySample: notesRepository
              .getKnowledgeRepository()
              .getRegistry()
              .isVersionCompatible("placeholder-entity-id", [1]),
          },
          categoryValidation: categories.map((category) => ({
            categoryId: category.categoryId,
            result: validateCategory(category),
          })),
          loader: {
            errors: loaded.errors,
            warnings: loaded.warnings,
          },
          serializer: {
            entitiesSerializedPreview: serializer.serializeEntities(entities),
            categoriesSerializedPreview:
              serializer.serializeCategories(categories),
          },
          notes: [
            "Knowledge Base foundation only: no enrichment, no translation logic, no runtime redesign.",
            "Knowledge Base does not depend on Translation Engine.",
            "Knowledge Base v1 dataset is currently populated for Notes domain only.",
          ],
        },
      },
    });
  },
  validateInput(input) {
    if (input.artifactType !== "BrandArtifact") {
      return invalid([
        `Expected BrandArtifact input, received ${input.artifactType}`,
      ]);
    }

    return valid([
      "Placeholder validation: brand payload constraints are deferred.",
    ]);
  },
  validateOutput(output) {
    if (output.artifactType !== "KnowledgeArtifact") {
      return invalid([
        `Expected KnowledgeArtifact output, received ${output.artifactType}`,
      ]);
    }

    return valid([
      "Placeholder validation: Knowledge artifact schema checks will be expanded in future milestones.",
    ]);
  },
  validateArtifact(artifact) {
    const errors: string[] = [];
    if (!artifact.payload.knowledgeBaseFoundation) {
      errors.push("Missing knowledgeBaseFoundation payload");
    }

    if (!artifact.payload.knowledgeBaseNotesV1) {
      errors.push("Missing knowledgeBaseNotesV1 payload");
    }

    if (!artifact.provenance) {
      errors.push("Missing artifact provenance");
    }

    if (errors.length > 0) {
      return invalid(errors);
    }

    return valid([
      "Placeholder validation: vocabulary taxonomy and relationship integrity constraints are deferred.",
    ]);
  },
};
