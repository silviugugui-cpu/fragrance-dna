import type { Dictionary } from '../en';

const faq: Dictionary['faq'] = {
  kicker: 'GUIA FRAGRANCEDNA',
  title: 'O seu perfil, a confiança e os distintivos',
  intro:
    'Um guia claro sobre como o Grounding inicia o seu ADN, como o feedback confirmado o refina e o que cada distintivo de confiança representa.',
  startWithGrounding: 'Comece pelo Grounding',
  continueEvaluations: 'Continuar as avaliações',
  badgeLevelsTitle: 'Níveis de distintivo de confiança',
  badgeImageAlt:
    'Hobby de 0 a 34 por cento; Explorador de 35 a 49 por cento; Entusiasta de 50 a 64 por cento; Conhecedor de 65 a 79 por cento; Perito de 80 a 89 por cento; Mestre olfativo de 90 a 100 por cento.',
  badgeRange: (minimum, maximum) => `${minimum}%–${maximum}% de confiança`,
  faqTitle: 'Perguntas frequentes',
  items: [
    {
      question: 'O que mede a confiança do ADN?',
      answer:
        'A confiança reflete a parte do seu perfil olfativo que está apoiada em evidência relevante, a consistência dos sinais repetidos e a quantidade de evidência útil acumulada. Não é uma pontuação sobre o quanto gosta de perfume, nem uma simples contagem de testes concluídos.',
    },
    {
      question: 'Como começa o meu perfil?',
      answer:
        'O Grounding regista as famílias olfativas que adora, que lhe são indiferentes ou que evita, e cria o seu perfil de ADN inicial. Vê recomendações de imediato. São necessárias pelo menos duas preferências «Adoro» ou «Evito» antes de iniciar um lote de diagnóstico.',
    },
    {
      question: 'Como funcionam as avaliações de perfumes?',
      answer:
        'Cada lote adaptativo oferece até seis perfumes, com uma opção recomendada e uma alternativa quando disponível. Escolha o perfume que consegue avaliar e classifique todas as características apresentadas. As suas respostas só afetam o perfil depois de confirmar a avaliação.',
    },
    {
      question: 'As alterações provisórias dos controlos afetam o meu distintivo?',
      answer:
        'Não. As alterações dos controlos são um rascunho até confirmar. As respostas não confirmadas não alteram a sua confiança de ADN, o distintivo atual nem as recomendações.',
    },
    {
      question: 'Posso parar e continuar mais tarde?',
      answer:
        'Sim. O perfume selecionado, a posição no lote, as avaliações concluídas e o perfil ficam guardados na sua conta. Pode parar após qualquer avaliação confirmada e retomar mais tarde.',
    },
    {
      question: 'O que significam os níveis de distintivo?',
      answer:
        'O distintivo junto ao nome da sua conta reflete o seu intervalo atual de confiança de ADN. À medida que a evidência confirmada fortalece e alarga o perfil, o distintivo muda nos limiares apresentados abaixo.',
    },
  ],
};

export default faq;
