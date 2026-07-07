import type {
  ArtifactType,
  StageName,
  StageRegistryEntry,
} from "@/lib/builder/contracts";

export const PIPELINE_VERSION = "0.1.0-foundation";

export const PIPELINE_STAGE_ORDER: StageName[] = [
  "import",
  "normalize",
  "brand-intelligence",
  "knowledge",
  "translation",
  "fragrance-intelligence",
  "metadata",
  "validation",
  "publish",
];

export const PIPELINE_REGISTRY: Record<StageName, StageRegistryEntry> = {
  import: {
    stage: "import",
    dependsOn: [],
    inputArtifactType: "PipelineSeedArtifact",
    outputArtifactType: "RawImportArtifact",
    producer: "ImportStageModule",
    consumers: ["normalize"],
  },
  normalize: {
    stage: "normalize",
    dependsOn: ["import"],
    inputArtifactType: "RawImportArtifact",
    outputArtifactType: "NormalizedArtifact",
    producer: "NormalizeStageModule",
    consumers: ["brand-intelligence"],
  },
  "brand-intelligence": {
    stage: "brand-intelligence",
    dependsOn: ["normalize"],
    inputArtifactType: "NormalizedArtifact",
    outputArtifactType: "BrandArtifact",
    producer: "BrandIntelligenceStageModule",
    consumers: ["knowledge"],
  },
  knowledge: {
    stage: "knowledge",
    dependsOn: ["brand-intelligence"],
    inputArtifactType: "BrandArtifact",
    outputArtifactType: "KnowledgeArtifact",
    producer: "KnowledgeStageModule",
    consumers: ["translation"],
  },
  translation: {
    stage: "translation",
    dependsOn: ["knowledge"],
    inputArtifactType: "KnowledgeArtifact",
    outputArtifactType: "TranslationArtifact",
    producer: "TranslationStageModule",
    consumers: ["fragrance-intelligence"],
  },
  "fragrance-intelligence": {
    stage: "fragrance-intelligence",
    dependsOn: ["translation"],
    inputArtifactType: "TranslationArtifact",
    outputArtifactType: "FragranceIntelligenceArtifact",
    producer: "FragranceIntelligenceStageModule",
    consumers: ["metadata"],
  },
  metadata: {
    stage: "metadata",
    dependsOn: ["fragrance-intelligence"],
    inputArtifactType: "FragranceIntelligenceArtifact",
    outputArtifactType: "MetadataArtifact",
    producer: "MetadataStageModule",
    consumers: ["validation"],
  },
  validation: {
    stage: "validation",
    dependsOn: ["metadata"],
    inputArtifactType: "MetadataArtifact",
    outputArtifactType: "ValidationArtifact",
    producer: "ValidationStageModule",
    consumers: ["publish"],
  },
  publish: {
    stage: "publish",
    dependsOn: ["validation"],
    inputArtifactType: "ValidationArtifact",
    outputArtifactType: "MasterPerfumeArtifact",
    producer: "PublishStageModule",
    consumers: [],
  },
};

export const artifactProducerStage = (
  artifactType: ArtifactType,
): StageName | null => {
  for (const stage of PIPELINE_STAGE_ORDER) {
    if (PIPELINE_REGISTRY[stage].outputArtifactType === artifactType) {
      return stage;
    }
  }

  return null;
};

export const validateNoCircularDependencies = (): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const visiting = new Set<StageName>();
  const visited = new Set<StageName>();

  const visit = (stage: StageName): void => {
    if (visited.has(stage)) {
      return;
    }

    if (visiting.has(stage)) {
      errors.push(`Circular dependency detected at stage ${stage}`);
      return;
    }

    visiting.add(stage);

    for (const dependency of PIPELINE_REGISTRY[stage].dependsOn) {
      visit(dependency);
    }

    visiting.delete(stage);
    visited.add(stage);
  };

  for (const stage of PIPELINE_STAGE_ORDER) {
    visit(stage);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
