import evaluationCatalog from "@/lib/db.json";
import canonicalRaw from "@/data/FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json";
import { resolveCanonicalAttribute } from "@/lib/intelligence/attributes";
import type {
  CanonicalFragranceAttribute,
  CanonicalFragranceModel,
  EvaluationFragranceRef,
  FragranceIntelligenceService,
  SessionFragranceRef,
} from "@/lib/intelligence/fragranceIntelligence/types";

type EvaluationCatalogItem = {
  id: string;
  name: string;
  notes?: string[];
};

type CanonicalLayer = {
  name?: string;
  semantic_v1?: Record<string, number>;
  user_attributes_v3?: {
    abstract?: string[];
    concrete?: string[];
  };
};

class AdapterBackedFragranceIntelligenceService implements FragranceIntelligenceService {
  private readonly refs: EvaluationFragranceRef[];
  private readonly sessionRefs: SessionFragranceRef[];
  private readonly byId: Map<string, EvaluationCatalogItem>;
  private readonly layersByName: Map<string, CanonicalLayer>;

  constructor() {
    const catalog = (evaluationCatalog as EvaluationCatalogItem[]) ?? [];

    this.refs = catalog.map((item) => ({
      fragranceId: item.id,
      displayName: item.name,
    }));

    this.sessionRefs = catalog.map((item) => ({
      fragranceId: item.id,
      displayName: item.name,
      notes: [...(item.notes ?? [])],
    }));

    this.byId = new Map(catalog.map((item) => [item.id, item]));
    this.layersByName = new Map(
      getCanonicalLayers().map((layer) => [normalizeForName(layer.name ?? ""), layer])
    );
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
    const item = this.byId.get(fragranceId);
    if (!item) {
      return null;
    }

    const layer = this.layersByName.get(normalizeForName(item.name));
    const coreAttributes = buildCoreAttributes(item, layer);
    const supportingAttributes = buildSupportingAttributes(layer);

    return {
      fragranceId: item.id,
      displayName: item.name,
      coreAttributes,
      supportingAttributes,
    };
  }
}

export function createFragranceIntelligenceService(): FragranceIntelligenceService {
  return new AdapterBackedFragranceIntelligenceService();
}

function buildCoreAttributes(
  item: EvaluationCatalogItem,
  layer: CanonicalLayer | undefined
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

  const topSemanticKeys = Object.entries(layer?.semantic_v1 ?? {})
    .sort((left, right) => right[1] - left[1])
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

function normalizeForName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeConfidence(score: number): number {
  const scaled = Math.max(0, Math.min(100, score));
  return scaled / 100;
}
