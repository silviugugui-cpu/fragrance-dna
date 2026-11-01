import type { Dictionary } from '../en';

const faq: Dictionary['faq'] = {
  kicker: 'GUIDE FRAGRANCEDNA',
  title: 'Votre profil, votre confiance et vos badges',
  intro:
    'Un guide clair pour comprendre comment l’Ancrage initialise votre ADN, comment vos retours validés l’affinent et ce que représente chaque badge de confiance.',
  startWithGrounding: 'Commencer par l’Ancrage',
  continueEvaluations: 'Poursuivre les évaluations',
  badgeLevelsTitle: 'Niveaux de badge de confiance',
  badgeImageAlt:
    'Hobby de 0 à 34 pour cent ; Explorateur de 35 à 49 pour cent ; Passionné de 50 à 64 pour cent ; Connaisseur de 65 à 79 pour cent ; Expert de 80 à 89 pour cent ; Maître olfactif de 90 à 100 pour cent.',
  badgeRange: (minimum, maximum) => `${minimum} %–${maximum} % de confiance`,
  faqTitle: 'Questions fréquentes',
  items: [
    {
      question: 'Que mesure la confiance ADN ?',
      answer:
        'La confiance reflète la part de votre profil olfactif étayée par des preuves pertinentes, la cohérence des signaux répétés et la quantité de preuves utiles accumulées. Ce n’est ni une note d’amour du parfum, ni un simple décompte de tests réalisés.',
    },
    {
      question: 'Comment mon profil démarre-t-il ?',
      answer:
        'L’Ancrage enregistre les familles olfactives que vous adorez, qui vous laissent neutre ou que vous évitez, et crée votre profil ADN initial. Vous voyez des recommandations immédiatement. Au moins deux préférences « J’adore » ou « J’évite » sont nécessaires avant de lancer une série diagnostique.',
    },
    {
      question: 'Comment fonctionnent les évaluations de parfums ?',
      answer:
        'Chaque série adaptative propose jusqu’à six parfums, avec une option recommandée et une solution de repli lorsque c’est possible. Choisissez le parfum que vous pouvez évaluer et notez chaque caractéristique affichée. Vos réponses n’influencent le profil qu’après validation de l’évaluation.',
    },
    {
      question: 'Les réglages provisoires des curseurs affectent-ils mon badge ?',
      answer:
        'Non. Les réglages des curseurs restent un brouillon tant que vous ne validez pas. Les réponses non validées ne modifient ni votre confiance ADN, ni votre badge actuel, ni vos recommandations.',
    },
    {
      question: 'Puis-je m’arrêter et reprendre plus tard ?',
      answer:
        'Oui. Le parfum sélectionné, votre position dans la série, les évaluations terminées et votre profil sont enregistrés sur votre compte. Vous pouvez vous arrêter après toute évaluation validée et reprendre plus tard.',
    },
    {
      question: 'Que signifient les niveaux de badge ?',
      answer:
        'Le badge affiché à côté de votre nom de compte reflète votre plage de confiance ADN actuelle. À mesure que les preuves validées renforcent et élargissent le profil, le badge évolue selon les seuils indiqués ci-dessous.',
    },
  ],
};

export default faq;
