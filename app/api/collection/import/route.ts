import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { readAllMasterFragrances, type MasterFragranceRecord } from "@/lib/database/masterFragranceDatabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_ROWS = 10_000;

const normalize = (value: unknown): string =>
  String(value ?? "").trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");

const brandAliases: Record<string, string> = {
  kilianparis: "bykilian",
  kilian: "bykilian",
  sospiro: "sospiroperfumes",
  initio: "initioparfumsprives",
};

const normalizeBrand = (value: unknown): string => {
  const key = normalize(value);
  return brandAliases[key] ?? key;
};

const canonicalKey = (brand: unknown, perfume: unknown): string =>
  `${normalizeBrand(brand)}::${normalize(perfume)}`;

const normalizeHeader = (value: unknown): string => normalize(value);

const getCell = (row: Record<string, unknown>, aliases: string[]): string => {
  const wanted = new Set(aliases.map(normalizeHeader));
  for (const [header, value] of Object.entries(row)) {
    if (!wanted.has(normalizeHeader(header))) continue;
    const text = value instanceof Date && Number.isFinite(value.getTime())
      ? value.toISOString().slice(0, 10)
      : String(value ?? "").trim();
    if (text) return text;
  }
  return "";
};

const parseBoolean = (value: string): boolean | undefined => {
  const normalized = normalize(value);
  if (["true", "yes", "y", "1", "owned", "own", "collected"].includes(normalized)) return true;
  if (["false", "no", "n", "0", "notowned", "wishlist", "want", "wanted"].includes(normalized)) return false;
  return undefined;
};

const parseRating = (value: string): number | undefined => {
  const rating = Number(value.replace(",", "."));
  if (!Number.isFinite(rating) || rating < 0 || rating > 10) return undefined;
  return rating;
};

const chooseImportSheet = (workbook: XLSX.WorkBook): string | null => {
  const preferred = workbook.SheetNames.find((name) => /collection|my fragrances|my perfumes/i.test(name));
  return preferred ?? workbook.SheetNames.find((name) => !/readme|source|legend/i.test(name)) ?? null;
};

