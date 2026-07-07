import type { OlfactoryVector } from "@/lib/types";

export type CanonicalAttributeId = string;

export type AttributeNormalizationRules = {
  trim: boolean;
  lowercase: boolean;
  replaceUnderscores: boolean;
  collapseWhitespace: boolean;
  stripPunctuation: boolean;
};

export type AttributeQuestionDefaults = {
  questionType: "intensity-scale";
  scale: {
    min: number;
    max: number;
    step: number;
    minLabel: string;
    maxLabel: string;
  };
  promptTemplate: string;
};

export type CanonicalAttributeDefinition = {
  canonicalAttributeId: CanonicalAttributeId;
  displayName: string;
  aliases: string[];
  axisMapping: Array<keyof OlfactoryVector>;
  vectorMapping: Partial<Record<keyof OlfactoryVector, number>>;
  defaultImportance: number;
  normalizationRules: AttributeNormalizationRules;
  questionDefaults: AttributeQuestionDefaults;
  localization: {
    translationKey: string;
    namespace: string;
    defaultLocale: string;
  };
  metadata: {
    category: "test" | "grounding" | "semantic";
    sourceFamily: string;
    groundingExpansionTokens?: string[];
  };
};

const DEFAULT_NORMALIZATION: AttributeNormalizationRules = {
  trim: true,
  lowercase: true,
  replaceUnderscores: true,
  collapseWhitespace: true,
  stripPunctuation: true,
};

const DEFAULT_SCALE = {
  min: 0,
  max: 100,
  step: 1,
  minLabel: "Not Present",
  maxLabel: "Very Present",
} as const;

