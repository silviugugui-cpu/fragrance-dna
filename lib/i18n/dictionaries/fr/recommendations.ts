import type { Dictionary } from '../en';

const recommendations: Dictionary['recommendations'] = {
  eyebrowEmbedded: 'VOS RECOMMANDATIONS',
  eyebrow: 'CORRESPONDANCES ADN',
  titleEmbedded: 'Vos recommandations',
  title: 'Parfums à explorer',
  intro:
    'Les recommandations s’appuient sur votre profil ADN actuel — créé lors de l’Ancrage puis affiné après chaque évaluation validée — confronté aux notes et accords cartographiés de la base de parfums de référence.',
  evaluations: 'évaluations',
  profileConfidence: 'confiance du profil',
  dominantSignals: 'signaux dominants',
  emerging: 'En émergence',
  loading: 'Recherche de correspondances dans la base de parfums...',
  incompleteTitle: 'Commencez par vos préférences olfactives',
  incompleteDescription:
    'L’Ancrage crée votre profil ADN initial. Les recommandations sont disponibles dès que ce profil existe.',
  beginGrounding: 'Commencer l’Ancrage',
  loadError: 'Impossible de charger les recommandations de parfums.',
  emptyReady:
    'La base de données de référence ne contient pas encore assez de notes ou d’accords cartographiés pour une correspondance fiable.',
  bottleAlt: (name) => `Flacon de ${name}`,
  fallbackName: 'Parfum',
  fallbackBrand: 'Base de parfums',
  unnamedFragrance: 'Parfum sans nom',
  mappedCharacteristics: 'Caractéristiques cartographiées :',
  inWishlist: 'Dans la liste d’envies',
  saveToWishlist: 'Ajouter à la liste d’envies',
  viewDna: 'Voir votre ADN',
  openCollection: 'Ouvrir la collection',
  explanationAligned: (attrs) => `S’accorde avec ${attrs}, tout en respectant votre ADN appris.`,
  explanationRanked: 'Classé selon ses notes et accords cartographiés par rapport à votre ADN appris.',
};

export default recommendations;
