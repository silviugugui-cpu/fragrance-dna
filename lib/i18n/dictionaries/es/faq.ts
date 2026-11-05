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
        'Grounding parte de tus elecciones explícitas Me encanta y Evito. Neutro no tiene influencia positiva ni negativa; las familias sin evaluar siguen siendo desconocidas. Necesitas dos elecciones Me encanta o Evito para el test. Las respuestas directas pueden corregir estas preferencias iniciales.',
    },
    {
      question: '¿Cómo funcionan las evaluaciones de perfumes?',
      answer:
        'Valora el perfume en conjunto y hasta dos características adaptativas: cuánto las percibiste y, si las notaste, si te gustaron. No percibido nunca significa rechazo. Solo el gusto explícito refina la preferencia del atributo y su confianza; la valoración global compara composiciones por separado. El siguiente perfume se elige tras enviar. No poder evaluar no añade señales ni evaluaciones completas.',
    },
    {
      question: '¿Las respuestas sin enviar afectan a mi insignia?',
      answer:
        'No. Las respuestas parciales se guardan para retomarlas, pero no cambian preferencias, confianza, insignias ni recomendaciones antes del envío. Los antiguos controles conservan percepción, nunca gusto o rechazo.',
    },
    {
      question: '¿Puedo parar y continuar más tarde?',
      answer:
        'Sí. El perfume actual y las respuestas parciales se guardan en este navegador y se sincronizan con tu cuenta al iniciar sesión. Las evaluaciones completas se conservan. Si falla el guardado, reintenta antes de salir.',
    },
    {
      question: '¿Qué significan los niveles de insignia?',
      answer:
        'La insignia junto al nombre de tu cuenta refleja tu rango actual de confianza de ADN. A medida que la evidencia confirmada fortalece y amplía el perfil, la insignia cambia en los umbrales que se muestran a continuación.',
    },
  ],
};

export default faq;