const CANONICAL_ATTRIBUTE_REGISTRY: CanonicalAttributeDefinition[] = [
  makeAttribute({
    canonicalAttributeId: "elegant",
    displayName: "Elegant",
    aliases: ["elegant", "sofisticat", "elegance"],
    axisMapping: ["elegance", "cleanliness"],
    vectorMapping: { elegance: 0.75, cleanliness: 0.25 },
    defaultImportance: 0.9,
    metadata: { category: "test", sourceFamily: "abstract" },
  }),
  makeAttribute({
    canonicalAttributeId: "charismatic",
    displayName: "Charismatic",
    aliases: ["carismatic", "charismatic"],
    axisMapping: ["warmth", "darkness", "elegance"],
    vectorMapping: { warmth: 0.45, darkness: 0.25, elegance: 0.2 },
    defaultImportance: 0.85,
    metadata: { category: "test", sourceFamily: "abstract" },
  }),
  makeAttribute({
    canonicalAttributeId: "mysterious",
    displayName: "Mysterious",
    aliases: ["misterios", "mysterious"],
    axisMapping: ["darkness", "elegance"],
    vectorMapping: { darkness: 0.7, elegance: 0.2 },
    defaultImportance: 0.8,
    metadata: { category: "test", sourceFamily: "abstract" },
  }),
  makeAttribute({
    canonicalAttributeId: "citrus",
    displayName: "Citrus",
    aliases: ["citrice", "citrus", "bergamot", "lemon"],
    axisMapping: ["freshness", "cleanliness"],
    vectorMapping: { freshness: 0.8, cleanliness: 0.35 },
    defaultImportance: 0.9,
    metadata: { category: "test", sourceFamily: "concrete" },
  }),
  makeAttribute({
    canonicalAttributeId: "honeyed",
    displayName: "Honeyed",
    aliases: ["miere", "honey", "honeyed", "vanilla", "caramel", "sweet", "gourmand"],
    axisMapping: ["sweetness", "warmth"],
    vectorMapping: { sweetness: 0.8, warmth: 0.35 },
    defaultImportance: 0.8,
    metadata: { category: "test", sourceFamily: "concrete" },
  }),
  makeAttribute({
    canonicalAttributeId: "woody",
    displayName: "Woody",
    aliases: ["lemn", "woody", "wood", "cedar", "vetiver"],
    axisMapping: ["darkness", "warmth", "elegance"],
    vectorMapping: { darkness: 0.35, warmth: 0.35, elegance: 0.2 },
    defaultImportance: 0.8,
    metadata: { category: "test", sourceFamily: "concrete" },
  }),
  makeAttribute({
    canonicalAttributeId: "aromatic",
    displayName: "Aromatic",
    aliases: ["aromatic"],
    axisMapping: ["freshness", "elegance"],
    vectorMapping: { freshness: 0.45, elegance: 0.2 },
    defaultImportance: 0.8,
    metadata: { category: "semantic", sourceFamily: "semantic_v1" },
  }),
  makeAttribute({
    canonicalAttributeId: "spices",
    displayName: "Spices",
    aliases: ["spices", "spice", "cinnamon", "cardamom"],
    axisMapping: ["warmth", "darkness"],
    vectorMapping: { warmth: 0.7, darkness: 0.2 },
    defaultImportance: 0.8,
    metadata: { category: "semantic", sourceFamily: "semantic_v1" },
  }),
  makeAttribute({
    canonicalAttributeId: "sweetness",
    displayName: "Sweetness",
    aliases: ["sweetness", "sweet", "gourmand"],
    axisMapping: ["sweetness", "warmth"],
    vectorMapping: { sweetness: 0.8, warmth: 0.25 },
    defaultImportance: 0.85,
    metadata: { category: "semantic", sourceFamily: "semantic_v1" },
  }),
  makeAttribute({
    canonicalAttributeId: "musk_clean",
    displayName: "Musk Clean",
    aliases: ["musk_clean", "musk clean", "musk", "clean", "cleanliness", "white musk", "soap", "soapy"],
    axisMapping: ["cleanliness", "elegance"],
    vectorMapping: { cleanliness: 0.85, elegance: 0.2 },
    defaultImportance: 0.8,
    metadata: { category: "semantic", sourceFamily: "semantic_v1" },
  }),
  makeAttribute({
    canonicalAttributeId: "distinct",
    displayName: "Distinct",
    aliases: ["distinct", "uniqueness"],
    axisMapping: ["elegance", "darkness"],
    vectorMapping: { elegance: 0.3, darkness: 0.3 },
    defaultImportance: 0.7,
    metadata: { category: "test", sourceFamily: "abstract" },
  }),
  makeAttribute({
    canonicalAttributeId: "intense",
    displayName: "Intense",
    aliases: ["intens", "intense", "presence"],
    axisMapping: ["darkness", "warmth"],
    vectorMapping: { darkness: 0.45, warmth: 0.35 },
    defaultImportance: 0.75,
    metadata: { category: "test", sourceFamily: "abstract" },
  }),
  makeAttribute({
    canonicalAttributeId: "luminous",
    displayName: "Luminous",
    aliases: ["luminos", "luminosity", "luminous"],
    axisMapping: ["freshness", "cleanliness"],
    vectorMapping: { freshness: 0.6, cleanliness: 0.35 },
    defaultImportance: 0.7,
    metadata: { category: "test", sourceFamily: "abstract" },
  }),
  makeAttribute({
    canonicalAttributeId: "green",
    displayName: "Green",
    aliases: ["green", "herbal", "herb", "leaf", "leafy", "natural"],
    axisMapping: ["freshness", "cleanliness"],
    vectorMapping: { freshness: 0.6, cleanliness: 0.3 },
    defaultImportance: 0.7,
    metadata: { category: "semantic", sourceFamily: "notes" },
  }),
  makeAttribute({
    canonicalAttributeId: "rose",
    displayName: "Rose",
    aliases: ["rose"],
    axisMapping: ["elegance", "sweetness"],
    vectorMapping: { elegance: 0.45, sweetness: 0.2 },
    defaultImportance: 0.65,
    metadata: { category: "semantic", sourceFamily: "notes" },
  }),
  makeAttribute({
    canonicalAttributeId: "oud",
    displayName: "Oud",
    aliases: ["oud"],
    axisMapping: ["darkness", "elegance"],
    vectorMapping: { darkness: 0.8, elegance: 0.25 },
    defaultImportance: 0.75,
    metadata: { category: "semantic", sourceFamily: "notes" },
  }),
  makeAttribute({
    canonicalAttributeId: "amber",
    displayName: "Amber",
    aliases: ["amber"],
    axisMapping: ["warmth", "sweetness"],
    vectorMapping: { warmth: 0.7, sweetness: 0.15 },
    defaultImportance: 0.75,
    metadata: { category: "semantic", sourceFamily: "notes" },
  }),
  makeAttribute({
    canonicalAttributeId: "freshness",
    displayName: "Freshness",
    aliases: ["freshness", "fresh"],
    axisMapping: ["freshness", "cleanliness"],
    vectorMapping: { freshness: 0.85, cleanliness: 0.3 },
    defaultImportance: 0.9,
    metadata: { category: "semantic", sourceFamily: "axes" },
  }),
  makeAttribute({
    canonicalAttributeId: "tea",
    displayName: "Tea",
    aliases: ["tea"],
    axisMapping: ["freshness", "elegance"],
    vectorMapping: { freshness: 0.4, elegance: 0.25, cleanliness: 0.2 },
    defaultImportance: 0.7,
    metadata: { category: "semantic", sourceFamily: "notes" },
  }),
  makeAttribute({
    canonicalAttributeId: "water",
    displayName: "Water",
    aliases: ["water", "aquatic"],
    axisMapping: ["freshness", "cleanliness"],
    vectorMapping: { freshness: 0.4, cleanliness: 0.3 },
    defaultImportance: 0.6,
    metadata: { category: "semantic", sourceFamily: "notes" },
  }),
  makeAttribute({
    canonicalAttributeId: "metallic",
    displayName: "Metallic",
    aliases: ["metallic", "silver"],
    axisMapping: ["cleanliness", "elegance"],
    vectorMapping: { cleanliness: 0.35, elegance: 0.25 },
    defaultImportance: 0.6,
    metadata: { category: "semantic", sourceFamily: "axes" },
  }),
  makeAttribute({
    canonicalAttributeId: "airiness",
    displayName: "Airiness",
    aliases: ["airiness", "airy"],
    axisMapping: ["freshness", "cleanliness"],
    vectorMapping: { freshness: 0.45, cleanliness: 0.35 },
    defaultImportance: 0.65,
    metadata: { category: "semantic", sourceFamily: "axes" },
  }),
  makeAttribute({
    canonicalAttributeId: "luxury",
    displayName: "Luxury",
    aliases: ["luxury", "lux"],
    axisMapping: ["elegance", "warmth"],
    vectorMapping: { elegance: 0.7, warmth: 0.2 },
    defaultImportance: 0.7,
    metadata: { category: "semantic", sourceFamily: "axes" },
  }),
  makeAttribute({
    canonicalAttributeId: "smoothness",
    displayName: "Smoothness",
    aliases: ["smoothness", "smooth"],
    axisMapping: ["elegance", "warmth"],
    vectorMapping: { elegance: 0.45, warmth: 0.25 },
    defaultImportance: 0.65,
    metadata: { category: "semantic", sourceFamily: "axes" },
  }),
  makeAttribute({
    canonicalAttributeId: "reflection",
    displayName: "Reflection",
    aliases: ["reflection", "reflective"],
    axisMapping: ["elegance", "cleanliness"],
    vectorMapping: { elegance: 0.5, cleanliness: 0.3 },
    defaultImportance: 0.6,
    metadata: { category: "semantic", sourceFamily: "axes" },
  }),
  makeAttribute({
    canonicalAttributeId: "white_florals",
    displayName: "White Florals",
    aliases: ["white_florals", "white florals"],
    axisMapping: ["elegance", "sweetness", "cleanliness"],
    vectorMapping: { elegance: 0.35, sweetness: 0.25, cleanliness: 0.2 },
    defaultImportance: 0.6,
    metadata: { category: "semantic", sourceFamily: "notes" },
  }),
  makeAttribute({
    canonicalAttributeId: "creaminess",
    displayName: "Creaminess",
    aliases: ["creaminess", "creamy"],
    axisMapping: ["sweetness", "warmth"],
    vectorMapping: { sweetness: 0.45, warmth: 0.3 },
    defaultImportance: 0.6,
    metadata: { category: "semantic", sourceFamily: "axes" },
  }),
  makeAttribute({
    canonicalAttributeId: "warmth",
    displayName: "Warmth",
    aliases: ["warmth", "warm"],
    axisMapping: ["warmth", "darkness"],
    vectorMapping: { warmth: 0.8, darkness: 0.2 },
    defaultImportance: 0.85,
    metadata: { category: "semantic", sourceFamily: "axes" },
  }),
  makeAttribute({
    canonicalAttributeId: "tobacco",
    displayName: "Tobacco",
    aliases: ["tobacco"],
    axisMapping: ["darkness", "warmth"],
    vectorMapping: { darkness: 0.7, warmth: 0.25 },
    defaultImportance: 0.75,
    metadata: { category: "semantic", sourceFamily: "notes" },
  }),
  makeAttribute({
    canonicalAttributeId: "lavender",
    displayName: "Lavender",
    aliases: ["lavender"],
    axisMapping: ["cleanliness", "elegance"],
    vectorMapping: { cleanliness: 0.4, elegance: 0.15 },
    defaultImportance: 0.65,
    metadata: { category: "semantic", sourceFamily: "notes" },
  }),

  makeAttribute({
    canonicalAttributeId: "grounding_fresh_citrusy",
    displayName: "Fresh & Citrusy",
    aliases: ["fresh & citrusy", "fresh and citrusy", "citrus token"],
    axisMapping: ["freshness", "cleanliness"],
    vectorMapping: { freshness: 1, cleanliness: 0.6 },
    defaultImportance: 1,
    metadata: {
      category: "grounding",
      sourceFamily: "grounding",
      groundingExpansionTokens: ["citrus", "bergamot", "lemon"],
    },
  }),
  makeAttribute({
    canonicalAttributeId: "grounding_sweet_gourmand",
    displayName: "Sweet & Gourmand",
    aliases: ["sweet & gourmand", "sweet and gourmand"],
    axisMapping: ["sweetness", "warmth"],
    vectorMapping: { sweetness: 1, warmth: 0.6 },
    defaultImportance: 1,
    metadata: {
      category: "grounding",
      sourceFamily: "grounding",
      groundingExpansionTokens: ["honey", "vanilla", "caramel"],
    },
  }),
  makeAttribute({
    canonicalAttributeId: "grounding_woody_dry",
    displayName: "Woody & Dry",
    aliases: ["woody & dry", "woody and dry"],
    axisMapping: ["darkness", "elegance"],
    vectorMapping: { darkness: 0.7, elegance: 0.2 },
    defaultImportance: 1,
    metadata: {
      category: "grounding",
      sourceFamily: "grounding",
      groundingExpansionTokens: ["wood", "cedar", "vetiver"],
    },
  }),
  makeAttribute({
    canonicalAttributeId: "grounding_clean_soapy",
    displayName: "Clean & Soapy",
    aliases: ["clean & soapy", "clean and soapy"],
    axisMapping: ["cleanliness", "freshness"],
    vectorMapping: { cleanliness: 1, freshness: 0.4 },
    defaultImportance: 1,
    metadata: {
      category: "grounding",
      sourceFamily: "grounding",
      groundingExpansionTokens: ["clean", "soap", "white musk"],
    },
  }),
  makeAttribute({
    canonicalAttributeId: "grounding_spicy_warm",
    displayName: "Spicy & Warm",
    aliases: ["spicy & warm", "spicy and warm"],
    axisMapping: ["warmth", "sweetness"],
    vectorMapping: { warmth: 1, sweetness: 0.2 },
    defaultImportance: 1,
    metadata: {
      category: "grounding",
      sourceFamily: "grounding",
      groundingExpansionTokens: ["spice", "cinnamon", "amber"],
    },
  }),
  makeAttribute({
    canonicalAttributeId: "grounding_green_natural",
    displayName: "Green & Natural",
    aliases: ["green & natural", "green and natural"],
    axisMapping: ["freshness"],
    vectorMapping: { freshness: 0.8 },
    defaultImportance: 1,
    metadata: {
      category: "grounding",
      sourceFamily: "grounding",
      groundingExpansionTokens: ["green", "herbal", "leaf"],
    },
  }),
  makeAttribute({
    canonicalAttributeId: "grounding_dark_smoky",
    displayName: "Dark & Smoky",
    aliases: ["dark & smoky", "dark and smoky", "smoky", "smoke", "incense", "dark"],
    axisMapping: ["darkness"],
    vectorMapping: { darkness: 1 },
    defaultImportance: 1,
    metadata: {
      category: "grounding",
      sourceFamily: "grounding",
      groundingExpansionTokens: ["smoke", "incense", "dark"],
    },
  }),
  makeAttribute({
    canonicalAttributeId: "grounding_soft_powdery",
    displayName: "Soft & Powdery",
    aliases: ["soft & powdery", "soft and powdery", "powdery", "powder", "iris", "soft"],
    axisMapping: ["elegance", "sweetness"],
    vectorMapping: { elegance: 1, sweetness: 0.3 },
    defaultImportance: 1,
    metadata: {
      category: "grounding",
      sourceFamily: "grounding",
      groundingExpansionTokens: ["powder", "iris", "soft"],
    },
  }),
];

