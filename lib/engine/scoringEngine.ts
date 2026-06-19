import raw from "@/data/FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json";

type Vector = {
  freshness: number;
  warmth: number;
  sweetness: number;
  darkness: number;
  cleanliness: number;
  elegance: number;
};

function cosineSimilarity(a: Vector, b: Partial<Vector>) {
  const keys: (keyof Vector)[] = [
    "freshness",
    "warmth",
    "sweetness",
    "darkness",
    "cleanliness",
    "elegance",
  ];

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const k of keys) {
    const av = a[k] ?? 0;
    const bv = b?.[k] ?? 0;

    dot += av * bv;
    magA += av * av;
    magB += bv * bv;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB) + 1e-8);
}

export function scoreFragrances(userVector: Vector, db: { FragranceDNA_USER_ATTRIBUTE_LAYER_v3: { note: string; layers: ({ name: string; type: string; dna_axes: { Freshness: number; Warmth: number; Complexity: number; Elegance: number; Character: number; Presence: number; Comfort: number; Uniqueness: number; Versatility: number; Luxury: number; Formality?: undefined; }; semantic_v1: { freshness: number; warmth: number; citrus: number; woods: number; spices: number; sweetness: number; gourmand: number; floral: number; musk_clean: number; leather_dark: number; aromatic: number; }; user_attributes_v3: { abstract: string[]; concrete: string[]; }; } | { name: string; type: string; dna_axes: { Freshness: number; Warmth: number; Complexity: number; Elegance: number; Character: number; Presence: number; Comfort: number; Uniqueness: number; Versatility: number; Luxury: number; Formality: number; }; semantic_v1: { freshness: number; warmth: number; citrus: number; woods: number; spices: number; sweetness: number; gourmand: number; floral: number; musk_clean: number; leather_dark: number; aromatic: number; }; user_attributes_v3: { abstract: string[]; concrete: string[]; }; })[]; }; }) {
  const rawDb: any = raw;

  // 🔥 normalize all possible JSON shapes
  const source = rawDb?.default ?? rawDb;

  const fragrances =
    source?.FragranceDNA_UserAttributeLayer_v3?.layers ??
    source?.FragranceDNA_USER_ATTRIBUTE_LAYER_v3?.layers ??
    source?.layers ??
    [];

  if (!Array.isArray(fragrances)) {
    console.log("❌ INVALID DB STRUCTURE:", source);
    return [];
  }

  const results = fragrances.map((frag: any) => {
    const similarity = cosineSimilarity(
      userVector,
      frag?.dna_axes ?? {}
    );

    return {
      fragrance: frag,
      score: similarity,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}