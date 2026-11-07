import { NextResponse, type NextRequest } from "next/server";
import {
  listMasterFragranceBrandSummaries,
  listMasterFragranceBrands,
} from "@/lib/database/masterFragranceDatabase";

export const dynamic = "force-dynamic";

const BRAND_TYPES: Record<string, string> = {
  niche: "Niche",
  designer: "Designer",
  dupe: "inspired_by",
};

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type")?.trim().toLowerCase() ?? "";
  if (type && !BRAND_TYPES[type]) {
    return NextResponse.json({ error: "Unknown category filter" }, { status: 400 });
  }

  try {
    const brands = listMasterFragranceBrands(type ? BRAND_TYPES[type] : undefined);
    const summaries = listMasterFragranceBrandSummaries(type ? BRAND_TYPES[type] : undefined);
    return NextResponse.json(
      { brands, summaries },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Brand list failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
