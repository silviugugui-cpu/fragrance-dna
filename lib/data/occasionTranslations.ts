import type { Locale } from "../i18n/config";
import { occasionsPage, type Occasion } from "./occasions";

type GuideText = { title: string; summary: string; guidance: string; applicationTip: string; imageAlt: string };
type Translation = [title: string, summary: string, guidance: string, applicationTip: string];
const translations: Record<Exclude<Locale, "en" | "ro">, Translation[]> = {
  fr: [
    ["Au quotidien", "Des parfums faciles à porter pour les journées ordinaires et les sorties décontractées.", "Privilégiez des compositions polyvalentes, fraîches, propres, douces ou discrètement florales, adaptées aux changements de programme.", "Adaptez la quantité à l'espace dans lequel vous évoluez."],
    ["Travail et études", "Des choix attentionnés pour les bureaux, les cours et les espaces partagés.", "Recherchez un profil équilibré : fraîcheur verte, bois raffinés, musc doux ou fleurs discrètes. Une application légère respecte les espaces communs.", "Appliquez avec discrétion avant les réunions et les cours."],
    ["Rendez-vous et moments intimes", "Des parfums personnels pour les dîners et les conversations rapprochées.", "Musc doux, fleurs expressives, ambre chaud ou gourmand délicat peuvent créer une impression intime. Choisissez un parfum que vous aimez : aucune recette n'est universelle.", "Pour un dîner, gardez une application agréable à courte distance."],
    ["Événements et cérémonies", "Des options raffinées pour les mariages, les réceptions, le théâtre et les dîners habillés.", "Les territoires boisés élégants, cuir, ambrés, frais raffinés ou floraux accompagnent une tenue formelle. L'élégance ne nécessite pas une forte intensité.", "Tenez compte du lieu et appliquez avec retenue lorsque les sièges sont proches."],
    ["Fêtes et sorties nocturnes", "Des choix expressifs pour les anniversaires, les soirées et la danse.", "Un profil gourmand, tabac, ambré ou floral riche apporte chaleur et caractère. Laissez le contexte guider la quantité, sans chercher à dominer la pièce.", "Même un parfum distinctif mérite une application mesurée dans la foule."],
    ["Plein air et journées chaudes", "Des profils frais pour les promenades et les déjeuners au soleil.", "Explorez les agrumes frais, la fraîcheur verte, les compositions fraîches raffinées et le musc doux. Les parfums citriques ou aquatiques ne se comportent pas tous de la même façon.", "Par temps chaud, restez modéré et réappliquez seulement si nécessaire."],
    ["Voyages et week-ends", "Des parfums adaptables pour les escapades et les programmes spontanés.", "Les profils frais, verts et musqués discrets passent de l'exploration en journée à une soirée détendue. Comparez les notes réellement présentes dans chaque composition.", "Choisissez un format compact et étanche, adapté à vos activités."],
    ["Soirées douillettes et froid", "Des profils enveloppants pour les soirées calmes et les journées d'hiver.", "Explorez les territoires ambrés, miel-tabac, gourmands riches et boisés élégants. Vanille, tonka, résines, tabac, bois et épices offrent des pistes à rechercher dans les compositions.", "Dans une pièce chauffée, équilibrez la richesse du parfum avec une petite quantité."],
  ],
  de: [
    ["Alltag und Erledigungen", "Unkomplizierte Düfte für gewöhnliche Tage und lockere Unternehmungen.", "Vielseitige, frische, saubere, weiche oder dezent blumige Kompositionen passen zu wechselnden Plänen.", "Passen Sie die Menge an die Räume an, in denen Sie sich aufhalten."],
    ["Arbeit und Lernen", "Rücksichtsvolle Duftwahl für Büro, Unterricht und gemeinsame Arbeitsräume.", "Grüne Frische, edle Hölzer, weicher Moschus oder dezente Blüten wirken ausgewogen. In gemeinsam genutzten Räumen ist weniger oft angenehmer.", "Tragen Sie vor Besprechungen und Unterricht zurückhaltend auf."],
    ["Dates und Nähe", "Persönliche Düfte für Abendessen und vertraute Gespräche.", "Weicher Moschus, ausdrucksstarke Blüten, warmer Amber oder sanfte Gourmandnoten können intim wirken. Entscheidend ist Ihr Geschmack, nicht eine allgemeine Duftregel.", "Wählen Sie für Gespräche aus der Nähe eine ausgewogene Menge."],
    ["Festliche Anlässe und Zeremonien", "Edle Optionen für Hochzeiten, Empfänge, Theater und festliche Abendessen.", "Elegant-holzige, ledrige, ambrige, edel-frische oder blumige Duftwelten ergänzen formelle Kleidung. Eleganz muss nicht laut sein.", "Berücksichtigen Sie den Veranstaltungsort und eng beieinanderliegende Sitzplätze."],
    ["Feiern und Ausgehen", "Ausdrucksstarke Düfte für Geburtstage, Partys und Tanz.", "Reichere Gourmand-, Tabak-, Amber- oder Blütenprofile bringen Wärme und Charakter. Die Situation bestimmt die Menge, nicht der Wunsch, den Raum zu überstrahlen.", "Auch markante Düfte lassen sich in vollen Räumen sparsam tragen."],
    ["Draußen und warme Tage", "Frische Profile für Spaziergänge und Essen im Freien.", "Frische Zitrusnoten, grüne Frische, edle Frische und weicher Moschus bieten gute Ausgangspunkte. Zitrische und aquatische Düfte tragen sich nicht alle gleich.", "Bei Hitze maßvoll auftragen und nur bei Bedarf nachlegen."],
    ["Reisen und Wochenenden", "Anpassungsfähige Düfte für Kurzreisen und spontane Pläne.", "Frische, grüne oder hautnahe Moschusprofile begleiten den Tag und den entspannten Abend. Vergleichen Sie die tatsächlich enthaltenen Noten.", "Wählen Sie ein kompaktes, auslaufsicheres Format und ein vielseitiges Profil."],
    ["Gemütliche Abende und Kälte", "Geborgene Duftprofile für ruhige Abende und Wintertage.", "Amber, Honig-Tabak, reiche Gourmands und elegante Hölzer laden zum Entdecken ein. Vanille, Tonka, Harze, Tabak, Hölzer und Gewürze sind mögliche Anhaltspunkte.", "In warmen Innenräumen die Duftfülle durch eine zurückhaltende Menge ausgleichen."],
  ],
  es: [
    ["Día a día y recados", "Perfumes fáciles de llevar para la rutina y los planes informales.", "Busca composiciones versátiles, frescas, limpias, suaves o discretamente florales que acompañen los cambios de planes.", "Adapta la cantidad al espacio en el que vas a estar."],
    ["Trabajo y estudio", "Opciones consideradas para oficinas, aulas y espacios compartidos.", "Un perfil equilibrado puede combinar frescor verde, maderas refinadas, almizcle suave o flores discretas. En espacios comunes, una aplicación ligera suele ser más agradable.", "Aplica con discreción antes de reuniones y clases."],
    ["Citas y momentos cercanos", "Perfumes personales para cenas y conversaciones íntimas.", "El almizcle suave, las flores expresivas, el ámbar cálido o un gourmand delicado pueden crear intimidad. Elige algo que disfrutes: no existe un perfume universal para una cita.", "Para una cena, busca una aplicación agradable a corta distancia."],
    ["Eventos formales y ceremonias", "Opciones refinadas para bodas, recepciones, teatro y cenas formales.", "Los territorios amaderados elegantes, cuero, ámbar, frescos refinados y florales complementan la ropa formal. La elegancia no necesita ser intensa.", "Considera el lugar y aplica con moderación si los asientos están próximos."],
    ["Celebraciones y noches de fiesta", "Opciones expresivas para cumpleaños, fiestas y baile.", "Un gourmand rico, tabaco, ámbar o flores aportan calidez y carácter. Deja que el contexto guíe la cantidad, sin intentar dominar la sala.", "En lugares concurridos, incluso un perfume distintivo admite una aplicación medida."],
    ["Aire libre y días cálidos", "Perfiles frescos para paseos, jardines y comidas al aire libre.", "Los cítricos frescos, el frescor verde, los frescos refinados y el almizcle suave son buenos puntos de partida. No todos los perfumes cítricos o acuáticos se comportan igual.", "Con calor, modera la cantidad y reaplica solo si hace falta."],
    ["Viajes y fines de semana", "Perfumes adaptables para escapadas y planes espontáneos.", "Los perfiles frescos, verdes o de almizcle cercano a la piel pasan del paseo diurno a una noche relajada. Compara las notas realmente presentes en cada perfume.", "Elige un formato compacto, resistente a fugas y un perfil versátil."],
    ["Noches acogedoras y frío", "Perfiles envolventes para noches tranquilas y planes de invierno.", "Explora ámbar, miel-tabaco, gourmand rico y maderas elegantes. Vainilla, tonka, resinas, tabaco, maderas y especias son pistas para buscar en las composiciones.", "En una habitación cálida, equilibra la riqueza del perfume con poca cantidad."],
  ],
  it: [
    ["Quotidianità e commissioni", "Profumi facili da indossare nella routine e nei programmi informali.", "Scegli composizioni versatili, fresche, pulite, morbide o discretamente floreali, adatte a programmi che cambiano.", "Adatta la quantità allo spazio in cui ti troverai."],
    ["Lavoro e studio", "Scelte attente per uffici, aule e spazi condivisi.", "Cerca un profilo equilibrato: freschezza verde, legni raffinati, muschio delicato o fiori discreti. Negli spazi comuni è spesso preferibile un'applicazione leggera.", "Applica con discrezione prima di riunioni e lezioni."],
    ["Appuntamenti e intimità", "Profumi personali per cene e conversazioni ravvicinate.", "Muschio morbido, fiori espressivi, ambra calda o gourmand delicati possono creare intimità. Scegli ciò che ami: non esiste un profumo universale per gli appuntamenti.", "Per una cena, mantieni una quantità piacevole anche da vicino."],
    ["Eventi formali e cerimonie", "Opzioni raffinate per matrimoni, ricevimenti, teatro e cene eleganti.", "Territori legnosi eleganti, cuoio, ambra, freschi raffinati e floreali accompagnano l'abito formale. L'eleganza non richiede intensità elevata.", "Considera il luogo e applica con moderazione quando i posti sono ravvicinati."],
    ["Feste e serate fuori", "Scelte espressive per compleanni, feste e ballo.", "Gourmand ricchi, tabacco, ambra e fiori possono offrire calore e carattere. Lascia che sia il contesto a guidare la quantità, senza voler dominare la stanza.", "Anche un profumo distintivo va dosato nei locali affollati."],
    ["All'aperto e giornate calde", "Profili freschi per passeggiate, giardini e pranzi all'aperto.", "Agrumi freschi, freschezza verde, composizioni fresche raffinate e muschio morbido sono buoni punti di partenza. I profumi agrumati o acquatici non si comportano tutti allo stesso modo.", "Con il caldo, dosa la quantità e riapplica soltanto se necessario."],
    ["Viaggi e fine settimana", "Profumi adattabili a brevi viaggi e programmi spontanei.", "Profili freschi, verdi o muschiati vicini alla pelle passano dalle esplorazioni diurne alle serate rilassate. Confronta le note realmente presenti nelle composizioni.", "Scegli un formato compatto e resistente alle perdite, con un profilo versatile."],
    ["Serate accoglienti e freddo", "Profili avvolgenti per serate tranquille e giornate invernali.", "Esplora ambra, miele-tabacco, gourmand ricchi e legni eleganti. Vaniglia, tonka, resine, tabacco, legni e spezie sono possibili indizi nelle composizioni.", "In una stanza riscaldata, bilancia la ricchezza del profumo con una piccola quantità."],
  ],
  pt: [
    ["Dia a dia e afazeres", "Perfumes fáceis de usar na rotina e em planos informais.", "Procure composições versáteis, frescas, limpas, suaves ou discretamente florais, adaptadas a mudanças de planos.", "Adapte a quantidade ao espaço onde vai estar."],
    ["Trabalho e estudo", "Escolhas atentas para escritórios, aulas e espaços partilhados.", "Procure equilíbrio: frescura verde, madeiras refinadas, almíscar suave ou flores discretas. Nos espaços comuns, uma aplicação leve costuma ser mais agradável.", "Aplique com discrição antes de reuniões e aulas."],
    ["Encontros e momentos próximos", "Perfumes pessoais para jantares e conversas íntimas.", "Almíscar suave, flores expressivas, âmbar quente ou gourmand delicado podem criar intimidade. Escolha algo de que gosta: não existe um perfume universal para encontros.", "Para um jantar, mantenha uma quantidade agradável de perto."],
    ["Eventos formais e cerimónias", "Opções refinadas para casamentos, receções, teatro e jantares formais.", "Territórios amadeirados elegantes, couro, âmbar, frescos refinados e florais complementam o traje formal. A elegância não precisa de ser intensa.", "Considere o local e aplique com moderação quando os lugares são próximos."],
    ["Celebrações e saídas à noite", "Escolhas expressivas para aniversários, festas e dança.", "Gourmand rico, tabaco, âmbar ou flores oferecem calor e carácter. Deixe o contexto orientar a quantidade, sem procurar dominar a sala.", "Em locais cheios, até um perfume distinto pode ser aplicado com medida."],
    ["Ar livre e dias quentes", "Perfis frescos para passeios, jardins e almoços ao ar livre.", "Cítricos frescos, frescura verde, frescos refinados e almíscar suave são bons pontos de partida. Os perfumes cítricos ou aquáticos não se comportam todos da mesma forma.", "Com calor, modere a quantidade e reaplique apenas se necessário."],
    ["Viagens e fins de semana", "Perfumes adaptáveis a escapadelas e planos espontâneos.", "Perfis frescos, verdes ou de almíscar próximo da pele acompanham a exploração diurna e a noite descontraída. Compare as notas realmente presentes nas composições.", "Escolha um formato compacto, resistente a fugas, com um perfil versátil."],
    ["Noites acolhedoras e frio", "Perfis envolventes para noites tranquilas e dias de inverno.", "Explore âmbar, mel-tabaco, gourmand rico e madeiras elegantes. Baunilha, tonka, resinas, tabaco, madeiras e especiarias são pistas possíveis nas composições.", "Numa sala aquecida, equilibre a riqueza do perfume com uma pequena quantidade."],
  ],
};

