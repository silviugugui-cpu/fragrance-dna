import type { Dictionary } from '../en';

const collection: Dictionary['collection'] = {
  page: {
    eyebrow: 'BIBLIOTECA TA',
    title: 'Colecția ta',
    description:
      'Construiește-ți și administrează-ți biblioteca de parfumuri. Urmărește ce deții, notează parfumurile și descoperă tipare în preferințele tale olfactive.',
    emptyTitle: 'Începe-ți colecția',
    emptyDescription:
      'Adaugă primul tău parfum pentru a debloca analizele colecției, acoperirea teritoriilor și recomandări de descoperire personalizate.',
    emptyCta: 'DESCOPERĂ PARFUMURI →',
  },
  stats: {
    label: 'BIBLIOTECA TA',
    title: 'Colecția ta',
    description: 'Urmărește parfumurile pe care le deții și explorează-ți peisajul olfactiv.',
    total: 'Parfumuri în total',
    totalSubtitle: 'în colecția ta',
    owned: 'Deținute',
    ownedSubtitle: (pct) => `${pct}% din colecție`,
    wishlist: 'Lista de dorințe',
    wishlistSubtitle: 'De achiziționat',
    avgRating: 'Nota medie',
    ratedSubtitle: (n) => `${n} notate`,
  },
  territory: {
    label: 'ANALIZA TERITORIILOR',
    title: 'Acoperire olfactivă',
    description: 'Află ce teritorii olfactive sunt reprezentate în colecția ta.',
    coverageLabel: 'Acoperirea teritoriilor',
    territoriesCount: (represented) => `(${represented}/10 teritorii)`,
    startSuggestion: 'Începe-ți colecția pentru a explora acoperirea teritoriilor.',
    buildSuggestion: 'Câștigă diversitate explorând teritoriile mai puțin reprezentate.',
    balancedSuggestion: 'Colecția ta arată un echilibru puternic între teritorii.',
    exploreCta: 'EXPLOREAZĂ TERITORIILE',
    characterLabel: 'Caracterul colecției',
    diverseExplorer: 'Explorator eclectic',
    buildingExplorer: 'Explorator în formare',
    diverseText:
      'Colecția ta acoperă mai multe teritorii olfactive, dezvăluind un profil de gust sofisticat și curios.',
    buildingText:
      'Colecția ta este în dezvoltare. Diversificarea între teritorii îți va dezvălui întreaga identitate olfactivă.',
    nextSteps: 'Pașii următori:',
    stepAddMore: (n) =>
      n === 1
        ? '• Adaugă încă 1 parfum pentru a debloca analizele ADN'
        : `• Adaugă încă ${n} parfumuri pentru a debloca analizele ADN`,
    stepExplore: '• Explorează teritoriile mai puțin reprezentate',
    stepRate: '• Notează-ți parfumurile pentru a-ți rafina profilul',
  },
  summaryCard: {
    eyebrow: 'Colecția mea',
    title: 'Urmărește parfumurile pe care le deții.',
    description:
      'Urmărește parfumurile pe care le deții și înțelege peisajul olfactiv pe care l-ai construit deja.',
    emptyTitle: 'Colecția ta începe aici.',
    emptyDescription:
      'Adaugă parfumurile pe care le deții deja pentru a debloca analize la nivel de colecție și viitoare funcții de recomandare.',
    addFirst: 'Adaugă primul parfum',
    size: 'Dimensiunea colecției',
    sizeValue: (n) => (n === 1 ? '1 parfum' : `${n} parfumuri`),
    averageRating: 'Nota personală medie',
    topBrand: 'Marca principală',
    diversity: 'Diversitatea colecției',
    dnaCoverage: 'Acoperire ADN',
    footer:
      'Colecția este un domeniu de prim rang pentru viitoarele sisteme de ADN, lacune, redundanță și recomandare.',
    manage: 'Administrează colecția',
  },
  manager: {
    eyebrow: 'Colecție',
    title: 'Colecția mea',
    subtitle: 'Parfumurile care îți definesc biblioteca olfactivă personală.',
    totalLabel: 'Parfumuri în total',
    totalValue: (n) => (n === 1 ? '1 parfum' : `${n} parfumuri`),
    totalDescription:
      'Administrează-ți de pe acum parfumurile din bibliotecă, astfel încât viitoarele sisteme de ADN al colecției, analiză a acoperirii și recomandare să aibă o bază stabilă.',
    summaryLabel: 'Rezumatul colecției',
    owned: 'Deținute',
    wishlist: 'Lista de dorințe',
    topBrand: 'Marca principală',
    coverage: 'Acoperire',
    dbSearchLabel: 'Căutare în baza de date',
    dbSearchTitle: 'Caută în baza de date de parfumuri',
    dbSearchDescription:
      'Găsește parfumuri din catalog și salvează-le direct în colecția ta sau în lista de dorințe.',
    searchLabel: 'Caută',
    dbSearchPlaceholder: 'Caută după parfum, marcă sau notă...',
    dbSearchHint:
      'Începe să tastezi pentru a căuta în baza de date de parfumuri și a adăuga rezultate în colecția ta.',
    dbNoMatches: 'Niciun parfum nu corespunde căutării tale.',
    yearNA: 'An n/a',
    alreadyAdded: 'Deja adăugat',
    addToCollection: 'Adaugă în colecție',
    inCollection: 'În colecție',
    saveToWishlist: 'Salvează în lista de dorințe',
    importFilesAria: 'Selectează fișiere Excel ale colecției',
    addFragrance: 'Adaugă parfum',
    importing: 'Se importă...',
    importCollection: 'Importă colecția',
    searchPlaceholder: 'Caută parfumuri...',
    brandLabel: 'Marcă',
    allBrands: 'Toate mărcile',
    sortBy: 'Sortează după',
    filters: {
      all: 'Toate',
      owned: 'Deținute',
      wishlist: 'Lista de dorințe',
    },
    sorts: {
      name: 'Nume',
      brand: 'Marcă',
      rating: 'Notă',
    },
    emptyTitle: 'Colecția ta începe aici.',
    noFilterMatches: 'Niciun parfum nu corespunde filtrelor tale actuale.',
    emptyDescription:
      'Adaugă parfumurile pe care le deții deja pentru a debloca analize la nivel de colecție și viitoare funcții de recomandare.',
    adjustFilters:
      'Ajustează căutarea, marca sau sortarea pentru a regăsi parfumurile deja prezente în biblioteca ta.',
    addFirst: 'Adaugă primul parfum',
    rating: 'Notă',
    edit: 'Editează',
    remove: 'Elimină',
    cancel: 'Anulează',
    saveChanges: 'Salvează modificările',
    modalAddTitle: 'Adaugă parfum',
    modalAddPlaceholder: 'Caută un parfum...',
    modalAddHint: 'Caută în baza de date de parfumuri pentru a adăuga un element în colecția ta.',
    add: 'Adaugă',
    modalEditTitle: 'Editează intrarea din colecție',
    statusLabel: 'Stare',
    statusOwned: 'Deținut',
    statusWishlist: 'Lista de dorințe',
    personalRating: 'Nota personală',
    ratingPlaceholder: '0,0 - 10,0',
    notesLabel: 'Notițe',
    notesPlaceholder: 'Adaugă notițe personale, impresii de purtare sau momente de referință.',
    modalRemoveTitle: 'Elimină parfumul',
    confirmDeletion: 'Confirmă ștergerea',
    removeWarning:
      'Parfumul va fi eliminat din colecția ta. Această acțiune poate fi anulată mai târziu, adăugându-l din nou.',
    messages: {
      searchUnavailable: 'Nu se poate căuta în baza de date de parfumuri.',
      searchFailed: 'Căutarea în colecție a eșuat.',
      alreadyInCollection: 'Acest parfum este deja în colecția ta.',
      savedToWishlist: 'Parfum salvat în lista ta de dorințe.',
      addedToCollection: 'Parfum adăugat în colecția ta.',
      importUnavailable: 'Nu se poate importa registrul colecției.',
      importSummary: (added, existing, unmatched, duplicates) =>
        `Adăugate: ${added}; deja în colecție: ${existing}; fără corespondență: ${unmatched}; rânduri duplicate: ${duplicates}.`,
      unmatchedRows: (n) =>
        `${n} rând(uri) fără corespondență în baza de date de parfumuri. Vezi rezumatul importului.`,
      importFailed: 'Importul colecției a eșuat.',
      entryUpdated: 'Intrarea din colecție a fost actualizată.',
      removed: 'Parfum eliminat din colecția ta.',
    },
  },
};

export default collection;
