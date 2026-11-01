import type { Dictionary } from '../en';

const brands: Dictionary['brands'] = {
  header: {
    label: 'CASE DE PARFUMURI',
    title: 'Universul mărcilor',
    description:
      'Explorează case de parfumuri iconice și colecțiile lor semnătură printr-o experiență de descoperire premium și coerentă.',
  },
  stats: {
    houses: 'Case',
    housesSubtitle: 'mărci disponibile',
    fragrances: 'Parfumuri',
    fragrancesSubtitle: 'catalog total',
    largestHouse: 'Cea mai mare casă',
    largestHouseSubtitle: 'parfumuri într-o singură casă',
    leadingName: 'Nume de top',
    leadingNameSubtitle: 'liderul actual',
  },
  card: {
    house: 'Casă de parfumuri',
    portfolioSize: 'Dimensiunea portofoliului',
    signature: 'Semnătură',
    explore: 'EXPLOREAZĂ CASA',
  },
  empty: 'Nu s-au găsit mărci în baza de date.',
  notAvailable: 'N/A',
  detail: {
    back: 'Înapoi la mărci',
    none: 'Nu s-au găsit parfumuri pentru această marcă.',
    returnCta: 'ÎNAPOI LA UNIVERSUL MĂRCILOR',
    label: 'PROFILUL MĂRCII',
    description: (count: number, brand: string) =>
      `Explorează ${count} parfumuri de la ${brand} și descoperă caracterul distinctiv și sezonalitatea.`,
    portfolio: 'Portofoliu',
    portfolioSubtitle: 'parfumuri',
    character: 'Caracterul mărcii',
    characterSubtitle: 'impresie dominantă',
    characterValues: { elegant: 'Elegant', fresh: 'Proaspăt', warm: 'Cald', balanced: 'Echilibrat' },
    strongestSeason: 'Sezonul dominant',
    strongestSeasonSubtitle: 'cea mai mare pondere sezonieră',
    seasonalDistribution: 'Distribuție sezonieră',
    seasons: { spring: 'Primăvară', summer: 'Vară', autumn: 'Toamnă', winter: 'Iarnă' } as Record<string, string>,
    topLabel: 'PARFUMURI DE TOP',
    topTenTitle: 'Top 10 selecții',
    allTitle: (n: number) => `Toate cele ${n} selecții`,
    topDescription: 'Parfumurile prioritare disponibile în prezent pentru această casă.',
  },
};

export default brands;
