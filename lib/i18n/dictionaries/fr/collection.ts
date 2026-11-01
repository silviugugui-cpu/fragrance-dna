import type { Dictionary } from '../en';

const collection: Dictionary['collection'] = {
  page: {
    eyebrow: 'VOTRE BIBLIOTHÈQUE',
    title: 'Votre collection',
    description:
      'Construisez et gérez votre bibliothèque de parfums. Suivez vos acquisitions, notez vos parfums et découvrez les tendances de vos préférences olfactives.',
    emptyTitle: 'Commencez votre collection',
    emptyDescription:
      'Ajoutez votre premier parfum pour débloquer les analyses de collection, l’analyse de couverture des territoires et des recommandations de découverte personnalisées.',
    emptyCta: 'DÉCOUVRIR DES PARFUMS →',
  },
  stats: {
    label: 'VOTRE BIBLIOTHÈQUE',
    title: 'Votre collection',
    description: 'Suivez les parfums que vous possédez et explorez votre paysage olfactif.',
    total: 'Parfums au total',
    totalSubtitle: 'dans votre collection',
    owned: 'Possédés',
    ownedSubtitle: (pct) => `${pct}% de la collection`,
    wishlist: 'Liste d’envies',
    wishlistSubtitle: 'Articles à acquérir',
    avgRating: 'Note moyenne',
    ratedSubtitle: (n) => `${n} notés`,
  },
  territory: {
    label: 'APERÇU DES TERRITOIRES',
    title: 'Couverture olfactive',
    description: 'Découvrez quels territoires olfactifs sont représentés dans votre collection.',
    coverageLabel: 'Couverture des territoires',
    territoriesCount: (represented) => `(${represented}/10 territoires)`,
    startSuggestion: 'Commencez votre collection pour explorer la couverture des territoires.',
    buildSuggestion: 'Diversifiez votre collection en explorant les territoires sous-représentés.',
    balancedSuggestion: 'Votre collection présente un bel équilibre entre les territoires.',
    exploreCta: 'EXPLORER LES TERRITOIRES',
    characterLabel: 'Caractère de la collection',
    diverseExplorer: 'Explorateur éclectique',
    buildingExplorer: 'Explorateur en devenir',
    diverseText:
      'Votre collection couvre plusieurs territoires olfactifs, révélant un profil de goût sophistiqué et curieux.',
    buildingText:
      'Votre collection se développe. Diversifier les territoires révélera toute votre identité olfactive.',
    nextSteps: 'Prochaines étapes :',
    stepAddMore: (n) =>
      n === 1
        ? '• Ajoutez 1 parfum de plus pour débloquer les analyses ADN'
        : `• Ajoutez ${n} parfums de plus pour débloquer les analyses ADN`,
    stepExplore: '• Explorez les territoires sous-représentés',
    stepRate: '• Notez vos parfums pour affiner votre profil',
  },
  summaryCard: {
    eyebrow: 'Ma collection',
    title: 'Suivez les parfums que vous possédez.',
    description:
      'Suivez les parfums que vous possédez et comprenez le paysage olfactif que vous avez déjà construit.',
    emptyTitle: 'Votre collection commence ici.',
    emptyDescription:
      'Ajoutez les parfums que vous possédez déjà pour débloquer des analyses de collection et de futures fonctions de recommandation.',
    addFirst: 'Ajouter un premier parfum',
    size: 'Taille de la collection',
    sizeValue: (n) => (n === 1 ? '1 parfum' : `${n} parfums`),
    averageRating: 'Note personnelle moyenne',
    topBrand: 'Marque principale',
    diversity: 'Diversité de la collection',
    dnaCoverage: 'Couverture ADN',
    footer:
      'La collection est un domaine de premier plan pour les futurs systèmes d’ADN, de lacunes, de redondance et de recommandation.',
    manage: 'Gérer la collection',
  },
  manager: {
    eyebrow: 'Collection',
    title: 'Ma collection',
    subtitle: 'Les parfums qui définissent votre bibliothèque olfactive personnelle.',
    totalLabel: 'Parfums au total',
    totalValue: (n) => (n === 1 ? '1 parfum' : `${n} parfums`),
    totalDescription:
      'Gérez dès maintenant les parfums de votre bibliothèque afin que les futurs systèmes d’ADN de collection, d’analyse de couverture et de recommandation reposent sur une base stable.',
    summaryLabel: 'Résumé de la collection',
    owned: 'Possédés',
    wishlist: 'Liste d’envies',
    topBrand: 'Marque principale',
    coverage: 'Couverture',
    dbSearchLabel: 'Recherche dans la base',
    dbSearchTitle: 'Recherchez dans la base de parfums',
    dbSearchDescription:
      'Trouvez des parfums dans le catalogue et enregistrez-les directement dans votre collection ou votre liste d’envies.',
    searchLabel: 'Recherche',
    dbSearchPlaceholder: 'Recherchez par parfum, marque ou note...',
    dbSearchHint:
      'Commencez à taper pour rechercher dans la base de parfums et ajouter des résultats à votre collection.',
    dbNoMatches: 'Aucun parfum ne correspond à votre recherche.',
    yearNA: 'Année n/d',
    alreadyAdded: 'Déjà ajouté',
    addToCollection: 'Ajouter à la collection',
    inCollection: 'Dans la collection',
    saveToWishlist: 'Ajouter à la liste d’envies',
    importFilesAria: 'Sélectionner des fichiers Excel de collection',
    addFragrance: 'Ajouter un parfum',
    importing: 'Importation...',
    importCollection: 'Importer une collection',
    searchPlaceholder: 'Rechercher des parfums...',
    brandLabel: 'Marque',
    allBrands: 'Toutes les marques',
    sortBy: 'Trier par',
    filters: {
      all: 'Tous',
      owned: 'Possédés',
      wishlist: 'Liste d’envies',
    },
    sorts: {
      name: 'Nom',
      brand: 'Marque',
      rating: 'Note',
    },
    emptyTitle: 'Votre collection commence ici.',
    noFilterMatches: 'Aucun parfum ne correspond à vos filtres actuels.',
    emptyDescription:
      'Ajoutez les parfums que vous possédez déjà pour débloquer des analyses de collection et de futures fonctions de recommandation.',
    adjustFilters:
      'Ajustez la recherche, la marque ou le tri pour retrouver les parfums déjà présents dans votre bibliothèque.',
    addFirst: 'Ajouter un premier parfum',
    rating: 'Note',
    edit: 'Modifier',
    remove: 'Retirer',
    cancel: 'Annuler',
    saveChanges: 'Enregistrer',
    modalAddTitle: 'Ajouter un parfum',
    modalAddPlaceholder: 'Rechercher un parfum...',
    modalAddHint: 'Recherchez dans la base de parfums pour ajouter un élément à votre collection.',
    add: 'Ajouter',
    modalEditTitle: 'Modifier l’entrée de collection',
    statusLabel: 'Statut',
    statusOwned: 'Possédé',
    statusWishlist: 'Liste d’envies',
    personalRating: 'Note personnelle',
    ratingPlaceholder: '0,0 - 10,0',
    notesLabel: 'Notes',
    notesPlaceholder: 'Ajoutez des notes personnelles, des impressions de port ou des moments de référence.',
    modalRemoveTitle: 'Retirer le parfum',
    confirmDeletion: 'Confirmer la suppression',
    removeWarning:
      'Ce parfum sera retiré de votre collection. Cette action peut être annulée plus tard en l’ajoutant à nouveau.',
    messages: {
      searchUnavailable: 'Impossible de rechercher dans la base de parfums.',
      searchFailed: 'La recherche dans la collection a échoué.',
      alreadyInCollection: 'Ce parfum est déjà dans votre collection.',
      savedToWishlist: 'Parfum enregistré dans votre liste d’envies.',
      addedToCollection: 'Parfum ajouté à votre collection.',
      importUnavailable: 'Impossible d’importer le classeur de collection.',
      importSummary: (added, existing, unmatched, duplicates) =>
        `Ajoutés : ${added} ; déjà dans la collection : ${existing} ; sans correspondance : ${unmatched} ; lignes en double : ${duplicates}.`,
      unmatchedRows: (n) =>
        `${n} ligne(s) sans correspondance dans la base de parfums. Consultez le résumé d’importation.`,
      importFailed: 'L’importation de la collection a échoué.',
      entryUpdated: 'Entrée de collection mise à jour.',
      removed: 'Parfum retiré de votre collection.',
    },
  },
};

export default collection;
