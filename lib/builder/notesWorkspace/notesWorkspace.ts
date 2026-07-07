import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createBuilderConfig } from "@/lib/builder/config";
import { createCanonicalNotesKnowledgeEntities } from "@/lib/builder/knowledge/canonicalNotes";
import type { KnowledgeEntityModel } from "@/lib/builder/knowledge/types";
import { createDefaultRawImportReader } from "@/lib/builder/rawImport";
import { parseMainAccordsList } from "@/lib/builder/validationEngine/rules/ValidationPackTypes";

type CounterMap = Map<string, number>;

export type NoteWorkspaceStatus = "healthy" | "review-needed" | "not-observed";

export interface NoteWorkspaceListItem {
  noteId: string;
  canonicalName: string;
  occurrences: number;
  status: NoteWorkspaceStatus;
  reviewStatus: "approved" | "pending-review" | "not-observed";
  coveragePercent: number;
}

export interface NoteWorkspaceSelectedNote {
  noteId: string;
  canonicalName: string;
  description: string;
  status: NoteWorkspaceStatus;
  reviewStatus: "approved" | "pending-review" | "not-observed";
  occurrences: number;
  aliases: Array<{
    alias: string;
    aliasType: string;
    locale: string;
  }>;
  topPerfumes: Array<{ label: string; count: number }>;
  topBrands: Array<{ label: string; count: number }>;
  topMainAccords: Array<{ label: string; count: number }>;
  topCoOccurringNotes: Array<{ label: string; count: number }>;
  builderStatus: string;
  coveragePercent: number;
  builderMetadata: {
    source: string;
    method: string;
    generatedBy: string;
    version: string;
    schemaVersion: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface NotesWorkspaceResult {
  totalNotes: number;
  totalOccurrences: number;
  averageOccurrences: number;
  pendingReview: number;
  coveragePercent: number;
  displayedNotes: NoteWorkspaceListItem[];
  selectedNote: NoteWorkspaceSelectedNote | null;
  statistics: {
    activeCanonicalNotes: number;
    observedCanonicalNotes: number;
    unresolvedUniqueRawNotes: number;
    unresolvedRawOccurrences: number;
    unresolvedRawSharePercent: number;
    aliasesTotal: number;
    relationshipsTotal: number;
    avgAliasesPerNote: number;
    avgCoOccurrencePerObservedNote: number;
  };
  validation: {
    rawImportValid: boolean;
    rawImportErrors: number;
    rawImportWarnings: number;
  };
  review: {
    approved: number;
    pending: number;
    notObserved: number;
  };
  futureTranslationStatus: {
    state: "ready" | "needs-review";
    unresolvedUniqueRawNotes: number;
  };
  builderMetadata: {
    workbookPath: string;
    importVersion: string;
    builderVersion: string;
    generatedAt: string;
  };
}

interface NoteAccumulator {
  occurrences: number;
  matchedRawCounts: CounterMap;
  perfumes: CounterMap;
  brands: CounterMap;
  accords: CounterMap;
  coOccurring: CounterMap;
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

const bumpCount = (map: CounterMap, key: string): void => {
  if (key.trim().length === 0) {
    return;
  }

  map.set(key, (map.get(key) ?? 0) + 1);
};

const topFromCounter = (
  map: CounterMap,
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

  return "Unknown";
};

const toPercent = (count: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }

  return Number(((count / total) * 100).toFixed(2));
};

const resolveStatus = (
  occurrences: number,
  canonicalRatio: number,
): {
  status: NoteWorkspaceStatus;
  reviewStatus: "approved" | "pending-review" | "not-observed";
} => {
  if (occurrences <= 0) {
    return {
      status: "not-observed",
      reviewStatus: "not-observed",
    };
  }

  if (canonicalRatio >= 0.7) {
    return {
      status: "healthy",
      reviewStatus: "approved",
    };
  }

  return {
    status: "review-needed",
    reviewStatus: "pending-review",
  };
};

export const loadNotesWorkspaceData = (): NotesWorkspaceResult => {
  const config = createBuilderConfig();
  const reader = createDefaultRawImportReader();
  const payload = reader.read({
    workbookPath: resolveReadableWorkbookPath(config.rawImport.workbookPath),
    worksheetNames: config.rawImport.worksheetNames,
    requiredHeaders: config.rawImport.requiredHeaders,
    identifierColumn: config.rawImport.identifierColumn,
    importVersion: config.rawImport.importVersion,
  });

  const knowledgeNotes = createCanonicalNotesKnowledgeEntities(config.generatedBy);
  const noteById = new Map<string, KnowledgeEntityModel>(
    knowledgeNotes.map((note) => [note.entityId, note]),
  );

  const canonicalLookup = new Map<string, string>();
  for (const note of knowledgeNotes) {
    canonicalLookup.set(normalizeText(note.canonicalName), note.entityId);
    for (const alias of note.aliases) {
      canonicalLookup.set(normalizeText(alias.alias), note.entityId);
    }
  }

  const accumulators = new Map<string, NoteAccumulator>();
  for (const note of knowledgeNotes) {
    accumulators.set(note.entityId, {
      occurrences: 0,
      matchedRawCounts: new Map<string, number>(),
      perfumes: new Map<string, number>(),
      brands: new Map<string, number>(),
      accords: new Map<string, number>(),
      coOccurring: new Map<string, number>(),
    });
  }

  const unresolvedRawCounts = new Map<string, number>();
  let totalOccurrences = 0;
  let matchedOccurrences = 0;

  for (const worksheet of payload.rawDatabase.worksheets) {
    for (const row of worksheet.rows) {
      const entries = row.parsed?.notes?.entries ?? [];
      if (entries.length === 0) {
        continue;
      }

      const brand = pickText(row.rawRecord, ["brand", "brand_name", "house"]);
      const perfume = pickText(row.rawRecord, ["perfume", "name", "fragrance"]);
      const accords = parseMainAccordsList(row.rawRecord.main_accords).items;

      const rowMatched = new Set<string>();
      for (const entry of entries) {
        const rawValue = entry.value.trim();
        if (rawValue.length === 0) {
          continue;
        }

        totalOccurrences += 1;
        const matchedNoteId = canonicalLookup.get(normalizeText(rawValue));
        if (!matchedNoteId) {
          bumpCount(unresolvedRawCounts, rawValue);
          continue;
        }

        matchedOccurrences += 1;
        rowMatched.add(matchedNoteId);
        const acc = accumulators.get(matchedNoteId);
        if (!acc) {
          continue;
        }

        acc.occurrences += 1;
        bumpCount(acc.matchedRawCounts, rawValue);
        bumpCount(acc.perfumes, perfume);
        bumpCount(acc.brands, brand);
        for (const accord of accords) {
          bumpCount(acc.accords, accord);
        }
      }

      const rowMatchedArray = Array.from(rowMatched.values());
      for (let index = 0; index < rowMatchedArray.length; index += 1) {
        const currentId = rowMatchedArray[index];
        const currentAcc = accumulators.get(currentId);
        if (!currentAcc) {
          continue;
        }

        for (let relatedIndex = 0; relatedIndex < rowMatchedArray.length; relatedIndex += 1) {
          if (relatedIndex === index) {
            continue;
          }

          const relatedId = rowMatchedArray[relatedIndex];
          const relatedName = noteById.get(relatedId)?.canonicalName ?? relatedId;
          bumpCount(currentAcc.coOccurring, relatedName);
        }
      }
    }
  }

  const listItems: NoteWorkspaceListItem[] = knowledgeNotes.map((note) => {
    const acc = accumulators.get(note.entityId);
    const occurrences = acc?.occurrences ?? 0;
    const topVariant = topFromCounter(acc?.matchedRawCounts ?? new Map<string, number>(), 1)[0];
    const canonicalRatio = occurrences > 0
      ? (topVariant?.label && normalizeText(topVariant.label) === normalizeText(note.canonicalName)
          ? topVariant.count / occurrences
          : 0)
      : 0;
    const resolved = resolveStatus(occurrences, canonicalRatio);

    return {
      noteId: note.entityId,
      canonicalName: note.canonicalName,
      occurrences,
      status: resolved.status,
      reviewStatus: resolved.reviewStatus,
      coveragePercent: toPercent(occurrences, totalOccurrences),
    };
  }).sort((left, right) => {
    if (right.occurrences !== left.occurrences) {
      return right.occurrences - left.occurrences;
    }

    return left.canonicalName.localeCompare(right.canonicalName);
  });

  const selectedListItem = listItems[0] ?? null;
  const selectedNoteEntity = selectedListItem
    ? noteById.get(selectedListItem.noteId) ?? null
    : null;
  const selectedAccumulator = selectedListItem
    ? accumulators.get(selectedListItem.noteId) ?? null
    : null;

  const unresolvedOccurrences = Array.from(unresolvedRawCounts.values()).reduce(
    (sum, value) => sum + value,
    0,
  );

  const reviewApproved = listItems.filter((item) => item.reviewStatus === "approved").length;
  const reviewPending = listItems.filter((item) => item.reviewStatus === "pending-review").length;
  const reviewNotObserved = listItems.filter((item) => item.reviewStatus === "not-observed").length;

  const aliasesTotal = knowledgeNotes.reduce((sum, note) => sum + note.aliases.length, 0);
  const relationshipsTotal = knowledgeNotes.reduce((sum, note) => sum + note.relationships.length, 0);
  const observedCanonicalNotes = listItems.filter((item) => item.occurrences > 0).length;
  const avgCoOccurrencePerObservedNote = observedCanonicalNotes > 0
    ? Number(
        (
          knowledgeNotes.reduce((sum, note) => {
            const acc = accumulators.get(note.entityId);
            const total = Array.from(acc?.coOccurring.values() ?? []).reduce((inner, value) => inner + value, 0);
            return sum + total;
          }, 0) / observedCanonicalNotes
        ).toFixed(2),
      )
    : 0;

  const selectedNote: NoteWorkspaceSelectedNote | null = selectedListItem && selectedNoteEntity && selectedAccumulator
    ? {
        noteId: selectedListItem.noteId,
        canonicalName: selectedNoteEntity.canonicalName,
        description: selectedNoteEntity.description,
        status: selectedListItem.status,
        reviewStatus: selectedListItem.reviewStatus,
        occurrences: selectedListItem.occurrences,
        aliases: selectedNoteEntity.aliases.map((alias) => ({
          alias: alias.alias,
          aliasType: alias.aliasType ?? "unknown",
          locale: alias.locale ?? "n/a",
        })),
        topPerfumes: topFromCounter(selectedAccumulator.perfumes, 10),
        topBrands: topFromCounter(selectedAccumulator.brands, 10),
        topMainAccords: topFromCounter(selectedAccumulator.accords, 10),
        topCoOccurringNotes: topFromCounter(selectedAccumulator.coOccurring, 10),
        builderStatus: selectedNoteEntity.status,
        coveragePercent: selectedListItem.coveragePercent,
        builderMetadata: {
          source: selectedNoteEntity.provenance.source,
          method: selectedNoteEntity.provenance.method,
          generatedBy: selectedNoteEntity.generatedBy,
          version: selectedNoteEntity.version,
          schemaVersion: selectedNoteEntity.schemaVersion,
          createdAt: selectedNoteEntity.createdAt,
          updatedAt: selectedNoteEntity.updatedAt,
        },
      }
    : null;

  return {
    totalNotes: listItems.length,
    totalOccurrences,
    averageOccurrences: listItems.length > 0
      ? Number((totalOccurrences / listItems.length).toFixed(2))
      : 0,
    pendingReview: unresolvedRawCounts.size,
    coveragePercent: toPercent(matchedOccurrences, totalOccurrences),
    displayedNotes: listItems,
    selectedNote,
    statistics: {
      activeCanonicalNotes: listItems.filter((item) => item.status !== "not-observed").length,
      observedCanonicalNotes,
      unresolvedUniqueRawNotes: unresolvedRawCounts.size,
      unresolvedRawOccurrences: unresolvedOccurrences,
      unresolvedRawSharePercent: toPercent(unresolvedOccurrences, totalOccurrences),
      aliasesTotal,
      relationshipsTotal,
      avgAliasesPerNote: listItems.length > 0 ? Number((aliasesTotal / listItems.length).toFixed(2)) : 0,
      avgCoOccurrencePerObservedNote,
    },
    validation: {
      rawImportValid: payload.validation.valid,
      rawImportErrors: payload.validation.errors.length,
      rawImportWarnings: payload.validation.warnings.length,
    },
    review: {
      approved: reviewApproved,
      pending: reviewPending,
      notObserved: reviewNotObserved,
    },
    futureTranslationStatus: {
      state: unresolvedRawCounts.size > 0 ? "needs-review" : "ready",
      unresolvedUniqueRawNotes: unresolvedRawCounts.size,
    },
    builderMetadata: {
      workbookPath: payload.source.workbookPath,
      importVersion: payload.report.importVersion,
      builderVersion: config.pipelineVersion,
      generatedAt: new Date().toISOString(),
    },
  };
};
