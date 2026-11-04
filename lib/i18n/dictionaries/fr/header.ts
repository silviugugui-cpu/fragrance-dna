import type { Dictionary } from '../en';

const header: Dictionary['header'] = {
  nav: {
    home: { label: 'Accueil', mobile: 'Accueil', hint: 'Page de départ' },
    grounding: { label: 'ANCRAGE', mobile: 'Ancrage', hint: 'Explorez les bases olfactives' },
    test: { label: 'TEST', mobile: 'Test', hint: 'Test olfactif rapide' },
    dna: { label: 'VOTRE ADN', mobile: 'Votre ADN', hint: 'Profil personnel' },
    collection: { label: 'VOTRE COLLECTION', mobile: 'Votre collection', hint: 'Parfums enregistrés' },
    fragrances: { label: 'PARFUMS', mobile: 'Bibliothèque de parfums', hint: 'Plus de 68 000 parfums' },
    faq: { label: 'FAQ', mobile: 'FAQ ADN & badges', hint: 'Confiance et badges expliqués' },
    articles: { label: 'DÉCOUVRIR', mobile: 'Découvrir', hint: 'Explorez les savoirs, créateurs et territoires olfactifs' },
  },
  signedInAs: 'Connecté en tant que',
  myDnaProfile: 'Mon profil ADN',
  myCollection: 'Ma collection',
  dnaBadgesFaq: 'Badges ADN & FAQ',
  signOut: 'Se déconnecter',
  signingOut: 'Déconnexion...',
  login: 'Connexion',
  menu: 'Menu',
  closeMenu: 'Fermer',
  closeMobileMenu: 'Fermer le menu mobile',
  signIntoYourDna: 'Connectez-vous à votre ADN',
  dnaBadgeAria: (name, badge) => `${name}, badge ADN ${badge}`,
  dnaBadgeTitle: (badge) => `Badge ADN ${badge}`,
  openDnaProfileAria: (badge) => `Ouvrir le profil ADN, badge ${badge}`,
  language: 'Langue',
  selectLanguage: 'Choisir la langue',
  switchToNormal: 'Passer au mode normal',
  switchToDark: 'Passer au mode sombre',
};

export default header;
