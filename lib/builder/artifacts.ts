import type {
  ArtifactByType,
  ArtifactType,
  BuilderArtifactBase,
  StageName,
} from "@/lib/builder/contracts";

interface BuildArtifactInput<T extends ArtifactType> {
  artifactType: T;
  stageName: StageName;
  runId: string;
  stageRunIndex: number;
  artifactVersion: string;
  pipelineVersion: string;
  generatedBy: string;
  source: string;
  parentArtifactId: string | null;
  payload?: Record<string, unknown>;
}

const createArtifactId = (
  runId: string,
  stageName: StageName,
  stageRunIndex: number,
): string => `${runId}:${stageName}:${stageRunIndex}`;

export const createArtifact = <T extends ArtifactType>(
  input: BuildArtifactInput<T>,
): ArtifactByType[T] => {
  const createdAt = new Date().toISOString();

  const artifact: BuilderArtifactBase = {
    artifactType: input.artifactType,
    artifactId: createArtifactId(input.runId, input.stageName, input.stageRunIndex),
    artifactVersion: input.artifactVersion,
    pipelineVersion: input.pipelineVersion,
    createdAt,
    generatedBy: input.generatedBy,
    source: input.source,
    parentArtifactId: input.parentArtifactId,
    status: "placeholder",
    provenance: {
      source: input.source,
      generator: input.generatedBy,
      method: "placeholder",
      version: input.artifactVersion,
      confidence: null,
      timestamp: createdAt,
    },
    payload: {
      ...(input.payload ?? {}),
      stage: input.stageName,
      todo: "TODO: implement stage business logic",
    },
  };

  return artifact as ArtifactByType[T];
};
