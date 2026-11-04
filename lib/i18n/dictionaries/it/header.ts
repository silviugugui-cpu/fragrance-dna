import type { Dictionary } from '../en';

const header: Dictionary['header'] = {
  nav: {
    home: { label: 'Home', mobile: 'Home', hint: 'Pagina iniziale' },
    grounding: { label: 'GROUNDING', mobile: 'Grounding', hint: 'Esplora le basi olfattive' },
    test: { label: 'TEST', mobile: 'Test', hint: 'Test olfattivo rapido' },
    dna: { label: 'IL TUO DNA', mobile: 'Il tuo DNA', hint: 'Profilo personale' },
    collection: { label: 'LA TUA COLLEZIONE', mobile: 'La tua collezione', hint: 'Fragranze salvate' },
    fragrances: { label: 'FRAGRANZE', mobile: 'Libreria delle fragranze', hint: 'Cerca tra oltre 68.000 profumi' },
    faq: { label: 'FAQ', mobile: 'FAQ DNA e badge', hint: 'Come funzionano fiducia e badge' },
    articles: { label: 'ARTICOLI', mobile: 'Il profumo come passione', hint: 'Leggi approfondimenti sui profumi' },
  },
  signedInAs: 'Accesso effettuato come',
  myDnaProfile: 'Il mio profilo DNA',
  myCollection: 'La mia collezione',
  dnaBadgesFaq: 'Badge DNA e FAQ',
  signOut: 'Esci',
  signingOut: 'Disconnessione...',
  login: 'Accedi',
  menu: 'Menu',
  closeMenu: 'Chiudi',
  closeMobileMenu: 'Chiudi il menu mobile',
  signIntoYourDna: 'Accedi al tuo DNA',
  dnaBadgeAria: (name, badge) => `${name}, badge DNA ${badge}`,
  dnaBadgeTitle: (badge) => `Badge DNA ${badge}`,
  openDnaProfileAria: (badge) => `Apri il profilo DNA, badge ${badge}`,
  language: 'Lingua',
  selectLanguage: 'Seleziona la lingua',
  themeComingSoon: 'Modalità scura attiva. La modalità normale sarà disponibile a breve.',
};

export default header;
