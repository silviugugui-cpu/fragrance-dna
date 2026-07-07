export type PerfumerDnaKey = 'Freshness' | 'Complexity' | 'Elegance' | 'Presence' | 'Luxury';

export type PerfumerCluster =
  | 'FRESH ARCHITECTS'
  | 'ORIENTAL SCULPTORS'
  | 'FLORAL ARTISTS'
  | 'MODERN MOLECULAR DESIGNERS'
  | 'HERITAGE HOUSES';

export type Perfumer = {
  name: string;
  style: string;
  philosophy: string;
  fragrances: string[];
  dna: Record<PerfumerDnaKey, number>;
  cluster: PerfumerCluster;
};

type PerfumerSeed = Omit<Perfumer, 'cluster'>;

const classifyPerfumerCluster = (perfumer: PerfumerSeed): PerfumerCluster => {
  const haystack = `${perfumer.style} ${perfumer.philosophy} ${perfumer.fragrances.join(' ')}`.toLowerCase();
  const { Freshness, Complexity, Elegance, Presence, Luxury } = perfumer.dna;

  const hasFreshDirection = /fresh|citrus|aquatic|mineral|clean|airy|transparency/.test(haystack);
  const hasOrientalDirection = /oriental|amber|spicy|dense|opulent|nightlife|sensual/.test(haystack);
  const hasHeritageDirection = /heritage|historic|timeless|tradition|guerlain|aristocratic/.test(haystack);
  const hasModernMolecularDirection = /modern|molecular|contrast|abstraction|synthetic/.test(haystack);

  if (hasFreshDirection && Freshness >= 88) {
    return 'FRESH ARCHITECTS';
  }

  if (
    (Complexity >= 85 && Elegance >= 85 && /floral/.test(haystack)) ||
    (Complexity >= 90 && Elegance >= 80 && /emotion|expressive|storytelling|artistic/.test(haystack))
  ) {
    return 'FLORAL ARTISTS';
  }

  if (hasOrientalDirection && Presence >= 90) {
    return 'ORIENTAL SCULPTORS';
  }

  if (hasModernMolecularDirection && Luxury >= 90) {
    return 'MODERN MOLECULAR DESIGNERS';
  }

  if (hasHeritageDirection || (Elegance >= 90 && Luxury >= 90 && Freshness >= 80)) {
    return 'HERITAGE HOUSES';
  }

  if (Freshness >= 85) {
    return 'FRESH ARCHITECTS';
  }

  if (Presence >= 90) {
    return 'ORIENTAL SCULPTORS';
  }

  return 'MODERN MOLECULAR DESIGNERS';
};

const perfumerSeeds: PerfumerSeed[] = [
  {
    name: 'Jean-Claude Ellena',
    style: 'Minimalist transparency, airy citrus compositions',
    philosophy: 'Less is more',
    fragrances: ['Terre d\'Hermes', 'Un Jardin sur le Nil', 'Eau d\'Orange Verte'],
    dna: { Freshness: 95, Complexity: 40, Elegance: 85, Presence: 45, Luxury: 70 },
  },
  {
    name: 'Francis Kurkdjian',
    style: 'Modern luxury, strong identity signatures',
    philosophy: 'Recognizability through contrast',
    fragrances: ['Baccarat Rouge 540', 'Grand Soir', 'Oud Satin Mood'],
    dna: { Freshness: 60, Complexity: 85, Elegance: 90, Presence: 95, Luxury: 100 },
  },
  {
    name: 'Olivier Creed',
    style: 'Fresh aristocratic luxury',
    philosophy: 'Nature plus heritage',
    fragrances: ['Aventus', 'Green Irish Tweed', 'Silver Mountain Water'],
    dna: { Freshness: 90, Complexity: 65, Elegance: 90, Presence: 85, Luxury: 90 },
  },
  {
    name: 'Alberto Morillas',
    style: 'Clean modern freshness',
    philosophy: 'Perfect simplicity',
    fragrances: ['Acqua di Gio', 'CK One', 'Bulgari Aqva'],
    dna: { Freshness: 95, Complexity: 55, Elegance: 70, Presence: 75, Luxury: 65 },
  },
  {
    name: 'Dominique Ropion',
    style: 'Dense sensual floral structures',
    philosophy: 'Strong backbone compositions',
    fragrances: ['Portrait of a Lady', 'La Vie Est Belle', 'Pure XS'],
    dna: { Freshness: 50, Complexity: 90, Elegance: 85, Presence: 95, Luxury: 85 },
  },
  {
    name: 'Thierry Wasser',
    style: 'Guerlain warm elegance',
    philosophy: 'Timeless French perfumery',
    fragrances: ['Mon Guerlain', 'L\'Homme Ideal', 'Shalimar'],
    dna: { Freshness: 55, Complexity: 80, Elegance: 95, Presence: 80, Luxury: 95 },
  },
  {
    name: 'Pierre Montale',
    style: 'Bold oriental-heavy compositions, intense projection',
    philosophy: 'More is more in raw material intensity',
    fragrances: ['Arabians Tonka', 'Intense Cafe', 'Roses Musk'],
    dna: { Freshness: 40, Complexity: 85, Elegance: 70, Presence: 100, Luxury: 80 },
  },
  {
    name: 'Roja Dove',
    style: 'Ultra-luxury British perfumery, extremely opulent blends',
    philosophy: 'Absolute refinement and excess in harmony',
    fragrances: ['Elysium', 'Enigma', 'Oligarch'],
    dna: { Freshness: 60, Complexity: 95, Elegance: 100, Presence: 100, Luxury: 100 },
  },
  {
    name: 'Serge Lutens',
    style: 'Artistic, dark, unconventional compositions',
    philosophy: 'Perfume as storytelling and emotion',
    fragrances: ['Chergui', 'Ambre Sultan', 'La Fille de Berlin'],
    dna: { Freshness: 50, Complexity: 100, Elegance: 80, Presence: 90, Luxury: 85 },
  },
  {
    name: 'Kilian Hennessy',
    style: 'Sensual luxury, nightlife-inspired compositions',
    philosophy: 'Don\'t be shy, be addictive',
    fragrances: ['Angels\' Share', 'Black Phantom', 'Straight to Heaven'],
    dna: { Freshness: 40, Complexity: 85, Elegance: 85, Presence: 95, Luxury: 95 },
  },
  {
    name: 'David Le Goff',
    style: 'Modern aquatic-mineral freshness',
    philosophy: 'Clean modern elegance with airy transparency',
    fragrances: ['Aqua Universalis', 'Lumiere Noire', 'Aqua Vitae'],
    dna: { Freshness: 95, Complexity: 70, Elegance: 85, Presence: 80, Luxury: 80 },
  },
  {
    name: 'Houbigant',
    style: 'Historic French perfumery with modern reinterpretations, elegant florals and refined woody structures',
    philosophy: 'Tradition refined through modern craftsmanship',
    fragrances: ['Quelques Fleurs L\'Original', 'Fougere Royale', 'Orangers en Fleurs'],
    dna: { Freshness: 65, Complexity: 85, Elegance: 95, Presence: 80, Luxury: 90 },
  },
];

export const perfumers: Perfumer[] = perfumerSeeds.map((perfumer) => ({
  ...perfumer,
  cluster: classifyPerfumerCluster(perfumer),
}));
