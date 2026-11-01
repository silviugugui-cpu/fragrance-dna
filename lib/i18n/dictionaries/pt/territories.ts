import type { Dictionary } from '../en';

const territories: Dictionary['territories'] = {
  pageTitle: 'Territórios olfativos',
  backgroundAlt: 'Fundo dos territórios',
  hero: {
    overviewLabel: 'Visão geral',
    overview:
      'O universo do perfume organiza-se em territórios distintos. Cada um representa um caráter olfativo único e oferece diferentes expressões de identidade, estado de espírito e ocasião.',
    howToUseLabel: 'Como utilizar',
    howToUse: 'Clique num território para explorar as características, as assinaturas de ADN e os perfumes emblemáticos.',
  },
  fullSection: {
    kicker: 'Territórios olfativos',
    title: 'Explore os mundos olfativos',
    subtitle: 'Encontre os universos olfativos que falam consigo.',
  },
  filters: {
    byIntensity: 'Filtrar por intensidade',
    bySeason: 'Filtrar por estação',
    all: 'Todos',
  },
  intensity: {
    light: 'Ligeira',
    moderate: 'Moderada',
    intense: 'Intensa',
    high: 'Alta',
  },
  intensityBadge: (level) => `Intensidade ${level.toLowerCase()}`,
  seasons: {
    spring: 'Primavera',
    summer: 'Verão',
    fall: 'Outono',
    winter: 'Inverno',
  },
  seasonsShort: {
    spring: 'Pri',
    summer: 'Ver',
    fall: 'Out',
    winter: 'Inv',
  },
  card: {
    versatility: 'Versatilidade',
  },
  detail: {
    close: 'Fechar',
    closeDetails: 'Fechar os detalhes do território',
    characteristics: 'CARACTERÍSTICAS',
    dnaAxes: 'EIXOS DE ADN',
    signatureFragrances: 'PERFUMES EMBLEMÁTICOS',
    seasons: 'ESTAÇÕES',
    intensity: 'INTENSIDADE',
    versatility: 'VERSATILIDADE',
    artworkAlt: (name) => `Ilustração do território ${name}`,
  },
  dnaIntegration: {
    kicker: 'INTEGRAÇÃO DE ADN',
    title: 'Mapeie a sua afinidade com os territórios',
    text: 'A sua assinatura OlfactiveDNA traduz-se naturalmente em afinidades com os territórios. Compreender que territórios ressoam com o seu perfil orienta a descoberta de perfumes alinhados com a sua identidade.',
    cta: 'DESCUBRA OS SEUS TERRITÓRIOS →',
  },
};

export default territories;
