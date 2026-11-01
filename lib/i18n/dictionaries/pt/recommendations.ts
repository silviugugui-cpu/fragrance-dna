import type { Dictionary } from '../en';

const recommendations: Dictionary['recommendations'] = {
  eyebrowEmbedded: 'AS SUAS RECOMENDAÇÕES',
  eyebrow: 'CORRESPONDÊNCIAS DE ADN',
  titleEmbedded: 'As suas recomendações',
  title: 'Fragrâncias a explorar',
  intro:
    'As recomendações usam o seu perfil de ADN atual — criado com a Base olfativa e apurado após cada avaliação confirmada — confrontado com as notas e acordes mapeados da base de dados principal de fragrâncias.',
  evaluations: 'avaliações',
  profileConfidence: 'confiança do perfil',
  dominantSignals: 'sinais dominantes',
  emerging: 'Em formação',
  loading: 'A procurar correspondências na base de dados de fragrâncias...',
  incompleteTitle: 'Comece pelas suas preferências olfativas',
  incompleteDescription:
    'A Base olfativa cria o seu perfil de ADN inicial. As recomendações ficam disponíveis assim que esse perfil existir.',
  beginGrounding: 'Começar a Base olfativa',
  loadError: 'Não foi possível carregar as recomendações de fragrâncias.',
  emptyReady:
    'A base de dados principal ainda não tem notas ou acordes mapeados suficientes para uma correspondência fiável.',
  bottleAlt: (name) => `Frasco de ${name}`,
  fallbackName: 'Fragrância',
  fallbackBrand: 'Base de dados de fragrâncias',
  unnamedFragrance: 'Fragrância sem nome',
  mappedCharacteristics: 'Características mapeadas:',
  inWishlist: 'Na lista de desejos',
  saveToWishlist: 'Guardar na lista de desejos',
  viewDna: 'Ver o seu ADN',
  openCollection: 'Abrir a coleção',
  explanationAligned: (attrs) => `Alinha-se com ${attrs}, ajustando-se ao seu ADN aprendido.`,
  explanationRanked: 'Classificada pelas suas notas e acordes mapeados face ao seu ADN aprendido.',
};

export default recommendations;
