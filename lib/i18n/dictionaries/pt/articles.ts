import type { Dictionary } from '../en';

const articles: Dictionary['articles'] = {
  menu: {
    passionMenu: 'Menu Paixão',
    items: {
      fragrances: { label: 'Perfumes', hint: 'Explore o catálogo de perfumes' },
      needToKnow: { label: 'Essencial saber', hint: 'Conhecimentos essenciais de perfumaria' },
      perfumeCreators: { label: 'Criadores de perfume', hint: 'ADN dos perfumistas e estilos de assinatura' },
      scentTerritories: { label: 'Territórios olfativos', hint: 'Explore os mundos olfativos' },
      perfumeHouses: { label: 'TOP Olfactive Houses', hint: 'Descubra casas e perfumes' },
      occasions: { label: 'Ocasiões', hint: 'Um perfume para cada momento' },
    },
  },
  houses: {
    title: 'TOP Olfactive Houses',
    intro: 'Uma seleção editorial, não um ranking de popularidade ou catálogo exaustivo. As recomendações de compra usam apenas este catálogo selecionado.',
    notice: 'Este catálogo não inclui todos os lançamentos. Os territórios são sugestões editoriais, não classificações confirmadas.',
    search: 'Pesquisar casas', fragranceSearch: 'Pesquisar nesta casa', searchAction: 'Pesquisar',
    catalog: 'Perfumes no nosso catálogo',
    description: 'Descrição editorial',
    editorialDescription: (name, accords) => accords
      ? `Explore o universo olfativo de ${name} através dos perfumes do nosso catálogo. Entre os acordes documentados com maior frequência encontram-se ${accords}. Esta visão geral oferece um ponto de partida para descobrir a casa, enquanto cada composição traz as suas próprias nuances.`
      : `Explore o universo olfativo de ${name} através dos perfumes do nosso catálogo. Descubra as composições abaixo e compare os perfis disponíveis para encontrar o seu próprio ponto de partida na casa.`,
    website: 'Website',
    source: 'Fonte documental', territories: 'Territórios sugeridos · revisão pendente',
    evidence: 'Termos de evidência', method: 'Método', confidence: 'Confiança declarada pela fonte',
    similarity: 'Semelhança relatada · não equivalência', brandClaim: 'Inspiração declarada pela marca',
    pending: 'Semelhança em pesquisa', notes: 'Notas do catálogo (não estruturadas; pirâmide não verificada)',
    noResults: 'Sem resultados nesta seleção.', previous: 'Anterior', next: 'Seguinte', back: 'Todas as casas selecionadas',
    page: 'Página', art: 'Ilustração editorial original; não é uma imagem oficial.', reviewStatus: 'Estado da revisão',
  },
  needToKnow: {
    kicker: 'Essencial saber',
    title: 'Artigos de Essencial saber',
    intro:
      'Explore conhecimento estruturado sobre perfumaria, organizado por categoria.',
    sectionLabel: 'Secção',
    nowReading: 'Em leitura',
    articleCount: (count) => `${count} artigos`,
    sections: {
      'scent-fundamentals': {
        title: 'Fundamentos olfativos',
        description: 'Princípios essenciais que explicam como os perfumes são estruturados e interpretados.',
        intro: 'Construa uma base sólida antes de avaliar desempenho, valor ou categoria de marca.',
        articles: [
          {
            title: 'Notas de saída, coração e fundo',
            subtitle: 'Um perfume é uma viagem',
            paragraphs: [
              'A maioria dos perfumes evolui por etapas, em vez de cheirar da mesma forma do início ao fim.',
              'As notas de saída são a primeira impressão: normalmente luminosas e efémeras.',
              'As notas de coração definem o caráter central quando a abertura se desvanece.',
              'As notas de fundo conferem profundidade e moldam frequentemente o aroma duradouro na pele.',
            ],
          },
          {
            title: 'Compreender as concentrações',
            subtitle: 'EDT, EDP e Parfum em contexto',
            paragraphs: [
              'A concentração indica a quantidade aproximada de matéria aromática dissolvida em álcool, mas, por si só, não garante o desempenho.',
              'O desenho da fórmula, a qualidade dos ingredientes, a química da pele e o clima podem alterar o desempenho mais do que o rótulo de concentração.',
              'Alguns EDT superam muitos Parfum, consoante a composição.',
            ],
            bullets: [
              'Eau Fraiche: 1-3%',
              'Eau de Cologne (EDC): 2-5%',
              'Eau de Toilette (EDT): 5-15%',
              'Eau de Parfum (EDP): 15-20%',
              'Parfum / Extrait: 20-40%',
            ],
            callout:
              'Mito: uma concentração mais alta significa sempre maior desempenho.\nRealidade: a arquitetura da fórmula importa mais do que o rótulo.',
          },
          {
            title: 'O que é um acorde?',
            subtitle: 'Os alicerces da composição',
            paragraphs: [
              'Um acorde é uma mistura de matérias que cria uma impressão olfativa reconhecível, como couro, âmbar, tabaco ou ar marinho.',
              'Muitos acordes são ilusões de composição e não existem como matéria natural única.',
              'Compreender os acordes ajuda a explicar porque é que as pirâmides de notas e a perceção olfativa nem sempre coincidem à letra.',
            ],
          },
          {
            title: 'Ingredientes naturais vs sintéticos',
            subtitle: 'Ambos são essenciais na perfumaria moderna',
            paragraphs: [
              'As matérias naturais podem conferir riqueza e textura, enquanto os sintéticos melhoram a consistência, a estabilidade e a amplitude criativa.',
              'A maioria dos perfumes de alta qualidade combina ambas as abordagens.',
              'A qualidade é determinada pela criatividade e pelo equilíbrio da fórmula, não por uma simples proporção entre natural e sintético.',
            ],
          },
        ],
      },
      'application-technique': {
        title: 'Técnica de aplicação',
        description: 'Como aplicar o perfume corretamente para uma projeção elegante e um uso mais consistente.',
        intro: 'Adote estas práticas para melhorar o comportamento do perfume sem exagerar nas borrifadelas.',
        articles: [
          {
            title: 'Como aplicar bem o perfume',
            subtitle: 'Menos é muitas vezes mais',
            paragraphs: [
              'Aplique nos pontos de pulsação, como o pescoço, o peito e os pulsos, para que o calor do corpo ajude a difusão ao longo do dia.',
              'Procure um rasto que se deixa descobrir, não a saturação do espaço.',
            ],
            bullets: [
              'Perfumes frescos: 4-6 borrifadelas',
              'Perfumes versáteis: 3-5 borrifadelas',
              'Perfumes potentes: 2-4 borrifadelas',
            ],
          },
          {
            title: 'Não esfregue depois de borrifar',
            subtitle: 'Deixe a abertura desenvolver-se naturalmente',
            paragraphs: [
              'Esfregar os pulsos aumenta a fricção e pode perturbar a perceção das notas de saída.',
              'O melhor método é simples: borrife e deixe o perfume secar naturalmente.',
            ],
          },
          {
            title: 'A colocação vale mais do que a quantidade',
            subtitle: 'Estratégia de aplicação antes de mais borrifadelas',
            paragraphs: [
              'Duplicar as borrifadelas raramente duplica a duração e, muitas vezes, apenas aumenta a intensidade.',
              'Uma colocação estratégica proporciona geralmente uma projeção mais limpa e maior conforto do que o excesso.',
            ],
          },
        ],
      },
      'testing-selection': {
        title: 'Teste e seleção',
        description: 'Um método prático para testar perfumes e comprar com confiança.',
        intro: 'Avalie com método para evitar compras por impulso e arrependimentos de colecionador.',
        articles: [
          {
            title: 'Como testar um perfume',
            subtitle: 'Avalie a evolução completa',
            paragraphs: [
              'Não julgue um perfume apenas nos primeiros minutos; muitas fórmulas transformam-se significativamente ao longo do uso.',
              'Sempre que possível, teste durante um dia inteiro antes de comprar.',
            ],
            bullets: [
              'Saída: 0-15 minutos',
              'Coração: 30-120 minutos',
              'Fundo: 3-8 horas',
            ],
          },
          {
            title: 'Tira de papel vs pele',
            subtitle: 'Duas ferramentas, dois propósitos',
            paragraphs: [
              'Use as tiras de teste para comparações rápidas e uma primeira orientação.',
              'Use o teste na pele para avaliar duração, projeção e interação com a sua química.',
              'Nunca tome uma decisão de compra definitiva apenas com base na tira.',
            ],
          },
          {
            title: 'Amostra antes do frasco completo',
            subtitle: 'Reduza o risco e aumente a taxa de acerto',
            paragraphs: [
              'Decants e amostras revelam o comportamento real no dia a dia melhor do que as impressões na loja.',
              'Um processo estruturado de «amostra primeiro» reduz erros caros de compra às cegas.',
            ],
          },
          {
            title: 'Não há um melhor perfume universal',
            subtitle: 'O melhor perfume é pessoal',
            paragraphs: [
              'As preferências pessoais, o clima, o estilo de vida e as associações emocionais determinam o sucesso de um perfume mais do que o entusiasmo ou os rankings.',
              'O objetivo não é a nota mais alta. O objetivo é o melhor ajuste ao seu próprio ADN olfativo.',
            ],
          },
        ],
      },
      'performance-science': {
        title: 'Ciência do desempenho',
        description: 'Compreenda a projeção, a duração, os limites da perceção e o comportamento sazonal.',
        intro: 'Separe os mitos do comportamento mensurável ao avaliar o desempenho de um perfume.',
        articles: [
          {
            title: 'Projeção vs duração',
            subtitle: 'Métricas diferentes, significados diferentes',
            paragraphs: [
              'A projeção descreve a distância a que o perfume irradia da pele, enquanto a duração mede o tempo total em que permanece percetível.',
              'Um perfume pode projetar com força e desvanecer-se depressa, durar muito com pouca projeção, ou destacar-se em ambas as dimensões.',
            ],
          },
          {
            title: 'Porque deixa de sentir o seu próprio perfume',
            subtitle: 'A fadiga olfativa explicada',
            paragraphs: [
              'A exposição contínua leva o cérebro a filtrar os sinais olfativos familiares.',
              'Não notar um perfume não prova que ele desapareceu. Os outros podem continuar a senti-lo claramente.',
            ],
          },
          {
            title: 'Variações sazonais de desempenho',
            subtitle: 'A temperatura muda tudo',
            paragraphs: [
              'O calor amplifica frequentemente a projeção e a luminosidade, enquanto o frio pode suavizar a projeção e realçar as notas densas.',
              'O mesmo perfume pode parecer completamente diferente no verão e no inverno.',
            ],
          },
          {
            title: 'Porque é que os perfumes cheiram de forma diferente em cada pessoa',
            subtitle: 'Química da pele e ambiente',
            paragraphs: [
              'A hidratação, a temperatura da pele, o clima e os óleos naturais influenciam tanto a perceção como o desempenho.',
              'Testar na sua própria pele é sempre mais fiável do que confiar apenas nas críticas.',
            ],
          },
        ],
      },
      'formula-evolution': {
        title: 'Evolução das fórmulas',
        description: 'Como os perfumes mudam ao longo do tempo: envelhecimento, reformulação e variáveis de produção.',
        intro: 'Compreenda porque é que dois frascos podem diferir e como proteger a qualidade a longo prazo.',
        articles: [
          {
            title: 'Porque é que os perfumes são reformulados',
            subtitle: 'Porque é que os favoritos por vezes mudam',
            paragraphs: [
              'As reformulações acontecem por motivos regulamentares, de segurança, de abastecimento, de custos e de estratégia.',
              'Algumas alterações são subtis; outras podem alterar a identidade de forma significativa.',
            ],
            bullets: [
              'Restrições de ingredientes',
              'Regulamentos de segurança',
              'Escassez de fornecimento',
              'Alterações no custo das matérias',
              'Mudanças de estratégia da marca',
            ],
          },
          {
            title: 'Variação entre lotes',
            subtitle: 'Porque é que os frascos podem diferir ligeiramente',
            paragraphs: [
              'Pequenas diferenças entre lotes podem resultar da variabilidade das matérias, de mudanças de fornecedor e de ajustes na produção.',
              'A maioria das diferenças é pequena e torna-se evidente sobretudo na comparação direta, lado a lado.',
            ],
          },
          {
            title: 'Maceração e envelhecimento no frasco',
            subtitle: 'Mudanças subtis ao longo do tempo',
            paragraphs: [
              'Depois de aberto, o oxigénio e o tempo podem suavizar algumas composições, embora mudanças drásticas sejam raras.',
              'Boas práticas de conservação contam geralmente mais do que tentativas deliberadas de maceração.',
            ],
          },
          {
            title: 'Como guardar os perfumes corretamente',
            subtitle: 'Proteja a sua coleção',
            paragraphs: [
              'O calor, a luz, a humidade e a exposição excessiva ao ar aceleram a degradação.',
              'Guarde os frascos em locais frescos, secos e escuros, com temperatura estável.',
              'Gavetas, armários e móveis são geralmente mais seguros do que casas de banho.',
            ],
          },
          {
            title: 'Porque é que os frascos vintage cheiram de forma diferente',
            subtitle: 'Um retrato de outra época',
            paragraphs: [
              'Os frascos vintage podem diferir devido a fórmulas históricas, restrições de ingredientes e evolução das matérias.',
              'Revelam muitas vezes estilos menos comuns nos lançamentos modernos.',
            ],
          },
        ],
      },
      'market-reality': {
        title: 'Realidade do mercado',
        description: 'Ultrapasse as suposições do marketing e avalie a qualidade com melhores critérios.',
        intro: 'Concentre-se na qualidade da composição e no ajuste pessoal, em vez de rótulos, entusiasmo e etiquetas de preço.',
        articles: [
          {
            title: 'Preço vs qualidade',
            subtitle: 'Caro não significa automaticamente melhor',
            paragraphs: [
              'O preço pode refletir a marca, a embalagem, a raridade e o posicionamento tanto quanto a qualidade olfativa.',
              'Muitos perfumes acessíveis superam os caros em versatilidade, prazer e ajuste pessoal.',
            ],
          },
          {
            title: 'Nicho vs designer',
            subtitle: 'A qualidade existe em ambos os mundos',
            paragraphs: [
              'Nicho e designer são categorias comerciais, não garantias de qualidade.',
              'Em cada categoria há perfumes excelentes e outros esquecíveis.',
              'Avalie o perfume em si, não a família do rótulo.',
            ],
          },
          {
            title: 'A potência não é qualidade',
            subtitle: 'Uma projeção forte é apenas uma métrica',
            paragraphs: [
              'Uma projeção elevada pode ser útil, mas a qualidade também depende do equilíbrio, da criatividade, da estrutura e da evolução.',
              'Alguns dos perfumes mais respeitados são íntimos em vez de exuberantes.',
            ],
          },
          {
            title: 'Complexidade não é o número de notas',
            subtitle: 'A estrutura importa mais do que listas longas',
            paragraphs: [
              'Uma lista longa de notas não garante profundidade.',
              'A verdadeira complexidade nasce de acordes em camadas, contrastes, transições e desenvolvimento ao longo do tempo.',
            ],
          },
          {
            title: 'Os rótulos de género são marketing',
            subtitle: 'Use o que lhe dá prazer',
            paragraphs: [
              'A maioria das notas essenciais aparece tanto em lançamentos ditos masculinos como femininos.',
              'O seu gosto pessoal é mais útil do que os rótulos de público na caixa.',
            ],
          },
        ],
      },
    },
  },
  perfumers: {
    directory: {
      eyebrow: 'Diretório de criadores', count: (shown, total) => `${shown} de ${total} perfumistas`,
      intro: 'Descubra as pessoas por detrás de perfumes extraordinários, as suas abordagens criativas e criações emblemáticas.',
      search: 'Pesquisar perfumista', placeholder: 'Nome do perfumista', topCreations: 'Criações de destaque',
      all: 'Todos os perfumistas', sort: 'Ordenar por', name: 'Nome', view: 'Ver perfil',
      portrait: (name) => `Retrato do perfumista ${name}`, photoSource: 'Fonte da fotografia', portraitUnavailable: 'Retrato indisponível',
      veryHigh: 'Criador muito recorrente', high: 'Criador de elevada recorrência', recurrent: 'Criador recorrente',
      creations: 'Criações nos 33% superiores', examples: 'Exemplos do catálogo', empty: 'Nenhum perfumista corresponde à pesquisa.',
      profileRank: (rank) => `Perfil do perfumista · posição ${rank}`, biographySource: 'Fonte biográfica e documental', credited: 'Perfumes creditados',
      examplesNote: 'Exemplos do catálogo; cada cocriador é contado uma vez por perfume distinto.',
      methodTitle: 'Como funciona a classificação', method: 'Método OlfactiveDNA',
      classification: 'Classificação', classificationNote: 'Os criadores são ordenados pelo número de perfumes distintos creditados nos 33% superiores da pontuação.',
      formula: 'Fórmula da pontuação', formulaNote: '80% avaliação da comunidade ajustada com um prior de 50 votos para a mediana da comunidade de origem, mais 20% percentil de popularidade nessa comunidade.',
      sample: 'Amostra e limiar', sampleNote: (scored, cutoff, included) => `${scored} perfumes tinham pontuação. Selecionamos os 33% superiores, arredondados para cima, mantendo os empates no limiar ${cutoff}: ${included} perfumes.`,
      credits: 'Créditos dos perfumistas', bands: 'Níveis de recorrência',
      bandsNote: '15–24 criações: recorrente · 25–49: elevada · 50+: muito elevada. Categorias editoriais, não prémios de carreira.',
      rankingNote: (rank, count) => `Posição #${rank} entre os criadores apresentados; os empates partilham a posição. ${count} criações creditadas.`,
      snapshot: (date) => `Retrato do catálogo: ${date}. Os totais não são em tempo real nem representam toda a carreira ou a sua compatibilidade ADN.`,
    },
    kicker: 'Criadores de perfume',
    title: 'Perfumistas e ADN criativo',
    intro: 'Explore os estilos de assinatura dos criadores e as suas filosofias de perfumaria.',
    iconicFragrances: 'Perfumes icónicos',
    clusters: {
      'FRESH ARCHITECTS': 'ARQUITETOS DA FRESCURA',
      'ORIENTAL SCULPTORS': 'ESCULTORES ORIENTAIS',
      'FLORAL ARTISTS': 'ARTISTAS FLORAIS',
      'MODERN MOLECULAR DESIGNERS': 'DESIGNERS MOLECULARES MODERNOS',
      'HERITAGE HOUSES': 'CASAS DE TRADIÇÃO',
    },
    profiles: {
      'Jean-Claude Ellena': {
        style: 'Transparência minimalista, composições cítricas etéreas',
        philosophy: 'Menos é mais',
      },
      'Francis Kurkdjian': {
        style: 'Luxo moderno, assinaturas de identidade marcantes',
        philosophy: 'Reconhecimento através do contraste',
      },
      'Olivier Creed': {
        style: 'Luxo aristocrático e fresco',
        philosophy: 'Natureza mais herança',
      },
      'Alberto Morillas': {
        style: 'Frescura moderna e limpa',
        philosophy: 'A simplicidade perfeita',
      },
      'Dominique Ropion': {
        style: 'Estruturas florais densas e sensuais',
        philosophy: 'Composições com uma espinha dorsal sólida',
      },
      'Thierry Wasser': {
        style: 'A elegância calorosa da Guerlain',
        philosophy: 'Perfumaria francesa intemporal',
      },
      'Pierre Montale': {
        style: 'Composições arrojadas de pendor oriental, projeção intensa',
        philosophy: '«Mais é mais» na intensidade das matérias-primas',
      },
      'Roja Dove': {
        style: 'Perfumaria britânica de ultraluxo, misturas extremamente opulentas',
        philosophy: 'Requinte absoluto e excesso em harmonia',
      },
      'Serge Lutens': {
        style: 'Composições artísticas, sombrias e pouco convencionais',
        philosophy: 'O perfume como narrativa e emoção',
      },
      'Kilian Hennessy': {
        style: 'Luxo sensual, composições inspiradas na vida noturna',
        philosophy: 'Não seja tímido, seja viciante',
      },
      'David Le Goff': {
        style: 'Frescura aquático-mineral moderna',
        philosophy: 'Elegância moderna e limpa com transparência etérea',
      },
      Houbigant: {
        style: 'Perfumaria francesa histórica com reinterpretações modernas, florais elegantes e estruturas amadeiradas refinadas',
        philosophy: 'A tradição apurada pelo artesanato moderno',
      },
    },
  },
};

export default articles;
