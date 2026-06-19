/**
 * Extended sensory mood categories for grounding
 * Replaces basic token system with richer sensory descriptors
 */

export const SENSORY_MOODS = [
  {
    name: "Fresh & Citrusy",
    description: "Bright, energetic, mood-lifting",
    comfort: 75,
    intensity: 60,
    vector: { freshness: 1, cleanliness: 0.6 },
  },
  {
    name: "Sweet & Gourmand",
    description: "Comforting, indulgent, warm-hearted",
    comfort: 85,
    intensity: 55,
    vector: { sweetness: 1, warmth: 0.6 },
  },
  {
    name: "Woody & Dry",
    description: "Grounding, sophisticated, contemplative",
    comfort: 70,
    intensity: 65,
    vector: { darkness: 0.7, elegance: 0.8 },
  },
  {
    name: "Clean & Soapy",
    description: "Pure, refreshing, trustworthy",
    comfort: 80,
    intensity: 45,
    vector: { cleanliness: 1, freshness: 0.7 },
  },
  {
    name: "Spicy & Warm",
    description: "Sensual, daring, passionate",
    comfort: 60,
    intensity: 75,
    vector: { warmth: 1, darkness: 0.5 },
  },
  {
    name: "Green & Natural",
    description: "Organic, peaceful, grounded",
    comfort: 75,
    intensity: 50,
    vector: { freshness: 0.8, cleanliness: 0.7 },
  },
  {
    name: "Dark & Smoky",
    description: "Mysterious, intense, unconventional",
    comfort: 40,
    intensity: 85,
    vector: { darkness: 1, elegance: 0.6 },
  },
  {
    name: "Soft & Powdery",
    description: "Gentle, nostalgic, comforting",
    comfort: 90,
    intensity: 35,
    vector: { sweetness: 0.7, elegance: 0.7 },
  },
];

/**
 * Extended calibration categories for better user profiling
 * Sensory + emotional axes
 */
export const CALIBRATION_CATEGORIES = [
  {
    id: "time-of-day",
    name: "When do you wear fragrance?",
    options: [
      "Morning rituals (energize & refresh)",
      "Office hours (steady & professional)",
      "Evening unwind (comfort & relaxation)",
      "Special occasions (statement & luxury)",
      "Anytime (versatile & adaptable)",
    ],
  },
  {
    id: "comfort-intensity",
    name: "Comfort vs Intensity preference",
    description: "Where on the spectrum do you prefer?",
    scale: {
      min: "Safe & comforting (familiar, low-risk)",
      max: "Bold & intense (daring, experimental)",
    },
  },
  {
    id: "contrast-detection",
    name: "Do you like surprising notes?",
    options: [
      "Prefer harmony (all notes work together)",
      "Like subtle contrasts (interesting twists)",
      "Love bold opposites (complexity & contrast)",
    ],
  },
  {
    id: "seasonal-affinity",
    name: "Strong seasonal preference?",
    options: [
      "Year-round (no preference)",
      "Seasonal shifter (different for each season)",
      "One season lover (summer / winter)",
    ],
  },
  {
    id: "occasion-versatility",
    name: "How do you use fragrance?",
    options: [
      "Single signature (one daily go-to)",
      "Occasion-based (different for different moments)",
      "Mood-driven (based on how I feel)",
    ],
  },
];

/**
 * Map grounding tokens + comfort/intensity/contrast to user vector
 */
export function buildEnhancedGroundingVector(groundingData: {
  love: string[];
  neutral: string[];
  hate: string[];
  comfortLevel?: number; // -1 to 1
  contrastPreference?: number; // 0 to 1
  occasionPreference?: string;
  seasonalShifter?: boolean;
}) {
  const { love, hate, comfortLevel = 0, contrastPreference = 0.5 } = groundingData;

  // Aggregate vectors from favorite moods
  let aggregatedVector = {
    freshness: 0.5,
    warmth: 0.5,
    sweetness: 0.5,
    darkness: 0.5,
    cleanliness: 0.5,
    elegance: 0.5,
  };

  if (love.length > 0) {
    const loveMoods = SENSORY_MOODS.filter((m) => love.includes(m.name));
    const avgVector = {
      freshness: 0,
      warmth: 0,
      sweetness: 0,
      darkness: 0,
      cleanliness: 0,
      elegance: 0,
    };

    for (const mood of loveMoods) {
      for (const [key, val] of Object.entries(mood.vector)) {
        (avgVector as any)[key] += val;
      }
    }

    if (loveMoods.length > 0) {
      for (const key of Object.keys(avgVector)) {
        (avgVector as any)[key] /= loveMoods.length;
      }
      aggregatedVector = avgVector;
    }
  }

  // Adjust for comfort preference
  if (comfortLevel > 0) {
    // Comfort seeker: boost sweetness, elegtance, cleanliness
    aggregatedVector.sweetness += comfortLevel * 0.2;
    aggregatedVector.elegance += comfortLevel * 0.1;
    aggregatedVector.cleanliness += comfortLevel * 0.1;
  } else if (comfortLevel < 0) {
    // Intensity seeker: boost darkness, warmth
    aggregatedVector.darkness += Math.abs(comfortLevel) * 0.2;
    aggregatedVector.warmth += Math.abs(comfortLevel) * 0.15;
  }

  // Adjust for contrast preference
  if (contrastPreference > 0.6) {
    // Loves contrast: increase complexity by mixing axes
    const temp = aggregatedVector.freshness;
    aggregatedVector.freshness = Math.min(1, (temp + aggregatedVector.darkness) / 2);
  }

  // Clamp all values to [0.3, 0.7] for balance (full range is possible but less common)
  for (const key of Object.keys(aggregatedVector)) {
    let val = (aggregatedVector as any)[key];
    val = Math.max(0, Math.min(1, val));
    (aggregatedVector as any)[key] = val;
  }

  return aggregatedVector;
}

/**
 * Calculate comfort vs intensity score from mood preferences
 */
export function calculateComfortIntensityAxis(
  love: string[],
  hate: string[]
): number {
  // -1 = intensity seeker, 1 = comfort seeker
  let score = 0;
  let count = 0;

  for (const mood of love) {
    const sensory = SENSORY_MOODS.find((m) => m.name === mood);
    if (sensory) {
      const moodScore = (sensory.comfort - sensory.intensity) / 100;
      score += moodScore;
      count++;
    }
  }

  for (const mood of hate) {
    const sensory = SENSORY_MOODS.find((m) => m.name === mood);
    if (sensory) {
      const moodScore = (sensory.comfort - sensory.intensity) / 100;
      score -= moodScore;
      count++;
    }
  }

  return count > 0 ? Math.max(-1, Math.min(1, score / count)) : 0;
}

/**
 * Detect contrast preference from hate/love patterns
 */
export function detectContrastPreference(
  love: string[],
  hate: string[]
): number {
  // If user loves contrasting moods, they like contrast
  // E.g., loves "Fresh & Citrusy" AND "Dark & Smoky" = high contrast preference
  if (love.length < 2) return 0.5; // neutral

  const loveIntensities = love.map((m) => {
    const sensory = SENSORY_MOODS.find((s) => s.name === m);
    return sensory ? sensory.intensity : 50;
  });

  const minIntensity = Math.min(...loveIntensities);
  const maxIntensity = Math.max(...loveIntensities);
  const spread = maxIntensity - minIntensity;

  return Math.min(1, spread / 50); // normalize to 0-1
}
