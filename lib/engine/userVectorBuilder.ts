import { resolveCanonicalAttribute } from "@/lib/intelligence/attributes";

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
      const definition = resolveCanonicalAttribute(t);
      const map = definition?.vectorMapping;
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