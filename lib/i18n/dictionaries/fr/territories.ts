import type { Dictionary } from '../en';

const territories: Dictionary['territories'] = {
  pageTitle: 'Territoires olfactifs',
  backgroundAlt: 'Arrière-plan des territoires',
  hero: {
    overviewLabel: 'Aperçu',
    overview:
      'L’univers du parfum s’organise en territoires distincts. Chacun incarne un caractère olfactif unique et offre des expressions différentes de l’identité, de l’humeur et de l’occasion.',
    howToUseLabel: 'Mode d’emploi',
    howToUse: 'Cliquez sur un territoire pour explorer ses caractéristiques, ses signatures ADN et ses parfums emblématiques.',
  },
  fullSection: {
    kicker: 'Territoires olfactifs',
    title: 'Explorez le monde des senteurs',
    subtitle: 'Trouvez les univers olfactifs qui vous parlent.',
  },
  filters: {
    byIntensity: 'Filtrer par intensité',
    bySeason: 'Filtrer par saison',
    all: 'Tous',
  },
  intensity: {
    light: 'Légère',
    moderate: 'Modérée',
    intense: 'Intense',
    high: 'Forte',
  },
  intensityBadge: (level) => `Intensité ${level.toLowerCase()}`,
  seasons: {
    spring: 'Printemps',
    summer: 'Été',
    fall: 'Automne',
    winter: 'Hiver',
  },
  seasonsShort: {
    spring: 'Pri',
    summer: 'Été',
    fall: 'Aut',
    winter: 'Hiv',
  },
  card: {
    versatility: 'Polyvalence',
  },
  detail: {
    close: 'Fermer',
    closeDetails: 'Fermer les détails du territoire',
    characteristics: 'CARACTÉRISTIQUES',
    dnaAxes: 'AXES ADN',
    signatureFragrances: 'PARFUMS SIGNATURES',
    seasons: 'SAISONS',
    intensity: 'INTENSITÉ',
    versatility: 'POLYVALENCE',
    artworkAlt: (name) => `Illustration du territoire ${name}`,
  },
  dnaIntegration: {
    kicker: 'INTÉGRATION ADN',
    title: 'Cartographiez vos affinités de territoire',
    text: 'Votre signature OlfactiveDNA se traduit naturellement en affinités de territoires. Comprendre quels territoires résonnent avec votre profil vous guide vers des parfums alignés avec votre identité.',
    cta: 'DÉCOUVREZ VOS TERRITOIRES →',
  },
};

export default territories;
