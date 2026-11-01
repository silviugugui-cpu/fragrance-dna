import type { Dictionary } from '../en';

const territories: Dictionary['territories'] = {
  pageTitle: 'Teritorii olfactive',
  backgroundAlt: 'Fundalul teritoriilor',
  hero: {
    overviewLabel: 'Prezentare generală',
    overview:
      'Universul parfumurilor se organizează în teritorii distincte. Fiecare reprezintă un caracter olfactiv unic și oferă expresii diferite ale identității, stării de spirit și ocaziei.',
    howToUseLabel: 'Cum se folosește',
    howToUse: 'Dă clic pe orice teritoriu pentru a explora caracteristicile, semnăturile ADN și parfumurile emblematice.',
  },
  fullSection: {
    kicker: 'Teritorii olfactive',
    title: 'Explorează lumile olfactive',
    subtitle: 'Găsește universurile olfactive care îți vorbesc.',
  },
  filters: {
    byIntensity: 'Filtrează după intensitate',
    bySeason: 'Filtrează după anotimp',
    all: 'Toate',
  },
  intensity: {
    light: 'Ușoară',
    moderate: 'Moderată',
    intense: 'Intensă',
    high: 'Ridicată',
  },
  intensityBadge: (level) => `Intensitate ${level.toLowerCase()}`,
  seasons: {
    spring: 'Primăvară',
    summer: 'Vară',
    fall: 'Toamnă',
    winter: 'Iarnă',
  },
  seasonsShort: {
    spring: 'Pri',
    summer: 'Var',
    fall: 'Toa',
    winter: 'Iar',
  },
  card: {
    versatility: 'Versatilitate',
  },
  detail: {
    close: 'Închide',
    closeDetails: 'Închide detaliile teritoriului',
    characteristics: 'CARACTERISTICI',
    dnaAxes: 'AXE ADN',
    signatureFragrances: 'PARFUMURI EMBLEMATICE',
    seasons: 'ANOTIMPURI',
    intensity: 'INTENSITATE',
    versatility: 'VERSATILITATE',
    artworkAlt: (name) => `Ilustrația teritoriului ${name}`,
  },
  dnaIntegration: {
    kicker: 'INTEGRARE ADN',
    title: 'Cartografiază-ți afinitatea cu teritoriile',
    text: 'Semnătura ta OlfactiveDNA se traduce natural în afinități cu teritoriile. Înțelegerea teritoriilor care rezonează cu profilul tău te ghidează spre parfumuri aliniate cu identitatea ta.',
    cta: 'DESCOPERĂ-ȚI TERITORIILE →',
  },
};

export default territories;