type MatchedImport = {
  rowNumber: number;
  sourceFile: string;
  fragranceId: string;
  owned: boolean;
  wishlist: boolean;
  personalRating?: number;
  purchaseDate?: string;
  personalNotes?: string;
  alreadyInCollection: boolean;
  canonicalRecord: MasterFragranceRecord;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload must use multipart/form-data." }, { status: 400 });
  }

  const uploads = formData.getAll("files").filter((value): value is File =>
    typeof value !== "string" && typeof (value as File).arrayBuffer === "function",
  );
  if (uploads.length === 0) {
    return NextResponse.json({ error: "Select at least one Excel file." }, { status: 400 });
  }

  const oversized = uploads.find((file) => file.size > MAX_FILE_BYTES);
  if (oversized) {
    return NextResponse.json({ error: `${oversized.name} exceeds the 20 MB file limit.` }, { status: 413 });
  }

  const masterRecords = readAllMasterFragrances();
  const byIdentity = new Map<string, MasterFragranceRecord[]>();
  const byName = new Map<string, MasterFragranceRecord[]>();
  const byExternalId = new Map<string, MasterFragranceRecord>();
  for (const record of masterRecords) {
    const brand = String(record.brand ?? "").trim();
    const name = String(record.perfume ?? record.name ?? "").trim();
    const key = canonicalKey(brand, name);
    if (!brand || !name) continue;
    const identityMatches = byIdentity.get(key) ?? [];
    identityMatches.push(record);
    byIdentity.set(key, identityMatches);
    const nameMatches = byName.get(normalize(name)) ?? [];
    nameMatches.push(record);
    byName.set(normalize(name), nameMatches);
    for (const rawId of [record.id, record.canonicalKey, record.externalId]) {
      const id = normalize(rawId);
      if (id) byExternalId.set(id, record);
    }
  }

  const existingIds = new Set<string>();
  const existingIdsRaw = String(formData.get("existingIds") ?? "");
  try {
    const parsed = JSON.parse(existingIdsRaw) as unknown;
    if (Array.isArray(parsed)) parsed.forEach((id) => existingIds.add(String(id)));
  } catch {
    return NextResponse.json({ error: "Invalid collection ID list." }, { status: 400 });
  }

  const matched: MatchedImport[] = [];
  const unmatched: Array<{ sourceFile: string; rowNumber: number; brand: string; perfume: string; reason: string }> = [];
  let duplicateRows = 0;
  let totalRows = 0;
  const seenIds = new Set<string>();

  for (const file of uploads) {
    const workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), { cellDates: true });
    const sheetName = chooseImportSheet(workbook);
    if (!sheetName) {
      unmatched.push({ sourceFile: file.name, rowNumber: 0, brand: "", perfume: "", reason: "No collection worksheet found." });
      continue;
    }
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: "" });
    if (rows.length > MAX_ROWS) {
      return NextResponse.json({ error: `${file.name} exceeds the ${MAX_ROWS.toLocaleString()} row limit.` }, { status: 413 });
    }

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const brand = getCell(row, ["brand", "brand name", "house", "designer", "maker"]);
      const perfume = getCell(row, ["perfume", "perfume name", "perfume_name", "fragrance", "fragrance name", "fragrance_name", "product", "product name", "name", "scent"]);
      const importId = getCell(row, ["fragrance id", "fragrance_id", "canonical key", "canonical_key", "external id", "external_id", "id"]);
      if (!brand && !perfume && !importId) continue;
      totalRows += 1;

      let candidates: MasterFragranceRecord[] = [];
      const idMatch = importId ? byExternalId.get(normalize(importId)) : undefined;
      if (idMatch) candidates = [idMatch];
      else if (brand && perfume) candidates = byIdentity.get(canonicalKey(brand, perfume)) ?? [];
      else if (perfume) candidates = byName.get(normalize(perfume)) ?? [];

      if (candidates.length !== 1) {
        unmatched.push({
          sourceFile: file.name,
          rowNumber,
          brand,
          perfume,
          reason: candidates.length > 1 ? "Ambiguous brand/name; add brand or a canonical ID." : "No exact canonical record match.",
        });
        continue;
      }

      const canonicalRecord = candidates[0];
      const fragranceId = String(canonicalRecord.id ?? canonicalRecord.canonicalKey ?? "").trim();
      if (!fragranceId || seenIds.has(fragranceId)) {
        duplicateRows += 1;
        continue;
      }
      seenIds.add(fragranceId);

      const status = normalize(getCell(row, ["collection status", "status", "list"]));
      const wishlistCell = parseBoolean(getCell(row, ["wishlist", "want", "wish list"]));
      const ownedCell = parseBoolean(getCell(row, ["owned", "own", "collected"]));
      const wishlist = wishlistCell ?? (status === "wishlist" || status === "want");
      const owned = ownedCell ?? (!wishlist && status !== "notowned");
      const rawRating = getCell(row, ["personal rating", "personal_rating", "my rating", "my_rating", "personal score"]);
      const rawPurchaseDate = getCell(row, ["purchase date", "purchase_date", "date purchased", "acquired"]);
      const personalNotes = getCell(row, ["personal notes", "personal_notes", "my notes", "collection notes", "wear notes"]);

      matched.push({
        rowNumber,
        sourceFile: file.name,
        fragranceId,
        owned,
        wishlist,
        personalRating: rawRating ? parseRating(rawRating) : undefined,
        purchaseDate: rawPurchaseDate || undefined,
        personalNotes: personalNotes || undefined,
        alreadyInCollection: existingIds.has(fragranceId),
        canonicalRecord,
      });
    }
  }

  return NextResponse.json({
    totalRows,
    matched,
    unmatched,
    duplicateRows,
    alreadyInCollection: matched.filter((row) => row.alreadyInCollection).length,
    addedCandidates: matched.filter((row) => !row.alreadyInCollection).length,
  }, { status: 200 });
}