const ui = {
  en: ["Occasions", "When to Wear Perfume", "Find a fragrance for every moment", "Season", "Setting", "Time of day", "Olfactive territories", "All", "Look for", "Example notes", "DNA character", "Wearing tip", "No occasions match these filters.", "Reset filters", "Explore the fragrance catalog", "Explore territories", "Spring", "Summer", "Autumn", "Winter", "Indoors", "Outdoors", "Day", "Evening", "These are starting points, not rules. Your taste, your skin and the people around you matter.", "Browse the catalog and compare individual compositions; this guide does not assign perfumes to occasions."],
  ro: ["Ocazii de purtare", "Când purtăm parfumul", "Descoperă un parfum pentru fiecare moment", "Anotimp", "Spațiu", "Momentul zilei", "Teritorii olfactive", "Toate", "Ce să cauți", "Exemple de note", "Caracter ADN", "Sfat de purtare", "Nicio ocazie nu corespunde filtrelor.", "Resetează filtrele", "Explorează catalogul de parfumuri", "Explorează teritoriile", "Primăvară", "Vară", "Toamnă", "Iarnă", "În interior", "În aer liber", "Zi", "Seară", "Sunt puncte de pornire, nu reguli. Gustul tău, pielea ta și cei din jur contează.", "Explorează catalogul și compară compozițiile individuale; acest ghid nu atribuie parfumuri ocaziilor."],
  fr: ["Occasions", "Quand porter un parfum", "Un parfum pour chaque moment", "Saison", "Lieu", "Moment", "Territoires olfactifs", "Tous", "À rechercher", "Exemples de notes", "Caractère ADN", "Conseil", "Aucune occasion ne correspond aux filtres.", "Réinitialiser", "Explorer le catalogue", "Explorer les territoires", "Printemps", "Été", "Automne", "Hiver", "Intérieur", "Extérieur", "Journée", "Soirée", "Des pistes, pas des règles. Vos goûts, votre peau et votre entourage comptent.", "Comparez les compositions dans le catalogue ; ce guide n'attribue pas les parfums aux occasions."],
  de: ["Anlässe", "Wann passt welcher Duft?", "Ein Duft für jeden Moment", "Jahreszeit", "Umgebung", "Tageszeit", "Duftwelten", "Alle", "Darauf achten", "Beispielnoten", "DNA-Charakter", "Tragetipp", "Keine Anlässe entsprechen diesen Filtern.", "Zurücksetzen", "Duftkatalog entdecken", "Duftwelten entdecken", "Frühling", "Sommer", "Herbst", "Winter", "Drinnen", "Draußen", "Tagsüber", "Abends", "Anregungen statt Regeln. Ihr Geschmack, Ihre Haut und Ihr Umfeld zählen.", "Vergleichen Sie einzelne Kompositionen im Katalog; dieser Ratgeber ordnet Düfte keinen Anlässen zu."],
  es: ["Ocasiones", "Cuándo llevar perfume", "Un perfume para cada momento", "Estación", "Entorno", "Momento del día", "Territorios olfativos", "Todos", "Qué buscar", "Ejemplos de notas", "Carácter ADN", "Consejo", "Ninguna ocasión coincide con los filtros.", "Restablecer", "Explorar el catálogo", "Explorar territorios", "Primavera", "Verano", "Otoño", "Invierno", "Interior", "Exterior", "Día", "Noche", "Son puntos de partida, no reglas. Tu gusto, tu piel y quienes te rodean importan.", "Compara las composiciones del catálogo; esta guía no asigna perfumes a las ocasiones."],
  it: ["Occasioni", "Quando indossare un profumo", "Un profumo per ogni momento", "Stagione", "Ambiente", "Momento", "Territori olfattivi", "Tutti", "Cosa cercare", "Esempi di note", "Carattere DNA", "Consiglio", "Nessuna occasione corrisponde ai filtri.", "Reimposta", "Esplora il catalogo", "Esplora i territori", "Primavera", "Estate", "Autunno", "Inverno", "Al chiuso", "All'aperto", "Giorno", "Sera", "Spunti, non regole. Contano il tuo gusto, la tua pelle e le persone vicine.", "Confronta le composizioni nel catalogo; questa guida non assegna profumi alle occasioni."],
  pt: ["Ocasiões", "Quando usar perfume", "Um perfume para cada momento", "Estação", "Ambiente", "Momento do dia", "Territórios olfativos", "Todos", "O que procurar", "Exemplos de notas", "Carácter ADN", "Conselho", "Nenhuma ocasião corresponde aos filtros.", "Repor filtros", "Explorar o catálogo", "Explorar territórios", "Primavera", "Verão", "Outono", "Inverno", "Interior", "Exterior", "Dia", "Noite", "Pontos de partida, não regras. O seu gosto, a sua pele e quem o rodeia contam.", "Compare composições no catálogo; este guia não atribui perfumes às ocasiões."],
} satisfies Record<Locale, string[]>;

