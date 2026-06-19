import { OlfactoryVector, ExtendedFragrance, MatchExplanation } from "@/lib/types";

/**
 * Enhanced matching engine with explainability
 * Scores a fragrance against user vector and provides reasoning
 */
export function scoreWithExplanation(
  userVector: OlfactoryVector,
  fragrance: ExtendedFragrance,
  userProfile?: { confidenceLevel: number; evolutionStage: string }
): MatchExplanation {
  const fragranceVector = fragrance.olfactoryVector || {
    freshness: 0.5,
    warmth: 0.5,
    sweetness: 0.5,
    darkness: 0.5,
    cleanliness: 0.5,
    elegance: 0.5,
  };

  const axes: (keyof OlfactoryVector)[] = [
    "freshness",
    "warmth",
    "sweetness",
    "darkness",
    "cleanliness",
    "elegance",
  ];

  // Calculate alignment for each axis
  const axisAlignments = axes.map((axis) => {
    const userVal = userVector[axis] ?? 0.5;
    const fragVal = fragranceVector[axis] ?? 0.5;

    // Alignment: 1 = perfect match, 0 = neutral, -1 = opposite
    // Using cosine-like metric but normalized to user preference
    const diff = Math.abs(userVal - fragVal);
    const alignment = 1 - diff * 2; // 1 when diff=0, -1 when diff=0.5

    return {
      axis: formatAxisName(axis),
      userValue: userVal,
      fragranceValue: fragVal,
      alignment: alignment,
    };
  });

  // Primary axes: top 3 by absolute user value
  const primaryAxes = axes
    .map((axis, idx) => ({
      ...axisAlignments[idx],
      userAbsolute: Math.abs(userVector[axis] ?? 0.5 - 0.5),
    }))
    .sort((a, b) => b.userAbsolute - a.userAbsolute)
    .slice(0, 3)
    .map(({ userAbsolute, ...rest }) => rest);

  // Overall score: average alignment on primary axes
  const score = Math.max(
    0,
    Math.min(
      1,
      (primaryAxes.reduce((sum, a) => sum + a.alignment, 0) / 3 + 1) / 2
    )
  );

  // Generate reasoning
  const reasoning = generateMatchReasoning(
    fragrance.name || "This fragrance",
    primaryAxes,
    userProfile?.evolutionStage || "stable"
  );

  // Detect contrast points
  const contrastPoints = detectContrasts(axisAlignments);

  return {
    score,
    primaryAxes,
    matchReasoning: reasoning,
    contrastPoints,
  };
}

/**
 * Compute compatibility between user DNA and fragrance collection
 */
export function computeCollectionCompatibility(
  userVector: OlfactoryVector,
  fragrances: ExtendedFragrance[]
): Map<string, number> {
  const compatibility = new Map<string, number>();

  for (const fragrance of fragrances) {
    const explanation = scoreWithExplanation(userVector, fragrance);
    compatibility.set(fragrance.id || fragrance.name || "", explanation.score);
  }

  return compatibility;
}

/**
 * Get dominant axes from user vector
 */
export function getDominantAxes(vector: OlfactoryVector): string[] {
  const axes: (keyof OlfactoryVector)[] = [
    "freshness",
    "warmth",
    "sweetness",
    "darkness",
    "cleanliness",
    "elegance",
  ];

  const sorted = axes
    .map((axis) => ({
      axis,
      value: Math.abs((vector[axis] ?? 0.5) - 0.5),
    }))
    .sort((a, b) => b.value - a.value);

  return sorted.slice(0, 2).map((x) => formatAxisName(x.axis));
}

/**
 * Generate "why this matches you" explanation
 */
function generateMatchReasoning(
  fragranceName: string,
  primaryAxes: Array<{ axis: string; userValue: number; alignment: number }>,
  evolutionStage: string
): string {
  const posAxes = primaryAxes
    .filter((a) => a.alignment > 0.2)
    .map((a) => a.axis.toLowerCase());
  const negAxes = primaryAxes
    .filter((a) => a.alignment < -0.2)
    .map((a) => a.axis.toLowerCase());

  const maxAlignment = Math.max(...primaryAxes.map((a) => a.alignment));
  const confidenceWord =
    maxAlignment > 0.6
      ? "strongly"
      : maxAlignment > 0.3
        ? "clearly"
        : "subtly";

  let reasoning = `${fragranceName} ${confidenceWord} aligns with your`;

  if (posAxes.length > 0) {
    reasoning += ` ${posAxes.join(" and ")}`;
  }

  if (negAxes.length > 0) {
    reasoning += ` while introducing contrast in ${negAxes.join(" and ")}`;
  }

  if (evolutionStage === "early") {
    reasoning += ". As your scent identity forms, this could reveal new dimensions.";
  } else if (evolutionStage === "refined") {
    reasoning +=
      ". Your refined palate will appreciate the sophistication here.";
  } else {
    reasoning += ".";
  }

  return reasoning;
}

/**
 * Detect contrast axes (where fragrance differs significantly from user preference)
 */
function detectContrasts(
  axisAlignments: Array<{ axis: string; alignment: number }>
): string[] {
  return axisAlignments
    .filter((a) => a.alignment < -0.3)
    .map((a) => `Introduces ${a.axis.toLowerCase()}`)
    .slice(0, 2);
}

function formatAxisName(axis: string): string {
  return axis.charAt(0).toUpperCase() + axis.slice(1);
}
