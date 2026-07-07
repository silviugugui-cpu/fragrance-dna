import fs from "node:fs";
import path from "node:path";
import { createBuilderConfig } from "@/lib/builder/config";
import { createCanonicalNotesKnowledgeEntities } from "@/lib/builder/knowledge/canonicalNotes";
import { createDefaultRawImportReader } from "@/lib/builder/rawImport";
import {
  parseMainAccordsList,
  parseNotesList,
  parseVoteDistribution,
} from "@/lib/builder/validationEngine/rules/ValidationPackTypes";

export type CanonicalResolutionMethod =
  | "exact-match"
  | "normalized-match"
  | "alias-match"
  | "known-mapping"
  | "dictionary-match"
  | "inferred"
  | "unresolved";

export interface CanonicalResolution<T> {
  value: T | null;
  resolved: boolean;
  method: CanonicalResolutionMethod;
  confidence: number;
  source: string;
  requiresReview: boolean;
}

export interface CanonicalMasterPerfumeObject {
  id: string;
  worksheet: string;
  rowIndex: number;
  perfume: string;
  launchYear: string;
  rawBrand: string;
  rawPerfumers: string[];
  imageUrl: string | null;
  canonicalBrand: CanonicalResolution<string>;
  canonicalNotes: CanonicalResolution<string[]>;
  unresolvedNotes: string[];
  canonicalMainAccords: CanonicalResolution<string[]>;
  unresolvedMainAccords: string[];
  canonicalFamily: CanonicalResolution<string>;
  canonicalGender: CanonicalResolution<string>;
  availability: CanonicalResolution<{ status: string; discontinued: boolean | null }>;
  performance: CanonicalResolution<{
    longevity: string | null;
    sillage: string | null;
    hasEvidence: boolean;
  }>;
  recommendation: CanonicalResolution<{ tags: string[] }>;
  builderConfidence: number;
  automaticResolutions: number;
  unresolvedEntities: number;
  provenance: Record<string, { source: string; method: CanonicalResolutionMethod; confidence: number }>;
}

export interface CanonicalReviewEntity {
  entityType: "note" | "accord" | "brand" | "family" | "gender";
  rawValue: string;
  normalizedValue: string;
  worksheet: string;
  rowIndex: number;
  perfume: string;
  brand: string;
  group: string;
}

export interface CanonicalBuilderIntelligenceResult {
  generatedAt: string;
  totalFragrancesProcessed: number;
  canonicalObjectsGenerated: number;
  automaticResolutions: number;
  possibleResolutions: number;
  automationPercentage: number;
  remainingReviewItems: number;
  knowledgeCoveragePercent: number;
  averageBuilderConfidence: number;
  objects: CanonicalMasterPerfumeObject[];
  unresolvedEntities: CanonicalReviewEntity[];
}

const BRAND_KNOWN_MAPPINGS: Record<string, string> = {
  ysl: "Yves Saint Laurent",
  "yves saint laurent": "Yves Saint Laurent",
  mfk: "Maison Francis Kurkdjian",
  "maison francis kurkdjian": "Maison Francis Kurkdjian",
  jpg: "Jean Paul Gaultier",
  "jean paul gaultier": "Jean Paul Gaultier",
  mmm: "Maison Margiela",
  "maison martin margiela": "Maison Margiela",
  "m. micallef": "M. Micallef",
};

const NOTE_KNOWN_MAPPINGS: Record<string, string> = {
  musks: "Musk",
  whitemusks: "Musk",
  ambergris: "Amber",
  cedar: "Cedarwood",
  sandal: "Sandalwood",
  citruses: "Citrus",
  citron: "Lemon",
};

