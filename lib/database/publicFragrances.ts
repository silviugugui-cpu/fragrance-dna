import type { MasterFragranceRecord } from "./masterFragranceDatabase";
import type { FragranceBadges } from "../fragranceBadges";
import { fragranceRelationships, publicBrandType, type FragranceRelationship } from "../fragranceClassification";
import { getFragranceReferenceHref } from "./fragrancePages";

export type PublicFragranceRelationship = FragranceRelationship & { href: string };

export interface PublicFragrance {
  id: string;
  brand: string;
  perfume: string;
  originRegion?: string;
  relationships: PublicFragranceRelationship[];
  brandType?: string;
  launchYear?: string;
  gender?: string;
  perfumer?: string;
  badges?: FragranceBadges;
  mainAccords: string[];
  notes: string[];
  description?: string;
  imageUrl?: string;
  blobImageUrl?: string;
  localImagePath?: string;
  dnaAxes?: Record<string, number>;
}

const text = (value: unknown): string | undefined => {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
};
const textList = (value: unknown): string[] => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];

export function toPublicFragrance(record: MasterFragranceRecord): PublicFragrance {
  const id = text(record.id) ?? text(record.canonicalKey);
  if (!id) throw new Error("Missing canonical fragrance identity.");
  return {
    id,
    brand: text(record.brand) ?? "",
    perfume: text(record.perfume ?? record.name) ?? "",
    brandType: publicBrandType(record.brandType),
    originRegion: text(record.originRegion),
    relationships: fragranceRelationships(record.relationships).map((relation) => ({
      ...relation, href: getFragranceReferenceHref(relation.referenceBrand, relation.referencePerfume),
    })),
    launchYear: text(record.launchYear),
    gender: text(record.gender),
    perfumer: text(record.perfumer),
    badges: record.badges,
    mainAccords: textList(record.mainAccords),
    notes: textList(record.notes),
    description: text(record.description),
    imageUrl: text(record.imageUrl),
    blobImageUrl: text(record.blobImageUrl),
    localImagePath: text(record.localImagePath),
    dnaAxes: record.userDnaProfiles?.[0]?.dna_axes,
  };
}
