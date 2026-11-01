import type { Dictionary } from '../en';

const brands: Dictionary['brands'] = {
  header: {
    label: 'DUFTHÄUSER',
    title: 'Markenuniversum',
    description:
      'Entdecken Sie ikonische Dufthäuser und ihre charakteristischen Kollektionen in einem einheitlichen Premium-Entdeckungserlebnis.',
  },
  stats: {
    houses: 'Häuser',
    housesSubtitle: 'verfügbare Marken',
    fragrances: 'Düfte',
    fragrancesSubtitle: 'Gesamtkatalog',
    largestHouse: 'Größtes Haus',
    largestHouseSubtitle: 'Düfte in einem Haus',
    leadingName: 'Führender Name',
    leadingNameSubtitle: 'aktueller Spitzenreiter',
  },
  card: {
    house: 'Dufthaus',
    portfolioSize: 'Portfoliogröße',
    signature: 'Signatur',
    explore: 'HAUS ERKUNDEN',
  },
  empty: 'Keine Marken in der Datenbank gefunden.',
  notAvailable: 'k. A.',
  detail: {
    back: 'Zurück zu den Marken',
    none: 'Keine Düfte für diese Marke gefunden.',
    returnCta: 'ZURÜCK ZUM MARKENUNIVERSUM',
    label: 'MARKENPROFIL',
    description: (count: number, brand: string) =>
      `Entdecken Sie ${count} Düfte von ${brand} und erleben Sie den charakteristischen Stil und die Saisonalität.`,
    portfolio: 'Portfolio',
    portfolioSubtitle: 'Düfte',
    character: 'Markencharakter',
    characterSubtitle: 'dominanter Eindruck',
    characterValues: { elegant: 'Elegant', fresh: 'Frisch', warm: 'Warm', balanced: 'Ausgewogen' },
    strongestSeason: 'Stärkste Saison',
    strongestSeasonSubtitle: 'höchstes saisonales Gewicht',
    seasonalDistribution: 'Saisonale Verteilung',
    seasons: { spring: 'Frühling', summer: 'Sommer', autumn: 'Herbst', winter: 'Winter' } as Record<string, string>,
    topLabel: 'TOP-DÜFTE',
    topTenTitle: 'Top-10-Auswahl',
    allTitle: (n: number) => `Alle ${n} Auswahlen`,
    topDescription: 'Die aktuell verfügbaren Spitzen-Düfte dieses Hauses.',
  },
};

export default brands;