const ACCORD_ALIASES: Record<string, string> = {
  citrusy: "Citrus",
  citric: "Citrus",
  woody: "Woody",
  woodsy: "Woody",
  floral: "Floral",
  musky: "Musky",
  ambery: "Amber",
  aromatic: "Aromatic",
  freshspicy: "Fresh Spicy",
  warmspicy: "Warm Spicy",
  sweet: "Sweet",
  gourmand: "Gourmand",
  powdery: "Powdery",
  aquatic: "Aquatic",
  ozonic: "Ozonic",
  green: "Green",
  fruity: "Fruity",
  vanilla: "Vanilla",
  balsamic: "Balsamic",
  leather: "Leather",
};

const FAMILY_BY_ACCORD: Record<string, string> = {
  Citrus: "Citrus",
  Aquatic: "Fresh",
  Ozonic: "Fresh",
  Aromatic: "Aromatic",
  Woody: "Woody",
  Floral: "Floral",
  Amber: "Amber",
  Musky: "Musk",
  Sweet: "Gourmand",
  Gourmand: "Gourmand",
  Vanilla: "Gourmand",
  Leather: "Leather",
  Green: "Green",
  Fruity: "Fruity",
  "Fresh Spicy": "Spicy",
  "Warm Spicy": "Spicy",
  Powdery: "Powdery",
  Balsamic: "Amber",
};

const normalizeText = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const normalizeToken = (value: string): string =>
  normalizeText(value).replace(/[^a-z0-9]+/g, "");

const titleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(" ")
    .filter((item) => item.length > 0)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");

const resolveReadableWorkbookPath = (configuredPath: string): string => {
  const configuredAbsolute = path.resolve(configuredPath);
  if (fs.existsSync(configuredAbsolute)) {
    return configuredAbsolute;
  }

  const preferred = path.resolve(process.cwd(), "public", "RawPerfumeDatabase.xlsx");
  if (fs.existsSync(preferred)) {
    return preferred;
  }

  const fallback = path.resolve(
    process.cwd(),
    "public",
    "FragranceDNA_RawPerfumeDatabase_Export.xlsx",
  );

  if (fs.existsSync(fallback)) {
    return fallback;
  }

  return configuredAbsolute;
};

const pickText = (record: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return "";
};

const pickManyTexts = (record: Record<string, unknown>, keys: string[]): string[] => {
  const values: string[] = [];
  for (const key of keys) {
    const value = record[key];
    if (typeof value !== "string") {
      continue;
    }

    const split = value
      .split(/[;,|/]/g)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    values.push(...split);
  }

  return Array.from(new Set(values));
};

const bucketMax = (distribution: Record<string, number>): string | null => {
  const entries = Object.entries(distribution);
  if (entries.length === 0) {
    return null;
  }

  let topKey = entries[0][0];
  let topValue = entries[0][1];
  for (const [key, value] of entries.slice(1)) {
    if (value > topValue) {
      topKey = key;
      topValue = value;
    }
  }

  if (topValue <= 0) {
    return null;
  }

  return topKey;
};

const toDiscontinued = (value: string): boolean | null => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  if (normalized.includes("discontinued") || normalized.includes("retired")) {
    return true;
  }

  if (normalized.includes("available") || normalized.includes("active") || normalized.includes("in stock")) {
    return false;
  }

  return null;
};

const resolveCanonicalBrand = (rawBrand: string): CanonicalResolution<string> => {
  const normalized = normalizeText(rawBrand);
  if (!normalized) {
    return {
      value: null,
      resolved: false,
      method: "unresolved",
      confidence: 0,
      source: "raw.brand",
      requiresReview: true,
    };
  }

  const direct = BRAND_KNOWN_MAPPINGS[normalized];
  if (direct) {
    return {
      value: direct,
      resolved: true,
      method: "known-mapping",
      confidence: 0.99,
      source: "brand-known-mappings",
      requiresReview: false,
    };
  }

  const compact = normalizeToken(rawBrand);
  if (compact in BRAND_KNOWN_MAPPINGS) {
    return {
      value: BRAND_KNOWN_MAPPINGS[compact],
      resolved: true,
      method: "normalized-match",
      confidence: 0.97,
      source: "brand-known-mappings",
      requiresReview: false,
    };
  }

  return {
    value: titleCase(normalized),
    resolved: true,
    method: "dictionary-match",
    confidence: 0.95,
    source: "brand-normalizer",
    requiresReview: false,
  };
};