const LOOKUP_INDEX = buildLookupIndex(CANONICAL_ATTRIBUTE_REGISTRY);

export function getCanonicalAttributeRegistry(): ReadonlyArray<CanonicalAttributeDefinition> {
  return CANONICAL_ATTRIBUTE_REGISTRY;
}

export function getCanonicalAttributeById(
  canonicalAttributeId: CanonicalAttributeId
): CanonicalAttributeDefinition | null {
  const normalizedId = normalizeAttributeInput(canonicalAttributeId);
  return LOOKUP_INDEX.get(normalizedId) ?? null;
}

export function resolveCanonicalAttribute(input: string): CanonicalAttributeDefinition | null {
  const normalizedInput = normalizeAttributeInput(input);
  return LOOKUP_INDEX.get(normalizedInput) ?? null;
}

export function normalizeAttributeInput(input: string): string {
  let value = input;

  if (DEFAULT_NORMALIZATION.replaceUnderscores) {
    value = value.replace(/_/g, " ");
  }

  if (DEFAULT_NORMALIZATION.trim) {
    value = value.trim();
  }

  if (DEFAULT_NORMALIZATION.lowercase) {
    value = value.toLowerCase();
  }

  if (DEFAULT_NORMALIZATION.stripPunctuation) {
    value = value.replace(/[^a-z0-9\s&]+/g, " ");
  }

  if (DEFAULT_NORMALIZATION.collapseWhitespace) {
    value = value.replace(/\s+/g, " ");
  }

  return value;
}

