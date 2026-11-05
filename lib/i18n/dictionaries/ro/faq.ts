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
        'Grounding pornește de la alegerile explicite „Iubesc” și „Evit”. Neutral nu are influență pozitivă sau negativă, iar familiile neevaluate rămân necunoscute. Ai nevoie de două alegeri Iubesc sau Evit pentru test. Răspunsurile directe despre plăcere pot corecta aceste preferințe inițiale.',
    },
    {
      question: 'Cum funcționează evaluările de parfumuri?',
      answer:
        'Evaluezi parfumul per ansamblu, apoi maximum două caracteristici adaptive: cât de sesizabile au fost și, dacă le-ai sesizat, dacă ți-au plăcut. Nesesizat nu înseamnă displăcut. Doar plăcerea explicită a caracteristicii îi rafinează preferința și încrederea; plăcerea generală influențează separat potrivirea compozițiilor. Următorul parfum este ales după trimitere. Imposibilitatea de a evalua nu adaugă dovezi sau evaluări finalizate.',
    },
    {
      question: 'Răspunsurile netrimise îmi afectează insigna?',
      answer:
        'Nu. Răspunsurile parțiale sunt salvate pentru reluare, dar nu schimbă preferințele, încrederea, insigna sau recomandările înainte de trimitere. Sliderele vechi rămân istoric de percepție, nu dovezi de plăcere sau neplăcere.',
    },
    {
      question: 'Pot să mă opresc și să continui mai târziu?',
      answer:
        'Da. Parfumul curent și răspunsurile parțiale sunt salvate în acest browser și sincronizate în cont când ești autentificat. Evaluările finalizate rămân salvate. Dacă salvarea eșuează, reîncearcă înainte să pleci.',
    },
    {
      question: 'Ce înseamnă nivelurile insignelor?',
      answer:
        'Insigna de lângă numele contului tău reflectă intervalul actual de încredere ADN. Pe măsură ce dovezile confirmate întăresc și extind profilul, insigna se schimbă la pragurile prezentate mai jos.',
    },
  ],
};

export default faq;
