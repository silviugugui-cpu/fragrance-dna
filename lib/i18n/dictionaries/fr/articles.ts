import type { Dictionary } from '../en';

const articles: Dictionary['articles'] = {
  menu: {
    passionMenu: 'Menu Passion',
    items: {
      needToKnow: { label: 'À savoir', hint: 'Connaissances essentielles du parfum' },
      perfumeCreators: { label: 'Créateurs de parfum', hint: 'ADN des parfumeurs et styles signatures' },
      scentTerritories: { label: 'Territoires olfactifs', hint: 'Explorez les mondes olfactifs' },
    },
  },
  needToKnow: {
    kicker: 'À savoir',
    title: 'Articles de la rubrique À savoir',
    intro:
      'Explorez des connaissances structurées sur le parfum, classées par catégorie.',
    sectionLabel: 'Section',
    nowReading: 'Lecture en cours',
    articleCount: (count) => `${count} articles`,
    sections: {
      'scent-fundamentals': {
        title: 'Fondamentaux olfactifs',
        description: 'Les principes de base qui expliquent comment les parfums sont structurés et interprétés.',
        intro: 'Construisez des bases solides avant d’évaluer la performance, la valeur ou la catégorie de marque.',
        articles: [
          {
            title: 'Notes de tête, de cœur et de fond',
            subtitle: 'Un parfum est un voyage',
            paragraphs: [
              'La plupart des parfums évoluent par étapes au lieu de sentir la même chose du début à la fin.',
              'Les notes de tête constituent la première impression ; elles sont généralement lumineuses et éphémères.',
              'Les notes de cœur définissent le caractère central une fois l’ouverture estompée.',
              'Les notes de fond apportent de la profondeur et façonnent souvent le sillage durable sur la peau.',
            ],
          },
          {
            title: 'Comprendre les concentrations',
            subtitle: 'EDT, EDP et Parfum en contexte',
            paragraphs: [
              'La concentration indique la quantité approximative de matière aromatique dissoute dans l’alcool, mais elle ne garantit pas à elle seule la performance.',
              'La conception de la formule, la qualité des ingrédients, la chimie de la peau et le climat peuvent influencer la performance davantage que la seule mention de concentration.',
              'Certaines EDT surpassent de nombreux Parfums selon la composition.',
            ],
            bullets: [
              'Eau Fraîche : 1-3 %',
              'Eau de Cologne (EDC) : 2-5 %',
              'Eau de Toilette (EDT) : 5-15 %',
              'Eau de Parfum (EDP) : 15-20 %',
              'Parfum / Extrait : 20-40 %',
            ],
            callout:
              'Mythe : une concentration plus élevée signifie toujours une meilleure performance.\nRéalité : l’architecture de la formule compte plus que l’étiquette.',
          },
          {
            title: 'Qu’est-ce qu’un accord ?',
            subtitle: 'Les briques de la composition',
            paragraphs: [
              'Un accord est un assemblage de matières qui crée une impression olfactive reconnaissable, comme le cuir, l’ambre, le tabac ou l’air marin.',
              'Beaucoup d’accords sont des illusions de composition et n’existent pas sous forme de matière naturelle unique.',
              'Comprendre les accords aide à expliquer pourquoi les pyramides de notes et la perception olfactive ne coïncident pas toujours littéralement.',
            ],
          },
          {
            title: 'Ingrédients naturels vs synthétiques',
            subtitle: 'Les deux sont essentiels à la parfumerie moderne',
            paragraphs: [
              'Les matières naturelles peuvent apporter richesse et texture, tandis que les synthétiques améliorent la constance, la stabilité et la liberté créative.',
              'La plupart des parfums de grande qualité combinent les deux approches.',
              'La qualité se mesure à la créativité et à l’équilibre de la formule, pas à un simple ratio naturel/synthétique.',
            ],
          },
        ],
      },
      'application-technique': {
        title: 'Technique d’application',
        description: 'Comment appliquer un parfum correctement pour une projection élégante et un porter plus régulier.',
        intro: 'Adoptez ces pratiques pour améliorer le comportement du parfum sans le surdoser.',
        articles: [
          {
            title: 'Comment bien appliquer son parfum',
            subtitle: 'Moins, c’est souvent mieux',
            paragraphs: [
              'Appliquez sur les points de pulsation comme le cou, le torse et les poignets afin que la chaleur du corps favorise la diffusion tout au long de la journée.',
              'Visez un sillage qui se laisse découvrir, pas une saturation de la pièce.',
            ],
            bullets: [
              'Parfums frais : 4-6 pulvérisations',
              'Parfums polyvalents : 3-5 pulvérisations',
              'Parfums puissants : 2-4 pulvérisations',
            ],
          },
          {
            title: 'Ne frottez pas après la pulvérisation',
            subtitle: 'Laissez l’ouverture se développer naturellement',
            paragraphs: [
              'Frotter les poignets augmente la friction et peut perturber la perception des notes de tête.',
              'La meilleure méthode est simple : pulvérisez et laissez le parfum sécher naturellement.',
            ],
          },
          {
            title: 'Le placement l’emporte sur la quantité',
            subtitle: 'Une stratégie de pulvérisation avant d’en rajouter',
            paragraphs: [
              'Doubler le nombre de pulvérisations double rarement la tenue et ne fait souvent qu’augmenter l’intensité.',
              'Un placement stratégique offre généralement une projection plus nette et plus de confort que le surdosage.',
            ],
          },
        ],
      },
      'testing-selection': {
        title: 'Test et sélection',
        description: 'Un cadre pratique pour tester les parfums et acheter en toute confiance.',
        intro: 'Adoptez une évaluation méthodique pour éviter les achats impulsifs et les regrets de collectionneur.',
        articles: [
          {
            title: 'Comment tester un parfum',
            subtitle: 'Évaluez l’évolution complète',
            paragraphs: [
              'Ne jugez pas un parfum sur les seules premières minutes ; de nombreuses formules se transforment considérablement au fil du porter.',
              'Dans la mesure du possible, testez-le une journée entière avant d’acheter.',
            ],
            bullets: [
              'Ouverture : 0-15 minutes',
              'Cœur : 30-120 minutes',
              'Fond : 3-8 heures',
            ],
          },
          {
            title: 'Mouillette vs peau',
            subtitle: 'Deux outils, deux usages',
            paragraphs: [
              'Utilisez les mouillettes pour comparer rapidement et dégager une première orientation.',
              'Utilisez le test sur peau pour la tenue, la projection et l’interaction avec votre chimie cutanée.',
              'Ne prenez jamais une décision d’achat définitive à partir de la seule mouillette.',
            ],
          },
          {
            title: 'Échantillon avant flacon complet',
            subtitle: 'Réduisez le risque et améliorez votre taux de réussite',
            paragraphs: [
              'Les décants et les échantillons révèlent le comportement réel au porter mieux que les impressions en boutique.',
              'Une démarche structurée « échantillon d’abord » réduit les achats à l’aveugle coûteux et décevants.',
            ],
          },
          {
            title: 'Pas de meilleur parfum universel',
            subtitle: 'Le meilleur parfum est personnel',
            paragraphs: [
              'Les préférences personnelles, le climat, le mode de vie et les associations émotionnelles déterminent la réussite d’un parfum davantage que le battage ou les classements.',
              'L’objectif n’est pas la meilleure note. L’objectif est la meilleure adéquation avec votre propre ADN olfactif.',
            ],
          },
        ],
      },
      'performance-science': {
        title: 'Science de la performance',
        description: 'Comprenez la projection, la tenue, les limites de la perception et le comportement saisonnier.',
        intro: 'Distinguez les mythes des comportements mesurables lorsque vous jugez la performance d’un parfum.',
        articles: [
          {
            title: 'Projection vs tenue',
            subtitle: 'Des mesures différentes, des significations différentes',
            paragraphs: [
              'La projection décrit la distance de rayonnement depuis la peau, tandis que la tenue mesure la durée totale pendant laquelle le parfum reste perceptible.',
              'Un parfum peut projeter fort et s’estomper vite, durer longtemps avec peu de projection, ou exceller dans les deux dimensions.',
            ],
          },
          {
            title: 'Pourquoi vous ne sentez plus votre propre parfum',
            subtitle: 'La fatigue olfactive expliquée',
            paragraphs: [
              'Une exposition continue amène le cerveau à filtrer les signaux olfactifs familiers.',
              'Ne plus remarquer un parfum ne prouve pas qu’il a disparu. Les autres peuvent encore le percevoir clairement.',
            ],
          },
          {
            title: 'Variations saisonnières de performance',
            subtitle: 'La température change tout',
            paragraphs: [
              'La chaleur amplifie souvent la projection et l’éclat, tandis que le froid peut atténuer la projection et accentuer les notes denses.',
              'Le même parfum peut sembler complètement différent en été et en hiver.',
            ],
          },
          {
            title: 'Pourquoi un parfum sent différemment selon les personnes',
            subtitle: 'Chimie de la peau et environnement',
            paragraphs: [
              'L’hydratation, la température de la peau, le climat et les huiles naturelles influencent à la fois la perception et la performance.',
              'Tester sur votre propre peau est toujours plus fiable que de se fier uniquement aux avis.',
            ],
          },
        ],
      },
      'formula-evolution': {
        title: 'Évolution des formules',
        description: 'Comment les parfums changent avec le temps : vieillissement, reformulation et variables de production.',
        intro: 'Comprenez pourquoi deux flacons peuvent différer et comment préserver la qualité sur le long terme.',
        articles: [
          {
            title: 'Pourquoi les parfums sont reformulés',
            subtitle: 'Pourquoi vos favoris changent parfois',
            paragraphs: [
              'Les reformulations répondent à des raisons réglementaires, sanitaires, d’approvisionnement, de coût et de stratégie.',
              'Certains changements sont subtils, d’autres peuvent altérer l’identité de manière significative.',
            ],
            bullets: [
              'Restrictions d’ingrédients',
              'Réglementations de sécurité',
              'Pénuries d’approvisionnement',
              'Variations du coût des matières',
              'Évolutions de stratégie de marque',
            ],
          },
          {
            title: 'Variation de lot',
            subtitle: 'Pourquoi des flacons peuvent légèrement différer',
            paragraphs: [
              'De petites différences entre lots peuvent provenir de la variabilité des matières, de changements de fournisseurs et d’ajustements de production.',
              'La plupart des écarts sont minimes et ne deviennent évidents qu’en comparaison directe, côte à côte.',
            ],
          },
          {
            title: 'Macération et vieillissement en flacon',
            subtitle: 'Des changements subtils avec le temps',
            paragraphs: [
              'Après ouverture, l’oxygène et le temps peuvent arrondir certaines compositions, même si les changements spectaculaires restent rares.',
              'De bonnes pratiques de conservation comptent généralement plus que des tentatives de macération volontaire.',
            ],
          },
          {
            title: 'Comment conserver ses parfums correctement',
            subtitle: 'Protégez votre collection',
            paragraphs: [
              'La chaleur, la lumière, l’humidité et une exposition excessive à l’air accélèrent la dégradation.',
              'Rangez vos flacons dans des endroits frais, secs et sombres, à température stable.',
              'Les tiroirs, placards et armoires sont généralement plus sûrs que les salles de bains.',
            ],
          },
          {
            title: 'Pourquoi les flacons vintage sentent différemment',
            subtitle: 'L’instantané d’une autre époque',
            paragraphs: [
              'Les flacons vintage peuvent différer en raison des formules historiques, des restrictions d’ingrédients et de l’évolution des matières.',
              'Ils révèlent souvent des styles devenus plus rares dans les sorties modernes.',
            ],
          },
        ],
      },
      'market-reality': {
        title: 'Réalités du marché',
        description: 'Dépassez les idées reçues du marketing et évaluez la qualité avec de meilleurs critères.',
        intro: 'Concentrez-vous sur la qualité de la composition et l’adéquation personnelle plutôt que sur les étiquettes, le battage et les prix.',
        articles: [
          {
            title: 'Prix vs qualité',
            subtitle: 'Cher ne veut pas automatiquement dire meilleur',
            paragraphs: [
              'Le prix peut refléter l’image de marque, le packaging, la rareté et le positionnement autant que la qualité olfactive.',
              'De nombreux parfums abordables surpassent des références coûteuses en polyvalence, en plaisir et en adéquation personnelle.',
            ],
          },
          {
            title: 'Niche vs designer',
            subtitle: 'La qualité existe dans les deux mondes',
            paragraphs: [
              'Niche et designer sont des catégories commerciales, pas des garanties de qualité.',
              'Chaque catégorie compte des parfums excellents et d’autres oubliables.',
              'Jugez le parfum lui-même, pas la famille d’étiquettes.',
            ],
          },
          {
            title: 'La puissance n’est pas la qualité',
            subtitle: 'Une forte projection n’est qu’un critère parmi d’autres',
            paragraphs: [
              'Une projection élevée peut être utile, mais la qualité dépend aussi de l’équilibre, de la créativité, de la structure et de l’évolution.',
              'Certains des parfums les plus respectés sont intimes plutôt que tonitruants.',
            ],
          },
          {
            title: 'La complexité n’est pas le nombre de notes',
            subtitle: 'La structure compte plus que les longues listes',
            paragraphs: [
              'Une longue liste de notes ne garantit pas la profondeur.',
              'La vraie complexité naît d’accords superposés, de contrastes, de transitions et d’un développement dans le temps.',
            ],
          },
          {
            title: 'Les étiquettes de genre relèvent du marketing',
            subtitle: 'Portez ce qui vous plaît',
            paragraphs: [
              'La plupart des notes essentielles figurent aussi bien dans les sorties dites masculines que féminines.',
              'Votre goût personnel est plus utile que les mentions de cible sur la boîte.',
            ],
          },
        ],
      },
    },
  },
  perfumers: {
    kicker: 'Créateurs de parfum',
    title: 'Parfumeurs et ADN créatif',
    intro: 'Explorez les styles signatures des créateurs et leurs philosophies de parfumerie.',
    iconicFragrances: 'Parfums iconiques',
    clusters: {
      'FRESH ARCHITECTS': 'ARCHITECTES DE LA FRAÎCHEUR',
      'ORIENTAL SCULPTORS': 'SCULPTEURS ORIENTAUX',
      'FLORAL ARTISTS': 'ARTISTES FLORAUX',
      'MODERN MOLECULAR DESIGNERS': 'DESIGNERS MOLÉCULAIRES MODERNES',
      'HERITAGE HOUSES': 'MAISONS DE TRADITION',
    },
    profiles: {
      'Jean-Claude Ellena': {
        style: 'Transparence minimaliste, compositions hespéridées aériennes',
        philosophy: 'Moins, c’est plus',
      },
      'Francis Kurkdjian': {
        style: 'Luxe moderne, signatures identitaires affirmées',
        philosophy: 'La reconnaissance par le contraste',
      },
      'Olivier Creed': {
        style: 'Luxe aristocratique et frais',
        philosophy: 'La nature alliée à l’héritage',
      },
      'Alberto Morillas': {
        style: 'Fraîcheur moderne et nette',
        philosophy: 'La simplicité parfaite',
      },
      'Dominique Ropion': {
        style: 'Structures florales denses et sensuelles',
        philosophy: 'Des compositions à la charpente solide',
      },
      'Thierry Wasser': {
        style: 'L’élégance chaleureuse de Guerlain',
        philosophy: 'La parfumerie française intemporelle',
      },
      'Pierre Montale': {
        style: 'Compositions orientales audacieuses, projection intense',
        philosophy: 'Le « plus, c’est plus » dans l’intensité des matières premières',
      },
      'Roja Dove': {
        style: 'Parfumerie britannique ultra-luxe, assemblages extrêmement opulents',
        philosophy: 'Le raffinement absolu et l’excès en harmonie',
      },
      'Serge Lutens': {
        style: 'Compositions artistiques, sombres et non conventionnelles',
        philosophy: 'Le parfum comme récit et émotion',
      },
      'Kilian Hennessy': {
        style: 'Luxe sensuel, compositions inspirées de la vie nocturne',
        philosophy: 'Ne soyez pas timide, soyez addictif',
      },
      'David Le Goff': {
        style: 'Fraîcheur aquatique et minérale moderne',
        philosophy: 'Une élégance moderne et nette, à la transparence aérienne',
      },
      Houbigant: {
        style: 'Parfumerie française historique aux réinterprétations modernes, florales élégantes et structures boisées raffinées',
        philosophy: 'La tradition sublimée par l’artisanat moderne',
      },
    },
  },
};

export default articles;
