import type { Dictionary } from '../en';

const recommendations: Dictionary['recommendations'] = {
  eyebrowEmbedded: 'RECOMANDĂRILE TALE',
  eyebrow: 'POTRIVIRI ADN',
  titleEmbedded: 'Recomandările tale',
  title: 'Parfumuri de explorat',
  intro:
    'Recomandările folosesc profilul tău ADN actual — creat prin Ancorare și rafinat după fiecare evaluare confirmată — raportat la notele și acordurile cartografiate din baza de date principală de parfumuri.',
  evaluations: 'evaluări',
  profileConfidence: 'încrederea profilului',
  dominantSignals: 'semnale dominante',
  emerging: 'În formare',
  loading: 'Se caută potriviri în baza de date de parfumuri...',
  incompleteTitle: 'Începe cu preferințele tale olfactive',
  incompleteDescription:
    'Ancorarea îți creează profilul ADN inițial. Recomandările devin disponibile imediat ce acest profil există.',
  beginGrounding: 'Începe Ancorarea',
  loadError: 'Nu s-au putut încărca recomandările de parfumuri.',
  emptyReady:
    'Baza de date principală nu are încă suficiente note sau acorduri cartografiate pentru o potrivire fiabilă.',
  bottleAlt: (name) => `Flaconul ${name}`,
  fallbackName: 'Parfum',
  fallbackBrand: 'Baza de date de parfumuri',
  unnamedFragrance: 'Parfum fără nume',
  mappedCharacteristics: 'Caracteristici cartografiate:',
  inWishlist: 'În lista de dorințe',
  saveToWishlist: 'Salvează în lista de dorințe',
  viewDna: 'Vezi ADN-ul tău',
  openCollection: 'Deschide colecția',
  explanationAligned: (attrs) => `Se aliniază cu ${attrs}, potrivindu-se totodată cu ADN-ul tău învățat.`,
  explanationRanked: 'Clasat după notele și acordurile sale cartografiate în raport cu ADN-ul tău învățat.',
};

export default recommendations;