const resolveCanonicalGender = (
  rawRecord: Record<string, unknown>,
): CanonicalResolution<string> => {
  const genderRaw = pickText(rawRecord, ["gender", "target_gender", "sex"]);
  const value = normalizeText(genderRaw);
  if (!value) {
    return {
      value: null,
      resolved: false,
      method: "unresolved",
      confidence: 0,
      source: "raw.gender",
      requiresReview: true,
    };
  }

  if (["unisex", "shared", "any"].some((item) => value.includes(item))) {
    return {
      value: "unisex",
      resolved: true,
      method: "dictionary-match",
      confidence: 0.99,
      source: "raw.gender",
      requiresReview: false,
    };
  }

  if (["men", "man", "male", "masculine", "homme"].some((item) => value.includes(item))) {
    return {
      value: "masculine",
      resolved: true,
      method: "dictionary-match",
      confidence: 0.99,
      source: "raw.gender",
      requiresReview: false,
    };
  }

  if (["women", "woman", "female", "feminine", "femme"].some((item) => value.includes(item))) {
    return {
      value: "feminine",
      resolved: true,
      method: "dictionary-match",
      confidence: 0.99,
      source: "raw.gender",
      requiresReview: false,
    };
  }

  return {
    value: null,
    resolved: false,
    method: "unresolved",
    confidence: 0,
    source: "raw.gender",
    requiresReview: true,
  };
};

const resolveAvailability = (
  rawRecord: Record<string, unknown>,
): CanonicalResolution<{ status: string; discontinued: boolean | null }> => {
  const statusRaw = pickText(rawRecord, ["availability", "status", "availability_status"]);
  const discontinuedRaw = pickText(rawRecord, ["discontinued", "is_discontinued"]);

  const discontinued = toDiscontinued(`${statusRaw} ${discontinuedRaw}`);
  const status = discontinued === true ? "discontinued" : discontinued === false ? "available" : "unknown";

  return {
    value: { status, discontinued },
    resolved: status !== "unknown",
    method: status !== "unknown" ? "dictionary-match" : "unresolved",
    confidence: status !== "unknown" ? 0.92 : 0,
    source: "raw.availability",
    requiresReview: status === "unknown",
  };
};

const resolveCanonicalFamily = (
  rawRecord: Record<string, unknown>,
  canonicalAccords: string[],
): CanonicalResolution<string> => {
  const familyRaw = pickText(rawRecord, ["family", "families", "olfactory_family"]);
  const normalizedFamily = normalizeText(familyRaw);

  if (normalizedFamily) {
    return {
      value: titleCase(normalizedFamily),
      resolved: true,
      method: "exact-match",
      confidence: 0.98,
      source: "raw.family",
      requiresReview: false,
    };
  }

  if (canonicalAccords.length === 0) {
    return {
      value: null,
      resolved: false,
      method: "unresolved",
      confidence: 0,
      source: "accord-inference",
      requiresReview: true,
    };
  }

  const scores = new Map<string, number>();
  for (const accord of canonicalAccords) {
    const inferred = FAMILY_BY_ACCORD[accord];
    if (!inferred) {
      continue;
    }

    scores.set(inferred, (scores.get(inferred) ?? 0) + 1);
  }

  if (scores.size === 0) {
    return {
      value: null,
      resolved: false,
      method: "unresolved",
      confidence: 0,
      source: "accord-inference",
      requiresReview: true,
    };
  }

  const ordered = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
  const [winner, top] = ordered[0];
  const second = ordered[1]?.[1] ?? 0;
  const deterministic = top >= 2 || top - second >= 1;

  if (!deterministic) {
    return {
      value: null,
      resolved: false,
      method: "unresolved",
      confidence: 0,
      source: "accord-inference",
      requiresReview: true,
    };
  }

  return {
    value: winner,
    resolved: true,
    method: "inferred",
    confidence: 0.9,
    source: "accord-inference",
    requiresReview: false,
  };
};

