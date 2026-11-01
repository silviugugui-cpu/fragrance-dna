import type { Dictionary } from '../en';

const faq: Dictionary['faq'] = {
  kicker: 'FRAGRANCEDNA-LEITFADEN',
  title: 'Ihr Profil, Ihre Konfidenz und Ihre Abzeichen',
  intro:
    'Ein klarer Leitfaden dazu, wie das Grounding Ihre DNA startet, wie bestätigtes Duft-Feedback sie verfeinert und was jedes Konfidenz-Abzeichen bedeutet.',
  startWithGrounding: 'Mit dem Grounding beginnen',
  continueEvaluations: 'Bewertungen fortsetzen',
  badgeLevelsTitle: 'Konfidenz-Abzeichenstufen',
  badgeImageAlt:
    'Hobby 0 bis 34 Prozent; Entdecker 35 bis 49 Prozent; Enthusiast 50 bis 64 Prozent; Kenner 65 bis 79 Prozent; Experte 80 bis 89 Prozent; Olfaktorischer Meister 90 bis 100 Prozent.',
  badgeRange: (minimum, maximum) => `${minimum} %–${maximum} % Konfidenz`,
  faqTitle: 'Häufig gestellte Fragen',
  items: [
    {
      question: 'Was misst die DNA-Konfidenz?',
      answer:
        'Die Konfidenz spiegelt wider, wie viel Ihres olfaktorischen Profils durch relevante Belege gestützt wird, wie konsistent wiederholte Signale sind und wie viele nützliche Belege sich angesammelt haben. Sie ist keine Bewertung dafür, wie sehr Sie Parfum mögen, und auch keine bloße Zählung abgeschlossener Tests.',
    },
    {
      question: 'Wie beginnt mein Profil?',
      answer:
        'Das Grounding erfasst die olfaktorischen Familien, die Sie lieben, neutral sehen oder meiden, und erstellt Ihr erstes DNA-Profil. Empfehlungen sehen Sie sofort. Mindestens zwei „Liebe“- oder „Meide“-Präferenzen sind nötig, bevor eine Diagnose-Serie starten kann.',
    },
    {
      question: 'Wie funktionieren Duftbewertungen?',
      answer:
        'Jede adaptive Serie bietet bis zu sechs Düfte, mit einer empfohlenen Option und – wo verfügbar – einer Alternative. Wählen Sie den Duft, den Sie bewerten können, und beurteilen Sie jede angezeigte Eigenschaft. Ihre Antworten beeinflussen das Profil erst, wenn Sie die Bewertung bestätigen.',
    },
    {
      question: 'Beeinflussen vorläufige Regler-Änderungen mein Abzeichen?',
      answer:
        'Nein. Regler-Änderungen bleiben ein Entwurf, bis Sie bestätigen. Unbestätigte Antworten verändern weder Ihre DNA-Konfidenz noch Ihr aktuelles Abzeichen oder Ihre Empfehlungen.',
    },
    {
      question: 'Kann ich pausieren und später weitermachen?',
      answer:
        'Ja. Ihr ausgewählter Duft, die Position in der Serie, abgeschlossene Bewertungen und Ihr Profil werden in Ihrem Konto gespeichert. Sie können nach jeder bestätigten Bewertung aufhören und später fortfahren.',
    },
    {
      question: 'Was bedeuten die Abzeichenstufen?',
      answer:
        'Das Abzeichen neben Ihrem Kontonamen spiegelt Ihren aktuellen DNA-Konfidenzbereich wider. Wenn bestätigte Belege das Profil stärken und erweitern, wechselt das Abzeichen an den unten gezeigten Schwellenwerten.',
    },
  ],
};

export default faq;
