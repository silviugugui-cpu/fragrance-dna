import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createBuilderConfig } from "@/lib/builder/config";
import { createCanonicalNotesKnowledgeEntities } from "@/lib/builder/knowledge/canonicalNotes";
import { createDefaultRawImportReader } from "@/lib/builder/rawImport";
import {
  parseMainAccordsList,
  parseNotesList,
} from "@/lib/builder/validationEngine/rules/ValidationPackTypes";

export type KnowledgeEntityType = "note" | "accord" | "brand" | "family" | "perfumer";
export type KnowledgeWorkspaceStatus = "healthy" | "review-needed" | "not-observed";
export type KnowledgeReviewStatus = "approved" | "pending-review" | "not-observed";

export interface KnowledgeWorkspaceListItem {
  entityId: string;
  displayName: string;
  occurrences: number;
  status: KnowledgeWorkspaceStatus;
  reviewStatus: KnowledgeReviewStatus;
  coveragePercent: number;
}

export interface KnowledgeWorkspaceSelectedEntity {
  entityId: string;
  displayName: string;
  occurrences: number;
  status: KnowledgeWorkspaceStatus;
  reviewStatus: KnowledgeReviewStatus;
  builderStatus: "complete" | "review-needed";
  coveragePercent: number;
  launchYearDistribution: Array<{ label: string; count: number }>;
  topPerfumes: Array<{ label: string; count: number }>;
  topBrands: Array<{ label: string; count: number }>;
  topNotes: Array<{ label: string; count: number }>;
  topMainAccords: Array<{ label: string; count: number }>;
  topFamilies: Array<{ label: string; count: number }>;
  topPerfumers: Array<{ label: string; count: number }>;
  rawVariants: Array<{ label: string; count: number }>;
  aliases: Array<{ label: string; count: number }>;
}

export interface KnowledgeWorkspaceResult {
  entityType: KnowledgeEntityType;
  entityLabelSingular: string;
  entityLabelPlural: string;
  totalEntities: number;
  totalOccurrences: number;
  averageOccurrences: number;
  pendingReview: number;
  coveragePercent: number;
  displayedEntities: KnowledgeWorkspaceListItem[];
  detailsById: Record<string, KnowledgeWorkspaceSelectedEntity>;
  selectedEntity: KnowledgeWorkspaceSelectedEntity | null;
  statistics: {
    observedEntities: number;
    unresolvedUnique: number;
    unresolvedOccurrences: number;
    totalRows: number;
    healthyEntities: number;
    reviewNeededEntities: number;
  };
  validation: {
    rawImportValid: boolean;
    rawImportErrors: number;
    rawImportWarnings: number;
  };
  intelligenceSummary: {
    topCoverageEntities: Array<{ label: string; count: number }>;
    topObservedEntities: Array<{ label: string; count: number }>;
  };
  builderMetadata: {
    workbookPath: string;
    importVersion: string;
    builderVersion: string;
    generatedAt: string;
  };
}

interface EntityAccumulator {
  displayName: string;
  occurrences: number;
  coverageAccumulator: number;
  rowCount: number;
  validationIssues: number;
  perfumes: Map<string, number>;
  brands: Map<string, number>;
  notes: Map<string, number>;
  accords: Map<string, number>;
  families: Map<string, number>;
  perfumers: Map<string, number>;
  years: Map<string, number>;
  rawVariants: Map<string, number>;
  aliases: Map<string, number>;
}

const ENTITY_LABELS: Record<KnowledgeEntityType, { singular: string; plural: string }> = {
  note: { singular: "Note", plural: "Notes" },
  accord: { singular: "Accord", plural: "Accords" },
  brand: { singular: "Brand", plural: "Brands" },
  family: { singular: "Family", plural: "Families" },
  perfumer: { singular: "Perfumer", plural: "Perfumers" },
};

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