const resolvePerformance = (
  longevityRaw: unknown,
  sillageRaw: unknown,
): CanonicalResolution<{ longevity: string | null; sillage: string | null; hasEvidence: boolean }> => {
  const longevityVotes = parseVoteDistribution(longevityRaw);
  const sillageVotes = parseVoteDistribution(sillageRaw);
  const longevityBucket = bucketMax(longevityVotes);
  const sillageBucket = bucketMax(sillageVotes);
  const hasEvidence = Boolean(longevityBucket || sillageBucket);

  return {
    value: {
      longevity: longevityBucket,
      sillage: sillageBucket,
      hasEvidence,
    },
    resolved: hasEvidence,
    method: hasEvidence ? "dictionary-match" : "unresolved",
    confidence: hasEvidence ? 0.9 : 0,
    source: "raw.performance",
    requiresReview: !hasEvidence,
  };
};

const resolveRecommendation = (
  family: CanonicalResolution<string>,
  accords: CanonicalResolution<string[]>,
  gender: CanonicalResolution<string>,
  performance: CanonicalResolution<{ longevity: string | null; sillage: string | null; hasEvidence: boolean }>,
): CanonicalResolution<{ tags: string[] }> => {
  const tags = new Set<string>();

  if (family.value) {
    tags.add(`family:${family.value.toLowerCase()}`);
  }

  for (const accord of accords.value ?? []) {
    tags.add(`accord:${accord.toLowerCase().replace(/\s+/g, "-")}`);
  }

  if (gender.value) {
    tags.add(`gender:${gender.value}`);
  }

  if (performance.value?.hasEvidence) {
    if (performance.value.longevity) {
      tags.add(`longevity:${performance.value.longevity}`);
    }
    if (performance.value.sillage) {
      tags.add(`sillage:${performance.value.sillage}`);
    }
  }

  return {
    value: { tags: Array.from(tags).sort() },
    resolved: true,
    method: "inferred",
    confidence: 0.88,
    source: "builder.recommendation",
    requiresReview: false,
  };
};

const buildCanonicalNoteResolver = (): {
  resolve: (rawNote: string) => CanonicalResolution<string>;
} => {
  const config = createBuilderConfig();
  const canonicalNotes = createCanonicalNotesKnowledgeEntities(config.generatedBy);
  const exactCanonical = new Map<string, string>();
  const normalizedCanonical = new Map<string, string>();
  const aliasCanonical = new Map<string, string>();

  for (const note of canonicalNotes) {
    exactCanonical.set(note.canonicalName, note.canonicalName);
    normalizedCanonical.set(normalizeText(note.canonicalName), note.canonicalName);
    normalizedCanonical.set(normalizeToken(note.canonicalName), note.canonicalName);

    for (const alias of note.aliases) {
      aliasCanonical.set(normalizeText(alias.alias), note.canonicalName);
      aliasCanonical.set(normalizeToken(alias.alias), note.canonicalName);
    }
  }

  for (const [key, canonical] of Object.entries(NOTE_KNOWN_MAPPINGS)) {
    aliasCanonical.set(normalizeText(key), canonical);
    aliasCanonical.set(normalizeToken(key), canonical);
  }

  return {
    resolve: (rawNote: string): CanonicalResolution<string> => {
      const trimmed = rawNote.trim();
      if (!trimmed) {
        return {
          value: null,
          resolved: false,
          method: "unresolved",
          confidence: 0,
          source: "knowledge.notes",
          requiresReview: true,
        };
      }

      const exact = exactCanonical.get(trimmed);
      if (exact) {
        return {
          value: exact,
          resolved: true,
          method: "exact-match",
          confidence: 1,
          source: "knowledge.notes",
          requiresReview: false,
        };
      }

      const normalized = normalizeText(trimmed);
      const normalizedHit = normalizedCanonical.get(normalized) ?? normalizedCanonical.get(normalizeToken(trimmed));
      if (normalizedHit) {
        return {
          value: normalizedHit,
          resolved: true,
          method: "normalized-match",
          confidence: 0.98,
          source: "knowledge.notes",
          requiresReview: false,
        };
      }

      const aliasHit = aliasCanonical.get(normalized) ?? aliasCanonical.get(normalizeToken(trimmed));
      if (aliasHit) {
        return {
          value: aliasHit,
          resolved: true,
          method: "alias-match",
          confidence: 0.96,
          source: "knowledge.notes.aliases",
          requiresReview: false,
        };
      }

      return {
        value: null,
        resolved: false,
        method: "unresolved",
        confidence: 0,
        source: "knowledge.notes",
        requiresReview: true,
      };
    },
  };
};

