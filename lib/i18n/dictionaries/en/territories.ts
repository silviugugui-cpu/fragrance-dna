const territories = {
  pageTitle: 'Olfactive Territories',
  backgroundAlt: 'Territories background',
  hero: {
    overviewLabel: 'Overview',
    overview:
      'The fragrance universe organizes into distinct territories. Each represents a unique olfactive character, offering different expressions of identity, mood, and occasion.',
    howToUseLabel: 'How to use',
    howToUse: 'Click any territory to explore characteristics, DNA signatures, and signature fragrances.',
  },
  fullSection: {
    kicker: 'Olfactive Territories',
    title: 'Explore the olfactive worlds',
    subtitle: 'Find the olfactive worlds that speak to you.',
  },
  filters: {
    byIntensity: 'Filter by Intensity',
    bySeason: 'Filter by Season',
    all: 'All',
  },
  intensity: {
    light: 'Light',
    moderate: 'Moderate',
    intense: 'Intense',
    high: 'High',
  } as Record<string, string>,
  intensityBadge: (level: string) => `${level} Intensity`,
  seasons: {
    spring: 'Spring',
    summer: 'Summer',
    fall: 'Fall',
    winter: 'Winter',
  } as Record<string, string>,
  seasonsShort: {
    spring: 'Spr',
    summer: 'Sum',
    fall: 'Fall',
    winter: 'Win',
  } as Record<string, string>,
  card: {
    versatility: 'Versatility',
  },
  detail: {
    close: 'Close',
    closeDetails: 'Close territory details',
    characteristics: 'CHARACTERISTICS',
    dnaAxes: 'DNA AXES',
    signatureFragrances: 'SIGNATURE FRAGRANCES',
    seasons: 'SEASONS',
    intensity: 'INTENSITY',
    versatility: 'VERSATILITY',
    artworkAlt: (name: string) => `${name} territory artwork`,
  },
  dnaIntegration: {
    kicker: 'DNA INTEGRATION',
    title: 'Map Your Territory Affinity',
    text: 'Your Olfactive DNA signature maps naturally to territory affinities. Understanding which territories resonate with your profile guides discovery of fragrances that align with your identity.',
    cta: 'DISCOVER YOUR TERRITORIES →',
  },
};

export default territories;
