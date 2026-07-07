import fs from "node:fs";
import path from "node:path";
import {
  readFile,
  set_fs,
  type WorkBook,
} from "xlsx";

set_fs(fs);

export interface WorkbookLoadInput {
  workbookPath: string;
}

export interface WorkbookLoadOutput {
  workbook: WorkBook;
  workbookPath: string;
  worksheetNames: string[];
}

export const loadWorkbook = (input: WorkbookLoadInput): WorkbookLoadOutput => {
  const workbookPath = path.resolve(input.workbookPath);
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Workbook file not found: ${workbookPath}`);
  }

  const workbook = readFile(workbookPath, {
    cellDates: false,
    dense: false,
    raw: true,
  });

  return {
    workbook,
    workbookPath,
    worksheetNames: workbook.SheetNames.slice(),
  };
};
