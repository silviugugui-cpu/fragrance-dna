import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createBuilderConfig } from "@/lib/builder/config";
import { createCanonicalNotesKnowledgeEntities } from "@/lib/builder/knowledge/canonicalNotes";
import { createDefaultRawImportReader } from "@/lib/builder/rawImport";
import {
  parseMainAccordsList,
  parseNotesList,
  parseVoteDistribution,
} from "@/lib/builder/validationEngine/rules/ValidationPackTypes";

type CounterMap = Map<string, number>;

export type BuilderStatus = "complete" | "partial" | "missing-core";
export type ValidationStatus = "passed" | "warning" | "failed";
export type ReviewStatus = "approved" | "pending-review";
export type KnowledgeStatus = "mapped" | "partial" | "unmapped";
export type PerformanceStatus = "available" | "missing";

export interface MasterDatabaseListRow {
  id: string;
  worksheet: string;
  rowIndex: number;
  perfume: string;
  brand: string;
  launchYear: string;
  notesCount: number;
  accordsCount: number;
  coveragePercent: number;
  builderStatus: BuilderStatus;
  validationStatus: ValidationStatus;
  reviewStatus: ReviewStatus;
  knowledgeStatus: KnowledgeStatus;
  performanceStatus: PerformanceStatus;
  published: boolean;
  searchText: string;
}

export interface MasterDatabaseDetailPanel {
  id: string;
  perfume: string;
  brand: string;
  launchYear: string;
  notes: string[];
  matchedNotes: string[];
  unresolvedNotes: string[];
  mainAccords: string[];
  longevityVotes: Record<string, number>;
  sillageVotes: Record<string, number>;
  validation: {
    status: ValidationStatus;
    issues: string[];
  };
  review: {
    status: ReviewStatus;
    reasons: string[];
  };
  builder: {
    status: BuilderStatus;
    coveragePercent: number;
  };
  knowledge: {
    status: KnowledgeStatus;
    mappedCount: number;
    unresolvedCount: number;
  };
  relationships: {
    sameBrandPerfumes: string[];
    commonNotes: Array<{ note: string; count: number }>;
  };
  translation: {
    status: "ready" | "needs-review";
    unresolvedTokens: string[];
  };
}

export interface MasterDatabaseWorkspaceResult {
  generatedAt: string;
  totalPerfumes: number;
  totalBrands: number;
  totalNotes: number;
  totalAccords: number;
  coveragePercent: number;
  builderCompletionPercent: number;
  validationCompletionPercent: number;
  pendingReview: number;
  validationIssueCount: number;
  published: number;
  rows: MasterDatabaseListRow[];
  detailsById: Record<string, MasterDatabaseDetailPanel>;
  builderMetadata: {
    workbookPath: string;
    importVersion: string;
    builderVersion: string;
  };
}

