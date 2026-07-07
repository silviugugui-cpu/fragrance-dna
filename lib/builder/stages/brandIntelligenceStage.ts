import { createArtifact } from "@/lib/builder/artifacts";
import {
  buildBrandInheritanceContract,
  createInMemoryBrandRepository,
  PlaceholderBrandLoader,
  PlaceholderBrandSerializer,
} from "@/lib/builder/brand";
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

export const brandIntelligenceStage: PipelineStageModule<
  "NormalizedArtifact",
  "BrandArtifact"
> = {
  name: "brand-intelligence",
  inputContract: {
    artifactType: "NormalizedArtifact",
    description: "Consumes normalized builder artifacts and prepares brand contracts.",
  },
  outputContract: {
    artifactType: "BrandArtifact",
    description: "Emits Brand Intelligence contract artifact without enrichment logic.",
  },
  async execute(input, context) {
    const repository = createInMemoryBrandRepository();
    const loader = new PlaceholderBrandLoader();
    const serializer = new PlaceholderBrandSerializer();
    const loaded = loader.loadBrands([]);
    const brands = repository.getAllBrands();

    return createArtifact({
      artifactType: "BrandArtifact",
      stageName: "brand-intelligence",
      runId: context.runId,
      stageRunIndex: context.stageRunIndex,
      artifactVersion: "1.0.0",
      pipelineVersion: context.pipelineVersion,
      generatedBy: context.generatedBy,
      source: context.source,
      parentArtifactId: input.artifactId,
      payload: {
        brandIntelligenceFoundation: {
          brands,
          totalBrands: brands.length,
          registry: {
            totalRegisteredBrands: repository.getRegistry().count(),
            duplicateDetectionIssues: repository
              .getRegistry()
              .detectDuplicates(brands),
          },
          inheritanceContracts: brands.map((brand) =>
            buildBrandInheritanceContract(brand),
          ),
          loader: {
            errors: loaded.errors,
            warnings: loaded.warnings,
          },
          serializer: {
            serializedPreview: serializer.serializeBrands(brands),
          },
          notes: [
            "Brand Intelligence foundation only: no enrichment, no override resolution, no persistence.",
          ],
        },
      },
    });
  },
  validateInput(input) {
    if (input.artifactType !== "NormalizedArtifact") {
      return invalid([
        `Expected NormalizedArtifact input, received ${input.artifactType}`,
      ]);
    }

    return valid([
      "Placeholder validation: normalized payload structure checks are deferred.",
    ]);
  },
  validateOutput(output) {
    if (output.artifactType !== "BrandArtifact") {
      return invalid([`Expected BrandArtifact output, received ${output.artifactType}`]);
    }

    return valid([
      "Placeholder validation: Brand artifact schema checks will be expanded in future milestones.",
    ]);
  },
  validateArtifact(artifact) {
    const errors: string[] = [];
    if (!artifact.payload.brandIntelligenceFoundation) {
      errors.push("Missing brandIntelligenceFoundation payload");
    }

    if (!artifact.provenance) {
      errors.push("Missing artifact provenance");
    }

    if (errors.length > 0) {
      return invalid(errors);
    }

    return valid([
      "Placeholder validation: domain-specific brand dataset constraints deferred.",
    ]);
  },
};
