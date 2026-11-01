import type { Dictionary } from '../en';

const brands: Dictionary['brands'] = {
  header: {
    label: 'MAISONS DE PARFUM',
    title: 'Univers des marques',
    description:
      'Explorez les maisons de parfum iconiques et leurs collections signature à travers une expérience de découverte premium et cohérente.',
  },
  stats: {
    houses: 'Maisons',
    housesSubtitle: 'marques disponibles',
    fragrances: 'Parfums',
    fragrancesSubtitle: 'catalogue total',
    largestHouse: 'Plus grande maison',
    largestHouseSubtitle: 'parfums dans une seule maison',
    leadingName: 'Nom de référence',
    leadingNameSubtitle: 'leader actuel',
  },
  card: {
    house: 'Maison de parfum',
    portfolioSize: 'Taille du portefeuille',
    signature: 'Signature',
    explore: 'EXPLORER LA MAISON',
  },
  empty: 'Aucune marque trouvée dans la base de données.',
  notAvailable: 'N/D',
  detail: {
    back: 'Retour aux marques',
    none: 'Aucun parfum trouvé pour cette marque.',
    returnCta: "RETOUR À L'UNIVERS DES MARQUES",
    label: 'PROFIL DE MARQUE',
    description: (count: number, brand: string) =>
      `Explorez ${count} parfums de ${brand} et découvrez leur caractère signature et leur saisonnalité.`,
    portfolio: 'Portefeuille',
    portfolioSubtitle: 'parfums',
    character: 'Caractère de la marque',
    characterSubtitle: 'impression dominante',
    characterValues: { elegant: 'Élégant', fresh: 'Frais', warm: 'Chaleureux', balanced: 'Équilibré' },
    strongestSeason: 'Saison dominante',
    strongestSeasonSubtitle: 'poids saisonnier le plus élevé',
    seasonalDistribution: 'Répartition saisonnière',
    seasons: { spring: 'Printemps', summer: 'Été', autumn: 'Automne', winter: 'Hiver' } as Record<string, string>,
    topLabel: 'PARFUMS PHARES',
    topTenTitle: 'Top 10 des sélections',
    allTitle: (n: number) => `Les ${n} sélections`,
    topDescription: 'Les parfums prioritaires actuellement disponibles pour cette maison.',
  },
};

export default brands;
