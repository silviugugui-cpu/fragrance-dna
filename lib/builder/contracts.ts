import type { BuilderConfig } from "@/lib/builder/config";

export type StageName =
  | "import"
  | "normalize"
  | "brand-intelligence"
  | "knowledge"
  | "translation"
  | "fragrance-intelligence"
  | "metadata"
  | "validation"
  | "publish";

export type ArtifactType =
  | "PipelineSeedArtifact"
  | "RawImportArtifact"
  | "NormalizedArtifact"
  | "BrandArtifact"
  | "KnowledgeArtifact"
  | "TranslationArtifact"
  | "FragranceIntelligenceArtifact"
  | "MetadataArtifact"
  | "ValidationArtifact"
  | "MasterPerfumeArtifact";

export type ArtifactStatus = "placeholder" | "validated" | "failed";

export interface ArtifactProvenance {
  source: string;
  generator: string;
  method: string;
  version: string;
  confidence: number | null;
  timestamp: string;
}

export interface BuilderArtifactBase {
  artifactType: ArtifactType;
  artifactId: string;
  artifactVersion: string;
  pipelineVersion: string;
  createdAt: string;
  generatedBy: string;
  source: string;
  parentArtifactId: string | null;
  status: ArtifactStatus;
  provenance: ArtifactProvenance;
  payload: Record<string, unknown>;
}

export interface PipelineSeedArtifact extends BuilderArtifactBase {
  artifactType: "PipelineSeedArtifact";
}

export interface RawImportArtifact extends BuilderArtifactBase {
  artifactType: "RawImportArtifact";
}

export interface NormalizedArtifact extends BuilderArtifactBase {
  artifactType: "NormalizedArtifact";
}

export interface BrandArtifact extends BuilderArtifactBase {
  artifactType: "BrandArtifact";
}

export interface KnowledgeArtifact extends BuilderArtifactBase {
  artifactType: "KnowledgeArtifact";
}

export interface TranslationArtifact extends BuilderArtifactBase {
  artifactType: "TranslationArtifact";
}

export interface FragranceIntelligenceArtifact extends BuilderArtifactBase {
  artifactType: "FragranceIntelligenceArtifact";
}

export interface MetadataArtifact extends BuilderArtifactBase {
  artifactType: "MetadataArtifact";
}

export interface ValidationArtifact extends BuilderArtifactBase {
  artifactType: "ValidationArtifact";
}

export interface MasterPerfumeArtifact extends BuilderArtifactBase {
  artifactType: "MasterPerfumeArtifact";
}

export interface ArtifactByType {
  PipelineSeedArtifact: PipelineSeedArtifact;
  RawImportArtifact: RawImportArtifact;
  NormalizedArtifact: NormalizedArtifact;
  BrandArtifact: BrandArtifact;
  KnowledgeArtifact: KnowledgeArtifact;
  TranslationArtifact: TranslationArtifact;
  FragranceIntelligenceArtifact: FragranceIntelligenceArtifact;
  MetadataArtifact: MetadataArtifact;
  ValidationArtifact: ValidationArtifact;
  MasterPerfumeArtifact: MasterPerfumeArtifact;
}

export type AnyBuilderArtifact = ArtifactByType[keyof ArtifactByType];

export interface StageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StageInputContract<TIn extends ArtifactType> {
  artifactType: TIn;
  description: string;
}

export interface StageOutputContract<TOut extends ArtifactType> {
  artifactType: TOut;
  description: string;
}

export interface StageExecutionContext {
  runId: string;
  stageRunIndex: number;
  pipelineVersion: string;
  generatedBy: string;
  source: string;
  config: BuilderConfig;
}

export interface PipelineStageModule<TIn extends ArtifactType, TOut extends ArtifactType> {
  name: StageName;
  inputContract: StageInputContract<TIn>;
  outputContract: StageOutputContract<TOut>;
  execute(
    input: ArtifactByType[TIn],
    context: StageExecutionContext,
  ): Promise<ArtifactByType[TOut]>;
  validateInput(input: ArtifactByType[TIn]): StageValidationResult;
  validateOutput(output: ArtifactByType[TOut]): StageValidationResult;
  validateArtifact(artifact: ArtifactByType[TOut]): StageValidationResult;
}

export interface StageRegistryEntry {
  stage: StageName;
  dependsOn: StageName[];
  inputArtifactType: ArtifactType;
  outputArtifactType: ArtifactType;
  producer: string;
  consumers: StageName[];
}
