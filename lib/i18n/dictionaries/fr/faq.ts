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
        'L’Ancrage utilise vos choix explicites J’adore et J’évite. Neutre n’a aucune influence positive ou négative ; les familles non évaluées restent inconnues. Deux choix J’adore ou J’évite permettent de commencer le test. Vos réponses directes peuvent corriger ces préférences initiales.',
    },
    {
      question: 'Comment fonctionnent les évaluations de parfums ?',
      answer:
        'Évaluez le parfum globalement, puis jusqu’à deux caractéristiques : leur perception et, si perçues, votre plaisir. Non perçu ne signifie jamais détesté. Seul le plaisir explicite affine une préférence et sa confiance ; l’avis global sert séparément à comparer les compositions. Le parfum suivant est choisi après envoi. Impossible à évaluer n’ajoute ni preuve ni évaluation complète.',
    },
    {
      question: 'Les réponses non envoyées affectent-elles mon badge ?',
      answer:
        'Non. Les réponses partielles sont sauvegardées pour reprise, sans modifier préférences, confiance, badge ou recommandations avant envoi. Les anciens curseurs restent un historique de perception, pas des préférences.',
    },
    {
      question: 'Puis-je m’arrêter et reprendre plus tard ?',
      answer:
        'Oui. Le parfum courant et les réponses partielles sont sauvegardés dans ce navigateur et synchronisés avec votre compte si vous êtes connecté. Les évaluations terminées sont conservées. En cas d’échec de sauvegarde, réessayez avant de partir.',
    },
    {
      question: 'Que signifient les niveaux de badge ?',
      answer:
        'Le badge affiché à côté de votre nom de compte reflète votre plage de confiance ADN actuelle. À mesure que les preuves validées renforcent et élargissent le profil, le badge évolue selon les seuils indiqués ci-dessous.',
    },
  ],
};

export default faq;
