import type { Dictionary } from '../en';

const header: Dictionary['header'] = {
  nav: {
    home: { label: 'Start', mobile: 'Start', hint: 'Startseite' },
    grounding: { label: 'GROUNDING', mobile: 'Grounding', hint: 'Olfaktorische Grundlagen entdecken' },
    test: { label: 'TEST', mobile: 'Test', hint: 'Schneller Dufttest' },
    dna: { label: 'IHRE DNA', mobile: 'Ihre DNA', hint: 'Persönliches Profil' },
    collection: { label: 'IHRE SAMMLUNG', mobile: 'Ihre Sammlung', hint: 'Gespeicherte Düfte' },
    fragrances: { label: 'DÜFTE', mobile: 'Duftbibliothek', hint: 'Über 68.000 Parfums durchsuchen' },
    faq: { label: 'FAQ', mobile: 'DNA- & Abzeichen-FAQ', hint: 'So funktionieren Vertrauen und Abzeichen' },
    articles: { label: 'ENTDECKEN', mobile: 'Entdecken', hint: 'Duftwissen, Parfümeure und Duftwelten erkunden' },
  },
  signedInAs: 'Angemeldet als',
  myDnaProfile: 'Mein DNA-Profil',
  myCollection: 'Meine Sammlung',
  dnaBadgesFaq: 'DNA-Abzeichen & FAQ',
  signOut: 'Abmelden',
  signingOut: 'Abmeldung...',
  login: 'Anmelden',
  menu: 'Menü',
  closeMenu: 'Schließen',
  closeMobileMenu: 'Mobiles Menü schließen',
  signIntoYourDna: 'Bei Ihrer DNA anmelden',
  dnaBadgeAria: (name, badge) => `${name}, DNA-Abzeichen ${badge}`,
  dnaBadgeTitle: (badge) => `DNA-Abzeichen ${badge}`,
  openDnaProfileAria: (badge) => `DNA-Profil öffnen, Abzeichen ${badge}`,
  language: 'Sprache',
  selectLanguage: 'Sprache wählen',
  switchToNormal: 'Zum normalen Modus wechseln',
  switchToDark: 'Zum Dunkelmodus wechseln',
};

export default header;
