import type { Dictionary } from '../en';

const collection: Dictionary['collection'] = {
  page: {
    eyebrow: 'A SUA BIBLIOTECA',
    title: 'A sua coleção',
    description:
      'Construa e faça a gestão da sua biblioteca de fragrâncias. Acompanhe o que possui, classifique as suas fragrâncias e descubra padrões nas suas preferências olfativas.',
    emptyTitle: 'Comece a sua coleção',
    emptyDescription:
      'Adicione a sua primeira fragrância para desbloquear análises da coleção, a cobertura de territórios e recomendações de descoberta personalizadas.',
    emptyCta: 'DESCOBRIR FRAGRÂNCIAS →',
  },
  stats: {
    label: 'A SUA BIBLIOTECA',
    title: 'A sua coleção',
    description: 'Acompanhe as fragrâncias que possui e explore a sua paisagem olfativa.',
    total: 'Fragrâncias no total',
    totalSubtitle: 'na sua coleção',
    owned: 'Em posse',
    ownedSubtitle: (pct) => `${pct}% da coleção`,
    wishlist: 'Lista de desejos',
    wishlistSubtitle: 'Por adquirir',
    avgRating: 'Classificação média',
    ratedSubtitle: (n) => `${n} classificadas`,
  },
  territory: {
    label: 'ANÁLISE DE TERRITÓRIOS',
    title: 'Cobertura olfativa',
    description: 'Perceba que territórios olfativos estão representados na sua coleção.',
    coverageLabel: 'Cobertura de territórios',
    territoriesCount: (represented) => `(${represented}/10 territórios)`,
    startSuggestion: 'Comece a sua coleção para explorar a cobertura de territórios.',
    buildSuggestion: 'Ganhe diversidade explorando os territórios menos representados.',
    balancedSuggestion: 'A sua coleção mostra um forte equilíbrio entre territórios.',
    exploreCta: 'EXPLORAR TERRITÓRIOS',
    characterLabel: 'Caráter da coleção',
    diverseExplorer: 'Explorador eclético',
    buildingExplorer: 'Explorador em construção',
    diverseText:
      'A sua coleção abrange vários territórios olfativos e revela um perfil de gosto sofisticado e curioso.',
    buildingText:
      'A sua coleção está em desenvolvimento. Diversificar entre territórios revelará toda a sua identidade olfativa.',
    nextSteps: 'Próximos passos:',
    stepAddMore: (n) =>
      n === 1
        ? '• Adicione mais 1 fragrância para desbloquear as análises de ADN'
        : `• Adicione mais ${n} fragrâncias para desbloquear as análises de ADN`,
    stepExplore: '• Explore os territórios menos representados',
    stepRate: '• Classifique as suas fragrâncias para apurar o seu perfil',
  },
  summaryCard: {
    eyebrow: 'A minha coleção',
    title: 'Acompanhe as fragrâncias que possui.',
    description:
      'Acompanhe as fragrâncias que possui e compreenda a paisagem olfativa que já construiu.',
    emptyTitle: 'A sua coleção começa aqui.',
    emptyDescription:
      'Adicione as fragrâncias que já possui para desbloquear análises da coleção e futuras funcionalidades de recomendação.',
    addFirst: 'Adicionar a primeira fragrância',
    size: 'Dimensão da coleção',
    sizeValue: (n) => (n === 1 ? '1 fragrância' : `${n} fragrâncias`),
    averageRating: 'Classificação pessoal média',
    topBrand: 'Marca principal',
    diversity: 'Diversidade da coleção',
    dnaCoverage: 'Cobertura de ADN',
    footer:
      'A coleção é um domínio de primeira ordem para os futuros sistemas de ADN, lacunas, redundância e recomendação.',
    manage: 'Gerir a coleção',
  },
  manager: {
    eyebrow: 'Coleção',
    title: 'A minha coleção',
    subtitle: 'As fragrâncias que definem a sua biblioteca olfativa pessoal.',
    totalLabel: 'Fragrâncias no total',
    totalValue: (n) => (n === 1 ? '1 fragrância' : `${n} fragrâncias`),
    totalDescription:
      'Faça já a gestão dos perfumes da sua biblioteca para que os futuros sistemas de ADN da coleção, análise de cobertura e recomendação tenham uma base estável.',
    summaryLabel: 'Resumo da coleção',
    owned: 'Em posse',
    wishlist: 'Lista de desejos',
    topBrand: 'Marca principal',
    coverage: 'Cobertura',
    dbSearchLabel: 'Pesquisa na base de dados',
    dbSearchTitle: 'Pesquise na base de dados de fragrâncias',
    dbSearchDescription:
      'Encontre fragrâncias do catálogo e guarde-as diretamente na sua coleção ou na lista de desejos.',
    searchLabel: 'Pesquisar',
    dbSearchPlaceholder: 'Pesquise por fragrância, marca ou nota...',
    dbSearchHint:
      'Comece a escrever para pesquisar na base de dados de fragrâncias e adicionar resultados à sua coleção.',
    dbNoMatches: 'Nenhuma fragrância corresponde à sua pesquisa.',
    yearNA: 'Ano n/d',
    alreadyAdded: 'Já adicionada',
    addToCollection: 'Adicionar à coleção',
    inCollection: 'Na coleção',
    saveToWishlist: 'Guardar na lista de desejos',
    importFilesAria: 'Selecionar ficheiros Excel da coleção',
    addFragrance: 'Adicionar fragrância',
    importing: 'A importar...',
    importCollection: 'Importar coleção',
    searchPlaceholder: 'Pesquisar fragrâncias...',
    brandLabel: 'Marca',
    allBrands: 'Todas as marcas',
    sortBy: 'Ordenar por',
    filters: {
      all: 'Todas',
      owned: 'Em posse',
      wishlist: 'Lista de desejos',
    },
    sorts: {
      name: 'Nome',
      brand: 'Marca',
      rating: 'Classificação',
    },
    emptyTitle: 'A sua coleção começa aqui.',
    noFilterMatches: 'Nenhuma fragrância corresponde aos seus filtros atuais.',
    emptyDescription:
      'Adicione as fragrâncias que já possui para desbloquear análises da coleção e futuras funcionalidades de recomendação.',
    adjustFilters:
      'Ajuste a pesquisa, a marca ou a ordenação para voltar a ver as fragrâncias já presentes na sua biblioteca.',
    addFirst: 'Adicionar a primeira fragrância',
    rating: 'Classificação',
    edit: 'Editar',
    remove: 'Remover',
    cancel: 'Cancelar',
    saveChanges: 'Guardar alterações',
    modalAddTitle: 'Adicionar fragrância',
    modalAddPlaceholder: 'Pesquisar fragrância...',
    modalAddHint: 'Pesquise na base de dados de fragrâncias para adicionar um item à sua coleção.',
    add: 'Adicionar',
    modalEditTitle: 'Editar entrada da coleção',
    statusLabel: 'Estado',
    statusOwned: 'Em posse',
    statusWishlist: 'Lista de desejos',
    personalRating: 'Classificação pessoal',
    ratingPlaceholder: '0,0 - 10,0',
    notesLabel: 'Notas',
    notesPlaceholder: 'Adicione notas pessoais, impressões de uso ou momentos de referência.',
    modalRemoveTitle: 'Remover fragrância',
    confirmDeletion: 'Confirmar eliminação',
    removeWarning:
      'Isto removerá a fragrância da sua coleção. Esta ação pode ser revertida mais tarde, adicionando-a novamente.',
    messages: {
      searchUnavailable: 'Não é possível pesquisar na base de dados de fragrâncias.',
      searchFailed: 'A pesquisa na coleção falhou.',
      alreadyInCollection: 'Esta fragrância já está na sua coleção.',
      savedToWishlist: 'Fragrância guardada na sua lista de desejos.',
      addedToCollection: 'Fragrância adicionada à sua coleção.',
      importUnavailable: 'Não é possível importar o livro da coleção.',
      importSummary: (added, existing, unmatched, duplicates) =>
        `Adicionadas: ${added}; já na coleção: ${existing}; sem correspondência: ${unmatched}; linhas duplicadas: ${duplicates}.`,
      unmatchedRows: (n) =>
        `${n} linha(s) sem correspondência na base de dados de fragrâncias. Consulte o resumo da importação.`,
      importFailed: 'A importação da coleção falhou.',
      entryUpdated: 'Entrada da coleção atualizada.',
      removed: 'Fragrância removida da sua coleção.',
    },
  },
};

export default collection;
