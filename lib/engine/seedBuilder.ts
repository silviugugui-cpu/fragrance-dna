import { resolveCanonicalAttribute } from "@/lib/intelligence/attributes";

export type GroundingInput = Partial<{
  love: string[];
  red_flag: string[];
  neutral: string[];
}>;

export type Seed = {
  attractors: string[];
  constraints: string[];
  neutral: string[];
};

export function buildSeed(input: GroundingInput): Seed {
  return {
    attractors: mapTokens(input.love),
    constraints: mapTokens(input.red_flag),
    neutral: mapTokens(input.neutral),
  };
}

function mapTokens(tokens: unknown): string[] {
  if (!Array.isArray(tokens)) return [];

  return tokens.flatMap((token) => {
    const raw = String(token);
    const resolved = resolveCanonicalAttribute(raw);
    const expanded = resolved?.metadata.groundingExpansionTokens;

    if (expanded && expanded.length > 0) {
      return expanded;
    }

    return [raw];
  });
}
