import { NextResponse } from "next/server";
import { resolveCanonicalAttribute } from "@/lib/intelligence/attributes";
import { type MasterFragranceRecord } from "@/lib/database/masterFragranceDatabase";
import { readPurchaseRecommendationFragrances } from "@/lib/database/curatedCatalog";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { parseBadgeFilters, type BadgeFilters } from "@/lib/fragranceBadges";
import { parseEvaluationRecords } from "@/lib/test/evaluationSession";
import { projectPreferences, preferenceCompatibility, knownAttributeIds } from "@/lib/test/preferenceLearning";

export const dynamic = "force-dynamic";

const toStringList = (value: unknown): string[] => Array.isArray(value)
  ? value.map((entry) => String(entry ?? "").trim()).filter(Boolean)
  : [];

const getRecordId = (record: MasterFragranceRecord): string =>
  String(record.id ?? record.canonicalKey ?? "").trim();

const getEvidence = (record: MasterFragranceRecord) => {
  const evidence = [...toStringList(record.notes), ...toStringList(record.mainAccords)];
  const attributes = new Map<string, ReturnType<typeof resolveCanonicalAttribute>>();
  for (const value of evidence) {
    const resolved = resolveCanonicalAttribute(value);
    if (resolved) attributes.set(resolved.canonicalAttributeId, resolved);
  }
  return [...attributes.values()].filter((attribute): attribute is NonNullable<typeof attribute> => Boolean(attribute));
};

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid recommendation request." }, { status: 400 });
  }

  let badgeFilters: BadgeFilters;
  try {
    const raw = payload.badgeFilters;
    if (raw !== undefined && (!raw || typeof raw !== "object" || Array.isArray(raw))) {
      throw new Error("Invalid badge filters.");
    }
    const input = (raw ?? {}) as Record<string, unknown>;
    badgeFilters = parseBadgeFilters({ get: (name) => {
      const value = input[name];
      if (value !== undefined && typeof value !== "string") throw new Error("Invalid badge filter value.");
      return value ?? null;
    } });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid badge filters." }, { status: 400 });
  }

  const ownedIds = new Set(toStringList(payload.ownedFragranceIds).slice(0, 1000));
  const grounding = payload.groundingProfile && typeof payload.groundingProfile === "object"
    ? payload.groundingProfile as Record<string, unknown>
    : {};
  let preferenceProjection: ReturnType<typeof projectPreferences>;
  try {
    const records = parseEvaluationRecords(payload.evaluations ?? []);
    const known = knownAttributeIds();
    if (records.length > 2000 || records.some((record) => record.attributeIds.some((id) => !known.has(id)))) throw new Error("Invalid preference evidence.");
    preferenceProjection = projectPreferences(records, {
      love: toStringList(grounding.love), neutral: toStringList(grounding.neutral), redFlag: toStringList(grounding.redFlag),
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid preference evidence." }, { status: 400 });
  }
  const requestedLimit = Number(payload.limit ?? 30);
  const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(100, Math.floor(requestedLimit))) : 30;
  // Localized explanation templates; defaults to English for unknown/missing locales.
  const dictionary = getDictionary(typeof payload.locale === "string" ? payload.locale : undefined).recommendations;

  const recordsById = new Map<string, MasterFragranceRecord>();
  let candidates: MasterFragranceRecord[];
  try {
    candidates = readPurchaseRecommendationFragrances(badgeFilters);
  } catch (error: unknown) {
    console.error("[recommendations] Selected catalog unavailable.", error);
    return NextResponse.json({ error: "The selected fragrance catalog is unavailable." }, { status: 503 });
  }
  for (const record of candidates) {
    const id = getRecordId(record);
    if (!id || ownedIds.has(id)) continue;
    const current = recordsById.get(id);
    const currentEvidence = current ? getEvidence(current).length : -1;
    if (!current || getEvidence(record).length > currentEvidence) recordsById.set(id, record);
  }

  const ranked = [...recordsById.entries()].flatMap(([id, record]) => {
    const evidence = getEvidence(record);
    if (evidence.length < 3) return [];

    const lovedMatches = evidence.filter((attribute) => (preferenceProjection.attributes[attribute.canonicalAttributeId]?.affinity ?? 0) > 0);
    const score = preferenceCompatibility(evidence.map((attribute) => attribute.canonicalAttributeId), id, preferenceProjection);
    const matchedAttributes = evidence.map((attribute) => attribute.displayName).slice(0, 5);
    const explanation = lovedMatches.length > 0
      ? dictionary.explanationAligned(lovedMatches.map((attribute) => attribute.displayName).slice(0, 3).join(", "))
      : dictionary.explanationRanked;

    return [{
      fragranceId: id,
      perfume: String(record.perfume ?? record.name ?? "").trim(),
      brand: String(record.brand ?? "").trim(),
      imageUrl: String(record.imageUrl ?? "").trim(),
      localImagePath: String(record.localImagePath ?? "").trim(),
      badges: record.badges,
      score,
      matchedAttributes,
      explanation,
    }];
  }).sort((left, right) => right.score - left.score || left.perfume.localeCompare(right.perfume));

  return NextResponse.json({ recommendations: ranked.slice(0, limit), totalEligible: ranked.length }, { status: 200 });
}
