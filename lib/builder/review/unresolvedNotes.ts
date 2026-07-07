import "server-only";
import { createBuilderConfig } from "@/lib/builder/config";
import { runCanonicalBuilderIntelligence } from "@/lib/builder/intelligence/canonicalBuilderIntelligence";

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

type ReviewAccumulator = {
  rawValue: string;
  entityType: string;
  occurrenceCount: number;
  perfumes: Map<string, number>;
  brands: Map<string, number>;
  worksheets: Set<string>;
  firstWorksheet: string;
  firstRowIndex: number;
};

const byFrequency = (map: Map<string, number>, limit: number): ReviewCountItem[] =>
  Array.from(map.entries())
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));

export const loadUnresolvedNoteReviewItems = (
  limit: number = 20,
): UnresolvedNotesReviewResult => {
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
  const config = createBuilderConfig();
  const intelligence = runCanonicalBuilderIntelligence();

  const unresolved = intelligence.unresolvedEntities;
  const totalOccurrences = unresolved.length;
  const map = new Map<string, ReviewAccumulator>();

  for (const entity of unresolved) {
    const key = `${entity.entityType}:${entity.normalizedValue}`;
    const existing = map.get(key);

    if (existing) {
      existing.occurrenceCount += 1;
      existing.perfumes.set(entity.perfume, (existing.perfumes.get(entity.perfume) ?? 0) + 1);
      existing.brands.set(entity.brand, (existing.brands.get(entity.brand) ?? 0) + 1);
      existing.worksheets.add(entity.worksheet);
      continue;
    }

    map.set(key, {
      rawValue: entity.rawValue,
      entityType: entity.entityType,
      occurrenceCount: 1,
      perfumes: new Map([[entity.perfume, 1]]),
      brands: new Map([[entity.brand, 1]]),
      worksheets: new Set([entity.worksheet]),
      firstWorksheet: entity.worksheet,
      firstRowIndex: entity.rowIndex,
    });
  }

  const allItems = Array.from(map.values())
    .sort((left, right) => {
      if (right.occurrenceCount !== left.occurrenceCount) {
        return right.occurrenceCount - left.occurrenceCount;
      }

      return left.rawValue.localeCompare(right.rawValue);
    })
    .map<UnresolvedNoteReviewItem>((item) => {
      const topPerfumes = byFrequency(item.perfumes, 10);
      const topBrands = byFrequency(item.brands, 10);
      const worksheetLabel =
        item.worksheets.size === 1
          ? Array.from(item.worksheets)[0]
          : `Multiple (${item.worksheets.size})`;

      return {
        rawNote: `${item.entityType}: ${item.rawValue}`,
        occurrenceCount: item.occurrenceCount,
        occurrencePercentage:
          totalOccurrences > 0
            ? Number(((item.occurrenceCount / totalOccurrences) * 100).toFixed(2))
            : 0,
        uniquePerfumes: item.perfumes.size,
        uniqueBrands: item.brands.size,
        uniquePositions: 1,
        uniqueVariants: 1,
        sourceFragrances: topPerfumes.map((entry) => entry.label),
        sourceBrands: topBrands.map((entry) => entry.label),
        knownPositions: [item.entityType],
        rawVariants: [item.rawValue],
        positionDistribution: [
          { bucket: "unknown", count: item.occurrenceCount, percentage: 100 },
        ],
        topPerfumes,
        topBrands,
        rawVariantCounts: [{ variant: item.rawValue, count: item.occurrenceCount }],
        relatedRawNotes: [],
        matchStatus: "unresolved",
        candidateMatch: null,
        provenance: `Raw DB / Sheet: ${item.firstWorksheet} / Row: ${item.firstRowIndex}`,
        provenanceDetails: {
          workbookPath: config.rawImport.workbookPath,
          worksheet: worksheetLabel,
          importVersion: config.rawImport.importVersion,
          builderVersion: config.pipelineVersion,
        },
        validationState: "unvalidated",
        builderMetadata: {
          pipelineVersion: config.pipelineVersion,
          importVersion: config.rawImport.importVersion,
          workbookPath: config.rawImport.workbookPath,
        },
      };
    });

  return {
    items: allItems.slice(0, normalizedLimit),
    pendingReviews: allItems.length,
    knowledgeHealth: allItems.length > 0 ? "review-required" : "healthy",
    currentDatasetVersion: config.rawImport.importVersion,
    builderVersion: config.pipelineVersion,
    knowledgeVersion: "canonical-builder-intelligence-v1",
  };
};
