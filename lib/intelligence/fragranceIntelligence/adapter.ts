import canonicalRaw from "@/data/FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json";
import type { UserDnaProfileRecord } from "@/lib/database/masterFragranceDatabase";
import { resolveCanonicalAttribute } from "@/lib/intelligence/attributes";
import type {
  CanonicalFragranceAttribute,
  CanonicalFragranceModel,
  EvaluationFragranceRef,
  FragranceIntelligenceService,
  SessionFragranceRef,
} from "@/lib/intelligence/fragranceIntelligence/types";

type EvaluationProfile = {
  id: string;
  name: string;
  notes?: string[];
};

type CanonicalLayer = {
  testProfileId?: string;
  canonicalFragranceId?: string;
  canonicalBrand?: string;
  canonicalPerfume?: string;
  canonicalImageUrl?: string;
  canonicalBlobImageUrl?: string;
  canonicalLocalImagePath?: string;
  name?: string;
  type?: string;
  dna_axes?: Record<string, number>;
  semantic_v1?: Record<string, number>;
  user_attributes_v3?: {
    abstract?: string[];
    concrete?: string[];
  };
};

class AdapterBackedFragranceIntelligenceService implements FragranceIntelligenceService {
  private readonly refs: EvaluationFragranceRef[];
  private readonly sessionRefs: SessionFragranceRef[];
  private readonly profilesById: Map<string, CanonicalLayer>;
  private readonly semanticPoolMeans: Map<string, number>;

  constructor(sourceProfiles?: UserDnaProfileRecord[]) {
    const profiles = sourceProfiles
      ? sourceProfiles as CanonicalLayer[]
      : getUniqueCanonicalProfiles();
    const ids = buildUniqueProfileIds(profiles);

    this.refs = profiles.map((profile, index) => ({
      fragranceId: ids[index],
      displayName: String(profile.canonicalPerfume ?? profile.name ?? "").trim(),
      brand: String(profile.canonicalBrand ?? "").trim(),
      canonicalFragranceId: String(profile.canonicalFragranceId ?? "").trim(),
      imageUrl: String(profile.canonicalImageUrl ?? "").trim(),
      blobImageUrl: String(profile.canonicalBlobImageUrl ?? "").trim(),
      localImagePath: String(profile.canonicalLocalImagePath ?? "").trim(),
    }));

    this.sessionRefs = profiles.map((profile, index) => ({
      fragranceId: ids[index],
      displayName: String(profile.canonicalPerfume ?? profile.name ?? "").trim(),
      brand: String(profile.canonicalBrand ?? "").trim(),
      notes: [...(profile.user_attributes_v3?.concrete ?? [])],
    }));

    this.profilesById = new Map(profiles.map((profile, index) => [ids[index], profile]));
    this.semanticPoolMeans = buildSemanticPoolMeans(profiles);
  }

  listEvaluationFragrances(): EvaluationFragranceRef[] {
    return [...this.refs];
  }

  listSessionFragrances(): SessionFragranceRef[] {
    return this.sessionRefs.map((item) => ({
      fragranceId: item.fragranceId,
      displayName: item.displayName,
      notes: [...item.notes],
    }));
  }

  getCanonicalFragrance(fragranceId: string): CanonicalFragranceModel | null {
    const layer = this.profilesById.get(fragranceId);
    if (!layer) {
      return null;
    }

    const item: EvaluationProfile = {
      id: fragranceId,
      name: String(layer.canonicalPerfume ?? layer.name ?? "").trim(),
      notes: [...(layer.user_attributes_v3?.concrete ?? [])],
    };
    const coreAttributes = buildCoreAttributes(item, layer, this.semanticPoolMeans);
    const supportingAttributes = buildSupportingAttributes(layer);

    return {
      fragranceId: item.id,
      displayName: item.name,
      coreAttributes,
      supportingAttributes,
    };
  }
}

export function createFragranceIntelligenceService(
  profiles?: UserDnaProfileRecord[],
): FragranceIntelligenceService {
  return new AdapterBackedFragranceIntelligenceService(profiles);
}

// Average semantic score per key across the pool; used to find the semantic
// qualities that are distinctive for a specific fragrance rather than globally common.
function buildSemanticPoolMeans(profiles: CanonicalLayer[]): Map<string, number> {
  const sums = new Map<string, { total: number; count: number }>();
  for (const profile of profiles) {
    for (const [key, score] of Object.entries(profile.semantic_v1 ?? {})) {
      if (!Number.isFinite(score)) continue;
      const entry = sums.get(key) ?? { total: 0, count: 0 };
      entry.total += score;
      entry.count += 1;
      sums.set(key, entry);
    }
  }
  return new Map([...sums.entries()].map(([key, { total, count }]) => [key, count > 0 ? total / count : 0]));
}

