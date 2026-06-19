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
    const t = String(token);

    switch (t) {
      case "Fresh & Citrusy":
        return ["citrus", "bergamot", "lemon"];

      case "Sweet & Gourmand":
        return ["honey", "vanilla", "caramel"];

      case "Woody & Dry":
        return ["wood", "cedar", "vetiver"];

      case "Clean & Soapy":
        return ["clean", "soap", "white musk"];

      case "Spicy & Warm":
        return ["spice", "cinnamon", "amber"];

      case "Green & Natural":
        return ["green", "herbal", "leaf"];

      case "Dark & Smoky":
        return ["smoke", "incense", "dark"];

      case "Soft & Powdery":
        return ["powder", "iris", "soft"];

      default:
        return [t];
    }
  });
}
