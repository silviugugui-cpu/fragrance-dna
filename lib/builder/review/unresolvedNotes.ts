import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createBuilderConfig } from "@/lib/builder/config";
import { createDefaultRawImportReader } from "@/lib/builder/rawImport";

export type NoteReviewMatchStatus = "unresolved";
export type PositionBucket = "top" | "middle" | "base" | "unknown";

export interface ReviewCountItem {
  label: string;
  count: number;
}

export interface PositionDistributionItem {
  bucket: PositionBucket;
  count: number;
  percentage: number;
}

export interface ReviewVariantCountItem {
  variant: string;
  count: number;
}

export interface ReviewProvenance {
  workbookPath: string;
  worksheet: string;
  importVersion: string;
  builderVersion: string;
}

export interface ReviewBuilderMetadata {
  pipelineVersion: string;
  importVersion: string;
  workbookPath: string;
}

export interface UnresolvedNoteReviewItem {
  rawNote: string;
  occurrenceCount: number;
  occurrencePercentage: number;
  uniquePerfumes: number;
  uniqueBrands: number;
  uniquePositions: number;
  uniqueVariants: number;
  sourceFragrances: string[];
  sourceBrands: string[];
  knownPositions: string[];
  rawVariants: string[];
  positionDistribution: PositionDistributionItem[];
  topPerfumes: ReviewCountItem[];
  topBrands: ReviewCountItem[];
  rawVariantCounts: ReviewVariantCountItem[];
  relatedRawNotes: ReviewCountItem[];
  matchStatus: NoteReviewMatchStatus;
  candidateMatch: string | null;
  provenance: string;
  provenanceDetails: ReviewProvenance;
  validationState: "unvalidated";
  builderMetadata: ReviewBuilderMetadata;
}

export interface UnresolvedNotesReviewResult {
  items: UnresolvedNoteReviewItem[];
  pendingReviews: number;
  knowledgeHealth: "review-required" | "healthy";
  currentDatasetVersion: string;
  builderVersion: string;
  knowledgeVersion: string;
}

type CandidateAccumulator = {
  normalizedKey: string;
  rawNote: string;
  occurrenceCount: number;
  sourceFragranceCounts: Map<string, number>;
  sourceBrandCounts: Map<string, number>;
  positionCounts: Map<PositionBucket, number>;
  rawVariantCounts: Map<string, number>;
  relatedNoteCounts: Map<string, number>;
  worksheetNames: Set<string>;
  firstWorksheet: string;
  firstRowIndex: number;
};

const normalizeText = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const pickRecordValue = (rawRecord: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = rawRecord[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return "Unknown";
};

const toProvenance = (worksheetName: string, rowIndex: number): string =>
  `Raw DB / Sheet: ${worksheetName} / Row: ${rowIndex}`;

const mapEntriesByFrequency = (counts: Map<string, number>, limit: number): ReviewCountItem[] =>
  Array.from(counts.entries())
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
    }));

const mapPositionBucket = (group: string | null): PositionBucket => {
  if (!group) {
    return "unknown";
  }

  const value = normalizeText(group);
  if (value.includes("top") || value.includes("head") || value.includes("opening")) {
    return "top";
  }

  if (value.includes("middle") || value.includes("heart") || value.includes("mid")) {
    return "middle";
  }

  if (value.includes("base") || value.includes("dry")) {
    return "base";
  }

  return "unknown";
};

const formatWorksheet = (worksheetNames: Set<string>): string => {
  const values = Array.from(worksheetNames.values());
  if (values.length === 0) {
    return "Unknown";
  }

  if (values.length === 1) {
    return values[0];
  }

  return `Multiple (${values.length})`;
};

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

