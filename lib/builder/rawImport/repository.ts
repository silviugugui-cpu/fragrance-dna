import type {
  RawImportRepositorySnapshot,
  RawImportWorksheet,
} from "@/lib/builder/rawImport/types";

export interface RawImportRepository {
  saveWorksheets(worksheets: RawImportWorksheet[]): void;
  getSnapshot(): RawImportRepositorySnapshot;
  clear(): void;
}

export class InMemoryRawImportRepository implements RawImportRepository {
  private worksheets: RawImportWorksheet[] = [];

  saveWorksheets(worksheets: RawImportWorksheet[]): void {
    this.worksheets = worksheets;
  }

  getSnapshot(): RawImportRepositorySnapshot {
    const totalRows = this.worksheets.reduce(
      (total, worksheet) => total + worksheet.rows.length,
      0,
    );

    return {
      totalRows,
      totalWorksheets: this.worksheets.length,
      worksheets: this.worksheets,
    };
  }

  clear(): void {
    this.worksheets = [];
  }
}

export const createInMemoryRawImportRepository = (): InMemoryRawImportRepository =>
  new InMemoryRawImportRepository();
