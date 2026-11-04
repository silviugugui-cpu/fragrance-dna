import type { Dictionary } from '../en';

const header: Dictionary['header'] = {
  nav: {
    home: { label: 'Acasă', mobile: 'Acasă', hint: 'Pagina de start' },
    grounding: { label: 'ANCORARE', mobile: 'Ancorare', hint: 'Explorează bazele olfactive' },
    test: { label: 'TEST', mobile: 'Test', hint: 'Test olfactiv rapid' },
    dna: { label: 'ADN-UL TĂU', mobile: 'ADN-ul tău', hint: 'Profil personal' },
    collection: { label: 'COLECȚIA TA', mobile: 'Colecția ta', hint: 'Parfumuri salvate' },
    fragrances: { label: 'PARFUMURI', mobile: 'Biblioteca de parfumuri', hint: 'Caută printre peste 68.000 de parfumuri' },
    faq: { label: 'FAQ', mobile: 'FAQ ADN și insigne', hint: 'Cum funcționează încrederea și insignele' },
    articles: { label: 'DESCOPERĂ', mobile: 'Descoperă', hint: 'Explorează cunoștințe, creatori și teritorii olfactive' },
  },
  signedInAs: 'Autentificat ca',
  myDnaProfile: 'Profilul meu ADN',
  myCollection: 'Colecția mea',
  dnaBadgesFaq: 'Insigne ADN și FAQ',
  signOut: 'Deconectare',
  signingOut: 'Se deconectează...',
  login: 'Autentificare',
  menu: 'Meniu',
  closeMenu: 'Închide',
  closeMobileMenu: 'Închide meniul mobil',
  signIntoYourDna: 'Autentifică-te în ADN-ul tău',
  dnaBadgeAria: (name, badge) => `${name}, insignă ADN ${badge}`,
  dnaBadgeTitle: (badge) => `Insignă ADN ${badge}`,
  openDnaProfileAria: (badge) => `Deschide profilul ADN, insigna ${badge}`,
  language: 'Limbă',
  selectLanguage: 'Selectează limba',
  switchToNormal: 'Activează modul normal',
  switchToDark: 'Activează modul întunecat',
};

export default header;
