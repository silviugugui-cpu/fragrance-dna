import type { Dictionary } from '../en';

const faq: Dictionary['faq'] = {
  kicker: 'GHID FRAGRANCEDNA',
  title: 'Profilul tău, încrederea și insignele',
  intro:
    'Un ghid clar despre cum Grounding îți pornește ADN-ul, cum îl rafinează feedbackul confirmat și ce reprezintă fiecare insignă de încredere.',
  startWithGrounding: 'Începe cu Grounding',
  continueEvaluations: 'Continuă evaluările',
  badgeLevelsTitle: 'Nivelurile insignelor de încredere',
  badgeImageAlt:
    'Hobby de la 0 la 34 la sută; Explorator de la 35 la 49 la sută; Entuziast de la 50 la 64 la sută; Cunoscător de la 65 la 79 la sută; Expert de la 80 la 89 la sută; Maestru olfactiv de la 90 la 100 la sută.',
  badgeRange: (minimum, maximum) => `${minimum}%–${maximum}% încredere`,
  faqTitle: 'Întrebări frecvente',
  items: [
    {
      question: 'Ce măsoară încrederea ADN?',
      answer:
        'Încrederea reflectă cât din profilul tău olfactiv este susținut de dovezi relevante, cât de consecvente sunt semnalele repetate și câte dovezi utile s-au acumulat. Nu este un scor al pasiunii tale pentru parfumuri și nici o simplă numărătoare a testelor finalizate.',
    },
    {
      question: 'Cum începe profilul meu?',
      answer:
        'Grounding înregistrează familiile olfactive pe care le iubești, față de care ești neutru sau pe care le eviți și îți creează profilul ADN inițial. Vezi recomandări imediat. Sunt necesare cel puțin două preferințe „Iubesc” sau „Evit” înainte de a începe un lot de diagnostic.',
    },
    {
      question: 'Cum funcționează evaluările de parfumuri?',
      answer:
        'Fiecare lot adaptiv oferă până la șase parfumuri, cu o opțiune recomandată și una de rezervă acolo unde este disponibilă. Alege parfumul pe care îl poți evalua și notează fiecare caracteristică afișată. Răspunsurile tale afectează profilul doar după ce confirmi evaluarea.',
    },
    {
      question: 'Modificările provizorii ale cursoarelor îmi afectează insigna?',
      answer:
        'Nu. Modificările cursoarelor rămân o ciornă până când confirmi. Răspunsurile neconfirmate nu îți schimbă încrederea ADN, insigna actuală sau recomandările.',
    },
    {
      question: 'Pot să mă opresc și să continui mai târziu?',
      answer:
        'Da. Parfumul selectat, poziția în lot, evaluările finalizate și profilul sunt salvate în contul tău. Te poți opri după orice evaluare confirmată și poți relua mai târziu.',
    },
    {
      question: 'Ce înseamnă nivelurile insignelor?',
      answer:
        'Insigna de lângă numele contului tău reflectă intervalul actual de încredere ADN. Pe măsură ce dovezile confirmate întăresc și extind profilul, insigna se schimbă la pragurile prezentate mai jos.',
    },
  ],
};

export default faq;
