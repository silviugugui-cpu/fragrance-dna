import type { Dictionary } from '../en';

const territories: Dictionary['territories'] = {
  pageTitle: 'Territorios olfativos',
  backgroundAlt: 'Fondo de los territorios',
  hero: {
    overviewLabel: 'Visión general',
    overview:
      'El universo del perfume se organiza en territorios diferenciados. Cada uno representa un carácter olfativo único y ofrece distintas expresiones de identidad, estado de ánimo y ocasión.',
    howToUseLabel: 'Cómo usarlo',
    howToUse: 'Haz clic en cualquier territorio para explorar sus características, firmas de ADN y perfumes emblemáticos.',
  },
  fullSection: {
    kicker: 'Territorios olfativos',
    title: 'Explora los mundos olfativos',
    subtitle: 'Encuentra los mundos olfativos que hablan contigo.',
  },
  filters: {
    byIntensity: 'Filtrar por intensidad',
    bySeason: 'Filtrar por estación',
    all: 'Todos',
  },
  intensity: {
    light: 'Ligera',
    moderate: 'Moderada',
    intense: 'Intensa',
    high: 'Alta',
  },
  intensityBadge: (level) => `Intensidad ${level.toLowerCase()}`,
  seasons: {
    spring: 'Primavera',
    summer: 'Verano',
    fall: 'Otoño',
    winter: 'Invierno',
  },
  seasonsShort: {
    spring: 'Pri',
    summer: 'Ver',
    fall: 'Oto',
    winter: 'Inv',
  },
  card: {
    versatility: 'Versatilidad',
  },
  detail: {
    close: 'Cerrar',
    closeDetails: 'Cerrar los detalles del territorio',
    characteristics: 'CARACTERÍSTICAS',
    dnaAxes: 'EJES DE ADN',
    signatureFragrances: 'PERFUMES EMBLEMÁTICOS',
    seasons: 'ESTACIONES',
    intensity: 'INTENSIDAD',
    versatility: 'VERSATILIDAD',
    artworkAlt: (name) => `Ilustración del territorio ${name}`,
  },
  dnaIntegration: {
    kicker: 'INTEGRACIÓN DE ADN',
    title: 'Mapea tu afinidad con los territorios',
    text: 'Tu firma OlfactiveDNA se traduce de forma natural en afinidades con los territorios. Entender qué territorios resuenan con tu perfil te guía hacia perfumes alineados con tu identidad.',
    cta: 'DESCUBRE TUS TERRITORIOS →',
  },
};

export default territories;
