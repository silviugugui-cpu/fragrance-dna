import type { Dictionary } from '../en';

const recommendations: Dictionary['recommendations'] = {
  eyebrowEmbedded: 'TUS RECOMENDACIONES',
  eyebrow: 'COINCIDENCIAS DE ADN',
  titleEmbedded: 'Tus recomendaciones',
  title: 'Fragancias por explorar',
  intro:
    'Las recomendaciones usan tu perfil de ADN actual —creado con la Base olfativa y afinado tras cada evaluación confirmada— contrastado con las notas y acordes mapeados de la base de datos maestra de fragancias.',
  evaluations: 'evaluaciones',
  profileConfidence: 'confianza del perfil',
  dominantSignals: 'señales dominantes',
  emerging: 'Emergente',
  loading: 'Buscando coincidencias en la base de datos de fragancias...',
  incompleteTitle: 'Empieza por tus preferencias olfativas',
  incompleteDescription:
    'La Base olfativa crea tu perfil de ADN inicial. Las recomendaciones estarán disponibles en cuanto exista ese perfil.',
  beginGrounding: 'Comenzar la Base olfativa',
  loadError: 'No se pudieron cargar las recomendaciones de fragancias.',
  emptyReady:
    'La base de datos maestra aún no tiene suficientes notas o acordes mapeados para una coincidencia fiable.',
  bottleAlt: (name) => `Frasco de ${name}`,
  fallbackName: 'Fragancia',
  fallbackBrand: 'Base de datos de fragancias',
  unnamedFragrance: 'Fragancia sin nombre',
  mappedCharacteristics: 'Características mapeadas:',
  inWishlist: 'En la lista de deseos',
  saveToWishlist: 'Guardar en la lista de deseos',
  viewDna: 'Ver tu ADN',
  openCollection: 'Abrir la colección',
  explanationAligned: (attrs) => `Encaja con ${attrs}, a la vez que se ajusta a tu ADN aprendido.`,
  explanationRanked: 'Clasificada según sus notas y acordes mapeados frente a tu ADN aprendido.',
};

export default recommendations;
