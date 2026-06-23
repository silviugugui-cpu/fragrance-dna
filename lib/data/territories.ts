/**
 * Olfactory Territories Database
 * 
 * Complete fragrance territory classification system with characteristics,
 * DNA associations, and fragrance examples.
 */

export interface Territory {
  id: string;
  name: string;
  label: string;
  description: string;
  characteristics: string[];
  dnaAxes: string[];
  examples: string[];
  color: string;
  intensity: 'light' | 'moderate' | 'intense';
  versatility: number; // 0-100
  season: string[];
}

export const territories: Record<string, Territory> = {
  freshCitrus: {
    id: 'fresh-citrus',
    name: 'Fresh Citrus',
    label: 'FRESH CITRUS',
    description: 'Bright, zesty, and uplifting fragrances anchored by citrus notes. Essential oils from bergamot, lemon, lime, and grapefruit create immediate freshness and clarity.',
    characteristics: [
      'Bright and energetic',
      'Immediate freshness',
      'Citrus-forward',
      'Clean and crisp',
      'Morning-oriented'
    ],
    dnaAxes: ['Freshness', 'Versatility', 'Presence'],
    examples: [
      'Acqua di Gio',
      'Light Blue',
      'Terre d\'Hermès EDT',
      'Neroli Portofino',
      'Bergamote 22'
    ],
    color: '#E8D966',
    intensity: 'light',
    versatility: 85,
    season: ['spring', 'summer']
  },

  greenFresh: {
    id: 'green-fresh',
    name: 'Green Fresh',
    label: 'GREEN FRESH',
    description: 'Herbaceous and vegetal fragrances with green notes, galbanum, and aromatic herbs. Creates a natural, garden-like freshness with structural complexity.',
    characteristics: [
      'Herbaceous and green',
      'Aromatic complexity',
      'Garden-inspired',
      'Natural character',
      'Balanced freshness'
    ],
    dnaAxes: ['Freshness', 'Complexity', 'Presence'],
    examples: [
      'Guerlain Vetiver',
      'Hermes Eau de Gentillesse',
      'Acqua di Parma Blu Mediterraneo',
      'Maison Margiela Beach Walk',
      'Penhaligons Elisium'
    ],
    color: '#9ACD32',
    intensity: 'moderate',
    versatility: 80,
    season: ['spring', 'summer', 'fall']
  },

  luxuryFresh: {
    id: 'luxury-fresh',
    name: 'Luxury Fresh',
    label: 'LUXURY FRESH',
    description: 'Premium citrus and fresh fragrances with sophisticated depth. Combines immediate freshness with refined base notes for elevated, refined character.',
    characteristics: [
      'Premium quality',
      'Sophisticated character',
      'Fresh with depth',
      'Refined composites',
      'Elegant presence'
    ],
    dnaAxes: ['Freshness', 'Refinement', 'Presence'],
    examples: [
      'Creed Virgin Island Water',
      'Hermès H24',
      'Dior Homme Cologne',
      'Tom Ford Neroli Portofino',
      'Roja Dove Danger'
    ],
    color: '#87CEEB',
    intensity: 'light',
    versatility: 90,
    season: ['spring', 'summer', 'fall']
  },

  honeyTobacco: {
    id: 'honey-tobacco',
    name: 'Honey Tobacco',
    label: 'HONEY TOBACCO',
    description: 'Warm, slightly spicy fragrances balancing sweetness with tobacco character. Combines honey sweetness with dry tobacco leaf for compelling contrast.',
    characteristics: [
      'Warm and sweet',
      'Tobacco character',
      'Spiced warmth',
      'Balanced sweetness',
      'Sophisticated edge'
    ],
    dnaAxes: ['Warmth', 'Complexity', 'Comfort'],
    examples: [
      'Davidoff Horizon',
      'Heeley Sel Marin',
      'Tom Ford Tobacco Vanille',
      'Maison Margiela Beach Walk',
      'Papousse'
    ],
    color: '#CD853F',
    intensity: 'moderate',
    versatility: 75,
    season: ['fall', 'winter']
  },

  richGourmand: {
    id: 'rich-gourmand',
    name: 'Rich Gourmand',
    label: 'RICH GOURMAND',
    description: 'Indulgent, sweet fragrances with gourmand notes like vanilla, caramel, amber, and chocolate. Creates warm, comforting, edible character.',
    characteristics: [
      'Sweet and indulgent',
      'Edible notes',
      'Warm enveloping',
      'Comforting character',
      'Rich character'
    ],
    dnaAxes: ['Warmth', 'Comfort', 'Sensuality'],
    examples: [
      'Givenchy Gentleman Reserve Privée',
      'Tom Ford Lost Cherry',
      'Heeley Sel Marin',
      'Prada L\'Homme Versace',
      'Maison Martin Margiela Replica Lazy Sunday'
    ],
    color: '#D2691E',
    intensity: 'intense',
    versatility: 70,
    season: ['fall', 'winter']
  },

  leather: {
    id: 'leather',
    name: 'Leather',
    label: 'LEATHER',
    description: 'Complex fragrances featuring leather accords with smoky, animalic, and dry qualities. Evokes craftsmanship and sophistication with subtle sensuality.',
    characteristics: [
      'Leather character',
      'Smoky notes',
      'Animalic quality',
      'Refined sensuality',
      'Sophisticated edge'
    ],
    dnaAxes: ['Complexity', 'Sensuality', 'Refinement'],
    examples: [
      'Hermès Ombre Leather',
      'Dior Homme EDP',
      'Tom Ford Black Orchid',
      'Caron Ombre Leather',
      'Givenchy Gentleman Reserve Privée'
    ],
    color: '#8B4513',
    intensity: 'moderate',
    versatility: 65,
    season: ['fall', 'winter']
  },

  woodyElegant: {
    id: 'woody-elegant',
    name: 'Woody Elegant',
    label: 'WOODY ELEGANT',
    description: 'Sophisticated woody fragrances with cedarwood, agarwood, and sandalwood base. Provides dry, clean, refined character with depth and longevity.',
    characteristics: [
      'Woody and dry',
      'Refined character',
      'Elegant composites',
      'Clean and clear',
      'Durable presence'
    ],
    dnaAxes: ['Refinement', 'Presence', 'Complexity'],
    examples: [
      'Chanel No. 5 EDP',
      'Hermès Eau de Gentillesse',
      'Dior Homme Original',
      'Creed Aventus',
      'Penhaligons Elisium'
    ],
    color: '#556B2F',
    intensity: 'moderate',
    versatility: 85,
    season: ['spring', 'summer', 'fall', 'winter']
  },

  amber: {
    id: 'amber',
    name: 'Amber',
    label: 'AMBER',
    description: 'Warm, golden fragrances with amber, resin, and spice notes. Creates a sensual, enveloping aura with oriental character and lasting impressiveness.',
    characteristics: [
      'Golden and warm',
      'Amber and resin',
      'Sensual character',
      'Oriental feel',
      'Lasting presence'
    ],
    dnaAxes: ['Warmth', 'Sensuality', 'Presence'],
    examples: [
      'Tom Ford Amber Absolute',
      'Hypnotic Poison',
      'Thierry Mugler Alien',
      'Givenchy Irresistible',
      'Maison Margiela Replica Lover Beach'
    ],
    color: '#D4A574',
    intensity: 'intense',
    versatility: 60,
    season: ['fall', 'winter']
  },

  musk: {
    id: 'musk',
    name: 'Musk',
    label: 'MUSK',
    description: 'Soft, intimate fragrances with musky base notes creating a second-skin effect. Emphasizes skin chemistry and personal sensuality over projection.',
    characteristics: [
      'Soft and intimate',
      'Skin chemistry',
      'Personal scent',
      'Intimate aura',
      'Subtle presence'
    ],
    dnaAxes: ['Sensuality', 'Comfort', 'Refinement'],
    examples: [
      'Maison Martin Margiela Beach Walk',
      'Replica Skin',
      'Le Labo Baie 19',
      'Byredo Balenciaga Florabotanica',
      'Parle Moi'
    ],
    color: '#A0826D',
    intensity: 'light',
    versatility: 95,
    season: ['spring', 'summer', 'fall', 'winter']
  },

  floral: {
    id: 'floral',
    name: 'Floral',
    label: 'FLORAL',
    description: 'Romantic and expressive fragrances with floral notes like rose, jasmine, peony, and tuberose. Ranges from delicate to heady with feminine or unisex character.',
    characteristics: [
      'Floral-forward',
      'Romantic character',
      'Expression of beauty',
      'Delicate to heady',
      'Emotional resonance'
    ],
    dnaAxes: ['Sensuality', 'Complexity', 'Refinement'],
    examples: [
      'Chanel No. 5',
      'Lancôme La Vie Est Belle',
      'Oscar La Renta',
      'Guerlain L\'Instant Guerlain',
      'Heeley Sel Marin'
    ],
    color: '#DB7093',
    intensity: 'moderate',
    versatility: 80,
    season: ['spring', 'summer']
  },
};

/**
 * Get all territories
 */
export function getAllTerritories(): Territory[] {
  return Object.values(territories);
}

/**
 * Get territory by ID
 */
export function getTerritoryById(id: string): Territory | undefined {
  return territories[Object.keys(territories).find(k => territories[k as keyof typeof territories].id === id) as keyof typeof territories];
}

/**
 * Get territories by season
 */
export function getTerritoriesBySeason(season: string): Territory[] {
  return Object.values(territories).filter(t => t.season.includes(season));
}

/**
 * Get territories by DNA axis
 */
export function getTerritoriesByAxis(axis: string): Territory[] {
  return Object.values(territories).filter(t => t.dnaAxes.includes(axis));
}

/**
 * Get territories by intensity
 */
export function getTerritoriesByIntensity(intensity: 'light' | 'moderate' | 'intense'): Territory[] {
  return Object.values(territories).filter(t => t.intensity === intensity);
}