const normalizeText = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const resolveReadableWorkbookPath = (configuredPath: string): string => {
  const configuredAbsolute = path.resolve(configuredPath);
  if (fs.existsSync(configuredAbsolute)) {
    return configuredAbsolute;
  }

  const preferred = path.resolve(process.cwd(), "public", "RawPerfumeDatabase.xlsx");
  if (fs.existsSync(preferred)) {
    return preferred;
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

const isValidLaunchYear = (raw: unknown): boolean => {
  const text = String(raw ?? "").trim();
  if (!/^\d{1,4}$/.test(text)) {
    return false;
  }

  const value = Number.parseInt(text, 10);
  const currentYear = new Date().getUTCFullYear();
  return value >= 1800 && value <= currentYear;
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

const isAllZeroDistribution = (distribution: Record<string, number>): boolean => {
  const values = Object.values(distribution);
  if (values.length === 0) {
    return true;
  }

  return values.every((value) => value === 0);
};

const bump = (map: CounterMap, key: string): void => {
  if (!key) {
    return;
  }

  map.set(key, (map.get(key) ?? 0) + 1);
};

export const loadMasterDatabaseWorkspaceData = (): MasterDatabaseWorkspaceResult => {
  const config = createBuilderConfig();
  const reader = createDefaultRawImportReader();

  const payload = reader.read({
    workbookPath: resolveReadableWorkbookPath(config.rawImport.workbookPath),
    worksheetNames: config.rawImport.worksheetNames,
    requiredHeaders: config.rawImport.requiredHeaders,
    identifierColumn: config.rawImport.identifierColumn,
    importVersion: config.rawImport.importVersion,
  });

  const canonicalNotes = createCanonicalNotesKnowledgeEntities(config.generatedBy);
  const noteLookup = new Set<string>();
  for (const note of canonicalNotes) {
    noteLookup.add(normalizeText(note.canonicalName));
    for (const alias of note.aliases) {
      noteLookup.add(normalizeText(alias.alias));
    }
  }

  const rows: MasterDatabaseListRow[] = [];
  const detailsById: Record<string, MasterDatabaseDetailPanel> = {};

  const brandToPerfumes = new Map<string, string[]>();
  const noteCounterById = new Map<string, CounterMap>();
  const notePresenceCount = new Map<string, number>();
  const noteSetById = new Map<string, Set<string>>();
  const uniqueBrands = new Set<string>();
  const uniqueNotes = new Set<string>();
  const uniqueAccords = new Set<string>();

  let coverageAccumulator = 0;
  let builderCompleteCount = 0;
  let validationPassedCount = 0;
  let pendingReviewCount = 0;
  let validationIssueCount = 0;
  let publishedCount = 0;

  for (const worksheet of payload.rawDatabase.worksheets) {
    for (const row of worksheet.rows) {
      const id = `${worksheet.worksheetName}:${row.rowIndex}`;
      const brand = pickText(row.rawRecord, ["brand", "brand_name", "house"]);
      const perfume = pickText(row.rawRecord, ["perfume", "name", "fragrance"]);
      const launchYear = String(row.rawRecord.launch_year ?? "").trim();

      const notesParsed = parseNotesList(row.rawRecord.notes);
      const accordsParsed = parseMainAccordsList(row.rawRecord.main_accords);
      const longevityVotes = parseVoteDistribution(row.rawRecord.longevity);
      const sillageVotes = parseVoteDistribution(row.rawRecord.sillage);

      const notes = notesParsed.items;
      const accords = accordsParsed.items;
      const matchedNotes = notes.filter((note) => noteLookup.has(normalizeText(note)));
      const unresolvedNotes = notes.filter((note) => !noteLookup.has(normalizeText(note)));

      const hasPerformance =
        !isAllZeroDistribution(longevityVotes) || !isAllZeroDistribution(sillageVotes);

      const checks = {
        brand: brand.length > 0,
        perfume: perfume.length > 0,
        launchYear: isValidLaunchYear(launchYear),
        notes: notes.length > 0,
        accords: accords.length > 0,
        performance: hasPerformance,
      };

      const coveragePassed = Object.values(checks).filter(Boolean).length;
      const coveragePercent = Number(((coveragePassed / 6) * 100).toFixed(2));
      coverageAccumulator += coveragePercent;

      let builderStatus: BuilderStatus = "missing-core";
      if (checks.brand && checks.perfume && checks.notes && checks.accords) {
        builderStatus = "complete";
      } else if (checks.brand || checks.perfume || checks.notes || checks.accords) {
        builderStatus = "partial";
      }

      const validationIssues: string[] = [];
      if (!checks.brand) {
        validationIssues.push("Missing brand");
      }
      if (!checks.perfume) {
        validationIssues.push("Missing perfume");
      }
      if (notesParsed.isInvalidStructure) {
        validationIssues.push("Invalid notes structure");
      }
      if (accordsParsed.isInvalidStructure) {
        validationIssues.push("Invalid accords structure");
      }
      if (!checks.launchYear) {
        validationIssues.push("Launch year requires review");
      }
      if (!checks.performance) {
        validationIssues.push("Performance evidence missing");
      }

      let validationStatus: ValidationStatus = "passed";
      if (
        !checks.brand ||
        !checks.perfume ||
        notesParsed.isInvalidStructure ||
        accordsParsed.isInvalidStructure
      ) {
        validationStatus = "failed";
      } else if (!checks.launchYear || !checks.performance) {
        validationStatus = "warning";
      }

      let knowledgeStatus: KnowledgeStatus = "unmapped";
      if (notes.length > 0 && matchedNotes.length === notes.length) {
        knowledgeStatus = "mapped";
      } else if (matchedNotes.length > 0) {
        knowledgeStatus = "partial";
      }

      const performanceStatus: PerformanceStatus = hasPerformance ? "available" : "missing";

      const reviewStatus: ReviewStatus =
        validationStatus === "passed" && knowledgeStatus !== "unmapped"
          ? "approved"
          : "pending-review";

      const published =
        builderStatus === "complete" &&
        validationStatus === "passed" &&
        reviewStatus === "approved";

      if (builderStatus === "complete") {
        builderCompleteCount += 1;
      }
      if (validationStatus === "passed") {
        validationPassedCount += 1;
      }
      if (reviewStatus === "pending-review") {
        pendingReviewCount += 1;
      }
      if (published) {
        publishedCount += 1;
      }

      const safeBrand = brand.length > 0 ? brand : "Unknown Brand";
      const safePerfume = perfume.length > 0 ? perfume : `Unnamed #${row.rowIndex}`;

      uniqueBrands.add(normalizeText(safeBrand));
      for (const note of notes) {
        uniqueNotes.add(normalizeText(note));
      }
      for (const accord of accords) {
        uniqueAccords.add(normalizeText(accord));
      }
      validationIssueCount += validationIssues.length;

      const listRow: MasterDatabaseListRow = {
        id,
        worksheet: worksheet.worksheetName,
        rowIndex: row.rowIndex,
        perfume: safePerfume,
        brand: safeBrand,
        launchYear,
        notesCount: notes.length,
        accordsCount: accords.length,
        coveragePercent,
        builderStatus,
        validationStatus,
        reviewStatus,
        knowledgeStatus,
        performanceStatus,
        published,
        searchText: normalizeText(
          `${safePerfume} ${safeBrand} ${notes.join(" ")} ${accords.join(" ")}`,
        ),
      };

      rows.push(listRow);

      const translationStatus = unresolvedNotes.length > 0 ? "needs-review" : "ready";
      detailsById[id] = {
        id,
        perfume: safePerfume,
        brand: safeBrand,
        launchYear,
        notes,
        matchedNotes,
        unresolvedNotes,
        mainAccords: accords,
        longevityVotes,
        sillageVotes,
        validation: {
          status: validationStatus,
          issues: validationIssues,
        },
        review: {
          status: reviewStatus,
          reasons:
            reviewStatus === "approved"
              ? ["Validation and knowledge checks passed."]
              : [
                  ...validationIssues,
                  ...(knowledgeStatus === "unmapped" ? ["Knowledge mapping missing"] : []),
                ],
        },
        builder: {
          status: builderStatus,
          coveragePercent,
        },
        knowledge: {
          status: knowledgeStatus,
          mappedCount: matchedNotes.length,
          unresolvedCount: unresolvedNotes.length,
        },
        relationships: {
          sameBrandPerfumes: [],
          commonNotes: [],
        },
        translation: {
          status: translationStatus,
          unresolvedTokens: unresolvedNotes,
        },
      };

      const brandBucket = brandToPerfumes.get(safeBrand) ?? [];
      brandBucket.push(id);
      brandToPerfumes.set(safeBrand, brandBucket);

      const noteCounter = new Map<string, number>();
      for (const note of matchedNotes) {
        bump(noteCounter, note);
      }
      noteCounterById.set(id, noteCounter);

      const distinctMatchedNotes = new Set<string>(matchedNotes);
      noteSetById.set(id, distinctMatchedNotes);
      for (const note of distinctMatchedNotes) {
        notePresenceCount.set(note, (notePresenceCount.get(note) ?? 0) + 1);
      }
    }
  }

  for (const row of rows) {
    const detail = detailsById[row.id];
    const sameBrandIds = (brandToPerfumes.get(row.brand) ?? [])
      .filter((id) => id !== row.id)
      .slice(0, 12);

    detail.relationships.sameBrandPerfumes = sameBrandIds
      .map((id) => detailsById[id]?.perfume)
      .filter((value): value is string => Boolean(value));

    const currentNotes = noteSetById.get(row.id) ?? new Set<string>();
    const commonCounter = new Map<string, number>();
    for (const note of currentNotes) {
      const globalCount = notePresenceCount.get(note) ?? 0;
      commonCounter.set(note, Math.max(0, globalCount - 1));
    }

    detail.relationships.commonNotes = Array.from(commonCounter.entries())
      .sort((left, right) => {
        if (right[1] !== left[1]) {
          return right[1] - left[1];
        }

        return left[0].localeCompare(right[0]);
      })
      .slice(0, 10)
      .map(([note, count]) => ({ note, count }));
  }

  rows.sort((left, right) => left.perfume.localeCompare(right.perfume));

  const totalPerfumes = rows.length;
  const safeTotal = totalPerfumes > 0 ? totalPerfumes : 1;

  return {
    generatedAt: new Date().toISOString(),
    totalPerfumes,
    totalBrands: uniqueBrands.size,
    totalNotes: uniqueNotes.size,
    totalAccords: uniqueAccords.size,
    coveragePercent: Number((coverageAccumulator / safeTotal).toFixed(2)),
    builderCompletionPercent: Number(
      ((builderCompleteCount / safeTotal) * 100).toFixed(2),
    ),
    validationCompletionPercent: Number(
      ((validationPassedCount / safeTotal) * 100).toFixed(2),
    ),
    pendingReview: pendingReviewCount,
    validationIssueCount,
    published: publishedCount,
    rows,
    detailsById,
    builderMetadata: {
      workbookPath: payload.source.workbookPath,
      importVersion: payload.report.importVersion,
      builderVersion: config.pipelineVersion,
    },
  };
};
