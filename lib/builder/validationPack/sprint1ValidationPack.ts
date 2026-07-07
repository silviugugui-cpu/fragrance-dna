import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createBuilderConfig } from "@/lib/builder/config";
import { createDefaultRawImportReader } from "@/lib/builder/rawImport";
import { createValidationEngine } from "@/lib/builder/validationEngine/ValidationEngine";
import { createBrandFormattingValidationRule } from "@/lib/builder/validationEngine/rules/BrandFormattingValidationRule";
import { createEmptyMainAccordsValidationRule } from "@/lib/builder/validationEngine/rules/EmptyMainAccordsValidationRule";
import { createEmptyNotesValidationRule } from "@/lib/builder/validationEngine/rules/EmptyNotesValidationRule";
import { createLaunchYearValidationRule } from "@/lib/builder/validationEngine/rules/LaunchYearValidationRule";
import { createPerformanceEvidencePackValidationRule } from "@/lib/builder/validationEngine/rules/PerformanceEvidencePackValidationRule";
import {
  normalizeBrandFormattingKey,
  type ValidationIssueSeverity,
  type ValidationPackPerfumeRecord,
} from "@/lib/builder/validationEngine/rules/ValidationPackTypes";

export interface Sprint1RuleMetric {
  ruleId: string;
  ruleName: string;
  executedCount: number;
  passCount: number;
  warningCount: number;
  errorCount: number;
  affectedPerfumes: number;
  executionTimeMs: number;
}

export interface Sprint1ValidationPackResult {
  generatedAt: string;
  datasetVersion: string;
  builderVersion: string;
  workbookPath: string;
  totalPerfumes: number;
  executedRules: number;
  passCount: number;
  warningCount: number;
  errorCount: number;
  affectedPerfumes: number;
  executionTimeMs: number;
  ruleMetrics: Sprint1RuleMetric[];
}

const resolveReadableWorkbookPath = (configuredPath: string): string => {
  const configuredAbsolute = path.resolve(configuredPath);
  if (fs.existsSync(configuredAbsolute)) {
    return configuredAbsolute;
  }

  const fallback = path.resolve(
    process.cwd(),
    "public",
    "FragranceDNA_RawPerfumeDatabase_Export.xlsx",
  );

  if (fs.existsSync(fallback)) {
    return fallback;
  }

  return configuredAbsolute;
};

const pickText = (record: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return "";
};

const getSeverity = (metadata: Record<string, unknown>): ValidationIssueSeverity => {
  const severity = metadata.severity;
  if (severity === "error" || severity === "warning" || severity === "none") {
    return severity;
  }

  return "none";
};

const getPerfumeKey = (record: ValidationPackPerfumeRecord): string => {
  const brand = record.brand.trim();
  const perfume = record.perfume.trim();
  if (brand.length === 0 && perfume.length === 0) {
    return `row-${record.rowIndex}`;
  }

  return `${brand}::${perfume}`;
};

type BrandFormattingAccumulator = {
  preferredFormatting: string;
  occurrences: number;
};

const choosePreferredFormatting = (
  counts: Map<string, number>,
): BrandFormattingAccumulator => {
  let preferredFormatting = "";
  let max = -1;

  for (const [formatting, count] of counts.entries()) {
    if (count > max) {
      preferredFormatting = formatting;
      max = count;
      continue;
    }

    if (count === max && formatting.localeCompare(preferredFormatting) < 0) {
      preferredFormatting = formatting;
    }
  }

  return {
    preferredFormatting,
    occurrences: max,
  };
};

