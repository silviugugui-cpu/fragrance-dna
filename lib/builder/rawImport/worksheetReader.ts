import { utils, type WorkBook } from "xlsx";

export interface WorksheetReadInput {
  workbook: WorkBook;
  requestedWorksheetNames?: string[];
}

export interface WorksheetReadResult {
  worksheetName: string;
  rows: unknown[][];
}

export const readWorksheets = (
  input: WorksheetReadInput,
): WorksheetReadResult[] => {
  const requested = input.requestedWorksheetNames;
  const worksheetNames = requested && requested.length > 0
    ? requested.filter((worksheetName) => input.workbook.SheetNames.includes(worksheetName))
    : input.workbook.SheetNames.slice();

  return worksheetNames.map((worksheetName) => {
    const sheet = input.workbook.Sheets[worksheetName];
    const rows = utils.sheet_to_json(sheet, {
      header: 1,
      raw: true,
      blankrows: true,
      defval: undefined,
    }) as unknown[][];

    return {
      worksheetName,
      rows,
    };
  });
};
