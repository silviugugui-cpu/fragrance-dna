import type { Dictionary } from '../en';

const brands: Dictionary['brands'] = {
  header: {
    label: 'CASAS DE PERFUMES',
    title: 'Universo das marcas',
    description:
      'Explore casas de perfumes icónicas e as suas coleções de assinatura através de uma experiência de descoberta premium e coerente.',
  },
  stats: {
    houses: 'Casas',
    housesSubtitle: 'marcas disponíveis',
    fragrances: 'Fragrâncias',
    fragrancesSubtitle: 'catálogo total',
    largestHouse: 'Maior casa',
    largestHouseSubtitle: 'fragrâncias numa só casa',
    leadingName: 'Nome de referência',
    leadingNameSubtitle: 'líder atual',
  },
  card: {
    house: 'Casa de perfumes',
    portfolioSize: 'Dimensão do portefólio',
    signature: 'Assinatura',
    explore: 'EXPLORAR A CASA',
  },
  empty: 'Nenhuma marca encontrada na base de dados.',
  notAvailable: 'N/D',
  detail: {
    back: 'Voltar às marcas',
    none: 'Nenhum perfume encontrado para esta marca.',
    returnCta: 'VOLTAR AO UNIVERSO DAS MARCAS',
    label: 'PERFIL DA MARCA',
    description: (count: number, brand: string) =>
      `Explore ${count} perfumes de ${brand} e descubra o caráter distintivo e a sazonalidade.`,
    portfolio: 'Portfólio',
    portfolioSubtitle: 'perfumes',
    character: 'Caráter da marca',
    characterSubtitle: 'impressão dominante',
    characterValues: { elegant: 'Elegante', fresh: 'Fresco', warm: 'Quente', balanced: 'Equilibrado' },
    strongestSeason: 'Estação mais forte',
    strongestSeasonSubtitle: 'maior peso sazonal',
    seasonalDistribution: 'Distribuição sazonal',
    seasons: { spring: 'Primavera', summer: 'Verão', autumn: 'Outono', winter: 'Inverno' } as Record<string, string>,
    topLabel: 'PERFUMES EM DESTAQUE',
    topTenTitle: 'Top 10 de seleções',
    allTitle: (n: number) => `Todas as ${n} seleções`,
    topDescription: 'Os perfumes prioritários atualmente disponíveis para esta casa.',
  },
};

export default brands;
