import type { Dictionary } from '../en';

const header: Dictionary['header'] = {
  nav: {
    home: { label: 'Início', mobile: 'Início', hint: 'Página inicial' },
    grounding: { label: 'BASE OLFATIVA', mobile: 'Base olfativa', hint: 'Explore os fundamentos do olfato' },
    test: { label: 'TESTE', mobile: 'Teste', hint: 'Teste rápido de fragrâncias' },
    dna: { label: 'O SEU ADN', mobile: 'O seu ADN', hint: 'Perfil pessoal' },
    collection: { label: 'A SUA COLEÇÃO', mobile: 'A sua coleção', hint: 'Fragrâncias guardadas' },
    fragrances: { label: 'FRAGRÂNCIAS', mobile: 'Biblioteca de fragrâncias', hint: 'Pesquise mais de 68 000 perfumes' },
    faq: { label: 'FAQ', mobile: 'FAQ de ADN e emblemas', hint: 'Como funcionam a confiança e os emblemas' },
    articles: { label: 'ARTIGOS', mobile: 'O perfume como paixão', hint: 'Leia artigos sobre perfumes' },
  },
  signedInAs: 'Sessão iniciada como',
  myDnaProfile: 'O meu perfil de ADN',
  myCollection: 'A minha coleção',
  dnaBadgesFaq: 'Emblemas de ADN e FAQ',
  signOut: 'Terminar sessão',
  signingOut: 'A terminar sessão...',
  login: 'Entrar',
  menu: 'Menu',
  closeMenu: 'Fechar',
  closeMobileMenu: 'Fechar o menu móvel',
  signIntoYourDna: 'Entre no seu ADN',
  dnaBadgeAria: (name, badge) => `${name}, emblema de ADN ${badge}`,
  dnaBadgeTitle: (badge) => `Emblema de ADN ${badge}`,
  openDnaProfileAria: (badge) => `Abrir o perfil de ADN, emblema ${badge}`,
  language: 'Idioma',
  selectLanguage: 'Selecionar idioma',
  themeComingSoon: 'Modo escuro ativo. O modo normal estará disponível em breve.',
};

export default header;
