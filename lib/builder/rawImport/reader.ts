import { mapHeaders } from "@/lib/builder/rawImport/headerMapper";
import {
  createInMemoryRawImportRepository,
  type RawImportRepository,
} from "@/lib/builder/rawImport/repository";
import { buildRawImportReport } from "@/lib/builder/rawImport/report";
import { buildRawRow } from "@/lib/builder/rawImport/rowReader";
import type {
  RawImportArtifactPayload,
  RawImportWorksheet,
} from "@/lib/builder/rawImport/types";
import { validateRawImport } from "@/lib/builder/rawImport/validator";
import { loadWorkbook } from "@/lib/builder/rawImport/workbookLoader";
import { readWorksheets } from "@/lib/builder/rawImport/worksheetReader";

export interface RawImportReaderInput {
  workbookPath: string;
  worksheetNames?: string[];
  requiredHeaders: string[];
  identifierColumn: string;
  importVersion: string;
}

export interface RawImportReader {
  read(input: RawImportReaderInput): RawImportArtifactPayload;
}

export class DefaultRawImportReader implements RawImportReader {
  private readonly repository: RawImportRepository;

  constructor(repository: RawImportRepository = createInMemoryRawImportRepository()) {
    this.repository = repository;
  }

  read(input: RawImportReaderInput): RawImportArtifactPayload {
    const start = Date.now();

    const workbook = loadWorkbook({
      workbookPath: input.workbookPath,
    });

    const worksheetRows = readWorksheets({
      workbook: workbook.workbook,
      requestedWorksheetNames: input.worksheetNames,
    });

    const worksheets: RawImportWorksheet[] = worksheetRows.map((worksheet) => {
      const headerRow = worksheet.rows[0] ?? [];
      const { headers } = mapHeaders(headerRow);

      const rows = [] as RawImportWorksheet["rows"];
      for (let index = 1; index < worksheet.rows.length; index += 1) {
        const rowValues = worksheet.rows[index] ?? [];
        rows.push(
          buildRawRow({
            worksheetName: worksheet.worksheetName,
            rowIndex: index + 1,
            rowValues,
            headers,
          }),
        );
      }

      return {
        worksheetName: worksheet.worksheetName,
        columns: headers,
        rows,
      };
    });

    this.repository.clear();
    this.repository.saveWorksheets(worksheets);
    const snapshot = this.repository.getSnapshot();

    const validation = validateRawImport({
      worksheets,
      requiredHeaders: input.requiredHeaders,
      identifierColumn: input.identifierColumn,
    });

    const report = buildRawImportReport({
      snapshot,
      validation,
      importDurationMs: Date.now() - start,
      importVersion: input.importVersion,
    });

    return {
      source: {
        workbookPath: workbook.workbookPath,
        worksheetNames: workbook.worksheetNames,
      },
      rawDatabase: snapshot,
      report,
      validation: {
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
      },
    };
  }
}

export const createDefaultRawImportReader = (): DefaultRawImportReader =>
  new DefaultRawImportReader();
