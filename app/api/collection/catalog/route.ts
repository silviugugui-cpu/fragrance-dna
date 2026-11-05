import { NextRequest, NextResponse } from "next/server";
import {
  getMasterDatabaseSearchResult,
  readMasterFragranceRecordsForCollection,
  type MasterFragranceRecord,
} from "../../../../lib/database/masterFragranceDatabase";
import { reviewedTerritories } from "@/lib/collection/territoryCoverage";
import { publicBrandType } from "@/lib/fragranceClassification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const publicRecord = (record: MasterFragranceRecord): MasterFragranceRecord => ({
  id: record.id, canonicalKey: record.canonicalKey, name: record.name,
  perfume: record.perfume, brand: record.brand, brandType: publicBrandType(record.brandType),
  launchYear: record.launchYear, perfumer: record.perfumer, gender: record.gender,
  localImagePath: record.localImagePath, imageUrl: record.imageUrl,
  notes: record.notes, mainAccords: record.mainAccords, description: record.description,
  confidence: record.confidence, badges: record.badges,
  reviewedTerritories: reviewedTerritories(record.reviewedTerritories),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (ids.length > 0) {
    const records = readMasterFragranceRecordsForCollection(ids).map(publicRecord);
    return NextResponse.json({ records }, { status: 200 });
  }

  const query = searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "8", 10);
  const limit = Number.isInteger(parsedLimit) ? Math.max(1, Math.min(50, parsedLimit)) : 8;
  const results = getMasterDatabaseSearchResult(query, limit).map(publicRecord);
  return NextResponse.json({ results }, { status: 200 });
}