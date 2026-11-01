import type { Dictionary } from '../en';

const territories: Dictionary['territories'] = {
  pageTitle: 'Olfaktorische Territorien',
  backgroundAlt: 'Territorien-Hintergrund',
  hero: {
    overviewLabel: 'Überblick',
    overview:
      'Das Duftuniversum gliedert sich in eigenständige Territorien. Jedes verkörpert einen einzigartigen olfaktorischen Charakter und bietet unterschiedliche Ausdrucksformen von Identität, Stimmung und Anlass.',
    howToUseLabel: 'So funktioniert es',
    howToUse: 'Klicken Sie auf ein Territorium, um Eigenschaften, DNA-Signaturen und charakteristische Düfte zu erkunden.',
  },
  fullSection: {
    kicker: 'Olfaktorische Territorien',
    title: 'Entdecken Sie die olfaktorischen Welten',
    subtitle: 'Finden Sie die olfaktorischen Welten, die Sie ansprechen.',
  },
  filters: {
    byIntensity: 'Nach Intensität filtern',
    bySeason: 'Nach Jahreszeit filtern',
    all: 'Alle',
  },
  intensity: {
    light: 'Leicht',
    moderate: 'Moderat',
    intense: 'Intensiv',
    high: 'Hoch',
  },
  intensityBadge: (level) => `Intensität: ${level}`,
  seasons: {
    spring: 'Frühling',
    summer: 'Sommer',
    fall: 'Herbst',
    winter: 'Winter',
  },
  seasonsShort: {
    spring: 'Frü',
    summer: 'Som',
    fall: 'Her',
    winter: 'Win',
  },
  card: {
    versatility: 'Vielseitigkeit',
  },
  detail: {
    close: 'Schließen',
    closeDetails: 'Territorium-Details schließen',
    characteristics: 'EIGENSCHAFTEN',
    dnaAxes: 'DNA-ACHSEN',
    signatureFragrances: 'SIGNATURDÜFTE',
    seasons: 'JAHRESZEITEN',
    intensity: 'INTENSITÄT',
    versatility: 'VIELSEITIGKEIT',
    artworkAlt: (name) => `Illustration des Territoriums ${name}`,
  },
  dnaIntegration: {
    kicker: 'DNA-INTEGRATION',
    title: 'Kartieren Sie Ihre Territorien-Affinität',
    text: 'Ihre OlfactiveDNA-Signatur lässt sich auf natürliche Weise in Territorien-Affinitäten übersetzen. Zu verstehen, welche Territorien mit Ihrem Profil in Resonanz stehen, leitet Sie zu Düften, die zu Ihrer Identität passen.',
    cta: 'ENTDECKEN SIE IHRE TERRITORIEN →',
  },
};

export default territories;
