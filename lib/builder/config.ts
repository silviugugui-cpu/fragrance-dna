import path from "node:path";

export interface BuilderPathConfig {
  workspaceRoot: string;
  builderRoot: string;
  artifactsRoot: string;
  logsRoot: string;
  rawImportRoot: string;
  normalizedRoot: string;
  brandRoot: string;
  knowledgeRoot: string;
  translationRoot: string;
  fragranceIntelligenceRoot: string;
  metadataRoot: string;
  validationRoot: string;
  publishRoot: string;
}

export interface BuilderConfig {
  pipelineVersion: string;
  generatedBy: string;
  rawImport: {
    workbookPath: string;
    worksheetNames?: string[];
    importVersion: string;
    requiredHeaders: string[];
    identifierColumn: string;
  };
  paths: BuilderPathConfig;
}

export const createBuilderConfig = (
  overrides: Partial<BuilderConfig> = {},
): BuilderConfig => {
  const workspaceRoot = process.env.BUILDER_WORKSPACE_ROOT ?? process.cwd();
  const builderRoot =
    process.env.BUILDER_ROOT ?? path.join(workspaceRoot, "tmp", "builder");
  const artifactsRoot =
    process.env.BUILDER_ARTIFACTS_ROOT ?? path.join(builderRoot, "artifacts");
  const logsRoot = process.env.BUILDER_LOGS_ROOT ?? path.join(builderRoot, "logs");

  const base: BuilderConfig = {
    pipelineVersion: process.env.BUILDER_PIPELINE_VERSION ?? "0.1.0-foundation",
    generatedBy: process.env.BUILDER_GENERATED_BY ?? "builder-pipeline",
    rawImport: {
      workbookPath:
        process.env.BUILDER_RAW_IMPORT_WORKBOOK_PATH ??
        path.join(workspaceRoot, "public", "FragranceDNA_RawPerfumeDatabase_Export.xlsx"),
      worksheetNames: process.env.BUILDER_RAW_IMPORT_WORKSHEETS
        ? process.env.BUILDER_RAW_IMPORT_WORKSHEETS.split(",").map((item) => item)
        : undefined,
      importVersion:
        process.env.BUILDER_RAW_IMPORT_VERSION ?? "0.1.0-raw-import-engine",
      requiredHeaders: process.env.BUILDER_RAW_IMPORT_REQUIRED_HEADERS
        ? process.env.BUILDER_RAW_IMPORT_REQUIRED_HEADERS.split(",").map((item) => item)
        : ["id", "name", "brand"],
      identifierColumn:
        process.env.BUILDER_RAW_IMPORT_IDENTIFIER_COLUMN ?? "id",
    },
    paths: {
      workspaceRoot,
      builderRoot,
      artifactsRoot,
      logsRoot,
      rawImportRoot:
        process.env.BUILDER_RAW_IMPORT_ROOT ??
        path.join(artifactsRoot, "raw-import"),
      normalizedRoot:
        process.env.BUILDER_NORMALIZED_ROOT ??
        path.join(artifactsRoot, "normalized"),
      brandRoot:
        process.env.BUILDER_BRAND_ROOT ?? path.join(artifactsRoot, "brand"),
      knowledgeRoot:
        process.env.BUILDER_KNOWLEDGE_ROOT ??
        path.join(artifactsRoot, "knowledge"),
      translationRoot:
        process.env.BUILDER_TRANSLATION_ROOT ??
        path.join(artifactsRoot, "translation"),
      fragranceIntelligenceRoot:
        process.env.BUILDER_FRAGRANCE_INTELLIGENCE_ROOT ??
        path.join(artifactsRoot, "fragrance-intelligence"),
      metadataRoot:
        process.env.BUILDER_METADATA_ROOT ?? path.join(artifactsRoot, "metadata"),
      validationRoot:
        process.env.BUILDER_VALIDATION_ROOT ??
        path.join(artifactsRoot, "validation"),
      publishRoot:
        process.env.BUILDER_PUBLISH_ROOT ?? path.join(artifactsRoot, "publish"),
    },
  };

  return {
    ...base,
    ...overrides,
    paths: {
      ...base.paths,
      ...(overrides.paths ?? {}),
    },
  };
};
