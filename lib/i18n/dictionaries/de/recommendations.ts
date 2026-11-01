import type { Dictionary } from '../en';

const recommendations: Dictionary['recommendations'] = {
  eyebrowEmbedded: 'IHRE EMPFEHLUNGEN',
  eyebrow: 'DNA-TREFFER',
  titleEmbedded: 'Ihre Empfehlungen',
  title: 'Düfte zum Entdecken',
  intro:
    'Die Empfehlungen nutzen Ihr aktuelles DNA-Profil – beginnend mit dem Grounding und nach jeder bestätigten Bewertung verfeinert – und gleichen es mit den kartierten Noten und Akkorden der Master-Duftdatenbank ab.',
  evaluations: 'Bewertungen',
  profileConfidence: 'Profil-Vertrauen',
  dominantSignals: 'dominante Signale',
  emerging: 'Im Entstehen',
  loading: 'Treffer werden in der Duftdatenbank gesucht...',
  incompleteTitle: 'Beginnen Sie mit Ihren Duftvorlieben',
  incompleteDescription:
    'Das Grounding erstellt Ihr erstes DNA-Profil. Empfehlungen sind verfügbar, sobald dieses Profil existiert.',
  beginGrounding: 'Grounding starten',
  loadError: 'Die Duftempfehlungen konnten nicht geladen werden.',
  emptyReady:
    'Die Master-Datenbank enthält noch nicht genügend kartierte Noten oder Akkorde für einen verlässlichen Treffer.',
  bottleAlt: (name) => `Flakon von ${name}`,
  fallbackName: 'Duft',
  fallbackBrand: 'Duftdatenbank',
  unnamedFragrance: 'Unbenannter Duft',
  mappedCharacteristics: 'Kartierte Merkmale:',
  inWishlist: 'Auf der Wunschliste',
  saveToWishlist: 'Auf die Wunschliste',
  viewDna: 'Ihre DNA ansehen',
  openCollection: 'Sammlung öffnen',
  explanationAligned: (attrs) => `Harmoniert mit ${attrs} und passt zugleich zu Ihrer gelernten DNA.`,
  explanationRanked: 'Eingestuft nach seinen kartierten Noten und Akkorden im Vergleich zu Ihrer gelernten DNA.',
};

export default recommendations;
