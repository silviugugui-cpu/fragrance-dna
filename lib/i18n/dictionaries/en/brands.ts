const brands = {
  header: {
    label: 'FRAGRANCE HOUSES',
    title: 'Brand Universe',
    description:
      'Explore iconic fragrance houses and their signature collections through a consistent premium discovery experience.',
  },
  stats: {
    houses: 'Houses',
    housesSubtitle: 'available brands',
    fragrances: 'Fragrances',
    fragrancesSubtitle: 'total catalog',
    largestHouse: 'Largest House',
    largestHouseSubtitle: 'fragrances in one house',
    leadingName: 'Leading Name',
    leadingNameSubtitle: 'current leader',
  },
  card: {
    house: 'Fragrance House',
    portfolioSize: 'Portfolio size',
    signature: 'Signature',
    explore: 'EXPLORE HOUSE',
  },
  empty: 'No brands found in the database.',
  notAvailable: 'N/A',
  detail: {
    back: 'Back to brands',
    none: 'No fragrances found for this brand.',
    returnCta: 'RETURN TO BRAND UNIVERSE',
    label: 'BRAND PROFILE',
    description: (count: number, brand: string) =>
      `Explore ${count} fragrances from ${brand} and review signature character and seasonality.`,
    portfolio: 'Portfolio',
    portfolioSubtitle: 'fragrances',
    character: 'Brand Character',
    characterSubtitle: 'dominant impression',
    characterValues: { elegant: 'Elegant', fresh: 'Fresh', warm: 'Warm', balanced: 'Balanced' },
    strongestSeason: 'Strongest Season',
    strongestSeasonSubtitle: 'highest seasonal weight',
    seasonalDistribution: 'Seasonal Distribution',
    seasons: { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' } as Record<string, string>,
    topLabel: 'TOP FRAGRANCES',
    topTenTitle: 'Top 10 Selections',
    allTitle: (n: number) => `All ${n} Selections`,
    topDescription: 'Highest-priority fragrances currently available for this house.',
  },
};

export default brands;