const topFromCounter = (
  map: Map<string, number>,
  limit: number,
): Array<{ label: string; count: number }> =>
  Array.from(map.entries())
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }
      return left[0].localeCompare(right[0]);
    })
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));

const toPercent = (value: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }
  return Number(((value / total) * 100).toFixed(2));
};

const bump = (map: Map<string, number>, value: string): void => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return;
  }
  map.set(trimmed, (map.get(trimmed) ?? 0) + 1);
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

const pickManyTexts = (record: Record<string, unknown>, keys: string[]): string[] => {
  const values: string[] = [];
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        values.push(trimmed);
      }
    }
  }
  return values;
};

const splitValues = (input: string[]): string[] => {
  const items: string[] = [];
  for (const value of input) {
    const split = value
      .split(/[;,|/]/g)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    items.push(...split);
  }
  return Array.from(new Set(items));
};

const computeStatus = (
  occurrences: number,
  avgCoverage: number,
): { status: KnowledgeWorkspaceStatus; reviewStatus: KnowledgeReviewStatus } => {
  if (occurrences <= 0) {
    return { status: "not-observed", reviewStatus: "not-observed" };
  }

  if (avgCoverage >= 80) {
    return { status: "healthy", reviewStatus: "approved" };
  }

  return { status: "review-needed", reviewStatus: "pending-review" };
};

const isValidLaunchYear = (raw: string): boolean => {
  if (raw.length === 0) {
    return true;
  }
  if (!/^\d{4}$/.test(raw)) {
    return false;
  }
  const value = Number.parseInt(raw, 10);
  const currentYear = new Date().getUTCFullYear();
  return value >= 1800 && value <= currentYear;
};

