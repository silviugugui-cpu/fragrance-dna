import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { createBuilderConfig } from '@/lib/builder/config';
import { createCanonicalNotesKnowledgeEntities } from '@/lib/builder/knowledge/canonicalNotes';
import { createDefaultRawImportReader } from '@/lib/builder/rawImport';
import {
  parseMainAccordsList,
  parseNotesList,
} from '@/lib/builder/validationEngine/rules/ValidationPackTypes';

export type BrandWorkspaceStatus = 'healthy' | 'review-needed' | 'not-observed';
export type BrandReviewStatus = 'approved' | 'pending-review';

export interface BrandWorkspaceListItem {
  brandId: string;
  brandName: string;
  perfumeCount: number;
  status: BrandWorkspaceStatus;
  reviewStatus: BrandReviewStatus;
  coveragePercent: number;
}

export interface BrandWorkspaceSelectedBrand {
  brandId: string;
  brandName: string;
  perfumeCount: number;
  launchYearDistribution: Array<{ label: string; count: number }>;
  topPerfumes: Array<{ label: string; count: number }>;
  topNotes: Array<{ label: string; count: number }>;
  topMainAccords: Array<{ label: string; count: number }>;
  builderStatus: string;
  knowledgeCoveragePercent: number;
  reviewStatus: BrandReviewStatus;
}

export interface BrandsWorkspaceResult {
  totalBrands: number;
  totalPerfumes: number;
  averagePerfumesPerBrand: number;
  pendingReview: number;
  builderCoveragePercent: number;
  displayedBrands: BrandWorkspaceListItem[];
  selectedBrand: BrandWorkspaceSelectedBrand | null;
  statistics: {
    healthyBrands: number;
    reviewNeededBrands: number;
    totalRows: number;
    mappedNoteOccurrences: number;
    totalNoteOccurrences: number;
  };
  validation: {
    rawImportValid: boolean;
    rawImportErrors: number;
    rawImportWarnings: number;
  };
  intelligenceSummary: {
    topKnowledgeDenseBrands: Array<{ label: string; count: number }>;
    topCoverageBrands: Array<{ label: string; count: number }>;
  };
  builderMetadata: {
    workbookPath: string;
    importVersion: string;
    builderVersion: string;
    generatedAt: string;
  };
}

interface BrandAccumulator {
  brandName: string;
  perfumes: Map<string, number>;
  launchYears: Map<string, number>;
  notes: Map<string, number>;
  accords: Map<string, number>;
  mappedNoteOccurrences: number;
  totalNoteOccurrences: number;
  coverageAccumulator: number;
  rows: number;
  validationIssues: number;
}

const normalizeText = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ');

const pickText = (record: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return '';
};

const resolveReadableWorkbookPath = (configuredPath: string): string => {
  const configuredAbsolute = path.resolve(configuredPath);
  if (fs.existsSync(configuredAbsolute)) {
    return configuredAbsolute;
  }

  const preferred = path.resolve(process.cwd(), 'public', 'RawPerfumeDatabase.xlsx');
  if (fs.existsSync(preferred)) {
    return preferred;
  }

  const fallback = path.resolve(process.cwd(), 'public', 'FragranceDNA_RawPerfumeDatabase_Export.xlsx');
  if (fs.existsSync(fallback)) {
    return fallback;
  }

  return configuredAbsolute;
};

const bump = (map: Map<string, number>, key: string): void => {
  if (!key) {
    return;
  }
  map.set(key, (map.get(key) ?? 0) + 1);
};

const topFromCounter = (map: Map<string, number>, limit: number): Array<{ label: string; count: number }> =>
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

const isValidLaunchYear = (raw: string): boolean => {
  if (!/^\d{4}$/.test(raw)) {
    return false;
  }
  const year = Number.parseInt(raw, 10);
  const currentYear = new Date().getUTCFullYear();
  return year >= 1800 && year <= currentYear;
};

const computeStatus = (averageCoverage: number, perfumeCount: number): BrandWorkspaceStatus => {
  if (perfumeCount <= 0) {
    return 'not-observed';
  }
  if (averageCoverage >= 80) {
    return 'healthy';
  }
  return 'review-needed';
};

