export type Fragrance = {
  id: string;
  name: string;
  brand?: string;
  year?: string;
  notes?: string[];
  dna_axes?: DNAAxis[];
  semantic_v1?: Record<string, number>;
};

export type AttributeKey = string;

export type AnswerRecord = Record<AttributeKey, number>;

export type DNAAxis = { name: string; value?: number };

export type FragranceLayer = {
  id?: string;
  name?: string;
  fragrances?: any[];
};

// 🧬 EXTENDED USER DNA SYSTEM
export type OlfactoryVector = {
  freshness: number;
  warmth: number;
  sweetness: number;
  darkness: number;
  cleanliness: number;
  elegance: number;
};

export type EvolutionStage = 'early' | 'forming' | 'stable' | 'refined';

export type DriftSnapshot = {
  timestamp: number;
  vector: OlfactoryVector;
  confidenceLevel: number;
};

export type UserDNAProfile = {
  userId: string; // or generated ID
  createdAt: number;
  updatedAt: number;
  
  // Core user vector
  dnaVector: OlfactoryVector;
  
  // Confidence & stability
  confidenceLevel: number; // 0-100
  dnaStabilityIndex: number; // 0-1, how consistent user preferences are
  evolutionStage: EvolutionStage;
  
  // Clustering & compatibility
  scentAffinityClusters: OlfactoryVector[]; // array of related preference vectors
  compatibilityHeatmap: Record<string, number>; // fragrance_id -> compatibility score (0-1)
  
  // Historical tracking
  identityDriftHistory: DriftSnapshot[];
  
  // Metadata
  totalInteractions: number;
  lastInteractionAt: number;
};

// 🌿 EXTENDED FRAGRANCE MODEL
export type SeasonalityAxis = {
  spring: number;
  summer: number;
  autumn: number;
  winter: number;
};

export type OccasionMap = {
  casual: number;
  office: number;
  evening: number;
  special: number;
};

export type ExtendedFragrance = Fragrance & {
  // Vectorized olfactory profile
  olfactoryVector?: OlfactoryVector;
  
  // Multi-axis seasonality (not just "summer")
  seasonalityMap?: SeasonalityAxis;
  
  // Occasion strength mapping
  occasionStrengthMap?: OccasionMap;
  
  // Emotional resonance score
  emotionalImpactScore?: number; // 0-100
  
  // Computed compatibility with current user
  dnaCompatibilityScore?: number; // 0-1, computed at request time
  
  // Brand & positioning
  positioningVector?: Record<string, number>; // luxury, niche, mainstream, etc.
};

// 🎯 GROUNDING EXTENSION - Sensory Moods & Axes
export type SensoryMood = {
  name: string;
  description: string;
  comfortLevel: number; // 0-100, how "comfort zone" it is
  intensityLevel: number; // 0-100, how intense/projected
  vectorInfluence: Partial<OlfactoryVector>;
};

export type GroundingExtended = {
  love: string[];
  neutral: string[];
  hate: string[];
  
  // New: Sensory mood preferences
  sensoryMoodPreferences?: Record<string, number>; // mood_name -> preference (-1 to 1)
  
  // New: Comfort vs Intensity axis
  comfortPreference?: number; // -1 (intensity seeker) to 1 (comfort seeker)
  
  // New: Contrast detection
  contrastPreference?: number; // 0 (harmonic) to 1 (contrasting)
};

// 🏢 BRAND PROFILE
export type BrandDNA = {
  brandName: string;
  brandVector: OlfactoryVector; // aggregated from top fragrances
  seasonalDistribution: SeasonalityAxis;
  fragranceCount: number;
  topFragrances: string[]; // fragrance IDs
  positioningTags: string[]; // luxury, niche, avant-garde, etc.
};

// 💎 USER COLLECTION ITEM
export type CollectionItem = {
  fragranceId: string;
  fragrance: ExtendedFragrance;
  addedAt: number;
  
  // Per-fragrance mapping
  personalCompatibilityScore: number; // vs user DNA
  
  // Usage tracking
  seasonalUsage: SeasonalityAxis;
  occasionUsage: OccasionMap;
  moodTriggers: string[]; // "confident", "relaxed", etc.
  
  // Local ranking in collection
  collectionRank: number; // position when sorted by compatibility
};

// 🔬 MATCHING ENGINE OUTPUT
export type MatchExplanation = {
  score: number; // 0-1
  primaryAxes: Array<{
    axis: string;
    userValue: number;
    fragranceValue: number;
    alignment: number; // -1 to 1, how aligned they are
  }>;
  matchReasoning: string; // "This fragrance activates your warmth & sweetness..."
  contrastPoints?: string[]; // "Introduces surprising darkness..."
};

export type RankedFragrance = {
  fragrance: ExtendedFragrance;
  score: number;
  explanation?: MatchExplanation;
};

export type CompatibilitySnapshot = Array<{
  fragranceId: string;
  fragranceName: string;
  score: number;
}>;

export type DNASummary = {
  finalVector: OlfactoryVector;
  confidenceScore: number;
  dominantAxes: string[];
  compatibilitySnapshot: CompatibilitySnapshot;
  completedAt: number;
  answeredCount: number;
};

export type DNASessionSnapshot = {
  fragranceId: string;
  fragranceName: string;
  vector: OlfactoryVector;
  confidenceScore: number;
  completedAt: number;
};

export type DNASessionState = {
  answers: Record<string, AnswerRecord>;
  answeredOrder: string[];
  currentIndex: number;
  currentVector: OlfactoryVector;
  snapshots: DNASessionSnapshot[];
  summary?: DNASummary;
  lastUpdatedAt: number;
};
