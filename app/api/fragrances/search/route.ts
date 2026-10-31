import { NextResponse, type NextRequest } from "next/server";
import {
  getMasterDatabaseSearchResult,
  type MasterFragranceRecord,
} from "@/lib/database/masterFragranceDatabase";

export const dynamic = "force-dynamic";

export interface PublicFragrance {
  id: string;
  brand: string;
  perfume: string;
  brandType?: string;
  launchYear?: string;
  gender?: string;
  perfumer?: string;
  rating?: string;
  voteCount?: string;
  mainAccords: string[];
  description?: string;
  imageUrl?: string;
  localImagePath?: string;
  dnaAxes?: Record<string, number>;
}

const text = (value: unknown): string | undefined => {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : undefined;
};

// Expose only consumer-facing fields; internal pipeline metadata
// (source, confidence, status, fingerprints, external links) stays private.
const toPublicFragrance = (record: MasterFragranceRecord): PublicFragrance => ({
  id: text(record.externalId) ?? text(record.canonicalKey) ?? `${record.brand}-${record.perfume}`,
  brand: text(record.brand) ?? "",
  perfume: text(record.perfume ?? record.name) ?? "",
  brandType: text(record.brandType),
  launchYear: text(record.launchYear),
  gender: text(record.gender),
  perfumer: text(record.perfumer),
  rating: text(record.rating),
  voteCount: text(record.voteCount),
  mainAccords: Array.isArray(record.mainAccords)
    ? record.mainAccords.map((accord) => String(accord)).filter(Boolean)
    : [],
  description: text(record.description),
  imageUrl: text(record.imageUrl),
  localImagePath: text(record.localImagePath),
  dnaAxes: record.userDnaProfiles?.[0]?.dna_axes,
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "24", 10);
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(60, parsedLimit)) : 24;

  try {
    const results = getMasterDatabaseSearchResult(query, limit).map(toPublicFragrance);
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fragrance search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
