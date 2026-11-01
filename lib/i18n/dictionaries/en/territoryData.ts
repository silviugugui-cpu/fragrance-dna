export interface TerritoryDisplay {
  name: string;
  description: string;
  characteristics: string[];
}

// Display text for olfactive territories, keyed by territory id (see lib/data/territories.ts).
const territoryData: Record<string, TerritoryDisplay> = {
  'fresh-citrus': {
    name: 'Fresh Citrus',
    description: 'Bright, zesty, and uplifting fragrances anchored by citrus notes. Essential oils from bergamot, lemon, lime, and grapefruit create immediate freshness and clarity.',
    characteristics: [
      'Bright and energetic',
      'Immediate freshness',
      'Citrus-forward',
      'Clean and crisp',
      'Morning-oriented'
    ]
  },
  'green-fresh': {
    name: 'Green Fresh',
    description: 'Herbaceous and vegetal fragrances with green notes, galbanum, and aromatic herbs. Creates a natural, garden-like freshness with structural complexity.',
    characteristics: [
      'Herbaceous and green',
      'Aromatic complexity',
      'Garden-inspired',
      'Natural character',
      'Balanced freshness'
    ]
  },
  'luxury-fresh': {
    name: 'Luxury Fresh',
    description: 'Premium citrus and fresh fragrances with sophisticated depth. Combines immediate freshness with refined base notes for elevated, refined character.',
    characteristics: [
      'Premium quality',
      'Sophisticated character',
      'Fresh with depth',
      'Refined composites',
      'Elegant presence'
    ]
  },
  'honey-tobacco': {
    name: 'Honey Tobacco',
    description: 'Warm, slightly spicy fragrances balancing sweetness with tobacco character. Combines honey sweetness with dry tobacco leaf for compelling contrast.',
    characteristics: [
      'Warm and sweet',
      'Tobacco character',
      'Spiced warmth',
      'Balanced sweetness',
      'Sophisticated edge'
    ]
  },
  'rich-gourmand': {
    name: 'Rich Gourmand',
    description: 'Indulgent, sweet fragrances with gourmand notes like vanilla, caramel, amber, and chocolate. Creates warm, comforting, edible character.',
    characteristics: [
      'Sweet and indulgent',
      'Edible notes',
      'Warm enveloping',
      'Comforting character',
      'Rich character'
    ]
  },
  leather: {
    name: 'Leather',
    description: 'Complex fragrances featuring leather accords with smoky, animalic, and dry qualities. Evokes craftsmanship and sophistication with subtle sensuality.',
    characteristics: [
      'Leather character',
      'Smoky notes',
      'Animalic quality',
      'Refined sensuality',
      'Sophisticated edge'
    ]
  },
  'woody-elegant': {
    name: 'Woody Elegant',
    description: 'Sophisticated woody fragrances with cedarwood, agarwood, and sandalwood base. Provides dry, clean, refined character with depth and longevity.',
    characteristics: [
      'Woody and dry',
      'Refined character',
      'Elegant composites',
      'Clean and clear',
      'Durable presence'
    ]
  },
  amber: {
    name: 'Amber',
    description: 'Warm, golden fragrances with amber, resin, and spice notes. Creates a sensual, enveloping aura with oriental character and lasting impressiveness.',
    characteristics: [
      'Golden and warm',
      'Amber and resin',
      'Sensual character',
      'Oriental feel',
      'Lasting presence'
    ]
  },
  musk: {
    name: 'Musk',
    description: 'Soft, intimate fragrances with musky base notes creating a second-skin effect. Emphasizes skin chemistry and personal sensuality over projection.',
    characteristics: [
      'Soft and intimate',
      'Skin chemistry',
      'Personal scent',
      'Intimate aura',
      'Subtle presence'
    ]
  },
  floral: {
    name: 'Floral',
    description: 'Romantic and expressive fragrances with floral notes like rose, jasmine, peony, and tuberose. Ranges from delicate to heady with feminine or unisex character.',
    characteristics: [
      'Floral-forward',
      'Romantic character',
      'Expression of beauty',
      'Delicate to heady',
      'Emotional resonance'
    ]
  }
};

export default territoryData;