const buildRecords = (): {
  records: ValidationPackPerfumeRecord[];
  datasetVersion: string;
  builderVersion: string;
  workbookPath: string;
} => {
  const config = createBuilderConfig();
  const reader = createDefaultRawImportReader();

  const payload = reader.read({
    workbookPath: resolveReadableWorkbookPath(config.rawImport.workbookPath),
    worksheetNames: config.rawImport.worksheetNames,
    requiredHeaders: config.rawImport.requiredHeaders,
    identifierColumn: config.rawImport.identifierColumn,
    importVersion: config.rawImport.importVersion,
  });

  const brandFormattingByKey = new Map<string, Map<string, number>>();

  for (const worksheet of payload.rawDatabase.worksheets) {
    for (const row of worksheet.rows) {
      const brand = pickText(row.rawRecord, ["brand", "brand_name", "house"]);
      if (brand.length === 0) {
        continue;
      }

      const normalized = normalizeBrandFormattingKey(brand);
      const current = brandFormattingByKey.get(normalized) ?? new Map<string, number>();
      current.set(brand, (current.get(brand) ?? 0) + 1);
      brandFormattingByKey.set(normalized, current);
    }
  }

  const preferredBrandFormatting = new Map<string, string>();
  for (const [normalizedBrand, counts] of brandFormattingByKey.entries()) {
    const preferred = choosePreferredFormatting(counts);
    if (preferred.occurrences > 0 && preferred.preferredFormatting.length > 0) {
      preferredBrandFormatting.set(normalizedBrand, preferred.preferredFormatting);
    }
  }

  const records: ValidationPackPerfumeRecord[] = [];

  for (const worksheet of payload.rawDatabase.worksheets) {
    for (const row of worksheet.rows) {
      const brand = pickText(row.rawRecord, ["brand", "brand_name", "house"]);
      const perfume = pickText(row.rawRecord, ["perfume", "name", "fragrance"]);
      const normalizedBrand = normalizeBrandFormattingKey(brand);

      records.push({
        rowIndex: row.rowIndex,
        brand,
        perfume,
        launchYearRaw: row.rawRecord.launch_year,
        notesRaw: row.rawRecord.notes,
        mainAccordsRaw: row.rawRecord.main_accords,
        longevityRaw: row.rawRecord.longevity,
        sillageRaw: row.rawRecord.sillage,
        preferredBrandFormatting:
          preferredBrandFormatting.get(normalizedBrand) ?? null,
      });
    }
  }

  return {
    records,
    datasetVersion: payload.report.importVersion,
    builderVersion: config.pipelineVersion,
    workbookPath: payload.source.workbookPath,
  };
};

export const runSprint1ValidationPack = async (): Promise<Sprint1ValidationPackResult> => {
  const started = Date.now();
  const { records, datasetVersion, builderVersion, workbookPath } = buildRecords();

  const engine = createValidationEngine();
  engine.registerRule(createPerformanceEvidencePackValidationRule());
  engine.registerRule(createLaunchYearValidationRule());
  engine.registerRule(createEmptyNotesValidationRule());
  engine.registerRule(createEmptyMainAccordsValidationRule());
  engine.registerRule(createBrandFormattingValidationRule());

  const ruleMetricsMap = new Map<
    string,
    Sprint1RuleMetric & { affectedPerfumeKeys: Set<string> }
  >();

  let passCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  const affectedGlobalPerfumeKeys = new Set<string>();

  for (const record of records) {
    const report = await engine.validate(
      {
        inputEntity: {
          record,
        },
      },
      {
        group: "sprint-1-validation-pack",
        globalEarlyExitDecisions: [],
      },
    );

    const perfumeKey = getPerfumeKey(record);

    for (const result of report.executedRules) {
      const severity = getSeverity(result.metadata);
      const existing = ruleMetricsMap.get(result.ruleId) ?? {
        ruleId: result.ruleId,
        ruleName: result.ruleName,
        executedCount: 0,
        passCount: 0,
        warningCount: 0,
        errorCount: 0,
        affectedPerfumes: 0,
        executionTimeMs: 0,
        affectedPerfumeKeys: new Set<string>(),
      };

      existing.executedCount += 1;
      existing.executionTimeMs += result.executionTimeMs;

      if (severity === "none") {
        existing.passCount += 1;
        passCount += 1;
      } else if (severity === "warning") {
        existing.warningCount += 1;
        warningCount += 1;
        existing.affectedPerfumeKeys.add(perfumeKey);
        affectedGlobalPerfumeKeys.add(perfumeKey);
      } else {
        existing.errorCount += 1;
        errorCount += 1;
        existing.affectedPerfumeKeys.add(perfumeKey);
        affectedGlobalPerfumeKeys.add(perfumeKey);
      }

      ruleMetricsMap.set(result.ruleId, existing);
    }
  }

  const ruleMetrics = Array.from(ruleMetricsMap.values())
    .map((item) => ({
      ruleId: item.ruleId,
      ruleName: item.ruleName,
      executedCount: item.executedCount,
      passCount: item.passCount,
      warningCount: item.warningCount,
      errorCount: item.errorCount,
      affectedPerfumes: item.affectedPerfumeKeys.size,
      executionTimeMs: item.executionTimeMs,
    }))
    .sort((left, right) => left.ruleName.localeCompare(right.ruleName));

  const executedRules = ruleMetrics.reduce((sum, item) => sum + item.executedCount, 0);

  return {
    generatedAt: new Date().toISOString(),
    datasetVersion,
    builderVersion,
    workbookPath,
    totalPerfumes: records.length,
    executedRules,
    passCount,
    warningCount,
    errorCount,
    affectedPerfumes: affectedGlobalPerfumeKeys.size,
    executionTimeMs: Date.now() - started,
    ruleMetrics,
  };
};