export const loadUnresolvedNoteReviewItems = (
  limit: number = 20,
): UnresolvedNotesReviewResult => {
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
  const config = createBuilderConfig();
  const reader = createDefaultRawImportReader();

  const payload = reader.read({
    workbookPath: resolveReadableWorkbookPath(config.rawImport.workbookPath),
    worksheetNames: config.rawImport.worksheetNames,
    requiredHeaders: config.rawImport.requiredHeaders,
    identifierColumn: config.rawImport.identifierColumn,
    importVersion: config.rawImport.importVersion,
  });

  const map = new Map<string, CandidateAccumulator>();
  let totalOccurrences = 0;

  for (const worksheet of payload.rawDatabase.worksheets) {
    for (const row of worksheet.rows) {
      const parsedEntries = row.parsed?.notes?.entries ?? [];
      if (parsedEntries.length === 0) {
        continue;
      }

      const sourceFragrance = pickRecordValue(row.rawRecord, [
        "perfume",
        "name",
        "fragrance",
      ]);
      const sourceBrand = pickRecordValue(row.rawRecord, ["brand", "brand_name", "house"]);

      const rowNoteKeys = new Set<string>();

      for (const entry of parsedEntries) {
        const rawNote = entry.value.trim();
        if (rawNote.length === 0) {
          continue;
        }

        totalOccurrences += 1;

        const normalizedKey = normalizeText(rawNote);
        rowNoteKeys.add(normalizedKey);

        const bucket = mapPositionBucket(entry.group);
        const existing = map.get(normalizedKey);
        if (existing) {
          existing.occurrenceCount += 1;
          existing.rawVariantCounts.set(rawNote, (existing.rawVariantCounts.get(rawNote) ?? 0) + 1);
          existing.sourceFragranceCounts.set(
            sourceFragrance,
            (existing.sourceFragranceCounts.get(sourceFragrance) ?? 0) + 1,
          );
          existing.sourceBrandCounts.set(
            sourceBrand,
            (existing.sourceBrandCounts.get(sourceBrand) ?? 0) + 1,
          );
          existing.positionCounts.set(bucket, (existing.positionCounts.get(bucket) ?? 0) + 1);
          existing.worksheetNames.add(worksheet.worksheetName);
          continue;
        }

        map.set(normalizedKey, {
          normalizedKey,
          rawNote,
          occurrenceCount: 1,
          sourceFragranceCounts: new Map([[sourceFragrance, 1]]),
          sourceBrandCounts: new Map([[sourceBrand, 1]]),
          positionCounts: new Map([[bucket, 1]]),
          rawVariantCounts: new Map([[rawNote, 1]]),
          relatedNoteCounts: new Map<string, number>(),
          worksheetNames: new Set([worksheet.worksheetName]),
          firstWorksheet: worksheet.worksheetName,
          firstRowIndex: row.rowIndex,
        });
      }

      const rowKeys = Array.from(rowNoteKeys.values());
      for (let index = 0; index < rowKeys.length; index += 1) {
        const currentKey = rowKeys[index];
        const current = map.get(currentKey);
        if (!current) {
          continue;
        }

        for (let relatedIndex = 0; relatedIndex < rowKeys.length; relatedIndex += 1) {
          if (index === relatedIndex) {
            continue;
          }

          const relatedKey = rowKeys[relatedIndex];
          current.relatedNoteCounts.set(
            relatedKey,
            (current.relatedNoteCounts.get(relatedKey) ?? 0) + 1,
          );
        }
      }
    }
  }

  const allItems = Array.from(map.values())
    .sort((left, right) => {
      if (right.occurrenceCount !== left.occurrenceCount) {
        return right.occurrenceCount - left.occurrenceCount;
      }

      return left.rawNote.localeCompare(right.rawNote);
    })
    .map<UnresolvedNoteReviewItem>((item) => {
      const topPerfumes = mapEntriesByFrequency(item.sourceFragranceCounts, 10);
      const topBrands = mapEntriesByFrequency(item.sourceBrandCounts, 10);
      const variantsSorted = Array.from(item.rawVariantCounts.entries())
        .sort((left, right) => {
          if (right[1] !== left[1]) {
            return right[1] - left[1];
          }

          return left[0].localeCompare(right[0]);
        })
        .map(([variant, count]) => ({
          variant,
          count,
        }));

      const relatedRawNotes = Array.from(item.relatedNoteCounts.entries())
        .sort((left, right) => {
          if (right[1] !== left[1]) {
            return right[1] - left[1];
          }

          return left[0].localeCompare(right[0]);
        })
        .slice(0, 10)
        .map(([relatedKey, count]) => ({
          label: map.get(relatedKey)?.rawNote ?? relatedKey,
          count,
        }));

      const distribution: PositionDistributionItem[] = ["top", "middle", "base", "unknown"].map((bucket) => {
        const count = item.positionCounts.get(bucket as PositionBucket) ?? 0;
        return {
          bucket: bucket as PositionBucket,
          count,
          percentage:
            item.occurrenceCount > 0
              ? Number(((count / item.occurrenceCount) * 100).toFixed(2))
              : 0,
        };
      });

      const knownPositions = distribution
        .filter((entry) => entry.count > 0)
        .map((entry) => entry.bucket);

      return {
        rawNote: item.rawNote,
        occurrenceCount: item.occurrenceCount,
        occurrencePercentage:
          totalOccurrences > 0
            ? Number(((item.occurrenceCount / totalOccurrences) * 100).toFixed(2))
            : 0,
        uniquePerfumes: item.sourceFragranceCounts.size,
        uniqueBrands: item.sourceBrandCounts.size,
        uniquePositions: knownPositions.length,
        uniqueVariants: item.rawVariantCounts.size,
        sourceFragrances: topPerfumes.map((entry) => entry.label),
        sourceBrands: topBrands.map((entry) => entry.label),
        knownPositions,
        rawVariants: variantsSorted.map((entry) => entry.variant),
        positionDistribution: distribution,
        topPerfumes,
        topBrands,
        rawVariantCounts: variantsSorted,
        relatedRawNotes,
        matchStatus: "unresolved",
        candidateMatch: null,
        provenance: toProvenance(item.firstWorksheet, item.firstRowIndex),
        provenanceDetails: {
          workbookPath: payload.source.workbookPath,
          worksheet: formatWorksheet(item.worksheetNames),
          importVersion: payload.report.importVersion,
          builderVersion: config.pipelineVersion,
        },
        validationState: "unvalidated",
        builderMetadata: {
          pipelineVersion: config.pipelineVersion,
          importVersion: payload.report.importVersion,
          workbookPath: payload.source.workbookPath,
        },
      };
    });

  const limitedItems = allItems.slice(0, normalizedLimit);

  return {
    items: limitedItems,
    pendingReviews: allItems.length,
    knowledgeHealth: allItems.length > 0 ? "review-required" : "healthy",
    currentDatasetVersion: payload.report.importVersion,
    builderVersion: config.pipelineVersion,
    knowledgeVersion: "knowledge-v1",
  };
};
