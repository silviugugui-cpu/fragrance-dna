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
        'O Grounding parte das escolhas explícitas Adoro e Evito. Neutro não tem influência positiva nem negativa; as famílias não avaliadas permanecem desconhecidas. São necessárias duas escolhas Adoro ou Evito para o teste. Respostas diretas podem corrigir estas preferências iniciais.',
    },
    {
      question: 'Como funcionam as avaliações de perfumes?',
      answer:
        'Avalie o perfume no geral e até duas características adaptativas: quanto as percebeu e, se notadas, se gostou delas. Não percebido nunca significa rejeição. Só o agrado explícito refina a preferência e confiança do atributo; a avaliação geral compara composições separadamente. O próximo perfume é escolhido após o envio. Não conseguir avaliar não acrescenta sinais nem avaliações completas.',
    },
    {
      question: 'As respostas não enviadas afetam o meu distintivo?',
      answer:
        'Não. As respostas parciais são guardadas para retomar, mas não alteram preferências, confiança, distintivos ou recomendações antes do envio. Os antigos controlos continuam como histórico de perceção, nunca de agrado.',
    },
    {
      question: 'Posso parar e continuar mais tarde?',
      answer:
        'Sim. O perfume atual e as respostas parciais são guardados neste navegador e sincronizados com a conta quando tem sessão iniciada. As avaliações completas permanecem guardadas. Se o guardado falhar, tente novamente antes de sair.',
    },
    {
      question: 'O que significam os níveis de distintivo?',
      answer:
        'O distintivo junto ao nome da sua conta reflete o seu intervalo atual de confiança de ADN. À medida que a evidência confirmada fortalece e alarga o perfil, o distintivo muda nos limiares apresentados abaixo.',
    },
  ],
};

export default faq;
