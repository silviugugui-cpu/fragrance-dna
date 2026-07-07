import { createArtifact } from "@/lib/builder/artifacts";
import type { PipelineStageModule, StageValidationResult } from "@/lib/builder/contracts";
import { runCanonicalBuilderIntelligence } from "@/lib/builder/intelligence/canonicalBuilderIntelligence";

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

export const fragranceIntelligenceStage: PipelineStageModule<
  "TranslationArtifact",
  "FragranceIntelligenceArtifact"
> = {
  name: "fragrance-intelligence",
  inputContract: {
    artifactType: "TranslationArtifact",
    description: "Consumes translation artifact and generates canonical builder intelligence output.",
  },
  outputContract: {
    artifactType: "FragranceIntelligenceArtifact",
    description: "Emits canonical fragrance intelligence and automation metrics for every fragrance.",
  },
  async execute(input, context) {
    const intelligence = runCanonicalBuilderIntelligence();

    return createArtifact({
      artifactType: "FragranceIntelligenceArtifact",
      stageName: "fragrance-intelligence",
      runId: context.runId,
      stageRunIndex: context.stageRunIndex,
      artifactVersion: "1.0.0",
      pipelineVersion: context.pipelineVersion,
      generatedBy: context.generatedBy,
      source: context.source,
      parentArtifactId: input.artifactId,
      payload: {
        canonicalBuilderIntelligenceV1: {
          generatedAt: intelligence.generatedAt,
          totalFragrancesProcessed: intelligence.totalFragrancesProcessed,
          canonicalObjectsGenerated: intelligence.canonicalObjectsGenerated,
          automaticResolutions: intelligence.automaticResolutions,
          possibleResolutions: intelligence.possibleResolutions,
          automationPercentage: intelligence.automationPercentage,
          remainingReviewItems: intelligence.remainingReviewItems,
          knowledgeCoveragePercent: intelligence.knowledgeCoveragePercent,
          averageBuilderConfidence: intelligence.averageBuilderConfidence,
          canonicalObjects: intelligence.objects,
          unresolvedEntities: intelligence.unresolvedEntities,
        },
      },
    });
  },
  validateInput(input) {
    if (input.artifactType !== "TranslationArtifact") {
      return invalid([`Expected TranslationArtifact input, received ${input.artifactType}`]);
    }

    return valid();
  },
  validateOutput(output) {
    if (output.artifactType !== "FragranceIntelligenceArtifact") {
      return invalid([
        `Expected FragranceIntelligenceArtifact output, received ${output.artifactType}`,
      ]);
    }

    return valid();
  },
  validateArtifact(artifact) {
    const intelligence = artifact.payload.canonicalBuilderIntelligenceV1 as
      | {
          totalFragrancesProcessed?: number;
          canonicalObjectsGenerated?: number;
        }
      | undefined;

    if (!intelligence) {
      return invalid(["Missing canonicalBuilderIntelligenceV1 payload"]);
    }

    if ((intelligence.totalFragrancesProcessed ?? 0) <= 0) {
      return invalid(["Fragrance intelligence produced zero processed fragrances"]);
    }

    if ((intelligence.canonicalObjectsGenerated ?? 0) <= 0) {
      return invalid(["Fragrance intelligence produced zero canonical objects"]);
    }

    return valid();
  },
};
