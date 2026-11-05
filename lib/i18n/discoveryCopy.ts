import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const en = {
  seasonal: "Seasonal Cues",
  seasonalHelp: "Seasonal cues are estimated from a fragrance’s accords. Use them as a discovery guide; personal preference, weather and setting can change how a scent feels.",
  cueReason: "Matching accords",
  guide: "Territory Guide",
  affinities: "Your Territory Affinities",
  affinityHelp: "These affinities are estimates based on your saved preferences. Several territories can be a strong match at once. Scores are independent, not shares of a total of 100%.",
  explained: "Olfactive Territories",
  editorialHelp: "Characteristics such as versatility, intensity and seasonal associations are editorial guides, not calculated affinities for your profile.",
  editorialVersatility: "Editorial versatility",
  profiles: "Perfumer Profiles",
  profile: "Perfumer Profile",
  profileHint: "People, attributed creations and sources",
  top: "Top-Tier Creations",
  evaluated: "Evaluated Creations",
  works: "Signature Works",
  sources: "Sources",
  biography: "Biography",
  attribution: "Attribution",
  role: "Perfumer",
  notRanked: "Not ranked · insufficient evaluated creations",
  rankingHelp: "Among these featured people, ranking counts distinct attributed creations at or above the catalog’s 67th percentile of valid Olfactive Scores, then their share of evaluated creations. Exact ties share a rank. Each co-creator receives one credit per fragrance. At least 15 evaluated creations are required. This is a catalog snapshot, not a complete career ranking or your DNA match.",
  noWorks: "No eligible, sourced creations are available in this snapshot.",
};