export const loadBrandsWorkspaceData = (): BrandsWorkspaceResult => {
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

  const brandMap = new Map<string, BrandAccumulator>();
  const globalPerfumeSet = new Set<string>();
  let totalRows = 0;

  for (const worksheet of payload.rawDatabase.worksheets) {
    for (const row of worksheet.rows) {
      totalRows += 1;
      const brand = pickText(row.rawRecord, ['brand', 'brand_name', 'house']) || 'Unknown Brand';
      const perfume = pickText(row.rawRecord, ['perfume', 'name', 'fragrance']) || `Unnamed #${row.rowIndex}`;
      const launchYear = String(row.rawRecord.launch_year ?? '').trim();

      const notesParsed = parseNotesList(row.rawRecord.notes);
      const accordsParsed = parseMainAccordsList(row.rawRecord.main_accords);
      const notes = notesParsed.items;
      const accords = accordsParsed.items;

      const brandId = normalizeText(brand);
      const current =
        brandMap.get(brandId) ??
        {
          brandName: brand,
          perfumes: new Map<string, number>(),
          launchYears: new Map<string, number>(),
          notes: new Map<string, number>(),
          accords: new Map<string, number>(),
          mappedNoteOccurrences: 0,
          totalNoteOccurrences: 0,
          coverageAccumulator: 0,
          rows: 0,
          validationIssues: 0,
        };

      bump(current.perfumes, perfume);
      if (launchYear) {
        bump(current.launchYears, launchYear);
      }
      for (const note of notes) {
        bump(current.notes, note);
        current.totalNoteOccurrences += 1;
        if (noteLookup.has(normalizeText(note))) {
          current.mappedNoteOccurrences += 1;
        }
      }
      for (const accord of accords) {
        bump(current.accords, accord);
      }

      const checks = {
        brand: brand.trim().length > 0,
        perfume: perfume.trim().length > 0,
        launchYear: launchYear.length === 0 || isValidLaunchYear(launchYear),
        notes: notes.length > 0 && !notesParsed.isInvalidStructure,
        accords: accords.length > 0 && !accordsParsed.isInvalidStructure,
      };

      const coverageChecks = Object.values(checks).filter(Boolean).length;
      const rowCoverage = (coverageChecks / 5) * 100;
      current.coverageAccumulator += rowCoverage;
      current.rows += 1;

      if (!checks.launchYear) {
        current.validationIssues += 1;
      }
      if (notesParsed.isInvalidStructure || accordsParsed.isInvalidStructure) {
        current.validationIssues += 1;
      }

      brandMap.set(brandId, current);
      globalPerfumeSet.add(`${brandId}::${normalizeText(perfume)}`);
    }
  }

  const displayedBrands: BrandWorkspaceListItem[] = Array.from(brandMap.entries())
    .map(([brandId, acc]) => {
      const perfumeCount = acc.perfumes.size;
      const avgCoverage = acc.rows > 0 ? acc.coverageAccumulator / acc.rows : 0;
      const status = computeStatus(avgCoverage, perfumeCount);
      const knowledgeCoveragePercent = toPercent(acc.mappedNoteOccurrences, acc.totalNoteOccurrences);
      const reviewStatus: BrandReviewStatus =
        status === 'healthy' && acc.validationIssues === 0 && knowledgeCoveragePercent >= 60
          ? 'approved'
          : 'pending-review';

      return {
        brandId,
        brandName: acc.brandName,
        perfumeCount,
        status,
        reviewStatus,
        coveragePercent: Number(avgCoverage.toFixed(2)),
      };
    })
    .sort((left, right) => {
      if (right.perfumeCount !== left.perfumeCount) {
        return right.perfumeCount - left.perfumeCount;
      }
      return left.brandName.localeCompare(right.brandName);
    });

  const selectedListItem = displayedBrands[0] ?? null;
  const selectedAccumulator = selectedListItem ? brandMap.get(selectedListItem.brandId) ?? null : null;

  const selectedBrand: BrandWorkspaceSelectedBrand | null =
    selectedListItem && selectedAccumulator
      ? {
          brandId: selectedListItem.brandId,
          brandName: selectedListItem.brandName,
          perfumeCount: selectedListItem.perfumeCount,
          launchYearDistribution: topFromCounter(selectedAccumulator.launchYears, 12),
          topPerfumes: topFromCounter(selectedAccumulator.perfumes, 12),
          topNotes: topFromCounter(selectedAccumulator.notes, 12),
          topMainAccords: topFromCounter(selectedAccumulator.accords, 12),
          builderStatus: selectedListItem.status === 'healthy' ? 'complete' : 'review-needed',
          knowledgeCoveragePercent: toPercent(
            selectedAccumulator.mappedNoteOccurrences,
            selectedAccumulator.totalNoteOccurrences,
          ),
          reviewStatus: selectedListItem.reviewStatus,
        }
      : null;

  const pendingReview = displayedBrands.filter((item) => item.reviewStatus === 'pending-review').length;
  const totalBrands = displayedBrands.length;
  const totalPerfumes = globalPerfumeSet.size;
  const builderCoveragePercent =
    totalBrands > 0
      ? Number(
          (
            displayedBrands.reduce((sum, item) => sum + item.coveragePercent, 0) /
            totalBrands
          ).toFixed(2),
        )
      : 0;

  const healthyBrands = displayedBrands.filter((item) => item.status === 'healthy').length;
  const reviewNeededBrands = displayedBrands.filter((item) => item.status === 'review-needed').length;

  return {
    totalBrands,
    totalPerfumes,
    averagePerfumesPerBrand: totalBrands > 0 ? Number((totalPerfumes / totalBrands).toFixed(2)) : 0,
    pendingReview,
    builderCoveragePercent,
    displayedBrands,
    selectedBrand,
    statistics: {
      healthyBrands,
      reviewNeededBrands,
      totalRows,
      mappedNoteOccurrences: Array.from(brandMap.values()).reduce(
        (sum, item) => sum + item.mappedNoteOccurrences,
        0,
      ),
      totalNoteOccurrences: Array.from(brandMap.values()).reduce(
        (sum, item) => sum + item.totalNoteOccurrences,
        0,
      ),
    },
    validation: {
      rawImportValid: payload.validation.valid,
      rawImportErrors: payload.validation.errors.length,
      rawImportWarnings: payload.validation.warnings.length,
    },
    intelligenceSummary: {
      topKnowledgeDenseBrands: Array.from(brandMap.values())
        .map((item) => ({
          label: item.brandName,
          count: Number(toPercent(item.mappedNoteOccurrences, item.totalNoteOccurrences).toFixed(2)),
        }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 8),
      topCoverageBrands: displayedBrands
        .map((item) => ({ label: item.brandName, count: item.coveragePercent }))
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
