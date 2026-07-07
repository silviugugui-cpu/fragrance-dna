export { createBuilderConfig } from "@/lib/builder/config";
export type { BuilderConfig } from "@/lib/builder/config";

export { runBuilderPipeline } from "@/lib/builder/pipeline/orchestrator";
export type {
  RunBuilderPipelineOptions,
  RunBuilderPipelineResult,
} from "@/lib/builder/pipeline/orchestrator";

export {
  PIPELINE_REGISTRY,
  PIPELINE_STAGE_ORDER,
  PIPELINE_VERSION,
  validateNoCircularDependencies,
} from "@/lib/builder/pipeline/registry";

export { builderStages } from "@/lib/builder/stages";
export * from "@/lib/builder/brand";
export * from "@/lib/builder/knowledge";
export * from "@/lib/builder/rawImport";
export * from "@/lib/builder/translation";
export * from "@/lib/builder/validationEngine";
export type {
  AnyBuilderArtifact,
  ArtifactByType,
  ArtifactType,
  PipelineStageModule,
  StageName,
  StageRegistryEntry,
  StageValidationResult,
} from "@/lib/builder/contracts";
