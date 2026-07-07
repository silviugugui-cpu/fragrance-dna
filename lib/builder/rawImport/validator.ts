import type {
  RawImportValidationResult,
  RawImportWorksheet,
} from "@/lib/builder/rawImport/types";

interface ValidateRawImportInput {
  worksheets: RawImportWorksheet[];
  requiredHeaders: string[];
  identifierColumn: string;
}

const emptyValidation = (): RawImportValidationResult => ({
  valid: true,
  errors: [],
  warnings: [],
  duplicateIdentifiers: [],
  missingColumns: {},
  emptyRows: [],
});

export const validateRawImport = (
  input: ValidateRawImportInput,
): RawImportValidationResult => {
  const result = emptyValidation();

  for (const worksheet of input.worksheets) {
    const missingColumns = input.requiredHeaders.filter(
      (header) => !worksheet.columns.includes(header),
    );

    if (missingColumns.length > 0) {
      result.missingColumns[worksheet.worksheetName] = missingColumns;
      result.valid = false;
      result.errors.push(
        `Missing required columns in ${worksheet.worksheetName}: ${missingColumns.join(", ")}`,
      );
    }

    const byIdentifier = new Map<string, number[]>();
    for (const row of worksheet.rows) {
      const identifierValue = row.rawRecord[input.identifierColumn];
      const identifier = String(identifierValue ?? "");

      if (identifier !== "") {
        const rows = byIdentifier.get(identifier) ?? [];
        rows.push(row.rowIndex);
        byIdentifier.set(identifier, rows);
      }

      const hasAnyValue = row.cells.some(
        (cell) => cell.value !== undefined && cell.value !== null && cell.value !== "",
      );
      if (!hasAnyValue) {
        result.emptyRows.push({
          worksheetName: worksheet.worksheetName,
          rowIndex: row.rowIndex,
        });
      }
    }

    for (const [identifier, rowIndexes] of byIdentifier.entries()) {
      if (rowIndexes.length > 1) {
        result.duplicateIdentifiers.push({
          worksheetName: worksheet.worksheetName,
          identifier,
          rowIndexes,
        });
      }
    }
  }

  result.warnings.push(
    "Raw import validation is non-transformative and preserves source values exactly as received.",
  );

  return result;
};
