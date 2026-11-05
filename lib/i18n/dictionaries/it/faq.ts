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
        'Il Grounding parte dalle scelte esplicite Amo ed Evito. Neutrale non ha influenza positiva o negativa; le famiglie non valutate restano sconosciute. Servono due scelte Amo o Evito per il test. Le risposte dirette possono correggere queste preferenze iniziali.',
    },
    {
      question: 'Come funzionano le valutazioni dei profumi?',
      answer:
        'Valuta il profumo nel complesso e fino a due caratteristiche adattive: quanto le hai percepite e, se notate, se ti sono piaciute. Non percepito non significa disprezzato. Solo il gradimento esplicito affina preferenza e fiducia dell’attributo; il giudizio generale confronta separatamente le composizioni. Il profumo successivo viene scelto dopo l’invio. Non valutabile non aggiunge segnali né valutazioni complete.',
    },
    {
      question: 'Le risposte non inviate influenzano il mio badge?',
      answer:
        'No. Le risposte parziali vengono salvate per riprendere, ma non cambiano preferenze, fiducia, badge o raccomandazioni prima dell’invio. I vecchi cursori restano uno storico di percezione, non di gradimento.',
    },
    {
      question: 'Posso fermarmi e continuare più tardi?',
      answer:
        'Sì. Il profumo attuale e le risposte parziali vengono salvati in questo browser e sincronizzati con il tuo account se hai effettuato l’accesso. Le valutazioni complete restano salvate. In caso di errore, riprova prima di uscire.',
    },
    {
      question: 'Cosa significano i livelli dei badge?',
      answer:
        'Il badge accanto al nome del tuo account riflette l’attuale intervallo di fiducia del tuo DNA. Man mano che le prove confermate rafforzano e ampliano il profilo, il badge cambia alle soglie mostrate qui sotto.',
    },
  ],
};

export default faq;
