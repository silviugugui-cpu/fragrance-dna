import type { Dictionary } from '../en';

const faq: Dictionary['faq'] = {
  kicker: 'OlfactiveDNA-LEITFADEN',
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
        'Grounding beginnt mit Ihren ausdrücklichen Liebe- und Meide-Auswahlen. Neutral hat keinen positiven oder negativen Einfluss; unbewertete Familien bleiben unbekannt. Zwei Liebe- oder Meide-Auswahlen sind für den Test nötig. Direkte Antworten können diese anfänglichen Vorlieben korrigieren.',
    },
    {
      question: 'Wie funktionieren Duftbewertungen?',
      answer:
        'Bewerten Sie den Duft insgesamt und dann höchstens zwei adaptive Merkmale: Wahrnehmbarkeit und, falls bemerkt, Gefallen. Nicht bemerkt bedeutet nie Ablehnung. Nur ausdrückliches Gefallen verfeinert die Merkmalsvorliebe und ihre Konfidenz; die Gesamtbewertung dient separat dem Kompositionsvergleich. Der nächste Duft wird nach dem Absenden gewählt. Nicht bewertbar liefert weder Lernsignal noch abgeschlossene Bewertung.',
    },
    {
      question: 'Beeinflussen ungesendete Antworten mein Abzeichen?',
      answer:
        'Nein. Teilantworten werden zum Fortsetzen gespeichert, ändern aber vor dem Absenden keine Vorlieben, Konfidenz, Abzeichen oder Empfehlungen. Frühere Reglerwerte bleiben Wahrnehmungsverlauf, keine Vorlieben.',
    },
    {
      question: 'Kann ich pausieren und später weitermachen?',
      answer:
        'Ja. Der aktuelle Duft und Teilantworten werden in diesem Browser gespeichert und bei Anmeldung mit Ihrem Konto synchronisiert. Abgeschlossene Bewertungen bleiben erhalten. Bei Speicherfehlern versuchen Sie es vor dem Verlassen erneut.',
    },
    {
      question: 'Was bedeuten die Abzeichenstufen?',
      answer:
        'Das Abzeichen neben Ihrem Kontonamen spiegelt Ihren aktuellen DNA-Konfidenzbereich wider. Wenn bestätigte Belege das Profil stärken und erweitern, wechselt das Abzeichen an den unten gezeigten Schwellenwerten.',
    },
  ],
};

export default faq;
