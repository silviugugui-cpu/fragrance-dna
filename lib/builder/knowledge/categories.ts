import type {
  KnowledgeCategoryDefinition,
  KnowledgeCategoryId,
  KnowledgeProvenance,
} from "@/lib/builder/knowledge/types";

const KNOWLEDGE_CATEGORY_VERSION = "0.1.0-foundation";
const KNOWLEDGE_CATEGORY_SCHEMA_VERSION = 1;

type KnowledgeCategorySeed = {
  categoryId: KnowledgeCategoryId;
  displayName: string;
  description: string;
};

const KNOWLEDGE_CATEGORY_SEEDS: KnowledgeCategorySeed[] = [
  {
    categoryId: "notes",
    displayName: "Notes",
    description: "Canonical note vocabulary contracts.",
  },
  {
    categoryId: "accords",
    displayName: "Accords",
    description: "Canonical accord vocabulary contracts.",
  },
  {
    categoryId: "olfactory-families",
    displayName: "Olfactory Families",
    description: "Canonical olfactive family vocabulary contracts.",
  },
  {
    categoryId: "facets",
    displayName: "Facets",
    description: "Canonical descriptive facets vocabulary contracts.",
  },
  {
    categoryId: "materials",
    displayName: "Materials",
    description: "Canonical material vocabulary contracts.",
  },
  {
    categoryId: "ingredients",
    displayName: "Ingredients",
    description: "Canonical ingredient vocabulary contracts.",
  },
  {
    categoryId: "brands",
    displayName: "Brands",
    description: "Canonical brand vocabulary contracts.",
  },
  {
    categoryId: "concentrations",
    displayName: "Concentrations",
    description: "Canonical concentration vocabulary contracts.",
  },
  {
    categoryId: "gender-directions",
    displayName: "Gender Directions",
    description: "Canonical gender direction vocabulary contracts.",
  },
  {
    categoryId: "seasonality",
    displayName: "Seasonality",
    description: "Canonical seasonality vocabulary contracts.",
  },
  {
    categoryId: "occasions",
    displayName: "Occasions",
    description: "Canonical occasion vocabulary contracts.",
  },
  {
    categoryId: "performance-terms",
    displayName: "Performance Terms",
    description: "Canonical performance terminology contracts.",
  },
  {
    categoryId: "relationship-types",
    displayName: "Relationship Types",
    description: "Canonical relationship type vocabulary contracts.",
  },
  {
    categoryId: "translation-vocabulary",
    displayName: "Translation Vocabulary",
    description: "Canonical translation-support vocabulary contracts.",
  },
  {
    categoryId: "metadata-terms",
    displayName: "Metadata Terms",
    description: "Canonical metadata vocabulary contracts.",
  },
  {
    categoryId: "builder-concepts",
    displayName: "Builder Concepts",
    description: "Canonical Builder concept vocabulary contracts.",
  },
];

const createCategoryProvenance = (
  generatedBy: string,
  now: string,
): KnowledgeProvenance => ({
  source: "knowledge-foundation",
  generator: generatedBy,
  method: "placeholder",
  confidence: null,
  timestamp: now,
});

export const createKnowledgeCategoriesFoundation = (
  generatedBy: string,
  now: string = new Date().toISOString(),
): KnowledgeCategoryDefinition[] =>
  KNOWLEDGE_CATEGORY_SEEDS.map((seed) => ({
    categoryId: seed.categoryId,
    displayName: seed.displayName,
    description: seed.description,
    version: KNOWLEDGE_CATEGORY_VERSION,
    schemaVersion: KNOWLEDGE_CATEGORY_SCHEMA_VERSION,
    generatedBy,
    createdAt: now,
    updatedAt: now,
    provenance: createCategoryProvenance(generatedBy, now),
    metadata: {
      status: "placeholder",
      independentlyVersionable: true,
      notes: [
        "Category contract only. No entity population is performed in this milestone.",
      ],
    },
  }));
