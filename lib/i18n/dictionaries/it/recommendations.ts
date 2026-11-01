import type { Dictionary } from '../en';

const recommendations: Dictionary['recommendations'] = {
  eyebrowEmbedded: 'I TUOI CONSIGLI',
  eyebrow: 'AFFINITÀ DNA',
  titleEmbedded: 'I tuoi consigli',
  title: 'Fragranze da esplorare',
  intro:
    'I consigli usano il tuo profilo DNA attuale — creato con il Grounding e affinato dopo ogni valutazione confermata — confrontato con le note e gli accordi mappati del database principale delle fragranze.',
  evaluations: 'valutazioni',
  profileConfidence: 'affidabilità del profilo',
  dominantSignals: 'segnali dominanti',
  emerging: 'In divenire',
  loading: 'Ricerca di affinità nel database delle fragranze...',
  incompleteTitle: 'Parti dalle tue preferenze olfattive',
  incompleteDescription:
    'Il Grounding crea il tuo profilo DNA iniziale. I consigli sono disponibili non appena quel profilo esiste.',
  beginGrounding: 'Inizia il Grounding',
  loadError: 'Impossibile caricare i consigli sulle fragranze.',
  emptyReady:
    'Il database principale non ha ancora abbastanza note o accordi mappati per un abbinamento affidabile.',
  bottleAlt: (name) => `Flacone di ${name}`,
  fallbackName: 'Fragranza',
  fallbackBrand: 'Database delle fragranze',
  unnamedFragrance: 'Fragranza senza nome',
  mappedCharacteristics: 'Caratteristiche mappate:',
  inWishlist: 'Nella lista dei desideri',
  saveToWishlist: 'Salva nella lista dei desideri',
  viewDna: 'Vedi il tuo DNA',
  openCollection: 'Apri la collezione',
  explanationAligned: (attrs) => `In sintonia con ${attrs}, e coerente con il tuo DNA appreso.`,
  explanationRanked: 'Classificata in base alle sue note e ai suoi accordi mappati rispetto al tuo DNA appreso.',
};

export default recommendations;
