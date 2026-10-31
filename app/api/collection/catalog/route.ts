import { NextRequest, NextResponse } from "next/server";
import {
  getMasterDatabaseSearchResult,
  readMasterFragranceRecordsForCollection,
} from "../../../../lib/database/masterFragranceDatabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (ids.length > 0) {
    const records = readMasterFragranceRecordsForCollection(ids);
    return NextResponse.json({ records }, { status: 200 });
  }

  const query = searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "8", 10);
  const limit = Number.isInteger(parsedLimit) ? Math.max(1, Math.min(50, parsedLimit)) : 8;
  const results = getMasterDatabaseSearchResult(query, limit);
  return NextResponse.json({ results }, { status: 200 });
}