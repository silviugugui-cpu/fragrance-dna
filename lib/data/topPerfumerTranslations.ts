import type { Locale } from "@/lib/i18n/config";
import type { TopPerfumerProfile } from "./topPerfumerProfiles";

type Translation = { bio: string; approach: string };
type TranslatedLocale = Exclude<Locale, "en" | "ro">;

const translations: Record<string, Record<TranslatedLocale, Translation>> = {
  "alberto-morillas": {
    fr: { bio: "Né et élevé à Séville, Alberto Morillas compte parmi les créateurs les plus présents dans les 33 % supérieurs de notre catalogue.", approach: "Il associe souvenirs sensoriels, ingrédients naturels et molécules de synthèse." },
    de: { bio: "Alberto Morillas wuchs in Sevilla auf und zählt zu den am häufigsten vertretenen Kreativen in den besten 33 % unseres Katalogs.", approach: "Er verbindet Sinneserinnerungen und naturinspirierte Techniken mit synthetischen Molekülen." },
    es: { bio: "Nacido y criado en Sevilla, Alberto Morillas es uno de los creadores más presentes en el 33 % superior de nuestro catálogo.", approach: "Combina recuerdos sensoriales y técnicas inspiradas en la naturaleza con moléculas sintéticas." },
    it: { bio: "Nato e cresciuto a Siviglia, Alberto Morillas è tra i creatori più presenti nel 33% superiore del nostro catalogo.", approach: "Unisce ricordi sensoriali e tecniche ispirate alla natura a molecole di sintesi." },
    pt: { bio: "Nascido e criado em Sevilha, Alberto Morillas é um dos criadores mais presentes nos 33% superiores do nosso catálogo.", approach: "Combina memórias sensoriais e técnicas inspiradas na natureza com moléculas sintéticas." },
  },
  "francois-demachy": {
    fr: { bio: "Originaire de Grasse, François Demachy a été parfumeur-créateur Dior de 2006 à 2021, signant de nombreuses créations pour la maison.", approach: "Il privilégie la qualité des matières premières et leur équilibre, dans le respect de l’identité olfactive de la maison." },
    de: { bio: "François Demachy stammt aus Grasse und war von 2006 bis 2021 Parfümeur-Kreativer bei Dior, wo er zahlreiche Düfte entwickelte.", approach: "Er betont die Qualität und Balance der Rohstoffe und bewahrt die Duftidentität des Hauses." },
    es: { bio: "Originario de Grasse, François Demachy fue perfumista-creador de Dior de 2006 a 2021 y desarrolló numerosas creaciones para la casa.", approach: "Prioriza la calidad y el equilibrio de las materias primas, manteniendo la identidad olfativa de la casa." },
    it: { bio: "Originario di Grasse, François Demachy è stato profumiere-creatore Dior dal 2006 al 2021, sviluppando numerose creazioni per la maison.", approach: "Privilegia qualità ed equilibrio delle materie prime, preservando l’identità olfattiva della maison." },
    pt: { bio: "Natural de Grasse, François Demachy foi perfumista-criador da Dior entre 2006 e 2021, desenvolvendo numerosas criações para a casa.", approach: "Privilegia a qualidade e o equilíbrio das matérias-primas, preservando a identidade olfativa da casa." },
  },
  "anne-flipo": {
    fr: { bio: "Anne Flipo est maître parfumeur et diplômée de l’ISIPCA. Nature, voyages, art, musique et gastronomie nourrissent sa curiosité.", approach: "Elle adapte sa palette et sa composition au récit de chaque projet plutôt qu’à une signature fixe." },
    de: { bio: "Anne Flipo ist Meisterparfümeurin und ISIPCA-Absolventin. Natur, Reisen, Kunst, Musik und Gastronomie nähren ihre Neugier.", approach: "Statt einer festen Signatur passt sie Palette und Komposition der Geschichte jedes Projekts an." },
    es: { bio: "Anne Flipo es maestra perfumista y graduada de ISIPCA. La naturaleza, los viajes, el arte, la música y la gastronomía nutren su curiosidad.", approach: "Adapta su paleta y composición a la historia de cada proyecto, sin seguir una firma fija." },
    it: { bio: "Anne Flipo è maestra profumiera e diplomata ISIPCA. Natura, viaggi, arte, musica e gastronomia alimentano la sua curiosità.", approach: "Adatta palette e composizione alla storia di ogni progetto, anziché seguire una firma fissa." },
    pt: { bio: "Anne Flipo é mestre perfumista e diplomada pelo ISIPCA. Natureza, viagens, arte, música e gastronomia alimentam a sua curiosidade.", approach: "Adapta a paleta e a composição à história de cada projeto, em vez de seguir uma assinatura fixa." },
  },
  "olivier-cresp": {
    fr: { bio: "Issu d’une famille ancrée à Grasse, Olivier Cresp est maître parfumeur chez dsm-firmenich et mentor de nouvelles générations.", approach: "Il recherche un concept clair et mémorable, puis le traduit en une composition lisible et marquante." },
    de: { bio: "Olivier Cresp stammt aus einer Familie mit Wurzeln in Grasse. Er ist Meisterparfümeur bei dsm-firmenich und Mentor neuer Generationen.", approach: "Er sucht ein klares, einprägsames Konzept und setzt es in eine ausdrucksstarke Komposition um." },
    es: { bio: "De una familia arraigada en Grasse, Olivier Cresp es maestro perfumista en dsm-firmenich y mentor de nuevas generaciones.", approach: "Busca un concepto claro y memorable y lo construye con impacto y claridad." },
    it: { bio: "Da una famiglia radicata a Grasse, Olivier Cresp è maestro profumiere presso dsm-firmenich e mentore di nuove generazioni.", approach: "Cerca un concetto chiaro e memorabile, traducendolo in una composizione incisiva e leggibile." },
    pt: { bio: "De uma família com raízes em Grasse, Olivier Cresp é mestre perfumista na dsm-firmenich e mentor de novas gerações.", approach: "Procura um conceito claro e memorável e transforma-o numa composição com impacto e clareza." },
  },
  "quentin-bisch": {
    fr: { bio: "Avant la parfumerie, Quentin Bisch a étudié le théâtre et les arts du spectacle. Ce parcours nourrit ses récits olfactifs.", approach: "Il aime les contrastes et les images expressives, souvent inspirées de la nature et des saisons." },
    de: { bio: "Quentin Bisch studierte vor der Parfümerie Theater und darstellende Kunst. Dieser Hintergrund prägt seine erzählerischen Duftkonzepte.", approach: "Ihn reizen Kontraste und ausdrucksvolle Duftbilder, oft inspiriert von Natur und Jahreszeiten." },
    es: { bio: "Antes de la perfumería, Quentin Bisch estudió teatro y artes escénicas. Esa trayectoria inspira sus conceptos narrativos.", approach: "Le atraen los contrastes y las imágenes olfativas expresivas, a menudo inspiradas en la naturaleza y las estaciones." },
    it: { bio: "Prima della profumeria, Quentin Bisch ha studiato teatro e arti performative. Questo percorso alimenta i suoi concetti narrativi.", approach: "È attratto da contrasti e immagini olfattive espressive, spesso ispirati alla natura e alle stagioni." },
    pt: { bio: "Antes da perfumaria, Quentin Bisch estudou teatro e artes do espetáculo. Esse percurso inspira os seus conceitos narrativos.", approach: "É atraído por contrastes e imagens olfativas expressivas, muitas vezes inspirados na natureza e nas estações." },
  },
  "francis-kurkdjian": {
    fr: { bio: "Francis Kurkdjian s’est fait connaître à 25 ans avec Le Male. Il a cofondé sa maison en 2009 et dirige la création des parfums Dior.", approach: "Il associe composition, projets artistiques et installations olfactives pour explorer émotion et mémoire." },
    de: { bio: "Francis Kurkdjian wurde mit 25 Jahren durch Le Male bekannt. Er gründete 2009 sein Haus mit und leitet die Parfumkreation bei Dior.", approach: "Er verbindet Komposition, Kunstprojekte und Duftinstallationen, um Emotion und Erinnerung zu erkunden." },
    es: { bio: "Francis Kurkdjian se dio a conocer a los 25 años con Le Male. Cofundó su casa en 2009 y dirige la creación de perfumes Dior.", approach: "Combina composición, proyectos artísticos e instalaciones olfativas para explorar emoción y memoria." },
    it: { bio: "Francis Kurkdjian è diventato noto a 25 anni con Le Male. Ha cofondato la sua maison nel 2009 e dirige la creazione dei profumi Dior.", approach: "Unisce composizione, progetti artistici e installazioni olfattive per esplorare emozioni e memoria." },
    pt: { bio: "Francis Kurkdjian tornou-se conhecido aos 25 anos com Le Male. Cofundou a sua casa em 2009 e dirige a criação de perfumes Dior.", approach: "Combina composição, projetos artísticos e instalações olfativas para explorar emoção e memória." },
  },
  "dominique-ropion": {
    fr: { bio: "Maître parfumeur IFF, Dominique Ropion a étudié la physique et travaillé en laboratoire avant de rejoindre IFF en 2000.", approach: "Il construit des structures audacieuses, associe des ingrédients de caractère et participe à la formation de nouveaux créateurs." },
    de: { bio: "IFF-Meisterparfümeur Dominique Ropion studierte Physik und arbeitete im Duftlabor, bevor er 2000 zu IFF kam.", approach: "Er verbindet markante Zutaten zu kühnen Strukturen und unterstützt die Ausbildung neuer Kreativer." },
    es: { bio: "Dominique Ropion es maestro perfumista de IFF. Estudió física y trabajó en un laboratorio antes de incorporarse a IFF en 2000.", approach: "Combina ingredientes de carácter en estructuras audaces y contribuye a formar nuevos creadores." },
    it: { bio: "Dominique Ropion è maestro profumiere IFF. Ha studiato fisica e lavorato in laboratorio prima di entrare in IFF nel 2000.", approach: "Combina ingredienti di carattere in strutture audaci e contribuisce alla formazione di nuovi creatori." },
    pt: { bio: "Dominique Ropion é mestre perfumista da IFF. Estudou física e trabalhou em laboratório antes de entrar na IFF em 2000.", approach: "Combina ingredientes de caráter em estruturas ousadas e contribui para formar novos criadores." },
  },
  "nathalie-lorson": {
    fr: { bio: "Nathalie Lorson est maître parfumeur chez dsm-firmenich. Elle a créé pour des maisons internationales et de nombreuses équipes de création.", approach: "Elle envisage la création comme un échange et privilégie des formules concises où chaque ingrédient joue un rôle clair." },
    de: { bio: "Nathalie Lorson ist Meisterparfümeurin bei dsm-firmenich. Sie hat für internationale Häuser und zahlreiche Kreativteams gearbeitet.", approach: "Sie versteht Kreation als Austausch und bevorzugt präzise Formeln, in denen jede Zutat eine klare Rolle hat." },
    es: { bio: "Nathalie Lorson es maestra perfumista en dsm-firmenich. Ha creado para casas internacionales y numerosos equipos de diseño.", approach: "Concibe la creación como un intercambio y prefiere fórmulas concisas donde cada ingrediente tiene un papel claro." },
    it: { bio: "Nathalie Lorson è maestra profumiera presso dsm-firmenich. Ha creato per maison internazionali e numerosi gruppi di design.", approach: "Vede la creazione come uno scambio e predilige formule concise dove ogni ingrediente ha un ruolo chiaro." },
    pt: { bio: "Nathalie Lorson é mestre perfumista na dsm-firmenich. Criou para casas internacionais e numerosas equipas de design.", approach: "Vê a criação como uma troca e prefere fórmulas concisas nas quais cada ingrediente tem um papel claro." },
  },
  "jean-claude-ellena": {
    fr: { bio: "Né dans une famille de parfumeurs à Grasse, Jean-Claude Ellena est connu pour ses compositions aériennes et son langage minimaliste.", approach: "Il soigne l’espace entre les ingrédients et l’expression limpide d’une idée ou d’une matière première." },
    de: { bio: "Jean-Claude Ellena wuchs in einer Parfümeurfamilie in Grasse auf. Bekannt ist er für luftige Kompositionen und eine minimalistische Duftsprache.", approach: "Er achtet auf den Raum zwischen Zutaten und den klaren Ausdruck einer Idee oder eines Rohstoffs." },
    es: { bio: "Nacido en una familia de perfumistas de Grasse, Jean-Claude Ellena es conocido por sus composiciones aéreas y lenguaje minimalista.", approach: "Cuida el espacio entre ingredientes y la expresión clara de una idea o materia prima." },
    it: { bio: "Nato in una famiglia di profumieri a Grasse, Jean-Claude Ellena è noto per composizioni ariose e un linguaggio minimalista.", approach: "Cura lo spazio tra gli ingredienti e l’espressione chiara di un’idea o materia prima." },
    pt: { bio: "Nascido numa família de perfumistas de Grasse, Jean-Claude Ellena é conhecido por composições arejadas e linguagem minimalista.", approach: "Cuida do espaço entre ingredientes e da expressão clara de uma ideia ou matéria-prima." },
  },
  "fabrice-pellegrin": {
    fr: { bio: "Issu d’une famille de parfumeurs de Grasse, Fabrice Pellegrin est maître parfumeur chez dsm-firmenich.", approach: "Il suit les ingrédients de la récolte à la composition et accorde une attention particulière aux matières naturelles." },
    de: { bio: "Fabrice Pellegrin stammt aus einer Parfümeurfamilie in Grasse und ist Meisterparfümeur bei dsm-firmenich.", approach: "Er begleitet Zutaten von der Ernte bis zur Komposition und widmet natürlichen Rohstoffen besondere Aufmerksamkeit." },
    es: { bio: "De una familia de perfumistas de Grasse, Fabrice Pellegrin es maestro perfumista en dsm-firmenich.", approach: "Sigue los ingredientes desde la cosecha hasta la composición y presta especial atención a las materias naturales." },
    it: { bio: "Da una famiglia di profumieri di Grasse, Fabrice Pellegrin è maestro profumiere presso dsm-firmenich.", approach: "Segue gli ingredienti dalla raccolta alla composizione, con particolare attenzione alle materie naturali." },
    pt: { bio: "De uma família de perfumistas de Grasse, Fabrice Pellegrin é mestre perfumista na dsm-firmenich.", approach: "Acompanha os ingredientes da colheita à composição e dedica especial atenção às matérias naturais." },
  },
  "bertrand-duchaufour": {
    fr: { bio: "Formé à Grasse, Bertrand Duchaufour a travaillé en indépendant pour de nombreuses maisons, explorant cultures, lieux et ingrédients du monde.", approach: "Ses compositions jouent souvent sur les contrastes et transforment les impressions de voyage en récits olfactifs." },
    de: { bio: "Der in Grasse ausgebildete Bertrand Duchaufour arbeitete unabhängig für zahlreiche Häuser und erkundete Kulturen, Orte und Zutaten weltweit.", approach: "Seine Kompositionen leben oft von Kontrasten und verwandeln Reiseeindrücke in Duftgeschichten." },
    es: { bio: "Formado en Grasse, Bertrand Duchaufour ha trabajado como independiente para muchas casas, explorando culturas, lugares e ingredientes.", approach: "Sus composiciones recurren a contrastes y convierten impresiones de viaje en historias olfativas." },
    it: { bio: "Formatosi a Grasse, Bertrand Duchaufour ha lavorato da indipendente per molte maison, esplorando culture, luoghi e ingredienti.", approach: "Le sue composizioni usano contrasti e trasformano impressioni di viaggio in racconti olfattivi." },
    pt: { bio: "Formado em Grasse, Bertrand Duchaufour trabalhou de forma independente para muitas casas, explorando culturas, lugares e ingredientes.", approach: "As suas composições recorrem a contrastes e transformam impressões de viagem em histórias olfativas." },
  },
  "daniela-andrier": {
    fr: { bio: "Daniela Andrier a étudié la philosophie à la Sorbonne avant la parfumerie. Elle est connue pour sa longue collaboration avec Prada.", approach: "Elle s’inspire d’associations inattendues de couleurs, d’objets et d’ingrédients rares ou familiers." },
    de: { bio: "Daniela Andrier studierte vor ihrer Parfümerieausbildung Philosophie an der Sorbonne. Bekannt ist sie für ihre langjährige Arbeit mit Prada.", approach: "Sie lässt sich von unerwarteten Verbindungen zwischen Farben, Objekten und seltenen oder vertrauten Zutaten inspirieren." },
    es: { bio: "Daniela Andrier estudió filosofía en la Sorbona antes de formarse en perfumería. Es conocida por su larga colaboración con Prada.", approach: "Se inspira en asociaciones inesperadas de colores, objetos e ingredientes raros o familiares." },
    it: { bio: "Daniela Andrier ha studiato filosofia alla Sorbona prima della profumeria. È nota per la lunga collaborazione con Prada.", approach: "Si ispira ad associazioni inattese di colori, oggetti e ingredienti rari o familiari." },
    pt: { bio: "Daniela Andrier estudou filosofia na Sorbonne antes da perfumaria. É conhecida pela longa colaboração com a Prada.", approach: "Inspira-se em associações inesperadas de cores, objetos e ingredientes raros ou familiares." },
  },
  "olivier-polge": {
    fr: { bio: "Olivier Polge est parfumeur-créateur de Chanel. Auparavant, il a travaillé pour des marques internationales et reçu des distinctions.", approach: "Il explore la palette et le patrimoine olfactif Chanel pour donner des expressions contemporaines aux repères de la maison." },
    de: { bio: "Olivier Polge ist Hausparfümeur bei Chanel. Zuvor arbeitete er für internationale Marken und erhielt Anerkennung für seine Kreationen.", approach: "Er entwickelt zeitgemäße Ausdrucksformen aus Chanels Duftpalette und Erbe und bewahrt dabei die Signaturen des Hauses." },
    es: { bio: "Olivier Polge es el perfumista-creador de Chanel. Antes trabajó para marcas internacionales y recibió reconocimiento por sus creaciones.", approach: "Trabaja con la paleta y el patrimonio olfativo Chanel para darles expresiones contemporáneas." },
    it: { bio: "Olivier Polge è il profumiere-creatore di Chanel. Prima ha lavorato con marchi internazionali, ottenendo riconoscimenti per le sue creazioni.", approach: "Lavora con la palette e il patrimonio olfattivo Chanel per trovare espressioni contemporanee dei suoi riferimenti." },
    pt: { bio: "Olivier Polge é o perfumista-criador da Chanel. Antes trabalhou com marcas internacionais e recebeu reconhecimento pelas suas criações.", approach: "Trabalha com a paleta e o património olfativo Chanel para encontrar expressões contemporâneas das suas referências." },
  },
  "christophe-raynaud": {
    fr: { bio: "Formé à l’ISIPCA, Christophe Raynaud a travaillé chez Drom et Symrise avant de rejoindre Givaudan en 2007.", approach: "Il compose des parfums de caractère et adapte son style à l’univers de chaque marque et à son public." },
    de: { bio: "Christophe Raynaud wurde an der ISIPCA ausgebildet und arbeitete bei Drom und Symrise, bevor er 2007 zu Givaudan kam.", approach: "Er komponiert ausdrucksstarke Düfte und passt seinen Stil der jeweiligen Marke und ihrem Publikum an." },
    es: { bio: "Formado en ISIPCA, Christophe Raynaud trabajó en Drom y Symrise antes de incorporarse a Givaudan en 2007.", approach: "Crea perfumes de carácter y adapta su estilo al universo de cada marca y a su público." },
    it: { bio: "Formatosi all’ISIPCA, Christophe Raynaud ha lavorato per Drom e Symrise prima di entrare in Givaudan nel 2007.", approach: "Crea profumi di carattere, adattando lo stile all’universo di ogni marchio e al suo pubblico." },
    pt: { bio: "Formado no ISIPCA, Christophe Raynaud trabalhou na Drom e na Symrise antes de entrar na Givaudan em 2007.", approach: "Cria perfumes de caráter, adaptando o estilo ao universo de cada marca e ao seu público." },
  },
  "marie-salamagne": {
    fr: { bio: "Marie Salamagne est maître parfumeur chez dsm-firmenich. Ses observations et carnets de voyage nourrissent son imaginaire.", approach: "Elle explore les contrastes de couleurs et d’ingrédients pour traduire une émotion ou une image en composition." },
    de: { bio: "Marie Salamagne ist Meisterparfümeurin bei dsm-firmenich. Beobachtungen und Reisenotizen nähren ihre Bild- und Gefühlswelt.", approach: "Sie erkundet Farb- und Zutatenkontraste, um Emotionen oder Bilder in erkennbare Kompositionen zu übersetzen." },
    es: { bio: "Marie Salamagne es maestra perfumista en dsm-firmenich. Sus observaciones y notas de viaje alimentan su imaginario.", approach: "Explora contrastes de colores e ingredientes para convertir una emoción o imagen en una composición reconocible." },
    it: { bio: "Marie Salamagne è maestra profumiera presso dsm-firmenich. Osservazioni e appunti di viaggio alimentano il suo immaginario.", approach: "Esplora contrasti di colori e ingredienti per tradurre un’emozione o un’immagine in una composizione riconoscibile." },
    pt: { bio: "Marie Salamagne é mestre perfumista na dsm-firmenich. As observações e notas de viagem alimentam o seu imaginário.", approach: "Explora contrastes de cores e ingredientes para transformar uma emoção ou imagem numa composição reconhecível." },
  },
};

export function getPerfumerText(profile: TopPerfumerProfile, locale: Locale): Translation {
  if (locale === "en" || locale === "ro") {
    return {
      bio: profile.bio[locale],
      approach: profile.approach[locale],
    };
  }
  const text = translations[profile.slug]?.[locale];
  if (!text) throw new Error(`Missing ${locale} perfumer translation: ${profile.slug}`);
  return text;
}
