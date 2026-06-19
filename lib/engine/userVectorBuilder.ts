type Seed = {
  attractors: string[];
  constraints: string[];
  neutral: string[];
};

type Vector = {
  freshness: number;
  warmth: number;
  sweetness: number;
  darkness: number;
  cleanliness: number;
  elegance: number;
};
const NORMALIZATION_MAP: Record<string, string> = {
  citrus: "Fresh & Citrusy",
  bergamot: "Fresh & Citrusy",
  lemon: "Fresh & Citrusy",

  vanilla: "Sweet & Gourmand",
  honey: "Sweet & Gourmand",
  caramel: "Sweet & Gourmand",

  clean: "Clean & Soapy",
  "white musk": "Clean & Soapy",

  green: "Green & Natural",
  herbal: "Green & Natural",
  leafy: "Green & Natural",

  smoky: "Dark & Smoky",
  smoke: "Dark & Smoky",
  incense: "Dark & Smoky",

  wood: "Woody & Dry",
  cedar: "Woody & Dry",
  vetiver: "Woody & Dry",
};
const TOKEN_MAP: Record<string, Partial<Vector>> = {
  "Fresh & Citrusy": {
    freshness: 1,
    cleanliness: 0.6,
  },

  "Sweet & Gourmand": {
    sweetness: 1,
    warmth: 0.6,
  },

  "Woody & Dry": {
    darkness: 0.7,
    elegance: 0.2,
  },

  "Clean & Soapy": {
    cleanliness: 1,
    freshness: 0.4,
  },

  "Spicy & Warm": {
    warmth: 1,
    sweetness: 0.2,
  },

  "Green & Natural": {
    freshness: 0.8,
  },

  "Dark & Smoky": {
    darkness: 1,
  },

  "Soft & Powdery": {
    elegance: 1,
    sweetness: 0.3,
  },
};

function applyToken(vector: Vector, token: string, weight: number) {
  const map = TOKEN_MAP[token];
  if (!map) return;

  for (const key in map) {
    const k = key as keyof Vector;
    vector[k] += (map[k] || 0) * weight;
  }
}

function clamp(vector: Vector) {
  for (const key in vector) {
    const k = key as keyof Vector;
    vector[k] = Math.max(0, Math.min(1, vector[k]));
  }
}

export function buildUserVector(seed: Seed): Vector {
  const vector: Vector = {
    freshness: 0,
    warmth: 0,
    sweetness: 0,
    darkness: 0,
    cleanliness: 0,
    elegance: 0,
  };

  const add = (key: keyof Vector, value: number) => {
    vector[key] += value;
  };

  const process = (tokens: string[], weight: number) => {
    tokens.forEach((t) => {
      const normalized = NORMALIZATION_MAP[t.toLowerCase()] ?? null;
      if (!normalized) return;

      const map = TOKEN_MAP[normalized];
      if (!map) return;

      for (const key in map) {
        const k = key as keyof Vector;
        add(k, (map[k] || 0) * weight);
      }
    });
  };

  // POSITIVE
  process(seed.attractors, 1);

  // NEGATIVE
  process(seed.constraints, -1);

  // NEUTRAL
  process(seed.neutral, 0.2);

  // CLAMP
  Object.keys(vector).forEach((k) => {
    const key = k as keyof Vector;
    vector[key] = Math.max(0, Math.min(1, vector[key]));
  });

  return vector;
}