export interface HeaderMapResult {
  headers: string[];
  headerIndexes: Map<number, string>;
}

export const mapHeaders = (headerRow: unknown[]): HeaderMapResult => {
  const headers: string[] = [];
  const headerIndexes = new Map<number, string>();

  for (let index = 0; index < headerRow.length; index += 1) {
    const value = headerRow[index];
    const header = typeof value === "string" ? value : String(value ?? "");
    headers.push(header);
    headerIndexes.set(index, header);
  }

  return {
    headers,
    headerIndexes,
  };
};
