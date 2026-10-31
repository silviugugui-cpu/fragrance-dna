import { NextResponse } from "next/server";
import { resolveCanonicalAttribute } from "@/lib/intelligence/attributes";
import { readAllMasterFragrances, type MasterFragranceRecord } from "@/lib/database/masterFragranceDatabase";
import type { OlfactoryVector } from "@/lib/types";

export const dynamic = "force-dynamic";

const AXES: Array<keyof OlfactoryVector> = [
  "freshness",
  "warmth",
  "sweetness",
  "darkness",
  "cleanliness",
  "elegance",
];

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
const toStringList = (value: unknown): string[] => Array.isArray(value)
  ? value.map((entry) => String(entry ?? "").trim()).filter(Boolean)
  : [];

const readVector = (value: unknown): OlfactoryVector | null => {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const values = AXES.map((axis) => Number(input[axis]));
  if (values.some((entry) => !Number.isFinite(entry))) return null;
  return Object.fromEntries(AXES.map((axis) => [axis, clamp01(Number(input[axis]))])) as OlfactoryVector;
};

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

const buildCandidateVector = (attributes: NonNullable<ReturnType<typeof resolveCanonicalAttribute>>[]): OlfactoryVector => {
  const result = {} as OlfactoryVector;
  for (const axis of AXES) {
    const values = attributes
      .map((attribute) => attribute.vectorMapping[axis])
      .filter((value): value is number => typeof value === "number");
    result[axis] = values.length > 0
      ? clamp01(values.reduce((sum, value) => sum + value, 0) / values.length)
      : 0.5;
  }
  return result;
};

const scoreVector = (user: OlfactoryVector, candidate: OlfactoryVector): number => {
  const averageDifference = AXES.reduce((sum, axis) => sum + Math.abs(user[axis] - candidate[axis]), 0) / AXES.length;
  return clamp01(1 - averageDifference);
};

const resolveGroundingIds = (values: string[]): Set<string> => {
  const resolved = new Set<string>();
  for (const value of values) {
    const definition = resolveCanonicalAttribute(value);
    const expanded = definition?.metadata.groundingExpansionTokens ?? [value];
    for (const token of expanded) {
      const attribute = resolveCanonicalAttribute(token);
      if (attribute) resolved.add(attribute.canonicalAttributeId);
    }
  }
  return resolved;
};

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid recommendation request." }, { status: 400 });
  }

  const userVector = readVector(payload.userVector);
  if (!userVector) {
    return NextResponse.json({ error: "A complete user DNA vector is required." }, { status: 400 });
  }

  const ownedIds = new Set(toStringList(payload.ownedFragranceIds).slice(0, 1000));
  const grounding = payload.groundingProfile && typeof payload.groundingProfile === "object"
    ? payload.groundingProfile as Record<string, unknown>
    : {};
  const lovedIds = resolveGroundingIds(toStringList(grounding.love));
  const avoidedIds = resolveGroundingIds(toStringList(grounding.redFlag));
  const requestedLimit = Number(payload.limit ?? 30);
  const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(100, Math.floor(requestedLimit))) : 30;

  const recordsById = new Map<string, MasterFragranceRecord>();
  for (const record of readAllMasterFragrances()) {
    const id = getRecordId(record);
    if (!id || ownedIds.has(id)) continue;
    const current = recordsById.get(id);
    const currentEvidence = current ? getEvidence(current).length : -1;
    if (!current || getEvidence(record).length > currentEvidence) recordsById.set(id, record);
  }

  const ranked = [...recordsById.entries()].flatMap(([id, record]) => {
    const evidence = getEvidence(record);
    if (evidence.length < 3 || evidence.some((attribute) => avoidedIds.has(attribute.canonicalAttributeId))) return [];

    const candidateVector = buildCandidateVector(evidence);
    const lovedMatches = evidence.filter((attribute) => lovedIds.has(attribute.canonicalAttributeId));
    const score = clamp01(scoreVector(userVector, candidateVector) + Math.min(0.1, lovedMatches.length * 0.025));
    const matchedAttributes = evidence.map((attribute) => attribute.displayName).slice(0, 5);
    const explanation = lovedMatches.length > 0
      ? `Aligns with ${lovedMatches.map((attribute) => attribute.displayName).slice(0, 3).join(", ")}, while fitting your learned DNA.`
      : `Ranked by its mapped notes and accords against your learned DNA.`;

    return [{
      fragranceId: id,
      perfume: String(record.perfume ?? record.name ?? "").trim(),
      brand: String(record.brand ?? "").trim(),
      imageUrl: String(record.imageUrl ?? "").trim(),
      localImagePath: String(record.localImagePath ?? "").trim(),
      score,
      matchedAttributes,
      explanation,
    }];
  }).sort((left, right) => right.score - left.score || left.perfume.localeCompare(right.perfume));

  return NextResponse.json({ recommendations: ranked.slice(0, limit), totalEligible: ranked.length }, { status: 200 });
}
