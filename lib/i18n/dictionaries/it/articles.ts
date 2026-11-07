import type { Dictionary } from '../en';

const articles: Dictionary['articles'] = {
  menu: {
    passionMenu: 'Menu Passione',
    items: {
      fragrances: { label: 'Profumi', hint: 'Esplora il catalogo dei profumi' },
      needToKnow: { label: 'Da sapere', hint: 'Conoscenze essenziali sul profumo' },
      perfumeCreators: { label: 'Creatori di profumi', hint: 'DNA dei profumieri e stili distintivi' },
      scentTerritories: { label: 'Territori olfattivi', hint: 'Esplora i mondi olfattivi' },
      perfumeHouses: { label: 'TOP Olfactive Houses', hint: 'Scopri case e profumi' },
      occasions: { label: 'Occasioni', hint: 'Un profumo per ogni momento' },
    },
  },
  houses: {
    title: 'TOP Olfactive Houses',
    intro: 'Una selezione editoriale, non una classifica di popolarità né un catalogo completo. I consigli di acquisto usano solo questo catalogo selezionato.',
    notice: 'Questo catalogo non comprende tutte le uscite. I territori sono suggerimenti editoriali, non classificazioni confermate.',
    search: 'Cerca case', fragranceSearch: 'Cerca in questa casa', searchAction: 'Cerca',
    catalog: 'Profumi nel nostro catalogo',
    description: 'Descrizione editoriale',
    editorialDescription: (name, accords) => accords
      ? `Esplora l’universo olfattivo di ${name} attraverso i profumi del nostro catalogo. Tra gli accordi documentati più frequentemente figurano ${accords}. Questa panoramica offre un punto di partenza per scoprire la maison, mentre ogni composizione apporta le proprie sfumature.`
      : `Esplora l’universo olfattivo di ${name} attraverso i profumi del nostro catalogo. Scopri le composizioni qui sotto e confronta i profili disponibili per trovare il tuo personale punto di partenza nella maison.`,
    website: 'Website',
    source: 'Fonte documentale', territories: 'Territori suggeriti · revisione in attesa',
    evidence: 'Termini di evidenza', method: 'Metodo', confidence: 'Affidabilità dichiarata dalla fonte',
    similarity: 'Somiglianza riportata · non equivalenza', brandClaim: 'Ispirazione dichiarata dal marchio',
    pending: 'Somiglianza in ricerca', notes: 'Note',
    noResults: 'Nessun risultato in questa selezione.', previous: 'Precedente', next: 'Successivo', back: 'Tutte le case selezionate',
    page: 'Pagina', art: 'Illustrazione editoriale originale; non ufficiale.', reviewStatus: 'Stato della revisione',
  },
  needToKnow: {
    kicker: 'Da sapere',
    title: 'Articoli della sezione Da sapere',
    intro:
      'Esplora conoscenze strutturate sul profumo, organizzate per categoria.',
    sectionLabel: 'Sezione',
    nowReading: 'Stai leggendo',
    articleCount: (count) => `${count} articoli`,
    sections: {
      'scent-fundamentals': {
        title: 'Fondamenti olfattivi',
        description: 'I principi di base che spiegano come i profumi sono strutturati e interpretati.',
        intro: 'Costruisci basi solide prima di valutare prestazioni, valore o categoria di marca.',
        articles: [
          {
            title: 'Note di testa, di cuore e di fondo',
            subtitle: 'Un profumo è un viaggio',
            paragraphs: [
              'La maggior parte dei profumi evolve per fasi invece di profumare allo stesso modo dall’inizio alla fine.',
              'Le note di testa sono la prima impressione: di solito luminose e di breve durata.',
              'Le note di cuore definiscono il carattere centrale quando l’apertura sfuma.',
              'Le note di fondo donano profondità e spesso modellano la scia duratura sulla pelle.',
            ],
          },
          {
            title: 'Capire le concentrazioni',
            subtitle: 'EDT, EDP e Parfum nel loro contesto',
            paragraphs: [
              'La concentrazione indica la quantità approssimativa di materiale aromatico disciolto nell’alcol, ma da sola non garantisce le prestazioni.',
              'Il design della formula, la qualità degli ingredienti, la chimica della pelle e il clima possono incidere sulle prestazioni più della sola etichetta di concentrazione.',
              'Alcune EDT superano molti Parfum, a seconda della composizione.',
            ],
            bullets: [
              'Eau Fraiche: 1-3%',
              'Eau de Cologne (EDC): 2-5%',
              'Eau de Toilette (EDT): 5-15%',
              'Eau de Parfum (EDP): 15-20%',
              'Parfum / Extrait: 20-40%',
            ],
            callout:
              'Mito: una concentrazione più alta significa sempre prestazioni più forti.\nRealtà: l’architettura della formula conta più dell’etichetta.',
          },
          {
            title: 'Che cos’è un accordo?',
            subtitle: 'I mattoni della composizione',
            paragraphs: [
              'Un accordo è una miscela di materiali che crea un’impressione olfattiva riconoscibile, come cuoio, ambra, tabacco o aria marina.',
              'Molti accordi sono illusioni compositive e non esistono come singolo materiale naturale.',
              'Capire gli accordi aiuta a spiegare perché le piramidi olfattive e la percezione non coincidono sempre alla lettera.',
            ],
          },
          {
            title: 'Ingredienti naturali vs sintetici',
            subtitle: 'Entrambi essenziali nella profumeria moderna',
            paragraphs: [
              'I materiali naturali possono donare ricchezza e consistenza, mentre i sintetici migliorano coerenza, stabilità e libertà creativa.',
              'La maggior parte dei profumi di alta qualità combina entrambi gli approcci.',
              'La qualità dipende dalla creatività e dall’equilibrio della formula, non da un semplice rapporto naturale/sintetico.',
            ],
          },
        ],
      },
      'application-technique': {
        title: 'Tecnica di applicazione',
        description: 'Come applicare il profumo correttamente per una proiezione elegante e una resa più costante.',
        intro: 'Adotta queste pratiche per migliorare il comportamento del profumo senza esagerare con le spruzzate.',
        articles: [
          {
            title: 'Come applicare bene il profumo',
            subtitle: 'Meno è spesso meglio',
            paragraphs: [
              'Applicalo sui punti di pulsazione come collo, petto e polsi, così il calore corporeo favorisce la diffusione durante la giornata.',
              'Punta a una scia che si lascia scoprire, non alla saturazione della stanza.',
            ],
            bullets: [
              'Profumi freschi: 4-6 spruzzi',
              'Profumi versatili: 3-5 spruzzi',
              'Profumi potenti: 2-4 spruzzi',
            ],
          },
          {
            title: 'Non strofinare dopo aver spruzzato',
            subtitle: 'Lascia che l’apertura si sviluppi naturalmente',
            paragraphs: [
              'Strofinare i polsi aumenta l’attrito e può alterare la percezione delle note di testa.',
              'Il metodo migliore è semplice: spruzza e lascia asciugare il profumo in modo naturale.',
            ],
          },
          {
            title: 'La posizione batte la quantità',
            subtitle: 'Strategia di applicazione prima di altri spruzzi',
            paragraphs: [
              'Raddoppiare gli spruzzi raramente raddoppia la durata e spesso aumenta solo l’intensità.',
              'Un posizionamento strategico offre in genere una proiezione più pulita e maggiore comfort rispetto all’eccesso.',
            ],
          },
        ],
      },
      'testing-selection': {
        title: 'Prova e selezione',
        description: 'Un metodo pratico per testare i profumi e acquistare con fiducia.',
        intro: 'Valuta con metodo per evitare acquisti impulsivi e rimpianti da collezionista.',
        articles: [
          {
            title: 'Come testare un profumo',
            subtitle: 'Valuta l’evoluzione completa',
            paragraphs: [
              'Non giudicare un profumo solo nei primi minuti; molte formule si trasformano notevolmente nel corso dell’utilizzo.',
              'Quando possibile, provalo per un’intera giornata prima di acquistare.',
            ],
            bullets: [
              'Apertura: 0-15 minuti',
              'Cuore: 30-120 minuti',
              'Fondo: 3-8 ore',
            ],
          },
          {
            title: 'Cartina vs pelle',
            subtitle: 'Due strumenti, due scopi',
            paragraphs: [
              'Usa le cartine per confronti rapidi e un primo orientamento.',
              'Usa la prova sulla pelle per durata, proiezione e interazione con la tua chimica.',
              'Non prendere mai la decisione finale di acquisto basandoti solo sulla cartina.',
            ],
          },
          {
            title: 'Campione prima del flacone intero',
            subtitle: 'Riduci il rischio e migliora le probabilità di successo',
            paragraphs: [
              'Decant e campioni rivelano il comportamento reale nell’uso quotidiano meglio delle impressioni in negozio.',
              'Un processo strutturato «prima il campione» riduce i costosi errori di acquisto alla cieca.',
            ],
          },
          {
            title: 'Non esiste il miglior profumo universale',
            subtitle: 'Il profumo migliore è personale',
            paragraphs: [
              'Preferenze personali, clima, stile di vita e associazioni emotive determinano il successo di un profumo più dell’hype o delle classifiche.',
              'L’obiettivo non è il punteggio più alto. L’obiettivo è la migliore corrispondenza con il tuo DNA olfattivo.',
            ],
          },
        ],
      },
      'performance-science': {
        title: 'Scienza delle prestazioni',
        description: 'Comprendi proiezione, durata, limiti della percezione e comportamento stagionale.',
        intro: 'Separa i miti dal comportamento misurabile quando giudichi le prestazioni di un profumo.',
        articles: [
          {
            title: 'Proiezione vs durata',
            subtitle: 'Metriche diverse, significati diversi',
            paragraphs: [
              'La proiezione descrive la distanza di irradiazione dalla pelle, mentre la durata misura il tempo totale in cui il profumo resta percepibile.',
              'Un profumo può proiettare forte e svanire in fretta, durare a lungo con poca proiezione, o eccellere in entrambe le dimensioni.',
            ],
          },
          {
            title: 'Perché smetti di sentire il tuo profumo',
            subtitle: 'La fatica olfattiva spiegata',
            paragraphs: [
              'L’esposizione continua porta il cervello a filtrare i segnali olfattivi familiari.',
              'Non percepire più un profumo non significa che sia svanito. Gli altri possono ancora sentirlo chiaramente.',
            ],
          },
          {
            title: 'Variazioni stagionali delle prestazioni',
            subtitle: 'La temperatura cambia tutto',
            paragraphs: [
              'Il caldo spesso amplifica proiezione e luminosità, mentre il freddo può attenuare la proiezione ed enfatizzare le note dense.',
              'Lo stesso profumo può sembrare completamente diverso in estate rispetto all’inverno.',
            ],
          },
          {
            title: 'Perché i profumi cambiano da persona a persona',
            subtitle: 'Chimica della pelle e ambiente',
            paragraphs: [
              'Idratazione, temperatura della pelle, clima e oli naturali influenzano sia la percezione sia le prestazioni.',
              'Provare sulla propria pelle è sempre più affidabile che fidarsi solo delle recensioni.',
            ],
          },
        ],
      },
      'formula-evolution': {
        title: 'Evoluzione delle formule',
        description: 'Come i profumi cambiano nel tempo tra invecchiamento, riformulazioni e variabili di produzione.',
        intro: 'Capisci perché due flaconi possono differire e come proteggere la qualità nel lungo periodo.',
        articles: [
          {
            title: 'Perché i profumi vengono riformulati',
            subtitle: 'Perché i tuoi preferiti a volte cambiano',
            paragraphs: [
              'Le riformulazioni avvengono per motivi normativi, di sicurezza, di approvvigionamento, di costo e di strategia.',
              'Alcuni cambiamenti sono sottili, altri possono alterare l’identità in modo significativo.',
            ],
            bullets: [
              'Restrizioni sugli ingredienti',
              'Normative di sicurezza',
              'Carenze di approvvigionamento',
              'Variazioni dei costi dei materiali',
              'Cambi di strategia del brand',
            ],
          },
          {
            title: 'Variazione tra lotti',
            subtitle: 'Perché i flaconi possono differire leggermente',
            paragraphs: [
              'Piccole differenze tra lotti possono derivare dalla variabilità dei materiali, da cambi di fornitore e da aggiustamenti di produzione.',
              'La maggior parte delle differenze è minima e diventa evidente soprattutto nel confronto diretto, fianco a fianco.',
            ],
          },
          {
            title: 'Macerazione e invecchiamento in flacone',
            subtitle: 'Cambiamenti sottili nel tempo',
            paragraphs: [
              'Dopo l’apertura, ossigeno e tempo possono ammorbidire alcune composizioni, anche se i cambiamenti radicali sono rari.',
              'Buone pratiche di conservazione contano in genere più dei tentativi deliberati di macerazione.',
            ],
          },
          {
            title: 'Come conservare correttamente i profumi',
            subtitle: 'Proteggi la tua collezione',
            paragraphs: [
              'Calore, luce, umidità ed eccessiva esposizione all’aria accelerano il degrado.',
              'Conserva i flaconi in luoghi freschi, asciutti e bui, a temperatura stabile.',
              'Cassetti, armadi e mobili sono in genere più sicuri dei bagni.',
            ],
          },
          {
            title: 'Perché i flaconi vintage profumano diversamente',
            subtitle: 'Un’istantanea di un’altra epoca',
            paragraphs: [
              'I flaconi vintage possono differire per formule storiche, restrizioni sugli ingredienti ed evoluzione dei materiali.',
              'Spesso rivelano stili meno comuni nelle uscite moderne.',
            ],
          },
        ],
      },
      'market-reality': {
        title: 'Realtà del mercato',
        description: 'Supera i luoghi comuni del marketing e valuta la qualità con criteri migliori.',
        intro: 'Concentrati sulla qualità della composizione e sulla corrispondenza personale, non su etichette, hype e cartellini del prezzo.',
        articles: [
          {
            title: 'Prezzo vs qualità',
            subtitle: 'Costoso non significa automaticamente migliore',
            paragraphs: [
              'Il prezzo può riflettere branding, packaging, rarità e posizionamento tanto quanto la qualità olfattiva.',
              'Molti profumi accessibili superano quelli costosi in versatilità, piacere e corrispondenza personale.',
            ],
          },
          {
            title: 'Nicchia vs designer',
            subtitle: 'La qualità esiste in entrambi i mondi',
            paragraphs: [
              'Nicchia e designer sono categorie commerciali, non garanzie di qualità.',
              'In ogni categoria ci sono profumi eccellenti e altri dimenticabili.',
              'Giudica il profumo in sé, non la famiglia dell’etichetta.',
            ],
          },
          {
            title: 'La potenza non è qualità',
            subtitle: 'Una proiezione forte è solo una metrica',
            paragraphs: [
              'Una proiezione elevata può essere utile, ma la qualità dipende anche da equilibrio, creatività, struttura ed evoluzione.',
              'Alcuni dei profumi più rispettati sono intimi anziché clamorosi.',
            ],
          },
          {
            title: 'La complessità non è il numero di note',
            subtitle: 'La struttura conta più delle liste lunghe',
            paragraphs: [
              'Una lunga lista di note non garantisce profondità.',
              'La vera complessità nasce da accordi stratificati, contrasti, transizioni e sviluppo nel tempo.',
            ],
          },
          {
            title: 'Le etichette di genere sono marketing',
            subtitle: 'Indossa ciò che ti piace',
            paragraphs: [
              'La maggior parte delle note principali compare sia nelle uscite dette maschili sia in quelle femminili.',
              'Il tuo gusto personale è più utile delle etichette di pubblico sulla confezione.',
            ],
          },
        ],
      },
    },
  },
  perfumers: {
    directory: {
      eyebrow: 'TOP Profumieri', count: (shown, total) => `${shown} di ${total} profumieri`,
      intro: 'Scopri le persone dietro profumi straordinari, i loro approcci creativi e le creazioni rappresentative.',
      search: 'Cerca profumiere', placeholder: 'Nome del profumiere', topCreations: 'Creazioni di punta',
      all: 'Tutti i profumieri', sort: 'Ordina per', name: 'Nome', view: 'Vedi profilo',
      portrait: (name) => `Ritratto del profumiere ${name}`, photoSource: 'Fonte della foto', portraitUnavailable: 'Ritratto non disponibile',
      veryHigh: 'Creatore molto ricorrente', high: 'Creatore ad alta ricorrenza', recurrent: 'Creatore ricorrente',
      creations: 'Creazioni nel 33% superiore', examples: 'Esempi dal catalogo', empty: 'Nessun profumiere corrisponde alla ricerca.',
      profileRank: (rank) => `Profilo del profumiere · posizione ${rank}`, biographySource: 'Fonte biografica e informativa', credited: 'Profumi accreditati',
      examplesNote: 'Esempi dal catalogo; ogni coautore è contato una volta per profumo distinto.',
      methodTitle: 'Come funziona la classificazione', method: 'Metodo OlfactiveDNA',
      classification: 'Classificazione', classificationNote: 'I creatori sono ordinati per il numero di profumi distinti accreditati nel 33% superiore del punteggio.',
      formula: 'Formula del punteggio', formulaNote: '80% valutazione della comunità corretta con un prior di 50 voti verso la mediana della comunità di origine, più 20% percentile di popolarità nella stessa comunità.',
      sample: 'Campione e soglia', sampleNote: (scored, cutoff, included) => `${scored} profumi avevano un punteggio. Il 33% superiore viene arrotondato per eccesso, includendo i pari merito alla soglia ${cutoff}: ${included} profumi.`,
      credits: 'Crediti dei profumieri', bands: 'Livelli di ricorrenza',
      bandsNote: '15–24 creazioni: ricorrente · 25–49: alta · 50+: molto alta. Categorie editoriali, non premi alla carriera.',
      rankingNote: (rank, count) => `Posizione #${rank} tra i creatori presentati; i pari merito condividono la posizione. ${count} creazioni accreditate.`,
      snapshot: (date) => `Istantanea del catalogo: ${date}. I conteggi non sono in tempo reale e non rappresentano l’intera carriera o la tua compatibilità DNA.`,
    },
    kicker: 'Creatori di profumi',
    title: 'Profumieri e DNA creativo',
    intro: 'Esplora gli stili distintivi dei creatori e le loro filosofie di profumeria.',
    iconicFragrances: 'Profumi iconici',
    clusters: {
      'FRESH ARCHITECTS': 'ARCHITETTI DELLA FRESCHEZZA',
      'ORIENTAL SCULPTORS': 'SCULTORI ORIENTALI',
      'FLORAL ARTISTS': 'ARTISTI FLOREALI',
      'MODERN MOLECULAR DESIGNERS': 'DESIGNER MOLECOLARI MODERNI',
      'HERITAGE HOUSES': 'CASE STORICHE',
    },
    profiles: {
      'Jean-Claude Ellena': {
        style: 'Trasparenza minimalista, composizioni agrumate ariose',
        philosophy: 'Less is more',
      },
      'Francis Kurkdjian': {
        style: 'Lusso moderno, firme identitarie decise',
        philosophy: 'Riconoscibilità attraverso il contrasto',
      },
      'Olivier Creed': {
        style: 'Lusso aristocratico e fresco',
        philosophy: 'Natura più eredità',
      },
      'Alberto Morillas': {
        style: 'Freschezza moderna e pulita',
        philosophy: 'La semplicità perfetta',
      },
      'Dominique Ropion': {
        style: 'Strutture floreali dense e sensuali',
        philosophy: 'Composizioni dalla spina dorsale solida',
      },
      'Thierry Wasser': {
        style: 'L’eleganza calda di Guerlain',
        philosophy: 'Profumeria francese senza tempo',
      },
      'Pierre Montale': {
        style: 'Composizioni audaci a dominante orientale, proiezione intensa',
        philosophy: '«More is more» nell’intensità delle materie prime',
      },
      'Roja Dove': {
        style: 'Profumeria britannica ultra-lusso, miscele estremamente opulente',
        philosophy: 'Raffinatezza assoluta ed eccesso in armonia',
      },
      'Serge Lutens': {
        style: 'Composizioni artistiche, scure e non convenzionali',
        philosophy: 'Il profumo come racconto ed emozione',
      },
      'Kilian Hennessy': {
        style: 'Lusso sensuale, composizioni ispirate alla vita notturna',
        philosophy: 'Non essere timido, sii irresistibile',
      },
      'David Le Goff': {
        style: 'Freschezza acquatico-minerale moderna',
        philosophy: 'Eleganza moderna e pulita con trasparenza ariosa',
      },
      Houbigant: {
        style: 'Profumeria francese storica con reinterpretazioni moderne, fiori eleganti e strutture legnose raffinate',
        philosophy: 'La tradizione raffinata dall’artigianato moderno',
      },
    },
  },
};

export default articles;
