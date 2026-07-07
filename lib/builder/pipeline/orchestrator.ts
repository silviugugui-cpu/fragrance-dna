import { createArtifact } from "@/lib/builder/artifacts";
import { createBuilderConfig, type BuilderConfig } from "@/lib/builder/config";
import type {
  AnyBuilderArtifact,
  ArtifactByType,
  ArtifactType,
  PipelineSeedArtifact,
  StageExecutionContext,
  StageName,
} from "@/lib/builder/contracts";
import { BuilderPipelineLogger } from "@/lib/builder/logger";
import {
  PIPELINE_REGISTRY,
  PIPELINE_STAGE_ORDER,
  PIPELINE_VERSION,
  validateNoCircularDependencies,
} from "@/lib/builder/pipeline/registry";
import { builderStages } from "@/lib/builder/stages";

export interface RunBuilderPipelineOptions {
  fromStage?: StageName;
  runId?: string;
  config?: Partial<BuilderConfig>;
  initialArtifact?: AnyBuilderArtifact;
  source?: string;
}

export interface RunBuilderPipelineResult {
  runId: string;
  finalArtifact: AnyBuilderArtifact;
  artifacts: AnyBuilderArtifact[];
  logs: ReturnType<BuilderPipelineLogger["getLogs"]>;
}

const makeRunId = (): string => `builder-run-${Date.now()}`;

const ensureInputArtifactType = (
  stage: StageName,
  artifact: AnyBuilderArtifact,
): void => {
  const expected = PIPELINE_REGISTRY[stage].inputArtifactType;
  if (artifact.artifactType !== expected) {
    throw new Error(
      `Invalid input artifact for ${stage}. Expected ${expected}, got ${artifact.artifactType}`,
    );
  }
};

const buildSeedArtifact = (
  runId: string,
  config: BuilderConfig,
  source: string,
): PipelineSeedArtifact =>
  createArtifact({
    artifactType: "PipelineSeedArtifact",
    stageName: "import",
    runId,
    stageRunIndex: 0,
    artifactVersion: "1.0.0",
    pipelineVersion: config.pipelineVersion,
    generatedBy: config.generatedBy,
    source,
    parentArtifactId: null,
    payload: {
      mode: "seed",
    },
  }) as PipelineSeedArtifact;

const getExecutionPlan = (fromStage: StageName): StageName[] => {
  const index = PIPELINE_STAGE_ORDER.indexOf(fromStage);
  if (index < 0) {
    throw new Error(`Unknown stage ${fromStage}`);
  }

  return PIPELINE_STAGE_ORDER.slice(index);
};

const validateStageOutput = <T extends ArtifactType>(
  stage: StageName,
  artifact: ArtifactByType[T],
): void => {
  const expectedType = PIPELINE_REGISTRY[stage].outputArtifactType;
  if (artifact.artifactType !== expectedType) {
    throw new Error(
      `Invalid output artifact for ${stage}. Expected ${expectedType}, got ${artifact.artifactType}`,
    );
  }
};

export const runBuilderPipeline = async (
  options: RunBuilderPipelineOptions = {},
): Promise<RunBuilderPipelineResult> => {
  const runId = options.runId ?? makeRunId();
  const config = createBuilderConfig(options.config);
  const source = options.source ?? "builder-pipeline";
  const fromStage = options.fromStage ?? "import";

  const graphValidation = validateNoCircularDependencies();
  if (!graphValidation.valid) {
    throw new Error(graphValidation.errors.join("; "));
  }

  const logger = new BuilderPipelineLogger();
  const executionPlan = getExecutionPlan(fromStage);
  const artifacts: AnyBuilderArtifact[] = [];

  let previousArtifact: AnyBuilderArtifact;
  if (fromStage === "import") {
    previousArtifact = buildSeedArtifact(runId, config, source);
  } else {
    if (!options.initialArtifact) {
      throw new Error(
        `Partial rebuild from ${fromStage} requires initialArtifact`,
      );
    }

    ensureInputArtifactType(fromStage, options.initialArtifact);
    previousArtifact = options.initialArtifact;
  }

  for (let index = 0; index < executionPlan.length; index += 1) {
    const stage = executionPlan[index];
    const stageModule = builderStages[stage];
    logger.startStage(stage);

    const context: StageExecutionContext = {
      runId,
      stageRunIndex: index + 1,
      pipelineVersion: config.pipelineVersion ?? PIPELINE_VERSION,
      generatedBy: config.generatedBy,
      source,
      config,
    };

    const inputValidation = stageModule.validateInput(previousArtifact as never);
    if (!inputValidation.valid) {
      const error = inputValidation.errors.join("; ");
      logger.failStage(stage, error);
      throw new Error(`Input validation failed for ${stage}: ${error}`);
    }

    for (const warning of inputValidation.warnings) {
      logger.warnStage(stage, warning);
    }

    const output = await stageModule.execute(previousArtifact as never, context);
    validateStageOutput(stage, output as never);

    const outputValidation = stageModule.validateOutput(output as never);
    if (!outputValidation.valid) {
      const error = outputValidation.errors.join("; ");
      logger.failStage(stage, error);
      throw new Error(`Output validation failed for ${stage}: ${error}`);
    }

    for (const warning of outputValidation.warnings) {
      logger.warnStage(stage, warning);
    }

    const artifactValidation = stageModule.validateArtifact(output as never);
    if (!artifactValidation.valid) {
      const error = artifactValidation.errors.join("; ");
      logger.failStage(stage, error);
      throw new Error(`Artifact validation failed for ${stage}: ${error}`);
    }

    for (const warning of artifactValidation.warnings) {
      logger.warnStage(stage, warning);
    }

    logger.completeStage({
      stage,
      status: "success",
      artifactProduced: output.artifactId,
      artifactType: output.artifactType,
      artifactVersion: output.artifactVersion,
    });

    artifacts.push(output);
    previousArtifact = output;
  }

  return {
    runId,
    finalArtifact: previousArtifact,
    artifacts,
    logs: logger.getLogs(),
  };
};
