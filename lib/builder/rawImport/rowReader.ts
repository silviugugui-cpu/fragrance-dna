import { parseRawNotesValue } from "@/lib/builder/rawImport/notesParser";
import type { RawImportCell, RawImportRow } from "@/lib/builder/rawImport/types";

interface BuildRawRowInput {
  worksheetName: string;
  rowIndex: number;
  rowValues: unknown[];
  headers: string[];
}

export const buildRawRow = (input: BuildRawRowInput): RawImportRow => {
  const cells: RawImportCell[] = [];
  const rawRecord: Record<string, unknown> = {};
  const parsed: NonNullable<RawImportRow["parsed"]> = {};

  for (let columnIndex = 0; columnIndex < input.headers.length; columnIndex += 1) {
    const header = input.headers[columnIndex] ?? "";
    const value = input.rowValues[columnIndex];

    cells.push({
      columnIndex,
      header,
      value,
    });

    rawRecord[header] = value;

    if (header === "notes") {
      parsed.notes = parseRawNotesValue(value);
    }
  }

  return {
    worksheetName: input.worksheetName,
    rowIndex: input.rowIndex,
    cells,
    rawValues: input.rowValues.slice(),
    rawRecord,
    parsed,
  };
};

export const isEmptyRawRow = (rowValues: unknown[]): boolean => {
  for (const value of rowValues) {
    if (value !== undefined && value !== null && value !== "") {
      return false;
    }
  }

  return true;
};