const resolveCanonicalAccord = (rawAccord: string): CanonicalResolution<string> => {
  const trimmed = rawAccord.trim();
  if (!trimmed) {
    return {
      value: null,
      resolved: false,
      method: "unresolved",
      confidence: 0,
      source: "builder.accords",
      requiresReview: true,
    };
  }

  const normalized = normalizeToken(trimmed);
  const known = ACCORD_ALIASES[normalized];
  if (known) {
    return {
      value: known,
      resolved: true,
      method: "dictionary-match",
      confidence: 0.95,
      source: "builder.accord-dictionary",
      requiresReview: false,
    };
  }

  const titled = titleCase(normalizeText(trimmed));
  if (titled.length > 0) {
    return {
      value: titled,
      resolved: true,
      method: "normalized-match",
      confidence: 0.9,
      source: "builder.accord-normalizer",
      requiresReview: false,
    };
  }

  return {
    value: null,
    resolved: false,
    method: "unresolved",
    confidence: 0,
    source: "builder.accords",
    requiresReview: true,
  };
};

export const runCanonicalBuilderIntelligence = (): CanonicalBuilderIntelligenceResult => {
  const config = createBuilderConfig();
  const reader = createDefaultRawImportReader();
  const payload = reader.read({
    workbookPath: resolveReadableWorkbookPath(config.rawImport.workbookPath),
    worksheetNames: config.rawImport.worksheetNames,
    requiredHeaders: config.rawImport.requiredHeaders,
    identifierColumn: config.rawImport.identifierColumn,
    importVersion: config.rawImport.importVersion,
  });

  const noteResolver = buildCanonicalNoteResolver();
  const objects: CanonicalMasterPerfumeObject[] = [];
  const unresolvedEntities: CanonicalReviewEntity[] = [];

  let automaticResolutions = 0;
  let possibleResolutions = 0;
  let notesTotal = 0;
  let notesResolved = 0;
  let confidenceAccumulator = 0;

  for (const worksheet of payload.rawDatabase.worksheets) {
    for (const row of worksheet.rows) {
      const id = `${worksheet.worksheetName}:${row.rowIndex}`;
      const perfume =
        pickText(row.rawRecord, ["perfume", "name", "fragrance"]) || `Unnamed #${row.rowIndex}`;
      const launchYear = String(row.rawRecord.launch_year ?? "").trim();
      const rawBrand = pickText(row.rawRecord, ["brand", "brand_name", "house"]);
      const rawPerfumers = pickManyTexts(row.rawRecord, [
        "perfumer",
        "perfumers",
        "perfumer_name",
        "nose",
        "creator",
        "creators",
      ]);
      const imageUrl =
        pickText(row.rawRecord, ["image", "image_url", "imageUrl", "picture", "photo"]) || null;

      const canonicalBrand = resolveCanonicalBrand(rawBrand);

      const notesParsed = parseNotesList(row.rawRecord.notes);
      const resolvedNotes = new Set<string>();
      const unresolvedNotes = new Set<string>();
      for (const note of notesParsed.items) {
        notesTotal += 1;
        const resolved = noteResolver.resolve(note);
        if (resolved.value) {
          notesResolved += 1;
          resolvedNotes.add(resolved.value);
        } else {
          unresolvedNotes.add(note);
          unresolvedEntities.push({
            entityType: "note",
            rawValue: note,
            normalizedValue: normalizeText(note),
            worksheet: worksheet.worksheetName,
            rowIndex: row.rowIndex,
            perfume,
            brand: rawBrand || "Unknown Brand",
            group: "note",
          });
        }
      }

      const canonicalNotes: CanonicalResolution<string[]> = {
        value: Array.from(resolvedNotes).sort((a, b) => a.localeCompare(b)),
        resolved: unresolvedNotes.size === 0,
        method: unresolvedNotes.size === 0 ? "alias-match" : "unresolved",
        confidence:
          notesParsed.items.length > 0
            ? Number(((resolvedNotes.size / notesParsed.items.length) * 0.99).toFixed(2))
            : 0,
        source: "knowledge.notes",
        requiresReview: unresolvedNotes.size > 0,
      };

      const accordsParsed = parseMainAccordsList(row.rawRecord.main_accords);
      const resolvedAccords = new Set<string>();
      const unresolvedAccords = new Set<string>();
      for (const accord of accordsParsed.items) {
        const resolved = resolveCanonicalAccord(accord);
        if (resolved.value) {
          resolvedAccords.add(resolved.value);
        } else {
          unresolvedAccords.add(accord);
          unresolvedEntities.push({
            entityType: "accord",
            rawValue: accord,
            normalizedValue: normalizeText(accord),
            worksheet: worksheet.worksheetName,
            rowIndex: row.rowIndex,
            perfume,
            brand: rawBrand || "Unknown Brand",
            group: "accord",
          });
        }
      }

      const canonicalMainAccords: CanonicalResolution<string[]> = {
        value: Array.from(resolvedAccords).sort((a, b) => a.localeCompare(b)),
        resolved: unresolvedAccords.size === 0,
        method: unresolvedAccords.size === 0 ? "dictionary-match" : "unresolved",
        confidence:
          accordsParsed.items.length > 0
            ? Number(((resolvedAccords.size / accordsParsed.items.length) * 0.95).toFixed(2))
            : 0,
        source: "builder.accords",
        requiresReview: unresolvedAccords.size > 0,
      };

      const canonicalFamily = resolveCanonicalFamily(
        row.rawRecord,
        canonicalMainAccords.value ?? [],
      );
      if (!canonicalFamily.resolved) {
        unresolvedEntities.push({
          entityType: "family",
          rawValue: pickText(row.rawRecord, ["family", "families", "olfactory_family"]) || "unknown-family",
          normalizedValue: "unknown-family",
          worksheet: worksheet.worksheetName,
          rowIndex: row.rowIndex,
          perfume,
          brand: rawBrand || "Unknown Brand",
          group: "family",
        });
      }

      const canonicalGender = resolveCanonicalGender(row.rawRecord);
      if (!canonicalGender.resolved) {
        unresolvedEntities.push({
          entityType: "gender",
          rawValue: pickText(row.rawRecord, ["gender", "target_gender", "sex"]) || "unknown-gender",
          normalizedValue: "unknown-gender",
          worksheet: worksheet.worksheetName,
          rowIndex: row.rowIndex,
          perfume,
          brand: rawBrand || "Unknown Brand",
          group: "gender",
        });
      }

      const availability = resolveAvailability(row.rawRecord);
      const performance = resolvePerformance(row.rawRecord.longevity, row.rawRecord.sillage);
      const recommendation = resolveRecommendation(
        canonicalFamily,
        canonicalMainAccords,
        canonicalGender,
        performance,
      );

      const resolutionSet = [
        canonicalBrand,
        canonicalNotes,
        canonicalMainAccords,
        canonicalFamily,
        canonicalGender,
        availability,
        performance,
        recommendation,
      ];

      const resolvedCount = resolutionSet.filter((item) => item.resolved).length;
      const possible = resolutionSet.length;
      automaticResolutions += resolvedCount;
      possibleResolutions += possible;

      const unresolvedCount = resolutionSet.filter((item) => item.requiresReview).length + unresolvedNotes.size + unresolvedAccords.size;
      const confidence = Number(
        (
          resolutionSet.reduce((sum, item) => sum + item.confidence, 0) /
          resolutionSet.length
        ).toFixed(2),
      );
      confidenceAccumulator += confidence;

      const object: CanonicalMasterPerfumeObject = {
        id,
        worksheet: worksheet.worksheetName,
        rowIndex: row.rowIndex,
        perfume,
        launchYear,
        rawBrand: rawBrand || "Unknown Brand",
        rawPerfumers,
        imageUrl,
        canonicalBrand,
        canonicalNotes,
        unresolvedNotes: Array.from(unresolvedNotes).sort((a, b) => a.localeCompare(b)),
        canonicalMainAccords,
        unresolvedMainAccords: Array.from(unresolvedAccords).sort((a, b) => a.localeCompare(b)),
        canonicalFamily,
        canonicalGender,
        availability,
        performance,
        recommendation,
        builderConfidence: confidence,
        automaticResolutions: resolvedCount,
        unresolvedEntities: unresolvedCount,
        provenance: {
          canonicalBrand: {
            source: canonicalBrand.source,
            method: canonicalBrand.method,
            confidence: canonicalBrand.confidence,
          },
          canonicalNotes: {
            source: canonicalNotes.source,
            method: canonicalNotes.method,
            confidence: canonicalNotes.confidence,
          },
          canonicalMainAccords: {
            source: canonicalMainAccords.source,
            method: canonicalMainAccords.method,
            confidence: canonicalMainAccords.confidence,
          },
          canonicalFamily: {
            source: canonicalFamily.source,
            method: canonicalFamily.method,
            confidence: canonicalFamily.confidence,
          },
          canonicalGender: {
            source: canonicalGender.source,
            method: canonicalGender.method,
            confidence: canonicalGender.confidence,
          },
          availability: {
            source: availability.source,
            method: availability.method,
            confidence: availability.confidence,
          },
          performance: {
            source: performance.source,
            method: performance.method,
            confidence: performance.confidence,
          },
          recommendation: {
            source: recommendation.source,
            method: recommendation.method,
            confidence: recommendation.confidence,
          },
        },
      };

      objects.push(object);
    }
  }

  const totalFragrancesProcessed = objects.length;
  const canonicalObjectsGenerated = objects.length;
  const automationPercentage =
    possibleResolutions > 0
      ? Number(((automaticResolutions / possibleResolutions) * 100).toFixed(2))
      : 0;

  const remainingReviewItems = unresolvedEntities.length;
  const knowledgeCoveragePercent =
    notesTotal > 0 ? Number(((notesResolved / notesTotal) * 100).toFixed(2)) : 0;
  const averageBuilderConfidence =
    totalFragrancesProcessed > 0
      ? Number((confidenceAccumulator / totalFragrancesProcessed).toFixed(2))
      : 0;

  return {
    generatedAt: new Date().toISOString(),
    totalFragrancesProcessed,
    canonicalObjectsGenerated,
    automaticResolutions,
    possibleResolutions,
    automationPercentage,
    remainingReviewItems,
    knowledgeCoveragePercent,
    averageBuilderConfidence,
    objects,
    unresolvedEntities,
  };
};
