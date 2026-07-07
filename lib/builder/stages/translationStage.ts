import { createArtifact } from "@/lib/builder/artifacts";
import {
  createInMemoryTranslationRuleRepository,
  PlaceholderTranslationRuleExecutor,
  PlaceholderTranslationRuleLoader,
  PlaceholderTranslationRuleSerializer,
  validateCompatibility,
  validateExecution,
  validateRegistry,
} from "@/lib/builder/translation";
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

export const translationStage: PipelineStageModule<
  "KnowledgeArtifact",
  "TranslationArtifact"
> = {
  name: "translation",
  inputContract: {
    artifactType: "KnowledgeArtifact",
    description: "Consumes knowledge artifact and prepares Translation Rules contracts.",
  },
  outputContract: {
    artifactType: "TranslationArtifact",
    description: "Emits Translation Rules contract artifact without translation logic.",
  },
  async execute(input, context) {
    const repository = createInMemoryTranslationRuleRepository();
    const loader = new PlaceholderTranslationRuleLoader();
    const serializer = new PlaceholderTranslationRuleSerializer();
    const executor = new PlaceholderTranslationRuleExecutor();

    const loaded = loader.loadRules([]);
    const rules = repository.getAllRules();
    const registryValidation = validateRegistry(rules);
    const executionValidation = validateExecution({
      matched: false,
      confidence: null,
      canonicalValue: null,
      ruleId: null,
      provenance: null,
    });
    const compatibilityValidation = validateCompatibility({
      compatible: true,
      errors: [],
      warnings: [],
    });

    return createArtifact({
      artifactType: "TranslationArtifact",
      stageName: "translation",
      runId: context.runId,
      stageRunIndex: context.stageRunIndex,
      artifactVersion: "1.0.0",
      pipelineVersion: context.pipelineVersion,
      generatedBy: context.generatedBy,
      source: context.source,
      parentArtifactId: input.artifactId,
      payload: {
        translationEngineFoundation: {
          rules,
          totalRules: rules.length,
          registry: {
            totalRegisteredRules: repository.getRegistry().count(),
            duplicateDetectionIssues: repository
              .getRegistry()
              .detectDuplicates(rules),
            priorityOrder: repository
              .getRegistry()
              .getPriorityOrderedRules()
              .map((rule) => ({
                ruleId: rule.ruleId,
                priority: rule.priority,
                enabled: rule.enabled,
              })),
          },
          executionContract: {
            sampleResult: executor.execute(
              {
                ruleId: "placeholder-rule-id",
                ruleType: "metadata-normalization",
                inputPattern: null,
                outputValue: null,
                priority: 0,
                enabled: false,
                version: "0.1.0-foundation",
                schemaVersion: 1,
                generatedBy: context.generatedBy,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                provenance: {
                  source: context.source,
                  generator: context.generatedBy,
                  method: "placeholder",
                  confidence: null,
                  timestamp: new Date().toISOString(),
                },
              },
              {
                ruleType: "metadata-normalization",
                sourceValue: null,
              },
            ),
          },
          loader: {
            errors: loaded.errors,
            warnings: loaded.warnings,
          },
          serializer: {
            serializedPreview: serializer.serializeRules(rules),
          },
          validation: {
            registry: registryValidation,
            execution: executionValidation,
            compatibility: compatibilityValidation,
          },
          notes: [
            "Translation Engine foundation only: no translation logic, no Knowledge Base logic, no downstream redesign.",
          ],
        },
      },
    });
  },
  validateInput(input) {
    if (input.artifactType !== "KnowledgeArtifact") {
      return invalid([
        `Expected KnowledgeArtifact input, received ${input.artifactType}`,
      ]);
    }

    return valid([
      "Placeholder validation: knowledge payload constraints are deferred.",
    ]);
  },
  validateOutput(output) {
    if (output.artifactType !== "TranslationArtifact") {
      return invalid([
        `Expected TranslationArtifact output, received ${output.artifactType}`,
      ]);
    }

    return valid([
      "Placeholder validation: Translation artifact schema checks will be expanded in future milestones.",
    ]);
  },
  validateArtifact(artifact) {
    const errors: string[] = [];
    if (!artifact.payload.translationEngineFoundation) {
      errors.push("Missing translationEngineFoundation payload");
    }

    if (!artifact.provenance) {
      errors.push("Missing artifact provenance");
    }

    if (errors.length > 0) {
      return invalid(errors);
    }

    return valid([
      "Placeholder validation: rule taxonomy and matching constraints deferred.",
    ]);
  },
};
