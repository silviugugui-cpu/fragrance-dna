import type { Dictionary } from '../en';

const faq: Dictionary['faq'] = {
  kicker: 'GUIDA FRAGRANCEDNA',
  title: 'Il tuo profilo, la fiducia e i badge',
  intro:
    'Una guida chiara su come il Grounding avvia il tuo DNA, come i feedback confermati lo affinano e cosa rappresenta ogni badge di fiducia.',
  startWithGrounding: 'Inizia con il Grounding',
  continueEvaluations: 'Continua le valutazioni',
  badgeLevelsTitle: 'Livelli dei badge di fiducia',
  badgeImageAlt:
    'Hobby da 0 a 34 per cento; Esploratore da 35 a 49 per cento; Appassionato da 50 a 64 per cento; Intenditore da 65 a 79 per cento; Esperto da 80 a 89 per cento; Maestro olfattivo da 90 a 100 per cento.',
  badgeRange: (minimum, maximum) => `${minimum}%–${maximum}% di fiducia`,
  faqTitle: 'Domande frequenti',
  items: [
    {
      question: 'Cosa misura la fiducia del DNA?',
      answer:
        'La fiducia riflette quanta parte del tuo profilo olfattivo è supportata da prove rilevanti, quanto sono coerenti i segnali ripetuti e quante prove utili si sono accumulate. Non è un punteggio su quanto ami il profumo, né un semplice conteggio dei test completati.',
    },
    {
      question: 'Come inizia il mio profilo?',
      answer:
        'Il Grounding registra le famiglie olfattive che ami, che ti lasciano neutrale o che eviti, e crea il tuo profilo DNA iniziale. Vedi subito le raccomandazioni. Servono almeno due preferenze «Amo» o «Evito» prima di avviare un lotto diagnostico.',
    },
    {
      question: 'Come funzionano le valutazioni dei profumi?',
      answer:
        'Ogni lotto adattivo propone fino a sei profumi, con un’opzione consigliata e una di riserva quando disponibile. Scegli il profumo che puoi valutare e assegna un punteggio a ogni caratteristica mostrata. Le tue risposte influenzano il profilo solo dopo la conferma della valutazione.',
    },
    {
      question: 'Le modifiche provvisorie dei cursori influenzano il mio badge?',
      answer:
        'No. Le modifiche dei cursori restano una bozza finché non confermi. Le risposte non confermate non cambiano la tua fiducia DNA, il badge attuale o le raccomandazioni.',
    },
    {
      question: 'Posso fermarmi e continuare più tardi?',
      answer:
        'Sì. Il profumo selezionato, la posizione nel lotto, le valutazioni completate e il profilo vengono salvati sul tuo account. Puoi fermarti dopo qualsiasi valutazione confermata e riprendere in seguito.',
    },
    {
      question: 'Cosa significano i livelli dei badge?',
      answer:
        'Il badge accanto al nome del tuo account riflette l’attuale intervallo di fiducia del tuo DNA. Man mano che le prove confermate rafforzano e ampliano il profilo, il badge cambia alle soglie mostrate qui sotto.',
    },
  ],
};

export default faq;
