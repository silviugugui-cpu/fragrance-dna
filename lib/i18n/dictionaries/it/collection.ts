import type { Dictionary } from '../en';

const collection: Dictionary['collection'] = {
  page: {
    eyebrow: 'LA TUA LIBRERIA',
    title: 'La tua collezione',
    description:
      'Costruisci e gestisci la tua libreria di fragranze. Tieni traccia di ciò che possiedi, vota le fragranze e scopri gli schemi delle tue preferenze olfattive.',
    emptyTitle: 'Inizia la tua collezione',
    emptyDescription:
      'Aggiungi la tua prima fragranza per sbloccare le analisi della collezione, la copertura dei territori e i consigli di scoperta personalizzati.',
    emptyCta: 'SCOPRI LE FRAGRANZE →',
  },
  stats: {
    label: 'LA TUA LIBRERIA',
    title: 'La tua collezione',
    description: 'Tieni traccia delle fragranze che possiedi ed esplora il tuo paesaggio olfattivo.',
    total: 'Fragranze totali',
    totalSubtitle: 'nella tua collezione',
    owned: 'Possedute',
    ownedSubtitle: (pct) => `${pct}% della collezione`,
    wishlist: 'Lista dei desideri',
    wishlistSubtitle: 'Da acquistare',
    avgRating: 'Voto medio',
    ratedSubtitle: (n) => `${n} votate`,
  },
  territory: {
    label: 'ANALISI DEI TERRITORI',
    title: 'Copertura olfattiva',
    description: 'Scopri quali territori olfattivi sono rappresentati nella tua collezione.',
    coverageLabel: 'Copertura dei territori',
    territoriesCount: (represented) => `(${represented}/10 territori)`,
    startSuggestion: 'Inizia la tua collezione per esplorare la copertura dei territori.',
    buildSuggestion: 'Aumenta la varietà esplorando i territori meno rappresentati.',
    balancedSuggestion: 'La tua collezione mostra un ottimo equilibrio tra i territori.',
    exploreCta: 'ESPLORA I TERRITORI',
    characterLabel: 'Carattere della collezione',
    diverseExplorer: 'Esploratore eclettico',
    buildingExplorer: 'Esploratore in crescita',
    diverseText:
      'La tua collezione copre più territori olfattivi e rivela un profilo di gusto sofisticato e curioso.',
    buildingText:
      'La tua collezione è in evoluzione. Diversificare tra i territori rivelerà tutta la tua identità olfattiva.',
    nextSteps: 'Prossimi passi:',
    stepAddMore: (n) =>
      n === 1
        ? '• Aggiungi 1 altra fragranza per sbloccare le analisi del DNA'
        : `• Aggiungi altre ${n} fragranze per sbloccare le analisi del DNA`,
    stepExplore: '• Esplora i territori meno rappresentati',
    stepRate: '• Vota le tue fragranze per affinare il tuo profilo',
  },
  summaryCard: {
    eyebrow: 'La mia collezione',
    title: 'Tieni traccia delle fragranze che possiedi.',
    description:
      'Tieni traccia delle fragranze che possiedi e comprendi il paesaggio olfattivo che hai già costruito.',
    emptyTitle: 'La tua collezione inizia qui.',
    emptyDescription:
      'Aggiungi le fragranze che già possiedi per sbloccare le analisi della collezione e le future funzioni di raccomandazione.',
    addFirst: 'Aggiungi la prima fragranza',
    size: 'Dimensione della collezione',
    sizeValue: (n) => (n === 1 ? '1 fragranza' : `${n} fragranze`),
    averageRating: 'Voto personale medio',
    topBrand: 'Marchio principale',
    diversity: 'Varietà della collezione',
    dnaCoverage: 'Copertura DNA',
    footer:
      'La collezione è un dominio di primo piano per i futuri sistemi di DNA, lacune, ridondanza e raccomandazione.',
    manage: 'Gestisci la collezione',
  },
  manager: {
    eyebrow: 'Collezione',
    title: 'La mia collezione',
    subtitle: 'Le fragranze che definiscono la tua libreria olfattiva personale.',
    totalLabel: 'Fragranze totali',
    totalValue: (n) => (n === 1 ? '1 fragranza' : `${n} fragranze`),
    totalDescription:
      'Gestisci fin da ora i profumi della tua libreria, così i futuri sistemi di DNA della collezione, analisi della copertura e raccomandazione avranno una base stabile.',
    summaryLabel: 'Riepilogo della collezione',
    owned: 'Possedute',
    wishlist: 'Lista dei desideri',
    topBrand: 'Marchio principale',
    coverage: 'Copertura',
    dbSearchLabel: 'Ricerca nel database',
    dbSearchTitle: 'Cerca nel database delle fragranze',
    dbSearchDescription:
      'Trova le fragranze del catalogo e salvale direttamente nella tua collezione o nella lista dei desideri.',
    searchLabel: 'Cerca',
    dbSearchPlaceholder: 'Cerca per fragranza, marchio o nota...',
    dbSearchHint:
      'Inizia a digitare per cercare nel database delle fragranze e aggiungere i risultati alla tua collezione.',
    dbNoMatches: 'Nessuna fragranza corrisponde alla tua ricerca.',
    yearNA: 'Anno n/d',
    alreadyAdded: 'Già aggiunta',
    addToCollection: 'Aggiungi alla collezione',
    inCollection: 'Nella collezione',
    saveToWishlist: 'Salva nella lista dei desideri',
    importFilesAria: 'Seleziona i file Excel della collezione',
    addFragrance: 'Aggiungi fragranza',
    importing: 'Importazione in corso...',
    importCollection: 'Importa collezione',
    searchPlaceholder: 'Cerca fragranze...',
    brandLabel: 'Marchio',
    allBrands: 'Tutti i marchi',
    sortBy: 'Ordina per',
    filters: {
      all: 'Tutte',
      owned: 'Possedute',
      wishlist: 'Lista dei desideri',
    },
    sorts: {
      name: 'Nome',
      brand: 'Marchio',
      rating: 'Voto',
    },
    emptyTitle: 'La tua collezione inizia qui.',
    noFilterMatches: 'Nessuna fragranza corrisponde ai filtri attuali.',
    emptyDescription:
      'Aggiungi le fragranze che già possiedi per sbloccare le analisi della collezione e le future funzioni di raccomandazione.',
    adjustFilters:
      'Modifica la ricerca, il marchio o l’ordinamento per ritrovare le fragranze già presenti nella tua libreria.',
    addFirst: 'Aggiungi la prima fragranza',
    rating: 'Voto',
    edit: 'Modifica',
    remove: 'Rimuovi',
    cancel: 'Annulla',
    saveChanges: 'Salva le modifiche',
    modalAddTitle: 'Aggiungi fragranza',
    modalAddPlaceholder: 'Cerca una fragranza...',
    modalAddHint: 'Cerca nel database delle fragranze per aggiungere un elemento alla tua collezione.',
    add: 'Aggiungi',
    modalEditTitle: 'Modifica voce della collezione',
    statusLabel: 'Stato',
    statusOwned: 'Posseduta',
    statusWishlist: 'Lista dei desideri',
    personalRating: 'Voto personale',
    ratingPlaceholder: '0,0 - 10,0',
    notesLabel: 'Note',
    notesPlaceholder: 'Aggiungi note personali, impressioni d’uso o momenti di riferimento.',
    modalRemoveTitle: 'Rimuovi fragranza',
    confirmDeletion: 'Conferma eliminazione',
    removeWarning:
      'La fragranza verrà rimossa dalla tua collezione. Potrai annullare questa azione in seguito aggiungendola di nuovo.',
    messages: {
      searchUnavailable: 'Impossibile cercare nel database delle fragranze.',
      searchFailed: 'La ricerca nella collezione non è riuscita.',
      alreadyInCollection: 'Questa fragranza è già nella tua collezione.',
      savedToWishlist: 'Fragranza salvata nella tua lista dei desideri.',
      addedToCollection: 'Fragranza aggiunta alla tua collezione.',
      importUnavailable: 'Impossibile importare il file della collezione.',
      importSummary: (added, existing, unmatched, duplicates) =>
        `Aggiunte: ${added}; già nella collezione: ${existing}; senza corrispondenza: ${unmatched}; righe duplicate: ${duplicates}.`,
      unmatchedRows: (n) =>
        `${n} riga/e senza corrispondenza nel database delle fragranze. Consulta il riepilogo dell’importazione.`,
      importFailed: 'L’importazione della collezione non è riuscita.',
      entryUpdated: 'Voce della collezione aggiornata.',
      removed: 'Fragranza rimossa dalla tua collezione.',
    },
  },
};

export default collection;
