import type { Dictionary } from '../en';

const header: Dictionary['header'] = {
  nav: {
    home: { label: 'Inicio', mobile: 'Inicio', hint: 'Página de inicio' },
    grounding: { label: 'BASE OLFATIVA', mobile: 'Base olfativa', hint: 'Explora los fundamentos del olfato' },
    test: { label: 'TEST', mobile: 'Test', hint: 'Test rápido de fragancias' },
    dna: { label: 'TU ADN', mobile: 'Tu ADN', hint: 'Perfil personal' },
    collection: { label: 'TU COLECCIÓN', mobile: 'Tu colección', hint: 'Fragancias guardadas' },
    fragrances: { label: 'FRAGANCIAS', mobile: 'Biblioteca de fragancias', hint: 'Busca entre más de 68 000 perfumes' },
    faq: { label: 'FAQ', mobile: 'FAQ de ADN e insignias', hint: 'Cómo funcionan la confianza y las insignias' },
    articles: { label: 'DESCUBRE', mobile: 'Descubre', hint: 'Explora conocimientos, creadores y territorios olfativos' },
  },
  signedInAs: 'Sesión iniciada como',
  myDnaProfile: 'Mi perfil de ADN',
  myCollection: 'Mi colección',
  dnaBadgesFaq: 'Insignias de ADN y FAQ',
  signOut: 'Cerrar sesión',
  signingOut: 'Cerrando sesión...',
  login: 'Iniciar sesión',
  menu: 'Menú',
  closeMenu: 'Cerrar',
  closeMobileMenu: 'Cerrar el menú móvil',
  mobileMenuSections: {
    exploreYourDna: 'Explora tu ADN',
    yourPassion: 'Tu pasión',
    exploreYourDnaButton: 'ADN',
    yourPassionButton: 'Pasión',
  },
  signIntoYourDna: 'Inicia sesión en tu ADN',
  dnaBadgeAria: (name, badge) => `${name}, insignia de ADN ${badge}`,
  dnaBadgeTitle: (badge) => `Insignia de ADN ${badge}`,
  openDnaProfileAria: (badge) => `Abrir perfil de ADN, insignia ${badge}`,
  language: 'Idioma',
  selectLanguage: 'Seleccionar idioma',
  switchToNormal: 'Cambiar al modo normal',
  switchToDark: 'Cambiar al modo oscuro',
};

export default header;
