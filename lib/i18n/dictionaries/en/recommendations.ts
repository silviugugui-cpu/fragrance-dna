const recommendations = {
  eyebrowEmbedded: 'YOUR RECOMMENDATIONS',
  eyebrow: 'DNA MATCHES',
  titleEmbedded: 'Your Recommendations',
  title: 'Fragrances to explore',
  intro:
    'Recommendations use your current DNA profile, starting with Grounding and refining after each committed evaluation, against mapped notes and accords in the master fragrance database.',
  evaluations: 'evaluations',
  profileConfidence: 'profile confidence',
  dominantSignals: 'dominant signals',
  emerging: 'Emerging',
  loading: 'Finding matches in the Fragrance Database...',
  incompleteTitle: 'Start with your olfactive preferences',
  incompleteDescription:
    'Grounding creates your initial DNA profile. Recommendations are available as soon as that profile exists.',
  beginGrounding: 'Begin Grounding',
  loadError: 'Unable to load fragrance recommendations.',
  emptyReady: 'The master database does not yet have enough mapped notes or accords for a reliable match.',
  bottleAlt: (name: string) => `${name} bottle`,
  fallbackName: 'Fragrance',
  fallbackBrand: 'Fragrance Database',
  unnamedFragrance: 'Unnamed fragrance',
  mappedCharacteristics: 'Mapped characteristics:',
  inWishlist: 'In wishlist',
  saveToWishlist: 'Save to wishlist',
  viewDna: 'View your DNA',
  openCollection: 'Open collection',
  explanationAligned: (attrs: string) => `Aligns with ${attrs}, while fitting your learned DNA.`,
  explanationRanked: 'Ranked by its mapped notes and accords against your learned DNA.',
};

export default recommendations;