export function getOccasionCopy(locale: Locale) {
  const [menu, title, hint, season, setting, time, territories, all, lookFor, notes, axes, tip, empty, reset, catalog, explore, spring, summer, fall, winter, indoors, outdoors, day, evening, notice, catalogNote] = ui[locale];
  return { menu, title, hint, season, setting, time, territories, all, lookFor, notes, axes, tip, empty, reset, catalog, explore, spring, summer, fall, winter, indoors, outdoors, day, evening, notice, catalogNote,
    intro: locale === "en" || locale === "ro" ? occasionsPage.intro[locale] : notice };
}

export function getOccasionText(item: Occasion, index: number, locale: Locale): GuideText {
  if (locale === "en" || locale === "ro") {
    return { title: item.title[locale], summary: item.summary[locale], guidance: item.guidance[locale], applicationTip: item.applicationTip[locale], imageAlt: item.imageAlt[locale] };
  }
  const text = translations[locale][index];
  if (!text) throw new Error(`Missing occasion translation: ${item.id}/${locale}`);
  const [title, summary, guidance, applicationTip] = text;
  return { title, summary, guidance, applicationTip, imageAlt: title };
}

const noteNames: Record<string, [string, string, string, string, string, string]> = {
  Bergamot: ["Bergamotă", "Bergamote", "Bergamotte", "Bergamota", "Bergamotto", "Bergamota"],
  Lemon: ["Lămâie", "Citron", "Zitrone", "Limón", "Limone", "Limão"],
  Mandarin: ["Mandarină", "Mandarine", "Mandarine", "Mandarina", "Mandarino", "Tangerina"],
  Neroli: ["Neroli", "Néroli", "Neroli", "Neroli", "Neroli", "Néroli"],
  "Green Tea": ["Ceai verde", "Thé vert", "Grüner Tee", "Té verde", "Tè verde", "Chá verde"],
  Lavender: ["Lavandă", "Lavande", "Lavendel", "Lavanda", "Lavanda", "Lavanda"],
  Musk: ["Mosc", "Musc", "Moschus", "Almizcle", "Muschio", "Almíscar"],
  Iris: ["Iris", "Iris", "Iris", "Iris", "Iris", "Íris"],
  Vetiver: ["Vetiver", "Vétiver", "Vetiver", "Vetiver", "Vetiver", "Vetiver"],
  Cedar: ["Cedru", "Cèdre", "Zeder", "Cedro", "Cedro", "Cedro"],
  Rose: ["Trandafir", "Rose", "Rose", "Rosa", "Rosa", "Rosa"],
  Jasmine: ["Iasomie", "Jasmin", "Jasmin", "Jazmín", "Gelsomino", "Jasmim"],
  "Orange Blossom": ["Floare de portocal", "Fleur d'oranger", "Orangenblüte", "Flor de azahar", "Fiore d'arancio", "Flor de laranjeira"],
  Vanilla: ["Vanilie", "Vanille", "Vanille", "Vainilla", "Vaniglia", "Baunilha"],
  Amber: ["Ambră", "Ambre", "Amber", "Ámbar", "Ambra", "Âmbar"],
  Sandalwood: ["Lemn de santal", "Santal", "Sandelholz", "Sándalo", "Sandalo", "Sândalo"],
  Incense: ["Tămâie", "Encens", "Weihrauch", "Incienso", "Incenso", "Incenso"],
  Leather: ["Piele", "Cuir", "Leder", "Cuero", "Cuoio", "Couro"],
  "Tonka Bean": ["Boabe de tonka", "Fève tonka", "Tonkabohne", "Haba tonka", "Fava tonka", "Fava tonka"],
  Tobacco: ["Tutun", "Tabac", "Tabak", "Tabaco", "Tabacco", "Tabaco"],
  Spices: ["Condimente", "Épices", "Gewürze", "Especias", "Spezie", "Especiarias"],
  Cherry: ["Cireașă", "Cerise", "Kirsche", "Cereza", "Ciliegia", "Cereja"],
  Grapefruit: ["Grepfrut", "Pamplemousse", "Grapefruit", "Pomelo", "Pompelmo", "Toranja"],
  Mint: ["Mentă", "Menthe", "Minze", "Menta", "Menta", "Hortelã"],
  Basil: ["Busuioc", "Basilic", "Basilikum", "Albahaca", "Basilico", "Manjericão"],
  "Green Notes": ["Note verzi", "Notes vertes", "Grüne Noten", "Notas verdes", "Note verdi", "Notas verdes"],
  Tea: ["Ceai", "Thé", "Tee", "Té", "Tè", "Chá"],
  "Aromatic Herbs": ["Ierburi aromatice", "Herbes aromatiques", "Aromatische Kräuter", "Hierbas aromáticas", "Erbe aromatiche", "Ervas aromáticas"],
  "Soft Woods": ["Lemn delicat", "Bois doux", "Sanfte Hölzer", "Maderas suaves", "Legni delicati", "Madeiras suaves"],
  Benzoin: ["Benzoină", "Benjoin", "Benzoe", "Benjuí", "Benzoino", "Benjoim"],
};
const noteLocaleIndex = { ro: 0, fr: 1, de: 2, es: 3, it: 4, pt: 5 } as const;

export function getOccasionNoteLabel(note: string, locale: Locale): string {
  if (locale === "en") return note;
  const labels = noteNames[note];
  if (!labels) throw new Error(`Missing occasion note translation: ${note}/${locale}`);
  return labels[noteLocaleIndex[locale]];
}
