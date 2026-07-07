export interface RawImportCell {
  columnIndex: number;
  header: string;
  value: unknown;
}

export interface RawImportRow {
  worksheetName: string;
  rowIndex: number;
  cells: RawImportCell[];
  rawValues: unknown[];
  rawRecord: Record<string, unknown>;
  parsed?: RawImportParsedFields;
}

export type RawNotesStructureType =
  | "empty"
  | "simple-array"
  | "grouped-object"
  | "unsupported";

export type RawNotesPreservedStructure =
  | {
      type: "empty";
      value: null;
    }
  | {
      type: "simple-array";
      value: string[];
    }
  | {
      type: "grouped-object";
      value: Record<string, string[]>;
    }
  | {
      type: "unsupported";
      value: unknown;
    };

export interface CanonicalRawNoteEntry {
  value: string;
  globalIndex: number;
  indexInGroup: number;
  group: string | null;
}

export interface RawNotesCanonicalRepresentation {
  detectedStructure: RawNotesStructureType;
  rawValue: unknown;
  preserved: RawNotesPreservedStructure;
  entries: CanonicalRawNoteEntry[];
}

export interface RawImportParsedFields {
  notes?: RawNotesCanonicalRepresentation;
}

export interface RawImportWorksheet {
  worksheetName: string;
  columns: string[];
  rows: RawImportRow[];
}

export interface RawImportRepositorySnapshot {
  totalRows: number;
  totalWorksheets: number;
  worksheets: RawImportWorksheet[];
}

export interface RawImportReport {
  rowsImported: number;
  worksheetsProcessed: string[];
  columnsDetected: Record<string, string[]>;
  notesStructuresDetected: Record<string, Record<RawNotesStructureType, number>>;
  missingColumns: Record<string, string[]>;
  duplicateIdentifiers: Array<{
    worksheetName: string;
    identifier: string;
    rowIndexes: number[];
  }>;
  emptyRows: Array<{
    worksheetName: string;
    rowIndex: number;
  }>;
  importDurationMs: number;
  importVersion: string;
}

export interface RawImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  duplicateIdentifiers: RawImportReport["duplicateIdentifiers"];
  missingColumns: RawImportReport["missingColumns"];
  emptyRows: RawImportReport["emptyRows"];
}

export interface WorkbookLoadResult {
  workbookPath: string;
  worksheetNames: string[];
}

export interface RawImportArtifactPayload {
  source: {
    workbookPath: string;
    worksheetNames: string[];
  };
  rawDatabase: RawImportRepositorySnapshot;
  report: RawImportReport;
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}
