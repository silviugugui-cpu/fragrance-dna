import type { Dictionary } from '../en';

const collection: Dictionary['collection'] = {
  page: {
    eyebrow: 'TU BIBLIOTECA',
    title: 'Tu colección',
    description:
      'Construye y gestiona tu biblioteca de fragancias. Registra lo que posees, valora tus fragancias y descubre patrones en tus preferencias olfativas.',
    emptyTitle: 'Empieza tu colección',
    emptyDescription:
      'Añade tu primera fragancia para desbloquear análisis de colección, cobertura de territorios y recomendaciones de descubrimiento personalizadas.',
    emptyCta: 'DESCUBRIR FRAGANCIAS →',
  },
  stats: {
    label: 'TU BIBLIOTECA',
    title: 'Tu colección',
    description: 'Registra las fragancias que posees y explora tu paisaje olfativo.',
    total: 'Fragancias en total',
    totalSubtitle: 'en tu colección',
    owned: 'En propiedad',
    ownedSubtitle: (pct) => `${pct}% de la colección`,
    wishlist: 'Lista de deseos',
    wishlistSubtitle: 'Pendientes de adquirir',
    avgRating: 'Valoración media',
    ratedSubtitle: (n) => `${n} valoradas`,
  },
  territory: {
    label: 'ANÁLISIS DE TERRITORIOS',
    title: 'Cobertura olfativa',
    description: 'Descubre qué territorios olfativos están representados en tu colección.',
    coverageLabel: 'Cobertura de territorios',
    territoriesCount: (represented) => `(${represented}/10 territorios)`,
    startSuggestion: 'Empieza tu colección para explorar la cobertura de territorios.',
    buildSuggestion: 'Gana diversidad explorando los territorios menos representados.',
    balancedSuggestion: 'Tu colección muestra un gran equilibrio entre territorios.',
    exploreCta: 'EXPLORAR TERRITORIOS',
    characterLabel: 'Carácter de la colección',
    diverseExplorer: 'Explorador versátil',
    buildingExplorer: 'Explorador en construcción',
    diverseText:
      'Tu colección abarca varios territorios olfativos y revela un perfil de gusto sofisticado y curioso.',
    buildingText:
      'Tu colección está en desarrollo. Diversificar entre territorios revelará toda tu identidad olfativa.',
    nextSteps: 'Próximos pasos:',
    stepAddMore: (n) =>
      n === 1
        ? '• Añade 1 fragancia más para desbloquear los análisis de ADN'
        : `• Añade ${n} fragancias más para desbloquear los análisis de ADN`,
    stepExplore: '• Explora los territorios menos representados',
    stepRate: '• Valora tus fragancias para afinar tu perfil',
  },
  summaryCard: {
    eyebrow: 'Mi colección',
    title: 'Registra las fragancias que posees.',
    description:
      'Registra las fragancias que posees y comprende el paisaje olfativo que ya has construido.',
    emptyTitle: 'Tu colección empieza aquí.',
    emptyDescription:
      'Añade las fragancias que ya posees para desbloquear análisis de colección y futuras funciones de recomendación.',
    addFirst: 'Añadir la primera fragancia',
    size: 'Tamaño de la colección',
    sizeValue: (n) => (n === 1 ? '1 fragancia' : `${n} fragancias`),
    averageRating: 'Valoración personal media',
    topBrand: 'Marca principal',
    diversity: 'Diversidad de la colección',
    dnaCoverage: 'Cobertura de ADN',
    footer:
      'La colección es un dominio de primer nivel para los futuros sistemas de ADN, carencias, redundancia y recomendación.',
    manage: 'Gestionar la colección',
  },
  manager: {
    eyebrow: 'Colección',
    title: 'Mi colección',
    subtitle: 'Las fragancias que definen tu biblioteca olfativa personal.',
    totalLabel: 'Fragancias en total',
    totalValue: (n) => (n === 1 ? '1 fragancia' : `${n} fragancias`),
    totalDescription:
      'Gestiona ya los perfumes de tu biblioteca para que los futuros sistemas de ADN de colección, análisis de cobertura y recomendación tengan una base estable.',
    summaryLabel: 'Resumen de la colección',
    owned: 'En propiedad',
    wishlist: 'Lista de deseos',
    topBrand: 'Marca principal',
    coverage: 'Cobertura',
    dbSearchLabel: 'Búsqueda en la base de datos',
    dbSearchTitle: 'Busca en la base de datos de fragancias',
    dbSearchDescription:
      'Encuentra fragancias del catálogo y guárdalas directamente en tu colección o en tu lista de deseos.',
    searchLabel: 'Buscar',
    dbSearchPlaceholder: 'Busca por fragancia, marca o nota...',
    dbSearchHint:
      'Empieza a escribir para buscar en la base de datos de fragancias y añadir resultados a tu colección.',
    dbNoMatches: 'Ninguna fragancia coincide con tu búsqueda.',
    yearNA: 'Año n/d',
    alreadyAdded: 'Ya añadida',
    addToCollection: 'Añadir a la colección',
    inCollection: 'En la colección',
    saveToWishlist: 'Guardar en la lista de deseos',
    importFilesAria: 'Seleccionar archivos Excel de la colección',
    addFragrance: 'Añadir fragancia',
    importing: 'Importando...',
    importCollection: 'Importar colección',
    searchPlaceholder: 'Buscar fragancias...',
    brandLabel: 'Marca',
    allBrands: 'Todas las marcas',
    sortBy: 'Ordenar por',
    filters: {
      all: 'Todas',
      owned: 'En propiedad',
      wishlist: 'Lista de deseos',
    },
    sorts: {
      name: 'Nombre',
      brand: 'Marca',
      rating: 'Valoración',
    },
    emptyTitle: 'Tu colección empieza aquí.',
    noFilterMatches: 'Ninguna fragancia coincide con tus filtros actuales.',
    emptyDescription:
      'Añade las fragancias que ya posees para desbloquear análisis de colección y futuras funciones de recomendación.',
    adjustFilters:
      'Ajusta la búsqueda, la marca o el orden para volver a ver las fragancias que ya tienes en tu biblioteca.',
    addFirst: 'Añadir la primera fragancia',
    rating: 'Valoración',
    edit: 'Editar',
    remove: 'Eliminar',
    cancel: 'Cancelar',
    saveChanges: 'Guardar cambios',
    modalAddTitle: 'Añadir fragancia',
    modalAddPlaceholder: 'Buscar fragancia...',
    modalAddHint: 'Busca en la base de datos de fragancias para añadir un elemento a tu colección.',
    add: 'Añadir',
    modalEditTitle: 'Editar entrada de la colección',
    statusLabel: 'Estado',
    statusOwned: 'En propiedad',
    statusWishlist: 'Lista de deseos',
    personalRating: 'Valoración personal',
    ratingPlaceholder: '0,0 - 10,0',
    notesLabel: 'Notas',
    notesPlaceholder: 'Añade notas personales, impresiones de uso o momentos de referencia.',
    modalRemoveTitle: 'Eliminar fragancia',
    confirmDeletion: 'Confirmar eliminación',
    removeWarning:
      'Esto eliminará la fragancia de tu colección. Podrás revertirlo más adelante añadiéndola de nuevo.',
    messages: {
      searchUnavailable: 'No se puede buscar en la base de datos de fragancias.',
      searchFailed: 'La búsqueda en la colección ha fallado.',
      alreadyInCollection: 'Esta fragancia ya está en tu colección.',
      savedToWishlist: 'Fragancia guardada en tu lista de deseos.',
      addedToCollection: 'Fragancia añadida a tu colección.',
      importUnavailable: 'No se puede importar el libro de la colección.',
      importSummary: (added, existing, unmatched, duplicates) =>
        `Añadidas: ${added}; ya en la colección: ${existing}; sin coincidencia: ${unmatched}; filas duplicadas: ${duplicates}.`,
      unmatchedRows: (n) =>
        `${n} fila(s) no coinciden con la base de datos de fragancias. Consulta el resumen de importación.`,
      importFailed: 'La importación de la colección ha fallado.',
      entryUpdated: 'Entrada de la colección actualizada.',
      removed: 'Fragancia eliminada de tu colección.',
    },
  },
};

export default collection;