type Copy = { [K in keyof typeof en]: string };
const copies: Record<Locale, Copy> = {
  en,
  ro: {
    seasonal: "Indicii sezoniere",
    seasonalHelp: "Indiciile sezoniere sunt estimate din acordurile parfumului. Folosește-le ca ghid de explorare; preferințele personale, vremea și contextul pot schimba percepția unui parfum.",
    cueReason: "Acorduri asociate", guide: "Ghidul teritoriilor", affinities: "Afinitățile tale teritoriale",
    affinityHelp: "Aceste afinități sunt estimări bazate pe preferințele salvate. Mai multe teritorii pot avea simultan o potrivire puternică. Scorurile sunt independente, nu părți dintr-un total de 100%.",
    explained: "Teritoriile olfactive",
    editorialHelp: "Caracteristici precum versatilitatea, intensitatea și asocierile sezoniere sunt repere editoriale, nu afinități calculate pentru profilul tău.",
    editorialVersatility: "Versatilitate editorială", profiles: "Profiluri de parfumieri", profile: "Profil de parfumier",
    profileHint: "Persoane, creații atribuite și surse", top: "Creații de top", evaluated: "Creații evaluate", works: "Creații reprezentative", sources: "Surse",
    biography: "Biografie", attribution: "Atribuire", role: "Parfumier", notRanked: "Fără clasament · insuficiente creații evaluate",
    rankingHelp: "Pentru persoanele prezentate, clasamentul numără creațiile distincte atribuite care ating percentila 67 a scorurilor Olfactive Score valide din catalog, apoi proporția lor din creațiile evaluate. Egalitățile exacte au același rang. Fiecare co-creator primește un credit per parfum. Sunt necesare minimum 15 creații evaluate. Este un instantaneu al catalogului, nu un clasament al întregii cariere sau o potrivire ADN personală.",
    noWorks: "Nu există creații eligibile cu surse în acest instantaneu.",
  },
  fr: {
    seasonal: "Indices saisonniers",
    seasonalHelp: "Les indices saisonniers sont estimés à partir des accords. Utilisez-les comme guide de découverte ; vos préférences, la météo et le contexte peuvent modifier la perception d’un parfum.",
    cueReason: "Accords associés", guide: "Guide des territoires", affinities: "Vos affinités territoriales",
    affinityHelp: "Ces affinités sont des estimations fondées sur vos préférences enregistrées. Plusieurs territoires peuvent bien correspondre à la fois. Les scores sont indépendants, pas des parts d’un total de 100 %.",
    explained: "Les territoires olfactifs",
    editorialHelp: "La polyvalence, l’intensité et les associations saisonnières sont des repères éditoriaux, pas des affinités calculées pour votre profil.",
    editorialVersatility: "Polyvalence éditoriale", profiles: "Profils de parfumeurs", profile: "Profil de parfumeur",
    profileHint: "Personnes, créations attribuées et sources", top: "Créations de premier plan", evaluated: "Créations évaluées", works: "Créations emblématiques", sources: "Sources",
    biography: "Biographie", attribution: "Attribution", role: "Parfumeur", notRanked: "Non classé · créations évaluées insuffisantes",
    rankingHelp: "Parmi les personnes présentées, le classement compte les créations distinctes attribuées atteignant le 67e percentile des Olfactive Scores valides du catalogue, puis leur proportion parmi les créations évaluées. Les ex æquo exacts partagent le rang. Chaque cocréateur reçoit un crédit par parfum. Un minimum de 15 créations évaluées est requis. Cet instantané ne classe ni une carrière complète ni votre affinité ADN.",
    noWorks: "Aucune création éligible avec source dans cet instantané.",
  },
  de: {
    seasonal: "Saisonale Hinweise",
    seasonalHelp: "Saisonale Hinweise werden aus den Duftakkorden geschätzt. Nutzen Sie sie zur Entdeckung; Vorlieben, Wetter und Anlass können die Wahrnehmung verändern.",
    cueReason: "Passende Akkorde", guide: "Territorienführer", affinities: "Ihre Territorien-Affinitäten",
    affinityHelp: "Diese Schätzungen beruhen auf Ihren gespeicherten Vorlieben. Mehrere Territorien können gleichzeitig gut passen. Die Werte sind unabhängig, keine Anteile einer Summe von 100 %.",
    explained: "Olfaktorische Territorien",
    editorialHelp: "Vielseitigkeit, Intensität und saisonale Zuordnungen sind redaktionelle Orientierung, keine berechneten persönlichen Affinitäten.",
    editorialVersatility: "Redaktionelle Vielseitigkeit", profiles: "Parfümeurprofile", profile: "Parfümeurprofil",
    profileHint: "Personen, zugeschriebene Werke und Quellen", top: "Spitzenkreationen", evaluated: "Bewertete Kreationen", works: "Prägende Werke", sources: "Quellen",
    biography: "Biografie", attribution: "Zuschreibung", role: "Parfümeur", notRanked: "Ohne Rang · zu wenige bewertete Kreationen",
    rankingHelp: "Unter den vorgestellten Personen zählt die Rangliste eigenständige zugeschriebene Werke ab dem 67. Perzentil gültiger Olfactive Scores im Katalog, danach deren Anteil an den bewerteten Werken. Exakte Gleichstände teilen den Rang. Jeder Miturheber erhält pro Duft einen Credit. Mindestens 15 bewertete Kreationen sind erforderlich. Dies ist eine Katalogmomentaufnahme, keine Karriere- oder persönliche DNA-Rangliste.",
    noWorks: "Keine geeigneten Werke mit Quellen in dieser Momentaufnahme.",
  },
  es: {
    seasonal: "Indicios estacionales",
    seasonalHelp: "Los indicios estacionales se estiman a partir de los acordes. Úsalos como guía de descubrimiento; las preferencias, el clima y el contexto pueden cambiar cómo se percibe un perfume.",
    cueReason: "Acordes asociados", guide: "Guía de territorios", affinities: "Tus afinidades territoriales",
    affinityHelp: "Son estimaciones basadas en tus preferencias guardadas. Varios territorios pueden encajar bien a la vez. Los valores son independientes, no partes de un total del 100 %.",
    explained: "Territorios olfativos",
    editorialHelp: "La versatilidad, intensidad y asociaciones estacionales son orientaciones editoriales, no afinidades calculadas para tu perfil.",
    editorialVersatility: "Versatilidad editorial", profiles: "Perfiles de perfumistas", profile: "Perfil de perfumista",
    profileHint: "Personas, creaciones atribuidas y fuentes", top: "Creaciones destacadas", evaluated: "Creaciones evaluadas", works: "Obras representativas", sources: "Fuentes",
    biography: "Biografía", attribution: "Atribución", role: "Perfumista", notRanked: "Sin clasificar · pocas creaciones evaluadas",
    rankingHelp: "Entre las personas presentadas, la clasificación cuenta creaciones distintas atribuidas que alcanzan el percentil 67 de Olfactive Scores válidos del catálogo y después su proporción entre las evaluadas. Los empates exactos comparten posición. Cada cocreador recibe un crédito por perfume. Se requieren al menos 15 creaciones evaluadas. Es una instantánea del catálogo, no de toda una carrera ni de tu compatibilidad ADN.",
    noWorks: "No hay creaciones elegibles con fuentes en esta instantánea.",
  },
  it: {
    seasonal: "Indizi stagionali",
    seasonalHelp: "Gli indizi stagionali sono stimati dagli accordi. Usali come guida alla scoperta; preferenze, clima e contesto possono cambiare la percezione di un profumo.",
    cueReason: "Accordi associati", guide: "Guida ai territori", affinities: "Le tue affinità territoriali",
    affinityHelp: "Sono stime basate sulle preferenze salvate. Più territori possono corrispondere bene contemporaneamente. I valori sono indipendenti, non parti di un totale del 100%.",
    explained: "Territori olfattivi",
    editorialHelp: "Versatilità, intensità e associazioni stagionali sono indicazioni editoriali, non affinità calcolate per il tuo profilo.",
    editorialVersatility: "Versatilità editoriale", profiles: "Profili dei profumieri", profile: "Profilo del profumiere",
    profileHint: "Persone, creazioni attribuite e fonti", top: "Creazioni di punta", evaluated: "Creazioni valutate", works: "Opere rappresentative", sources: "Fonti",
    biography: "Biografia", attribution: "Attribuzione", role: "Profumiere", notRanked: "Non classificato · poche creazioni valutate",
    rankingHelp: "Tra le persone presentate, la classifica conta creazioni distinte attribuite che raggiungono il 67° percentile degli Olfactive Score validi del catalogo, poi la loro quota tra quelle valutate. Le parità esatte condividono la posizione. Ogni coautore riceve un credito per profumo. Servono almeno 15 creazioni valutate. È un’istantanea del catalogo, non una classifica della carriera o della compatibilità ADN.",
    noWorks: "Nessuna creazione idonea con fonti in questa istantanea.",
  },
  pt: {
    seasonal: "Indícios sazonais",
    seasonalHelp: "Os indícios sazonais são estimados a partir dos acordes. Use-os como guia de descoberta; preferências, clima e contexto podem mudar a perceção de um perfume.",
    cueReason: "Acordes associados", guide: "Guia de territórios", affinities: "As suas afinidades territoriais",
    affinityHelp: "São estimativas baseadas nas preferências guardadas. Vários territórios podem combinar bem em simultâneo. Os valores são independentes, não partes de um total de 100%.",
    explained: "Territórios olfativos",
    editorialHelp: "Versatilidade, intensidade e associações sazonais são orientações editoriais, não afinidades calculadas para o seu perfil.",
    editorialVersatility: "Versatilidade editorial", profiles: "Perfis de perfumistas", profile: "Perfil de perfumista",
    profileHint: "Pessoas, criações atribuídas e fontes", top: "Criações de destaque", evaluated: "Criações avaliadas", works: "Obras representativas", sources: "Fontes",
    biography: "Biografia", attribution: "Atribuição", role: "Perfumista", notRanked: "Sem classificação · poucas criações avaliadas",
    rankingHelp: "Entre as pessoas apresentadas, a classificação conta criações distintas atribuídas que atingem o percentil 67 dos Olfactive Scores válidos do catálogo, depois a sua proporção entre as avaliadas. Empates exatos partilham a posição. Cada cocriador recebe um crédito por perfume. São necessárias pelo menos 15 criações avaliadas. É um instantâneo do catálogo, não de uma carreira inteira nem da afinidade ADN pessoal.",
    noWorks: "Sem criações elegíveis com fontes neste instantâneo.",
  },
};