function makeAttribute(input: {
  canonicalAttributeId: CanonicalAttributeId;
  displayName: string;
  aliases: string[];
  axisMapping: Array<keyof OlfactoryVector>;
  vectorMapping: Partial<Record<keyof OlfactoryVector, number>>;
  defaultImportance: number;
  metadata: CanonicalAttributeDefinition["metadata"];
}): CanonicalAttributeDefinition {
  return {
    canonicalAttributeId: input.canonicalAttributeId,
    displayName: input.displayName,
    aliases: input.aliases,
    axisMapping: input.axisMapping,
    vectorMapping: input.vectorMapping,
    defaultImportance: input.defaultImportance,
    normalizationRules: DEFAULT_NORMALIZATION,
    questionDefaults: {
      questionType: "intensity-scale",
      scale: DEFAULT_SCALE,
      promptTemplate: "Evaluate how present {attribute} feels in {fragrance}.",
    },
    localization: {
      translationKey: `attribute.${input.canonicalAttributeId}`,
      namespace: "attributes",
      defaultLocale: "en",
    },
    metadata: input.metadata,
  };
}

function buildLookupIndex(
  definitions: CanonicalAttributeDefinition[]
): Map<string, CanonicalAttributeDefinition> {
  const index = new Map<string, CanonicalAttributeDefinition>();

  for (const definition of definitions) {
    const normalizedId = normalizeAttributeInput(definition.canonicalAttributeId);
    index.set(normalizedId, definition);

    index.set(normalizeAttributeInput(definition.displayName), definition);

    for (const alias of definition.aliases) {
      index.set(normalizeAttributeInput(alias), definition);
    }
  }

  return index;
}
