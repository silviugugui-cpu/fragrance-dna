import type { Dictionary } from '../en';

const faq: Dictionary['faq'] = {
  kicker: 'GUÍA FRAGRANCEDNA',
  title: 'Tu perfil, tu confianza y tus insignias',
  intro:
    'Una guía clara sobre cómo el Grounding inicia tu ADN, cómo lo afinan tus valoraciones confirmadas y qué representa cada insignia de confianza.',
  startWithGrounding: 'Empieza con el Grounding',
  continueEvaluations: 'Continuar evaluaciones',
  badgeLevelsTitle: 'Niveles de insignia de confianza',
  badgeImageAlt:
    'Hobby de 0 a 34 por ciento; Explorador de 35 a 49 por ciento; Entusiasta de 50 a 64 por ciento; Connoisseur de 65 a 79 por ciento; Experto de 80 a 89 por ciento; Maestro olfativo de 90 a 100 por ciento.',
  badgeRange: (minimum, maximum) => `${minimum} %–${maximum} % de confianza`,
  faqTitle: 'Preguntas frecuentes',
  items: [
    {
      question: '¿Qué mide la confianza del ADN?',
      answer:
        'La confianza refleja qué parte de tu perfil olfativo está respaldada por evidencia relevante, cuán consistentes son las señales repetidas y cuánta evidencia útil se ha acumulado. No es una puntuación de cuánto te gusta el perfume, ni un simple recuento de pruebas completadas.',
    },
    {
      question: '¿Cómo empieza mi perfil?',
      answer:
        'El Grounding registra las familias olfativas que amas, te resultan neutras o evitas, y crea tu perfil de ADN inicial. Verás recomendaciones de inmediato. Se necesitan al menos dos preferencias de «Me encanta» o «Evito» antes de iniciar un lote de diagnóstico.',
    },
    {
      question: '¿Cómo funcionan las evaluaciones de perfumes?',
      answer:
        'Cada lote adaptativo ofrece hasta seis perfumes, con una opción recomendada y una alternativa cuando esté disponible. Elige el perfume que puedas evaluar y puntúa cada característica mostrada. Tus respuestas solo afectan al perfil cuando confirmas la evaluación.',
    },
    {
      question: '¿Los cambios provisionales de los controles afectan a mi insignia?',
      answer:
        'No. Los cambios en los controles son un borrador hasta que confirmas. Las respuestas sin confirmar no modifican tu confianza de ADN, tu insignia actual ni tus recomendaciones.',
    },
    {
      question: '¿Puedo parar y continuar más tarde?',
      answer:
        'Sí. El perfume seleccionado, tu posición en el lote, las evaluaciones completadas y tu perfil se guardan en tu cuenta. Puedes parar después de cualquier evaluación confirmada y retomar más tarde.',
    },
    {
      question: '¿Qué significan los niveles de insignia?',
      answer:
        'La insignia junto al nombre de tu cuenta refleja tu rango actual de confianza de ADN. A medida que la evidencia confirmada fortalece y amplía el perfil, la insignia cambia en los umbrales que se muestran a continuación.',
    },
  ],
};

export default faq;
