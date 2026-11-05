const faq = {
  kicker: 'OlfactiveDNA GUIDE',
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
        'Grounding starts your profile from explicit Love and Avoid choices. Neutral has no positive or negative influence; unassessed families remain unknown. At least two Love or Avoid choices are needed to start the test. Direct liking answers can correct these initial preferences.',
    },
    {
      question: 'How do fragrance evaluations work?',
      answer:
        'Rate the fragrance overall, then up to two adaptive characteristics: how noticeable each was and, if noticed, whether you liked it. Not noticed never means dislike. Only explicit attribute liking refines attribute preferences and their confidence; overall liking informs composition matching separately. The next fragrance is chosen after submission. Unable to evaluate adds no learning signal or completed evaluation.',
    },
    {
      question: 'Do unfinished answers affect my badge?',
      answer:
        'No. Draft answers are saved for resuming, but do not change preferences, confidence, badges or recommendations until submitted. Previous sliders remain perception history, never like/dislike evidence.',
    },
    {
      question: 'Can I stop and continue later?',
      answer:
        'Yes. The current fragrance and partially answered questions are saved on this browser and synchronized to your account when signed in. Completed evaluations remain saved too. If saving fails, retry before leaving.',
    },
    {
      question: 'What do the badge levels mean?',
      answer:
        'The badge next to your account name reflects your current DNA confidence range. As committed evidence strengthens and broadens the profile, the badge changes at the thresholds shown below.',
    },
  ],
};

export default faq;
