const faq = {
  kicker: 'FRAGRANCEDNA GUIDE',
  title: 'Your profile, confidence and badges',
  intro:
    'A clear guide to how Grounding starts your DNA, how committed fragrance feedback refines it, and what each confidence badge represents.',
  startWithGrounding: 'Start with Grounding',
  continueEvaluations: 'Continue evaluations',
  badgeLevelsTitle: 'Confidence badge levels',
  badgeImageAlt:
    'Hobby 0 to 34 percent; Explorer 35 to 49 percent; Enthusiast 50 to 64 percent; Connoisseur 65 to 79 percent; Expert 80 to 89 percent; Olfactive Master 90 to 100 percent.',
  badgeRange: (minimum: number, maximum: number) => `${minimum}%–${maximum}% confidence`,
  faqTitle: 'Frequently asked questions',
  items: [
    {
      question: 'What does DNA confidence measure?',
      answer:
        'Confidence reflects how much of your fragrance profile is supported by relevant evidence, how consistent repeated signals are, and how much useful evidence has accumulated. It is not a score for how much you like perfume, and it is not simply a count of completed tests.',
    },
    {
      question: 'How does my profile begin?',
      answer:
        'Grounding records the olfactive families you love, feel neutral about, or avoid, and creates your initial DNA profile. You can see recommendations right away. At least two Love or Avoid preferences are needed before starting a diagnostic batch.',
    },
    {
      question: 'How do fragrance evaluations work?',
      answer:
        'Each adaptive batch offers up to six fragrances, with a recommended option and a backup where available. Choose the fragrance you can evaluate and rate every displayed characteristic. Your answers affect the profile only after you commit the evaluation.',
    },
    {
      question: 'Do draft slider changes affect my badge?',
      answer:
        'No. Slider changes are a draft until you commit. Uncommitted answers do not change your DNA confidence, current badge, or recommendations.',
    },
    {
      question: 'Can I stop and continue later?',
      answer:
        'Yes. Your selected fragrance, batch position, completed evaluations, and profile are saved for your account. You can stop after any committed evaluation and resume later.',
    },
    {
      question: 'What do the badge levels mean?',
      answer:
        'The badge next to your account name reflects your current DNA confidence range. As committed evidence strengthens and broadens the profile, the badge changes at the thresholds shown below.',
    },
  ],
};

export default faq;
