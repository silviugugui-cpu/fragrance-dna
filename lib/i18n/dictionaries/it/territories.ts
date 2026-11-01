import type { Dictionary } from '../en';

const territories: Dictionary['territories'] = {
  pageTitle: 'Territori olfattivi',
  backgroundAlt: 'Sfondo dei territori',
  hero: {
    overviewLabel: 'Panoramica',
    overview:
      'L’universo del profumo si organizza in territori distinti. Ciascuno rappresenta un carattere olfattivo unico e offre espressioni diverse di identità, umore e occasione.',
    howToUseLabel: 'Come si usa',
    howToUse: 'Clicca su un territorio per esplorarne caratteristiche, firme DNA e profumi simbolo.',
  },
  fullSection: {
    kicker: 'Territori olfattivi',
    title: 'Esplora i mondi olfattivi',
    subtitle: 'Trova gli universi olfattivi che parlano di te.',
  },
  filters: {
    byIntensity: 'Filtra per intensità',
    bySeason: 'Filtra per stagione',
    all: 'Tutti',
  },
  intensity: {
    light: 'Leggera',
    moderate: 'Moderata',
    intense: 'Intensa',
    high: 'Alta',
  },
  intensityBadge: (level) => `Intensità ${level.toLowerCase()}`,
  seasons: {
    spring: 'Primavera',
    summer: 'Estate',
    fall: 'Autunno',
    winter: 'Inverno',
  },
  seasonsShort: {
    spring: 'Pri',
    summer: 'Est',
    fall: 'Aut',
    winter: 'Inv',
  },
  card: {
    versatility: 'Versatilità',
  },
  detail: {
    close: 'Chiudi',
    closeDetails: 'Chiudi i dettagli del territorio',
    characteristics: 'CARATTERISTICHE',
    dnaAxes: 'ASSI DNA',
    signatureFragrances: 'PROFUMI SIMBOLO',
    seasons: 'STAGIONI',
    intensity: 'INTENSITÀ',
    versatility: 'VERSATILITÀ',
    artworkAlt: (name) => `Illustrazione del territorio ${name}`,
  },
  dnaIntegration: {
    kicker: 'INTEGRAZIONE DNA',
    title: 'Mappa la tua affinità con i territori',
    text: 'La tua firma OlfactiveDNA si traduce naturalmente in affinità con i territori. Capire quali territori risuonano con il tuo profilo ti guida verso profumi in sintonia con la tua identità.',
    cta: 'SCOPRI I TUOI TERRITORI →',
  },
};

export default territories;
