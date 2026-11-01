import type { Dictionary } from '../en';

const brands: Dictionary['brands'] = {
  header: {
    label: 'CASE PROFUMIERE',
    title: 'Universo dei marchi',
    description:
      'Esplora le case profumiere iconiche e le loro collezioni distintive attraverso un’esperienza di scoperta premium e coerente.',
  },
  stats: {
    houses: 'Case',
    housesSubtitle: 'marchi disponibili',
    fragrances: 'Fragranze',
    fragrancesSubtitle: 'catalogo totale',
    largestHouse: 'Casa più grande',
    largestHouseSubtitle: 'fragranze in una sola casa',
    leadingName: 'Nome leader',
    leadingNameSubtitle: 'leader attuale',
  },
  card: {
    house: 'Casa profumiera',
    portfolioSize: 'Dimensione del portfolio',
    signature: 'Firma',
    explore: 'ESPLORA LA CASA',
  },
  empty: 'Nessun marchio trovato nel database.',
  notAvailable: 'N/D',
  detail: {
    back: 'Torna ai marchi',
    none: 'Nessun profumo trovato per questo marchio.',
    returnCta: "TORNA ALL'UNIVERSO DEI MARCHI",
    label: 'PROFILO DEL MARCHIO',
    description: (count: number, brand: string) =>
      `Esplora ${count} profumi di ${brand} e scopri il carattere distintivo e la stagionalità.`,
    portfolio: 'Portfolio',
    portfolioSubtitle: 'profumi',
    character: 'Carattere del marchio',
    characterSubtitle: 'impressione dominante',
    characterValues: { elegant: 'Elegante', fresh: 'Fresco', warm: 'Caldo', balanced: 'Equilibrato' },
    strongestSeason: 'Stagione più forte',
    strongestSeasonSubtitle: 'peso stagionale più alto',
    seasonalDistribution: 'Distribuzione stagionale',
    seasons: { spring: 'Primavera', summer: 'Estate', autumn: 'Autunno', winter: 'Inverno' } as Record<string, string>,
    topLabel: 'PROFUMI DI PUNTA',
    topTenTitle: 'Top 10 delle selezioni',
    allTitle: (n: number) => `Tutte le ${n} selezioni`,
    topDescription: 'I profumi prioritari attualmente disponibili per questa casa.',
  },
};

export default brands;
