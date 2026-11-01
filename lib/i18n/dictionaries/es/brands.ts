import type { Dictionary } from '../en';

const brands: Dictionary['brands'] = {
  header: {
    label: 'CASAS DE PERFUMES',
    title: 'Universo de marcas',
    description:
      'Explora casas de perfumes icónicas y sus colecciones emblemáticas a través de una experiencia de descubrimiento premium y coherente.',
  },
  stats: {
    houses: 'Casas',
    housesSubtitle: 'marcas disponibles',
    fragrances: 'Fragancias',
    fragrancesSubtitle: 'catálogo total',
    largestHouse: 'Casa más grande',
    largestHouseSubtitle: 'fragancias en una sola casa',
    leadingName: 'Nombre líder',
    leadingNameSubtitle: 'líder actual',
  },
  card: {
    house: 'Casa de perfumes',
    portfolioSize: 'Tamaño del catálogo',
    signature: 'Firma',
    explore: 'EXPLORAR LA CASA',
  },
  empty: 'No se encontraron marcas en la base de datos.',
  notAvailable: 'N/D',
  detail: {
    back: 'Volver a las marcas',
    none: 'No se encontraron perfumes para esta marca.',
    returnCta: 'VOLVER AL UNIVERSO DE MARCAS',
    label: 'PERFIL DE MARCA',
    description: (count: number, brand: string) =>
      `Explora ${count} perfumes de ${brand} y descubre su carácter distintivo y su estacionalidad.`,
    portfolio: 'Portafolio',
    portfolioSubtitle: 'perfumes',
    character: 'Carácter de la marca',
    characterSubtitle: 'impresión dominante',
    characterValues: { elegant: 'Elegante', fresh: 'Fresco', warm: 'Cálido', balanced: 'Equilibrado' },
    strongestSeason: 'Temporada más fuerte',
    strongestSeasonSubtitle: 'mayor peso estacional',
    seasonalDistribution: 'Distribución estacional',
    seasons: { spring: 'Primavera', summer: 'Verano', autumn: 'Otoño', winter: 'Invierno' } as Record<string, string>,
    topLabel: 'PERFUMES DESTACADOS',
    topTenTitle: 'Top 10 de selecciones',
    allTitle: (n: number) => `Las ${n} selecciones`,
    topDescription: 'Los perfumes prioritarios disponibles actualmente para esta casa.',
  },
};

export default brands;
