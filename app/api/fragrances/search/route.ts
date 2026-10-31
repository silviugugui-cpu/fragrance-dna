import { NextResponse, type NextRequest } from "next/server";
import {
  searchMasterFragrances,
  type FragranceSearchFilters,
  type MasterFragranceRecord,
} from "@/lib/database/masterFragranceDatabase";

export const dynamic = "force-dynamic";

// Public filter vocabularies, mapped to internal database values.
const BRAND_TYPES: Record<string, string> = {
  niche: "Niche",
  designer: "Designer",
  dupe: "Dupe/Middle Eastern",
};

const AUDIENCES: Record<string, string> = {
  men: "for men",
  women: "for women",
  unisex: "for women and men",
};

// Seasons are derived from main accords, following common perfumery conventions.
const SEASON_ACCORDS: Record<string, string[]> = {
  spring: ["floral", "white floral", "green", "rose", "iris", "violet", "powdery", "lavender", "yellow floral", "tuberose"],
  summer: ["citrus", "fresh", "aquatic", "marine", "ozonic", "tropical", "fresh spicy", "herbal", "salty"],
  autumn: ["woody", "earthy", "mossy", "leather", "patchouli", "warm spicy", "soft spicy", "smoky", "oud"],
  winter: ["vanilla", "sweet", "amber", "balsamic", "caramel", "honey", "cinnamon", "tobacco", "lactonic"],
};

const ERAS: Record<string, { yearFrom?: number; yearTo?: number }> = {
  "2020s": { yearFrom: 2020 },
  "2010s": { yearFrom: 2010, yearTo: 2019 },
  "2000s": { yearFrom: 2000, yearTo: 2009 },
  "1990s": { yearFrom: 1990, yearTo: 1999 },
  classics: { yearTo: 1989 },
};

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

// Some sources rate on a 0-10 scale; normalize display to the 0-5 scale.
const normalizedRating = (value: unknown): string | undefined => {
  const raw = Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(raw) || raw <= 0) return undefined;
  const scaled = raw > 5 ? raw / 2 : raw;
  return (Math.round(scaled * 100) / 100).toString();
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
  rating: normalizedRating(record.rating),
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

  const filters: FragranceSearchFilters = { query };

  const type = searchParams.get("type")?.trim().toLowerCase() ?? "";
  if (type) {
    if (!BRAND_TYPES[type]) {
      return NextResponse.json({ error: "Unknown category filter" }, { status: 400 });
    }
    filters.brandType = BRAND_TYPES[type];
  }

  const audience = searchParams.get("audience")?.trim().toLowerCase() ?? "";
  if (audience) {
    if (!AUDIENCES[audience]) {
      return NextResponse.json({ error: "Unknown audience filter" }, { status: 400 });
    }
    filters.gender = AUDIENCES[audience];
  }

  const season = searchParams.get("season")?.trim().toLowerCase() ?? "";
  if (season) {
    if (!SEASON_ACCORDS[season]) {
      return NextResponse.json({ error: "Unknown season filter" }, { status: 400 });
    }
    filters.anyAccords = SEASON_ACCORDS[season];
  }

  const era = searchParams.get("era")?.trim().toLowerCase() ?? "";
  if (era) {
    if (!ERAS[era]) {
      return NextResponse.json({ error: "Unknown era filter" }, { status: 400 });
    }
    filters.yearFrom = ERAS[era].yearFrom;
    filters.yearTo = ERAS[era].yearTo;
  }

  const brand = searchParams.get("brand")?.trim() ?? "";
  if (brand) filters.brand = brand;

  const accord = searchParams.get("accord")?.trim().toLowerCase() ?? "";
  if (accord) filters.accord = accord;

  const minRating = Number.parseFloat(searchParams.get("minRating") ?? "");
  if (Number.isFinite(minRating) && minRating > 0) filters.minRating = Math.min(5, minRating);

  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "36", 10);
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(60, parsedLimit)) : 36;

  try {
    const results = searchMasterFragrances(filters, limit).map(toPublicFragrance);
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fragrance search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