export const getDiscoveryCopy = (locale: Locale): Copy => copies[locale];

export function withDiscoveryLabels(dictionary: Dictionary, locale: Locale): Dictionary {
  const c = copies[locale];
  return {
    ...dictionary,
    fragrances: { ...dictionary.fragrances, search: { ...dictionary.fragrances.search, season: c.seasonal } },
    home: { ...dictionary.home, ctaTerritories: c.affinities, journeySteps: {
      ...dictionary.home.journeySteps, explore: { ...dictionary.home.journeySteps.explore, action: c.affinities },
    } },
    territories: {
      ...dictionary.territories, pageTitle: c.guide, card: { ...dictionary.territories.card, versatility: c.editorialVersatility },
      detail: { ...dictionary.territories.detail, versatility: c.editorialVersatility },
      dnaIntegration: { ...dictionary.territories.dnaIntegration, title: c.affinities, cta: `${c.affinities} →` },
    },
    dna: { ...dictionary.dna, territoriesTitle: c.affinities, territoriesDescription: c.affinityHelp, exploreAllTerritories: `${c.guide} →` },
    articles: {
      ...dictionary.articles,
      menu: { ...dictionary.articles.menu, items: {
        ...dictionary.articles.menu.items,
        perfumeCreators: { label: c.profiles, hint: c.profileHint },
        scentTerritories: { label: c.explained, hint: dictionary.articles.menu.items.scentTerritories.hint },
      } },
      perfumers: { ...dictionary.articles.perfumers, title: c.profiles, kicker: c.profiles },
    },
  };
}
