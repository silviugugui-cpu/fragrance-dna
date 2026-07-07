import { createArtifact } from "@/lib/builder/artifacts";
import { createDefaultRawImportReader } from "@/lib/builder/rawImport";
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

export const importStage: PipelineStageModule<
  "PipelineSeedArtifact",
  "RawImportArtifact"
> = {
  name: "import",
  inputContract: {
    artifactType: "PipelineSeedArtifact",
    description: "Consumes pipeline seed and imports raw workbook source data.",
  },
  outputContract: {
    artifactType: "RawImportArtifact",
    description: "Emits Raw Import artifact with source-preserved workbook rows.",
  },
  async execute(input, context) {
    const reader = createDefaultRawImportReader();
    const payload = reader.read({
      workbookPath: context.config.rawImport.workbookPath,
      worksheetNames: context.config.rawImport.worksheetNames,
      requiredHeaders: context.config.rawImport.requiredHeaders,
      identifierColumn: context.config.rawImport.identifierColumn,
      importVersion: context.config.rawImport.importVersion,
    });

    return createArtifact({
      artifactType: "RawImportArtifact",
      stageName: "import",
      runId: context.runId,
      stageRunIndex: context.stageRunIndex,
      artifactVersion: "1.0.0",
      pipelineVersion: context.pipelineVersion,
      generatedBy: context.generatedBy,
      source: context.source,
      parentArtifactId: input.artifactId,
      payload: {
        rawImportEngine: payload,
        notes: [
          "Raw Import Engine stores source values exactly as received.",
          "No normalization, transformation, translation, or enrichment is applied.",
        ],
      },
    });
  },
  validateInput(input) {
    if (input.artifactType !== "PipelineSeedArtifact") {
      return invalid([
        `Expected PipelineSeedArtifact input, received ${input.artifactType}`,
      ]);
    }

    return valid([
      "Import stage input validation is contract-level in this milestone.",
    ]);
  },
  validateOutput(output) {
    if (output.artifactType !== "RawImportArtifact") {
      return invalid([
        `Expected RawImportArtifact output, received ${output.artifactType}`,
      ]);
    }

    return valid([
      "Raw import output validation is schema-level in this milestone.",
    ]);
  },
  validateArtifact(artifact) {
    const errors: string[] = [];

    if (!artifact.payload.rawImportEngine) {
      errors.push("Missing rawImportEngine payload");
    }

    if (!artifact.provenance) {
      errors.push("Missing artifact provenance");
    }

    if (errors.length > 0) {
      return invalid(errors);
    }

    return valid([
      "Raw import artifact preserves original source records without transformations.",
    ]);
  },
};
