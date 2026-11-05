export const GROUNDING_TOKENS = [
  "Fresh & Citrusy", "Sweet & Gourmand", "Woody & Dry", "Clean & Soapy",
  "Spicy & Warm", "Green & Natural", "Dark & Smoky", "Soft & Powdery",
  "Floral & Rosy", "Fruity & Cherry", "Creamy & Coconut", "Marine & Aquatic",
];
export type GroundingZone = "unrated" | "love" | "neutral" | "hate";
export type GroundingState = Record<string, GroundingZone>;
export const emptyGroundingState = (): GroundingState => Object.fromEntries(GROUNDING_TOKENS.map((token) => [token, "unrated"]));

export function restoreGroundingState(value: unknown): GroundingState {
  const state = emptyGroundingState();
  if (!value || typeof value !== "object") throw new Error("Invalid grounding preferences");
  const input = value as Record<string, unknown>;
  for (const [key, zone] of [["love", "love"], ["neutral", "neutral"], ["red_flag", "hate"]] as const) {
    // Older saves included every untouched token in neutral; those are not evidence.
    if (key === "neutral" && input.schemaVersion !== 2) continue;
    if (input[key] !== undefined && !Array.isArray(input[key])) throw new Error(`Invalid grounding ${key}`);
    for (const token of (input[key] ?? []) as unknown[]) {
      if (typeof token === "string" && GROUNDING_TOKENS.includes(token)) state[token] = zone;
    }
  }
  return state;
}

export function groundingChoices(state: GroundingState) {
  const tokens = (zone: GroundingZone) => GROUNDING_TOKENS.filter((token) => state[token] === zone);
  return { schemaVersion: 2, love: tokens("love"), neutral: tokens("neutral"), red_flag: tokens("hate"),
    strength: { loveWeight: 1, neutralWeight: 0, hateWeight: -1.2 } };
}
