import type { Dictionary } from '../en';

const articles: Dictionary['articles'] = {
  menu: {
    passionMenu: 'Meniul Pasiunii',
    items: {
      fragrances: { label: 'Parfumuri', hint: 'Explorează catalogul de parfumuri' },
      needToKnow: { label: 'De știut', hint: 'Cunoștințe esențiale despre parfumuri' },
      perfumeCreators: { label: 'Creatori de parfumuri', hint: 'ADN-ul parfumierilor și stiluri de semnătură' },
      scentTerritories: { label: 'Teritorii olfactive', hint: 'Explorează lumile olfactive' },
      perfumeHouses: { label: 'TOP Olfactive Houses', hint: 'Descoperă casele și parfumurile lor' },
      occasions: { label: 'Ocazii de purtare', hint: 'Un parfum pentru fiecare moment' },
    },
  },
  houses: {
    title: 'TOP Olfactive Houses',
    intro: 'O selecție editorială, nu un clasament de popularitate sau un istoric complet al lansărilor. Recomandările de cumpărare folosesc doar acest catalog selectat.',
    notice: 'Catalogul nu include toate lansările. Teritoriile parfumurilor sunt sugestii editoriale, nu clasificări confirmate.',
    search: 'Caută case',
    fragranceSearch: 'Caută în această casă',
    searchAction: 'Caută',
    catalog: 'Parfumuri în catalogul nostru',
    description: 'Descriere editorială',
    editorialDescription: (name, accords) => accords
      ? `Explorează universul olfactiv ${name} prin parfumurile din catalogul nostru. Printre acordurile documentate cel mai frecvent se numără ${accords}. Această privire de ansamblu oferă un punct de pornire pentru descoperirea casei, fiecare compoziție aducând propriile nuanțe.`
      : `Explorează universul olfactiv ${name} prin parfumurile din catalogul nostru. Descoperă compozițiile de mai jos și compară profilurile disponibile pentru a găsi propriul punct de pornire în explorarea casei.`,
    website: 'Website',
    source: 'Sursa documentării',
    territories: 'Sugestii teritoriale · în așteptarea revizuirii',
    evidence: 'Termeni justificativi',
    method: 'Metodă',
    confidence: 'Încredere declarată de sursă',
    similarity: 'Asemănare raportată · nu echivalență',
    brandClaim: 'Inspirație declarată de marcă',
    pending: 'Asemănarea este încă în cercetare',
    notes: 'Note',
    noResults: 'Niciun rezultat în această selecție.',
    previous: 'Înapoi',
    next: 'Înainte',
    back: 'Toate casele selectate',
    page: 'Pagina',
    art: 'Ilustrație editorială originală; nu este o imagine oficială a mărcii.',
    reviewStatus: 'Starea verificării',
  },
  needToKnow: {
    kicker: 'De știut',
    title: 'Articole din secțiunea De știut',
    intro:
      'Explorează cunoștințe structurate despre parfumuri, organizate pe categorii.',
    sectionLabel: 'Secțiune',
    nowReading: 'Citești acum',
    articleCount: (count) => `${count} articole`,
    sections: {
      'scent-fundamentals': {
        title: 'Noțiuni olfactive de bază',
        description: 'Principiile esențiale care explică modul în care parfumurile sunt structurate și interpretate.',
        intro: 'Construiește o bază solidă înainte de a evalua performanța, valoarea sau categoria de brand.',
        articles: [
          {
            title: 'Note de vârf, de inimă și de bază',
            subtitle: 'Un parfum este o călătorie',
            paragraphs: [
              'Majoritatea parfumurilor evoluează în etape, în loc să miroasă la fel de la început până la sfârșit.',
              'Notele de vârf sunt prima impresie și sunt de obicei luminoase și efemere.',
              'Notele de inimă definesc caracterul central după ce deschiderea se estompează.',
              'Notele de bază oferă profunzime și modelează adesea parfumul de durată de pe piele.',
            ],
          },
          {
            title: 'Înțelegerea concentrațiilor',
            subtitle: 'EDT, EDP și Parfum în context',
            paragraphs: [
              'Concentrația indică aproximativ cantitatea de material aromatic dizolvat în alcool, dar nu garantează singură performanța.',
              'Designul formulei, calitatea ingredientelor, chimia pielii și clima pot influența performanța mai mult decât eticheta de concentrație.',
              'Unele EDT-uri depășesc multe Parfum-uri, în funcție de compoziție.',
            ],
            bullets: [
              'Eau Fraiche: 1-3%',
              'Eau de Cologne (EDC): 2-5%',
              'Eau de Toilette (EDT): 5-15%',
              'Eau de Parfum (EDP): 15-20%',
              'Parfum / Extrait: 20-40%',
            ],
            callout:
              'Mit: o concentrație mai mare înseamnă întotdeauna performanță mai puternică.\nRealitate: arhitectura formulei contează mai mult decât eticheta.',
          },
          {
            title: 'Ce este un acord?',
            subtitle: 'Cărămizile compoziției',
            paragraphs: [
              'Un acord este un amestec de materiale care creează o impresie olfactivă recognoscibilă, precum pielea, ambra, tutunul sau aerul marin.',
              'Multe acorduri sunt iluzii de compoziție și nu există ca material natural unic.',
              'Înțelegerea acordurilor ajută să explici de ce piramidele de note și percepția olfactivă nu coincid întotdeauna literal.',
            ],
          },
          {
            title: 'Ingrediente naturale vs sintetice',
            subtitle: 'Ambele sunt esențiale în parfumeria modernă',
            paragraphs: [
              'Materialele naturale pot aduce bogăție și textură, în timp ce cele sintetice îmbunătățesc consistența, stabilitatea și libertatea creativă.',
              'Majoritatea parfumurilor de înaltă calitate combină ambele abordări.',
              'Calitatea este dată de creativitatea și echilibrul formulei, nu de un simplu raport natural/sintetic.',
            ],
          },
        ],
      },
      'application-technique': {
        title: 'Tehnica de aplicare',
        description: 'Cum să aplici parfumul corect pentru o proiecție elegantă și o purtare mai consecventă.',
        intro: 'Folosește aceste practici pentru a îmbunătăți comportamentul parfumului fără a exagera cu pulverizările.',
        articles: [
          {
            title: 'Cum să aplici corect parfumul',
            subtitle: 'Mai puțin înseamnă adesea mai mult',
            paragraphs: [
              'Aplică pe punctele de puls, precum gâtul, pieptul și încheieturile, pentru ca această căldură a corpului să ajute difuzia pe parcursul zilei.',
              'Țintește spre un siaj care se lasă descoperit, nu spre saturarea încăperii.',
            ],
            bullets: [
              'Parfumuri fresh: 4-6 pulverizări',
              'Parfumuri versatile: 3-5 pulverizări',
              'Parfumuri puternice: 2-4 pulverizări',
            ],
          },
          {
            title: 'Nu freca după pulverizare',
            subtitle: 'Lasă deschiderea să se dezvolte natural',
            paragraphs: [
              'Frecarea încheieturilor crește fricțiunea și poate afecta percepția notelor de vârf.',
              'Cea mai bună metodă e simplă: pulverizează și lasă parfumul să se usuce natural.',
            ],
          },
          {
            title: 'Plasarea bate cantitatea',
            subtitle: 'Strategie de aplicare înainte de mai multe pulverizări',
            paragraphs: [
              'Dublarea pulverizărilor rareori dublează durata și adesea doar crește intensitatea.',
              'Plasarea strategică oferă de obicei o proiecție mai curată și mai mult confort decât excesul.',
            ],
          },
        ],
      },
      'testing-selection': {
        title: 'Testare și selecție',
        description: 'Un cadru practic pentru a testa parfumuri și a cumpăra cu încredere.',
        intro: 'Evaluează metodic pentru a evita cumpărăturile impulsive și regretele de colecționar.',
        articles: [
          {
            title: 'Cum să testezi un parfum',
            subtitle: 'Evaluează evoluția completă',
            paragraphs: [
              'Nu judeca un parfum doar după primele minute; multe formule se transformă semnificativ pe parcursul purtării.',
              'Ori de câte ori poți, testează-l o zi întreagă înainte de a cumpăra.',
            ],
            bullets: [
              'Deschidere: 0-15 minute',
              'Inimă: 30-120 minute',
              'Drydown: 3-8 ore',
            ],
          },
          {
            title: 'Bandă de hârtie vs piele',
            subtitle: 'Două instrumente, două scopuri',
            paragraphs: [
              'Folosește benzile de testare pentru comparații rapide și o primă orientare.',
              'Folosește testarea pe piele pentru durată, proiecție și interacțiunea cu chimia ta.',
              'Nu lua niciodată decizia finală de cumpărare doar pe baza benzii de testare.',
            ],
          },
          {
            title: 'Mostră înainte de sticla întreagă',
            subtitle: 'Redu riscul și crește rata de reușită',
            paragraphs: [
              'Decanturile și mostrele dezvăluie comportamentul real la purtare mai bine decât impresiile din magazin.',
              'Un proces structurat de tip „întâi mostra” reduce greșelile costisitoare de cumpărare pe nevăzute.',
            ],
          },
          {
            title: 'Nu există un cel mai bun parfum universal',
            subtitle: 'Cel mai bun parfum este personal',
            paragraphs: [
              'Preferințele personale, clima, stilul de viață și asocierile emoționale decid succesul unui parfum mai mult decât hype-ul sau clasamentele.',
              'Scopul nu este nota cea mai mare. Scopul este potrivirea cea mai bună cu propriul tău ADN olfactiv.',
            ],
          },
        ],
      },
      'performance-science': {
        title: 'Știința performanței',
        description: 'Înțelege proiecția, durata, limitele percepției și comportamentul sezonier.',
        intro: 'Separă miturile de comportamentul măsurabil atunci când judeci performanța unui parfum.',
        articles: [
          {
            title: 'Proiecție vs durată',
            subtitle: 'Măsuri diferite, semnificații diferite',
            paragraphs: [
              'Proiecția descrie distanța la care parfumul radiază de pe piele, în timp ce durata măsoară timpul total în care rămâne perceptibil.',
              'Un parfum poate proiecta puternic și dispărea repede, poate rezista mult cu proiecție redusă sau poate excela în ambele dimensiuni.',
            ],
          },
          {
            title: 'De ce nu îți mai simți propriul parfum',
            subtitle: 'Oboseala olfactivă explicată',
            paragraphs: [
              'Expunerea continuă face creierul să filtreze semnalele olfactive familiare.',
              'Faptul că nu mai observi un parfum nu dovedește că a dispărut. Ceilalți îl pot percepe în continuare clar.',
            ],
          },
          {
            title: 'Variații sezoniere de performanță',
            subtitle: 'Temperatura schimbă totul',
            paragraphs: [
              'Căldura amplifică adesea proiecția și strălucirea, în timp ce frigul poate atenua proiecția și accentua notele dense.',
              'Același parfum poate părea complet diferit vara față de iarnă.',
            ],
          },
          {
            title: 'De ce parfumurile miros diferit pe fiecare',
            subtitle: 'Chimia pielii și mediul',
            paragraphs: [
              'Hidratarea, temperatura pielii, clima și uleiurile naturale influențează atât percepția, cât și performanța.',
              'Testarea pe propria piele este întotdeauna mai de încredere decât bazarea exclusiv pe recenzii.',
            ],
          },
        ],
      },
      'formula-evolution': {
        title: 'Evoluția formulelor',
        description: 'Cum se schimbă parfumurile în timp prin învechire, reformulare și variabile de producție.',
        intro: 'Înțelege de ce două sticle pot diferi și cum să protejezi calitatea pe termen lung.',
        articles: [
          {
            title: 'De ce sunt reformulate parfumurile',
            subtitle: 'De ce favoritele se schimbă uneori',
            paragraphs: [
              'Reformulările au loc din motive de reglementare, siguranță, aprovizionare, costuri și strategie.',
              'Unele schimbări sunt subtile, altele pot altera identitatea în mod semnificativ.',
            ],
            bullets: [
              'Restricții privind ingredientele',
              'Reglementări de siguranță',
              'Penurii de aprovizionare',
              'Variații ale costurilor materialelor',
              'Schimbări de strategie de brand',
            ],
          },
          {
            title: 'Variația între loturi',
            subtitle: 'De ce sticlele pot diferi ușor',
            paragraphs: [
              'Micile diferențe între loturi pot proveni din variația materialelor, schimbările de furnizori și ajustările de producție.',
              'Majoritatea diferențelor sunt mici și devin evidente mai ales în comparația directă, una lângă alta.',
            ],
          },
          {
            title: 'Macerarea și învechirea în sticlă',
            subtitle: 'Schimbări subtile în timp',
            paragraphs: [
              'După deschidere, oxigenul și timpul pot rotunji unele compoziții, deși schimbările dramatice sunt rare.',
              'Practicile corecte de depozitare contează de regulă mai mult decât încercările deliberate de macerare.',
            ],
          },
          {
            title: 'Cum să depozitezi corect parfumurile',
            subtitle: 'Protejează-ți colecția',
            paragraphs: [
              'Căldura, lumina, umiditatea și expunerea excesivă la aer accelerează degradarea.',
              'Păstrează sticlele în locuri răcoroase, uscate și întunecate, cu temperaturi stabile.',
              'Sertarele, dulapurile și vitrinele sunt de obicei mai sigure decât băile.',
            ],
          },
          {
            title: 'De ce sticlele vintage miros diferit',
            subtitle: 'Un instantaneu dintr-o altă epocă',
            paragraphs: [
              'Sticlele vintage pot diferi din cauza formulelor istorice, a restricțiilor de ingrediente și a evoluției materialelor.',
              'Ele dezvăluie adesea stiluri mai rar întâlnite în lansările moderne.',
            ],
          },
        ],
      },
      'market-reality': {
        title: 'Realitatea pieței',
        description: 'Treci dincolo de presupunerile de marketing și evaluează calitatea cu criterii mai bune.',
        intro: 'Concentrează-te pe calitatea compoziției și pe potrivirea personală, nu pe etichete, hype și prețuri.',
        articles: [
          {
            title: 'Preț vs calitate',
            subtitle: 'Scump nu înseamnă automat mai bun',
            paragraphs: [
              'Prețul poate reflecta brandingul, ambalajul, raritatea și poziționarea la fel de mult ca și calitatea olfactivă.',
              'Multe parfumuri accesibile le depășesc pe cele scumpe în versatilitate, plăcere și potrivire personală.',
            ],
          },
          {
            title: 'Nișă vs designer',
            subtitle: 'Calitatea există în ambele lumi',
            paragraphs: [
              'Nișa și designerul sunt categorii comerciale, nu garanții de calitate.',
              'În fiecare categorie există parfumuri excelente, dar și unele ușor de uitat.',
              'Judecă parfumul în sine, nu familia etichetei.',
            ],
          },
          {
            title: 'Puterea nu înseamnă calitate',
            subtitle: 'Proiecția puternică este doar o măsură',
            paragraphs: [
              'O proiecție ridicată poate fi utilă, dar calitatea depinde și de echilibru, creativitate, structură și evoluție.',
              'Unele dintre cele mai respectate parfumuri sunt intime, nu zgomotoase.',
            ],
          },
          {
            title: 'Complexitatea nu este numărul de note',
            subtitle: 'Structura contează mai mult decât listele lungi',
            paragraphs: [
              'O listă lungă de note nu garantează profunzime.',
              'Adevărata complexitate vine din acorduri stratificate, contraste, tranziții și dezvoltare în timp.',
            ],
          },
          {
            title: 'Etichetele de gen sunt marketing',
            subtitle: 'Poartă ce îți place',
            paragraphs: [
              'Majoritatea notelor esențiale apar atât în lansările așa-zis masculine, cât și în cele feminine.',
              'Gustul tău personal este mai util decât etichetele de public de pe cutie.',
            ],
          },
        ],
      },
    },
  },
  perfumers: {
    directory: {
      eyebrow: 'TOP Parfumieri', count: (shown, total) => `${shown} din ${total} parfumieri`,
      intro: 'Descoperă oamenii din spatele parfumurilor remarcabile, abordările lor creative și creațiile reprezentative.',
      search: 'Caută parfumier', placeholder: 'Nume parfumier', topCreations: 'Creații în top',
      all: 'Toți parfumierii', sort: 'Sortează după', name: 'Nume', view: 'Vezi profilul',
      portrait: (name) => `Portretul parfumierului ${name}`,
      photoSource: 'Sursa fotografiei', portraitUnavailable: 'Portret indisponibil',
      veryHigh: 'Creator cu recurență foarte ridicată', high: 'Creator cu recurență ridicată', recurrent: 'Creator recurent',
      creations: 'Creații în primele 33%', examples: 'Exemple din catalog', empty: 'Nu am găsit parfumieri pentru această căutare.',
      profileRank: (rank) => `Profil parfumier · locul ${rank}`,
      biographySource: 'Sursa biografiei și a informațiilor', credited: 'Parfumuri creditate',
      examplesNote: 'Exemple din catalog; fiecare co-creator este creditat o dată pentru fiecare parfum distinct.',
      methodTitle: 'Cum calculăm clasificarea', method: 'Metoda OlfactiveDNA',
      classification: 'Clasificare', classificationNote: 'Creatorii sunt ordonați după numărul de parfumuri distincte creditate în primele 33% ale scorului platformei.',
      formula: 'Formula scorului', formulaNote: '80% aprecierea comunității ajustată cu un reper de 50 de voturi spre mediana comunității sursă, plus 20% percentila popularității în aceeași comunitate.',
      sample: 'Eșantion și prag',
      sampleNote: (scored, cutoff, included) => `${scored} parfumuri aveau scor. Selectăm primele 33% (rotunjit în sus), păstrând toate egalitățile la pragul ${cutoff}: ${included} parfumuri se califică.`,
      credits: 'Creditarea parfumierilor', bands: 'Categorii de recurență',
      bandsNote: '15–24 creații: recurentă · 25–49: ridicată · 50+: foarte ridicată. Sunt categorii editoriale, nu premii pentru întreaga carieră.',
      rankingNote: (rank, count) => `Locul #${rank} între creatorii prezentați; egalitățile împart același loc. ${count} creații creditate în acest snapshot.`,
      snapshot: (date) => `Snapshot al catalogului: ${date}. Numărătorile nu sunt live și nu reprezintă întreaga carieră sau compatibilitatea cu ADN-ul tău.`,
    },
    kicker: 'Creatori de parfumuri',
    title: 'Parfumieri și ADN creativ',
    intro: 'Explorează stilurile de semnătură ale creatorilor și filosofiile lor de parfumerie.',
    iconicFragrances: 'Parfumuri iconice',
    clusters: {
      'FRESH ARCHITECTS': 'ARHITECȚII PROSPEȚIMII',
      'ORIENTAL SCULPTORS': 'SCULPTORI ORIENTALI',
      'FLORAL ARTISTS': 'ARTIȘTI FLORALI',
      'MODERN MOLECULAR DESIGNERS': 'DESIGNERI MOLECULARI MODERNI',
      'HERITAGE HOUSES': 'CASE CU TRADIȚIE',
    },
    profiles: {
      'Jean-Claude Ellena': {
        style: 'Transparență minimalistă, compoziții citrice aerate',
        philosophy: 'Mai puțin înseamnă mai mult',
      },
      'Francis Kurkdjian': {
        style: 'Lux modern, semnături identitare puternice',
        philosophy: 'Recognoscibilitate prin contrast',
      },
      'Olivier Creed': {
        style: 'Lux aristocratic și proaspăt',
        philosophy: 'Natura plus moștenirea',
      },
      'Alberto Morillas': {
        style: 'Prospețime modernă și curată',
        philosophy: 'Simplitatea perfectă',
      },
      'Dominique Ropion': {
        style: 'Structuri florale dense și senzuale',
        philosophy: 'Compoziții cu o coloană vertebrală solidă',
      },
      'Thierry Wasser': {
        style: 'Eleganța caldă Guerlain',
        philosophy: 'Parfumerie franceză atemporală',
      },
      'Pierre Montale': {
        style: 'Compoziții îndrăznețe cu accent oriental, proiecție intensă',
        philosophy: '„Mai mult înseamnă mai mult” în intensitatea materiilor prime',
      },
      'Roja Dove': {
        style: 'Parfumerie britanică ultra-lux, amestecuri extrem de opulente',
        philosophy: 'Rafinament absolut și exces în armonie',
      },
      'Serge Lutens': {
        style: 'Compoziții artistice, întunecate, neconvenționale',
        philosophy: 'Parfumul ca poveste și emoție',
      },
      'Kilian Hennessy': {
        style: 'Lux senzual, compoziții inspirate de viața de noapte',
        philosophy: 'Nu fi timid, fii captivant',
      },
      'David Le Goff': {
        style: 'Prospețime acvatic-minerală modernă',
        philosophy: 'Eleganță modernă și curată, cu transparență aerată',
      },
      Houbigant: {
        style: 'Parfumerie franceză istorică cu reinterpretări moderne, florale elegante și structuri lemnoase rafinate',
        philosophy: 'Tradiția șlefuită prin măiestria modernă',
      },
    },
  },
};

export default articles;