function buildCoreAttributes(
  item: EvaluationProfile,
  layer: CanonicalLayer | undefined,
  semanticPoolMeans?: Map<string, number>
): CanonicalFragranceAttribute[] {
  const attributes = new Map<string, CanonicalFragranceAttribute>();

  const addAttribute = (
    value: string,
    source: "core" | "derived",
    confidence?: number,
    family?: string
  ): void => {
    const resolved = resolveCanonicalAttribute(value);
    if (!resolved) {
      return;
    }

    if (!attributes.has(resolved.canonicalAttributeId)) {
      attributes.set(resolved.canonicalAttributeId, {
        canonicalAttributeId: resolved.canonicalAttributeId,
        displayName: resolved.displayName,
        source,
        confidence,
        importance: resolved.defaultImportance,
        metadata: {
          family,
          localizationKey: resolved.localization.translationKey,
        },
      });
    }
  };

  for (const value of layer?.user_attributes_v3?.concrete ?? []) {
    addAttribute(value, "core", 0.95, "user_attributes.concrete");
  }

  for (const value of layer?.user_attributes_v3?.abstract ?? []) {
    addAttribute(value, "core", 0.9, "user_attributes.abstract");
  }

  for (const value of item.notes ?? []) {
    addAttribute(value, "core", 0.8, "evaluation.notes");
  }

  // Pick the semantic qualities that stand out for THIS fragrance: rank by how far
  // the score exceeds the pool average, so distinctive signatures (e.g. woods,
  // leather, floral) surface instead of the globally dominant keys.
  const topSemanticKeys = Object.entries(layer?.semantic_v1 ?? {})
    .filter(([, score]) => Number.isFinite(score) && score >= 40)
    .sort((left, right) => {
      const leftDistinct = left[1] - (semanticPoolMeans?.get(left[0]) ?? 0);
      const rightDistinct = right[1] - (semanticPoolMeans?.get(right[0]) ?? 0);
      return rightDistinct - leftDistinct;
    })
    .slice(0, 3)
    .map(([key]) => key);

  for (const semanticKey of topSemanticKeys) {
    addAttribute(semanticKey, "derived", 0.7, "semantic_v1");
  }

  return Array.from(attributes.values());
}

function buildSupportingAttributes(layer: CanonicalLayer | undefined): CanonicalFragranceAttribute[] {
  if (!layer?.semantic_v1) {
    return [];
  }

  return Object.entries(layer.semantic_v1)
    .sort((left, right) => right[1] - left[1])
    .slice(3, 8)
    .flatMap(([key, score]) => {
      const resolved = resolveCanonicalAttribute(key);
      if (!resolved) {
        return [];
      }

      return [
        {
          canonicalAttributeId: resolved.canonicalAttributeId,
          displayName: resolved.displayName,
          source: "supporting" as const,
          confidence: normalizeConfidence(score),
          importance: resolved.defaultImportance,
          metadata: {
            family: "semantic_v1",
            localizationKey: resolved.localization.translationKey,
          },
        },
      ];
    });
}

function getCanonicalLayers(): CanonicalLayer[] {
  const root = canonicalRaw as {
    FragranceDNA_USER_ATTRIBUTE_LAYER_v3?: { layers?: CanonicalLayer[] };
    layers?: CanonicalLayer[];
  };

  return root.FragranceDNA_USER_ATTRIBUTE_LAYER_v3?.layers ?? root.layers ?? [];
}

function getUniqueCanonicalProfiles(): CanonicalLayer[] {
  const profilesByName = new Map<string, CanonicalLayer>();
  for (const profile of getCanonicalLayers()) {
    const name = String(profile.name ?? "").trim();
    const key = normalizeProfileName(name);
    if (!name || !key) continue;

    const existing = profilesByName.get(key);
    if (!existing || profileCompleteness(profile) > profileCompleteness(existing)) {
      profilesByName.set(key, profile);
    }
  }
  return [...profilesByName.values()];
}

function profileCompleteness(profile: CanonicalLayer): number {
  return Object.keys(profile.dna_axes ?? {}).length * 100
    + Object.keys(profile.semantic_v1 ?? {}).length * 10
    + (profile.user_attributes_v3?.abstract?.length ?? 0)
    + (profile.user_attributes_v3?.concrete?.length ?? 0);
}

function buildUniqueProfileIds(profiles: CanonicalLayer[]): string[] {
  const used = new Set<string>();
  return profiles.map((profile) => {
    const base = normalizeProfileName(String(profile.name ?? "")) || "fragrance";
    let id = String(profile.testProfileId ?? "").trim() || base;
    let suffix = 2;
    while (used.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(id);
    return id;
  });
}

function normalizeProfileName(value: string): string {
  return value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeConfidence(score: number): number {
  const scaled = Math.max(0, Math.min(100, score));
  return scaled / 100;
}
