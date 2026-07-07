import type {
  RawImportReport,
  RawImportRepositorySnapshot,
  RawImportValidationResult,
} from "@/lib/builder/rawImport/types";

interface BuildRawImportReportInput {
  snapshot: RawImportRepositorySnapshot;
  validation: RawImportValidationResult;
  importDurationMs: number;
  importVersion: string;
}

export const buildRawImportReport = (
  input: BuildRawImportReportInput,
): RawImportReport => {
  const worksheetsProcessed = input.snapshot.worksheets.map(
    (worksheet) => worksheet.worksheetName,
  );

  const columnsDetected: Record<string, string[]> = {};
  const notesStructuresDetected: RawImportReport["notesStructuresDetected"] = {};
  for (const worksheet of input.snapshot.worksheets) {
    columnsDetected[worksheet.worksheetName] = worksheet.columns.slice();

    const structureCounters: RawImportReport["notesStructuresDetected"][string] = {
      empty: 0,
      "simple-array": 0,
      "grouped-object": 0,
      unsupported: 0,
    };

    for (const row of worksheet.rows) {
      const structure = row.parsed?.notes?.detectedStructure;
      if (structure) {
        structureCounters[structure] += 1;
      }
    }

    notesStructuresDetected[worksheet.worksheetName] = structureCounters;
  }

  return {
    rowsImported: input.snapshot.totalRows,
    worksheetsProcessed,
    columnsDetected,
    notesStructuresDetected,
    missingColumns: input.validation.missingColumns,
    duplicateIdentifiers: input.validation.duplicateIdentifiers,
    emptyRows: input.validation.emptyRows,
    importDurationMs: input.importDurationMs,
    importVersion: input.importVersion,
  };
};
