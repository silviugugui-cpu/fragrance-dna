import { createArtifact } from "@/lib/builder/artifacts";
import type {
  ArtifactByType,
  ArtifactType,
  PipelineStageModule,
  StageName,
  StageValidationResult,
} from "@/lib/builder/contracts";

const validateContractType = <T extends ArtifactType>(
  artifactType: ArtifactType,
  expected: T,
): StageValidationResult => {
  if (artifactType !== expected) {
    return {
      valid: false,
      errors: [`Expected ${expected}, got ${artifactType}`],
      warnings: [],
    };
  }

  return {
    valid: true,
    errors: [],
    warnings: ["TODO: strengthen contract validation"],
  };
};

const validateArtifactShape = <T extends ArtifactType>(
  artifact: ArtifactByType[T],
): StageValidationResult => {
  const errors: string[] = [];
  if (!artifact.artifactId) {
    errors.push("Missing artifactId");
  }
  if (!artifact.artifactVersion) {
    errors.push("Missing artifactVersion");
  }
  if (!artifact.pipelineVersion) {
    errors.push("Missing pipelineVersion");
  }
  if (!artifact.createdAt) {
    errors.push("Missing createdAt");
  }
  if (!artifact.generatedBy) {
    errors.push("Missing generatedBy");
  }
  if (!artifact.source) {
    errors.push("Missing source");
  }
  if (!artifact.provenance) {
    errors.push("Missing provenance");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings:
      errors.length === 0
        ? ["TODO: implement domain-specific validation"]
        : [],
  };
};

interface CreatePlaceholderStageParams<TIn extends ArtifactType, TOut extends ArtifactType> {
  name: StageName;
  inputArtifactType: TIn;
  outputArtifactType: TOut;
  description: string;
}

export const createPlaceholderStage = <
  TIn extends ArtifactType,
  TOut extends ArtifactType,
>(
  params: CreatePlaceholderStageParams<TIn, TOut>,
): PipelineStageModule<TIn, TOut> => ({
  name: params.name,
  inputContract: {
    artifactType: params.inputArtifactType,
    description: `Input contract for ${params.name}`,
  },
  outputContract: {
    artifactType: params.outputArtifactType,
    description: `Output contract for ${params.name}`,
  },
  async execute(input, context) {
    return createArtifact({
      artifactType: params.outputArtifactType,
      stageName: params.name,
      runId: context.runId,
      stageRunIndex: context.stageRunIndex,
      artifactVersion: "1.0.0",
      pipelineVersion: context.pipelineVersion,
      generatedBy: context.generatedBy,
      source: context.source,
      parentArtifactId: input.artifactId,
      payload: {
        stageDescription: params.description,
      },
    });
  },
  validateInput(input) {
    return validateContractType(input.artifactType, params.inputArtifactType);
  },
  validateOutput(output) {
    return validateContractType(output.artifactType, params.outputArtifactType);
  },
  validateArtifact(artifact) {
    return validateArtifactShape(artifact);
  },
});