export const loadKnowledgeWorkspaceData = (
  entityType: KnowledgeEntityType,
): KnowledgeWorkspaceResult => {
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
  const canonicalNoteLookup = new Map<string, string>();
  const canonicalNoteAliases = new Map<string, string[]>();
  for (const note of canonicalNotes) {
    canonicalNoteLookup.set(normalizeText(note.canonicalName), note.canonicalName);
    const aliases: string[] = [];
    for (const alias of note.aliases) {
      canonicalNoteLookup.set(normalizeText(alias.alias), note.canonicalName);
      aliases.push(alias.alias);
    }
    canonicalNoteAliases.set(note.canonicalName, aliases);
  }

  const accumulators = new Map<string, EntityAccumulator>();
  if (entityType === "note") {
    for (const note of canonicalNotes) {
      accumulators.set(normalizeText(note.canonicalName), {
        displayName: note.canonicalName,
        occurrences: 0,
        coverageAccumulator: 0,
        rowCount: 0,
        validationIssues: 0,
        perfumes: new Map<string, number>(),
        brands: new Map<string, number>(),
        notes: new Map<string, number>(),
        accords: new Map<string, number>(),
        families: new Map<string, number>(),
        perfumers: new Map<string, number>(),
        years: new Map<string, number>(),
        rawVariants: new Map<string, number>(),
        aliases: new Map<string, number>(),
      });
    }
  }

  const unresolvedValues = new Map<string, number>();
  let totalRows = 0;

  for (const worksheet of payload.rawDatabase.worksheets) {
    for (const row of worksheet.rows) {
      totalRows += 1;
      const raw = row.rawRecord;

      const brand = pickText(raw, ["brand", "brand_name", "house"]) || "Unknown Brand";
      const perfume =
        pickText(raw, ["perfume", "name", "fragrance"]) || `Unnamed #${row.rowIndex}`;
      const launchYear = String(raw.launch_year ?? "").trim();

      const parsedNotes = parseNotesList(raw.notes);
      const parsedAccords = parseMainAccordsList(raw.main_accords);

      const notes = parsedNotes.items;
      const accords = parsedAccords.items;
      const families = splitValues(
        pickManyTexts(raw, ["family", "families", "olfactory_family", "olfactory_families"]),
      );
      const perfumers = splitValues(
        pickManyTexts(raw, [
          "perfumer",
          "perfumers",
          "perfumer_name",
          "creator",
          "creators",
          "nose",
        ]),
      );

      const mappedNotes = notes
        .map((item) => canonicalNoteLookup.get(normalizeText(item)) ?? "")
        .filter((item) => item.length > 0);

      const checks = {
        brand: brand.trim().length > 0,
        perfume: perfume.trim().length > 0,
        launchYear: isValidLaunchYear(launchYear),
        notes: notes.length > 0 && !parsedNotes.isInvalidStructure,
        accords: accords.length > 0 && !parsedAccords.isInvalidStructure,
      };
      const coverage = (Object.values(checks).filter(Boolean).length / 5) * 100;

      const entityValues =
        entityType === "note"
          ? mappedNotes
          : entityType === "accord"
            ? accords
            : entityType === "brand"
              ? [brand]
              : entityType === "family"
                ? families
                : perfumers;

      const rowEntityValues = Array.from(new Set(entityValues));
      if (entityType === "note") {
        const unresolved = notes.filter(
          (item) => !canonicalNoteLookup.has(normalizeText(item)),
        );
        for (const item of unresolved) {
          bump(unresolvedValues, item);
        }
      }

      for (const value of rowEntityValues) {
        const normalized = normalizeText(value);
        if (!normalized) {
          continue;
        }

        const acc =
          accumulators.get(normalized) ??
          {
            displayName: value,
            occurrences: 0,
            coverageAccumulator: 0,
            rowCount: 0,
            validationIssues: 0,
            perfumes: new Map<string, number>(),
            brands: new Map<string, number>(),
            notes: new Map<string, number>(),
            accords: new Map<string, number>(),
            families: new Map<string, number>(),
            perfumers: new Map<string, number>(),
            years: new Map<string, number>(),
            rawVariants: new Map<string, number>(),
            aliases: new Map<string, number>(),
          };

        acc.occurrences += 1;
        acc.coverageAccumulator += coverage;
        acc.rowCount += 1;
        if (!checks.launchYear || parsedNotes.isInvalidStructure || parsedAccords.isInvalidStructure) {
          acc.validationIssues += 1;
        }

        bump(acc.perfumes, perfume);
        bump(acc.brands, brand);
        for (const note of mappedNotes) {
          if (entityType === "note" && normalizeText(note) === normalized) {
            continue;
          }
          bump(acc.notes, note);
        }
        for (const accord of accords) {
          if (entityType === "accord" && normalizeText(accord) === normalized) {
            continue;
          }
          bump(acc.accords, accord);
        }
        for (const family of families) {
          if (entityType === "family" && normalizeText(family) === normalized) {
            continue;
          }
          bump(acc.families, family);
        }
        for (const perfumer of perfumers) {
          if (entityType === "perfumer" && normalizeText(perfumer) === normalized) {
            continue;
          }
          bump(acc.perfumers, perfumer);
        }
        if (launchYear.length > 0) {
          bump(acc.years, launchYear);
        }

        bump(acc.rawVariants, value);

        if (entityType === "note") {
          const aliases = canonicalNoteAliases.get(acc.displayName) ?? [];
          for (const alias of aliases) {
            bump(acc.aliases, alias);
          }
        }

        accumulators.set(normalized, acc);
      }
    }
  }

  const displayedEntities: KnowledgeWorkspaceListItem[] = Array.from(accumulators.entries())
    .map(([entityId, acc]) => {
      const avgCoverage = acc.rowCount > 0 ? acc.coverageAccumulator / acc.rowCount : 0;
      const resolved = computeStatus(acc.occurrences, avgCoverage);
      const reviewStatus: KnowledgeReviewStatus =
        resolved.reviewStatus === "approved" && acc.validationIssues === 0
          ? "approved"
          : resolved.reviewStatus === "not-observed"
            ? "not-observed"
            : "pending-review";

      return {
        entityId,
        displayName: acc.displayName,
        occurrences: acc.occurrences,
        status: resolved.status,
        reviewStatus,
        coveragePercent: Number(avgCoverage.toFixed(2)),
      };
    })
    .sort((left, right) => {
      if (right.occurrences !== left.occurrences) {
        return right.occurrences - left.occurrences;
      }
      return left.displayName.localeCompare(right.displayName);
    });

  const detailsById: Record<string, KnowledgeWorkspaceSelectedEntity> = {};
  for (const item of displayedEntities) {
    const acc = accumulators.get(item.entityId);
    if (!acc) {
      continue;
    }

    detailsById[item.entityId] = {
      entityId: item.entityId,
      displayName: item.displayName,
      occurrences: item.occurrences,
      status: item.status,
      reviewStatus: item.reviewStatus,
      builderStatus: item.status === "healthy" ? "complete" : "review-needed",
      coveragePercent: item.coveragePercent,
      launchYearDistribution: topFromCounter(acc.years, 12),
      topPerfumes: topFromCounter(acc.perfumes, 12),
      topBrands: topFromCounter(acc.brands, 12),
      topNotes: topFromCounter(acc.notes, 12),
      topMainAccords: topFromCounter(acc.accords, 12),
      topFamilies: topFromCounter(acc.families, 12),
      topPerfumers: topFromCounter(acc.perfumers, 12),
      rawVariants: topFromCounter(acc.rawVariants, 12),
      aliases: topFromCounter(acc.aliases, 12),
    };
  }

  const selectedListItem = displayedEntities[0] ?? null;
  const selectedEntity = selectedListItem ? detailsById[selectedListItem.entityId] ?? null : null;

  const totalEntities = displayedEntities.length;
  const totalOccurrences = displayedEntities.reduce((sum, item) => sum + item.occurrences, 0);
  const pendingReview = displayedEntities.filter(
    (item) => item.reviewStatus === "pending-review",
  ).length;
  const coveragePercent =
    totalEntities > 0
      ? Number(
          (
            displayedEntities.reduce((sum, item) => sum + item.coveragePercent, 0) / totalEntities
          ).toFixed(2),
        )
      : 0;

  const unresolvedOccurrences = Array.from(unresolvedValues.values()).reduce(
    (sum, value) => sum + value,
    0,
  );

  return {
    entityType,
    entityLabelSingular: ENTITY_LABELS[entityType].singular,
    entityLabelPlural: ENTITY_LABELS[entityType].plural,
    totalEntities,
    totalOccurrences,
    averageOccurrences:
      totalEntities > 0 ? Number((totalOccurrences / totalEntities).toFixed(2)) : 0,
    pendingReview,
    coveragePercent,
    displayedEntities,
    detailsById,
    selectedEntity,
    statistics: {
      observedEntities: displayedEntities.filter((item) => item.occurrences > 0).length,
      unresolvedUnique: unresolvedValues.size,
      unresolvedOccurrences,
      totalRows,
      healthyEntities: displayedEntities.filter((item) => item.status === "healthy").length,
      reviewNeededEntities: displayedEntities.filter((item) => item.status === "review-needed").length,
    },
    validation: {
      rawImportValid: payload.validation.valid,
      rawImportErrors: payload.validation.errors.length,
      rawImportWarnings: payload.validation.warnings.length,
    },
    intelligenceSummary: {
      topCoverageEntities: displayedEntities
        .map((item) => ({ label: item.displayName, count: item.coveragePercent }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 8),
      topObservedEntities: displayedEntities
        .map((item) => ({ label: item.displayName, count: item.occurrences }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 8),
    },
    builderMetadata: {
      workbookPath: payload.source.workbookPath,
      importVersion: payload.report.importVersion,
      builderVersion: config.pipelineVersion,
      generatedAt: new Date().toISOString(),
    },
  };
};
