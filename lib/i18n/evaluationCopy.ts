import type { Locale } from "./config";
import type { SelectionReason } from "../test/preferenceLearning";

const en = {
  title: "Learn what you notice — and what you love",
  intro: "Perception and liking are separate. Answer the overall question and up to two adaptive questions. Only submitted, explicit liking answers refine your preferences.",
  overall: "How much do you like this fragrance?",
  overallOptions: ["Strongly dislike it", "Dislike it", "Neutral", "Like it", "Love it"],
  preferenceOptions: ["Strongly dislike", "Dislike", "Neutral", "Like", "Love"],
  perceptionOptions: ["I didn’t notice it", "Slight", "Moderate", "Strong"],
  unable: "I haven’t smelled it / I can’t evaluate it",
  noticed: "How noticeable was {attribute}?",
  feeling: "How did you feel about {attribute}?",
  submit: "Submit evaluation",
  next: "Continue with an alternative",
  saved: "Progress saved. You can leave and resume this evaluation.",
  pending: "Saving progress…",
  saveError: "Progress could not be saved. Your answers remain on this screen. Retry before leaving.",
  loadError: "Saved progress could not be loaded. Your existing data has not been deleted.",
  retry: "Retry",
  required: "Answer the overall question and every displayed question before submitting.",
  complete: "Completed evaluations",
  noSignal: "Unable to evaluate: no liking signal, DNA update or completed evaluation was recorded.",
  updated: "Evaluation saved. The next fragrance was selected using your new answers.",
  conflicts: "Updated from direct evidence, replacing your initial Grounding preference",
  legacy: "Previous slider answers are preserved as perception history, not like/dislike evidence.",
  confirm: "Confirming your preference for {attribute}",
  clarify: "Clarifying your response to {attribute}",
  explore: "Exploring an untested {attribute} profile",
  fallback: "No available fragrance combines an unconfirmed Love preference with another untested characteristic. This candidate offers the best remaining learning value.",
  exhausted: "No unevaluated alternatives remain in the eligible pool. Your progress is saved.",
  perceptionOnly: "Not noticed records perception only. It does not mean dislike.",
};
type Copy = { [K in keyof typeof en]: typeof en[K] extends string[] ? string[] : string };
const copies: Record<Locale, Copy> = {
  en,
  ro: {
    title: "Descoperă ce sesizezi — și ce îți place",
    intro: "Percepția și plăcerea sunt separate. Răspunde la întrebarea generală și la maximum două întrebări adaptive. Doar răspunsurile explicite despre plăcere, trimise, rafinează preferințele.",
    overall: "Cât de mult îți place acest parfum?",
    overallOptions: ["Îmi displace mult", "Îmi displace", "Neutru", "Îmi place", "Îl ador"],
    preferenceOptions: ["Îmi displace mult", "Îmi displace", "Neutru", "Îmi place", "Ador"],
    perceptionOptions: ["Nu am sesizat-o", "Ușor", "Moderat", "Puternic"],
    unable: "Nu l-am mirosit / Nu îl pot evalua", noticed: "Cât de sesizabilă a fost caracteristica {attribute}?", feeling: "Cum te-ai simțit în legătură cu {attribute}?",
    submit: "Trimite evaluarea", next: "Continuă cu o alternativă", saved: "Progres salvat. Poți pleca și relua această evaluare.", pending: "Se salvează progresul…",
    saveError: "Progresul nu a putut fi salvat. Răspunsurile rămân pe ecran. Reîncearcă înainte să pleci.", loadError: "Progresul salvat nu a putut fi încărcat. Datele existente nu au fost șterse.", retry: "Reîncearcă",
    required: "Răspunde la întrebarea generală și la toate întrebările afișate înainte de trimitere.", complete: "Evaluări finalizate",
    noSignal: "Nu poate fi evaluat: nu s-a înregistrat semnal de plăcere, actualizare ADN sau evaluare finalizată.",
    updated: "Evaluare salvată. Următorul parfum a fost ales folosind noile răspunsuri.",
    conflicts: "Actualizat din dovezi directe, înlocuind preferința inițială din Grounding",
    legacy: "Răspunsurile vechi la slidere sunt păstrate ca istoric de percepție, nu ca dovezi de plăcere sau neplăcere.",
    confirm: "Confirmăm preferința ta pentru {attribute}", clarify: "Clarificăm răspunsul tău la {attribute}", explore: "Explorăm un profil netestat de {attribute}",
    fallback: "Niciun parfum disponibil nu combină o preferință Love neconfirmată cu o altă caracteristică netestată. Acest candidat oferă cea mai bună valoare de învățare rămasă.",
    exhausted: "Nu mai există alternative neevaluate în pool-ul eligibil. Progresul este salvat.", perceptionOnly: "Nesesizat înregistrează doar percepția. Nu înseamnă că îți displace.",
  },
  fr: {
    title: "Découvrez ce que vous percevez — et aimez", intro: "Perception et plaisir sont distincts. Répondez à la question globale et à deux questions adaptatives maximum. Seules les préférences explicites soumises affinent votre profil.",
    overall: "À quel point aimez-vous ce parfum ?", overallOptions: ["Je le déteste", "Je ne l’aime pas", "Neutre", "Je l’aime", "Je l’adore"], preferenceOptions: ["Je déteste", "Je n’aime pas", "Neutre", "J’aime", "J’adore"], perceptionOptions: ["Non perçu", "Léger", "Modéré", "Fort"],
    unable: "Je ne l’ai pas senti / Je ne peux pas l’évaluer", noticed: "À quel point avez-vous perçu {attribute} ?", feeling: "Qu’avez-vous ressenti à propos de {attribute} ?",
    submit: "Envoyer l’évaluation", next: "Continuer avec une alternative", saved: "Progression enregistrée. Vous pouvez reprendre cette évaluation plus tard.", pending: "Enregistrement…",
    saveError: "Impossible d’enregistrer. Vos réponses restent à l’écran. Réessayez avant de partir.", loadError: "Impossible de charger la progression. Vos données existantes n’ont pas été supprimées.", retry: "Réessayer",
    required: "Répondez à la question globale et à toutes les questions affichées.", complete: "Évaluations terminées", noSignal: "Non évaluable : aucun signal de plaisir, changement d’ADN ni évaluation complète enregistré.",
    updated: "Évaluation enregistrée. Le parfum suivant tient compte de vos nouvelles réponses.", conflicts: "Mis à jour par une réponse directe, remplaçant la préférence initiale de Grounding",
    legacy: "Les anciens curseurs restent un historique de perception, pas des préférences.", confirm: "Confirmation de votre préférence pour {attribute}", clarify: "Clarification de votre réaction à {attribute}", explore: "Exploration d’un profil {attribute} non testé",
    fallback: "Aucun parfum disponible ne combine une préférence Love non confirmée et une caractéristique inexplorée. Ce candidat offre la meilleure valeur d’apprentissage restante.",
    exhausted: "Aucune alternative non évaluée dans le catalogue éligible. Progression enregistrée.", perceptionOnly: "Non perçu décrit seulement la perception, pas un rejet.",
  },
  de: {
    title: "Was Sie wahrnehmen — und was Ihnen gefällt", intro: "Wahrnehmung und Gefallen sind getrennt. Beantworten Sie die Gesamtfrage und höchstens zwei adaptive Fragen. Nur abgesendete ausdrückliche Vorlieben verfeinern Ihr Profil.",
    overall: "Wie gut gefällt Ihnen dieser Duft?", overallOptions: ["Gefällt mir gar nicht", "Gefällt mir nicht", "Neutral", "Gefällt mir", "Liebe ich"], preferenceOptions: ["Mag ich gar nicht", "Mag ich nicht", "Neutral", "Mag ich", "Liebe ich"], perceptionOptions: ["Nicht wahrgenommen", "Leicht", "Mäßig", "Stark"],
    unable: "Nicht gerochen / Kann ich nicht bewerten", noticed: "Wie deutlich war {attribute} wahrnehmbar?", feeling: "Wie empfanden Sie {attribute}?",
    submit: "Bewertung absenden", next: "Mit einer Alternative fortfahren", saved: "Fortschritt gespeichert. Sie können diese Bewertung später fortsetzen.", pending: "Wird gespeichert…",
    saveError: "Speichern fehlgeschlagen. Ihre Antworten bleiben sichtbar. Vor dem Verlassen erneut versuchen.", loadError: "Fortschritt konnte nicht geladen werden. Bestehende Daten wurden nicht gelöscht.", retry: "Erneut versuchen",
    required: "Beantworten Sie die Gesamtfrage und alle angezeigten Fragen.", complete: "Abgeschlossene Bewertungen", noSignal: "Nicht bewertbar: kein Gefallenssignal, keine DNA-Änderung und keine abgeschlossene Bewertung erfasst.",
    updated: "Bewertung gespeichert. Der nächste Duft berücksichtigt Ihre neuen Antworten.", conflicts: "Durch direkte Angaben aktualisiert; ersetzt die ursprüngliche Grounding-Vorliebe",
    legacy: "Alte Schieberegler bleiben Wahrnehmungshistorie, keine Vorlieben.", confirm: "Ihre Vorliebe für {attribute} bestätigen", clarify: "Ihre Reaktion auf {attribute} klären", explore: "Ein ungetestetes {attribute}-Profil erkunden",
    fallback: "Kein verfügbarer Duft verbindet eine unbestätigte Love-Vorliebe mit einem unbekannten Merkmal. Dieser Kandidat bietet den besten verbleibenden Lernwert.",
    exhausted: "Keine unbewerteten Alternativen im geeigneten Pool. Fortschritt gespeichert.", perceptionOnly: "Nicht wahrgenommen bedeutet nur Wahrnehmung, nicht Ablehnung.",
  },
  es: {
    title: "Descubre lo que percibes — y lo que te gusta", intro: "Percepción y gusto son distintos. Responde a la pregunta general y hasta dos preguntas adaptativas. Solo las preferencias explícitas enviadas afinan tu perfil.",
    overall: "¿Cuánto te gusta este perfume?", overallOptions: ["Me disgusta mucho", "Me disgusta", "Neutral", "Me gusta", "Me encanta"], preferenceOptions: ["Me disgusta mucho", "Me disgusta", "Neutral", "Me gusta", "Me encanta"], perceptionOptions: ["No lo percibí", "Leve", "Moderado", "Fuerte"],
    unable: "No lo he olido / No puedo evaluarlo", noticed: "¿Cuánto percibiste {attribute}?", feeling: "¿Qué sentiste respecto a {attribute}?",
    submit: "Enviar evaluación", next: "Continuar con una alternativa", saved: "Progreso guardado. Puedes retomar esta evaluación más tarde.", pending: "Guardando…",
    saveError: "No se pudo guardar. Tus respuestas siguen en pantalla. Reintenta antes de salir.", loadError: "No se pudo cargar el progreso. Tus datos no se han borrado.", retry: "Reintentar",
    required: "Responde a la pregunta general y a todas las preguntas mostradas.", complete: "Evaluaciones completadas", noSignal: "No evaluable: no se registró gusto, cambio de ADN ni evaluación completa.",
    updated: "Evaluación guardada. El siguiente perfume tiene en cuenta tus nuevas respuestas.", conflicts: "Actualizado por evidencia directa, sustituyendo la preferencia inicial de Grounding",
    legacy: "Los antiguos deslizadores se conservan como percepción, no como preferencias.", confirm: "Confirmando tu preferencia por {attribute}", clarify: "Aclarando tu respuesta a {attribute}", explore: "Explorando un perfil {attribute} sin evaluar",
    fallback: "Ningún perfume disponible combina una preferencia Love sin confirmar con otra característica sin evaluar. Este candidato ofrece el mejor aprendizaje restante.",
    exhausted: "No quedan alternativas sin evaluar en el catálogo elegible. Progreso guardado.", perceptionOnly: "No percibido registra solo percepción, no disgusto.",
  },
  it: {
    title: "Scopri cosa percepisci — e cosa ami", intro: "Percezione e gradimento sono distinti. Rispondi alla domanda generale e a un massimo di due domande adattive. Solo le preferenze esplicite inviate affinano il profilo.",
    overall: "Quanto ti piace questo profumo?", overallOptions: ["Non mi piace affatto", "Non mi piace", "Neutro", "Mi piace", "Lo adoro"], preferenceOptions: ["Non mi piace affatto", "Non mi piace", "Neutro", "Mi piace", "Adoro"], perceptionOptions: ["Non percepito", "Lieve", "Moderato", "Forte"],
    unable: "Non l’ho annusato / Non posso valutarlo", noticed: "Quanto era percepibile {attribute}?", feeling: "Come hai percepito emotivamente {attribute}?",
    submit: "Invia valutazione", next: "Continua con un’alternativa", saved: "Progressi salvati. Puoi riprendere questa valutazione più tardi.", pending: "Salvataggio…",
    saveError: "Salvataggio non riuscito. Le risposte restano visibili. Riprova prima di uscire.", loadError: "Impossibile caricare i progressi. I dati esistenti non sono stati eliminati.", retry: "Riprova",
    required: "Rispondi alla domanda generale e a tutte quelle mostrate.", complete: "Valutazioni completate", noSignal: "Non valutabile: nessun segnale di gradimento, modifica ADN o valutazione completa registrata.",
    updated: "Valutazione salvata. Il prossimo profumo considera le nuove risposte.", conflicts: "Aggiornato da prove dirette, sostituendo la preferenza iniziale di Grounding",
    legacy: "I vecchi cursori restano uno storico di percezione, non di preferenze.", confirm: "Confermiamo la preferenza per {attribute}", clarify: "Chiariamo la risposta a {attribute}", explore: "Esploriamo un profilo {attribute} non testato",
    fallback: "Nessun profumo disponibile combina una preferenza Love non confermata e un’altra caratteristica inesplorata. Questo candidato offre il miglior apprendimento restante.",
    exhausted: "Nessuna alternativa non valutata nel catalogo idoneo. Progressi salvati.", perceptionOnly: "Non percepito indica solo percezione, non avversione.",
  },
  pt: {
    title: "Descubra o que percebe — e o que gosta", intro: "Perceção e agrado são distintos. Responda à pergunta geral e a até duas perguntas adaptativas. Só preferências explícitas enviadas refinam o perfil.",
    overall: "Quanto gosta deste perfume?", overallOptions: ["Desgosto muito", "Desgosto", "Neutro", "Gosto", "Adoro"], preferenceOptions: ["Desgosto muito", "Desgosto", "Neutro", "Gosto", "Adoro"], perceptionOptions: ["Não percebi", "Ligeiro", "Moderado", "Forte"],
    unable: "Não o cheirei / Não consigo avaliar", noticed: "Quão percetível foi {attribute}?", feeling: "Como se sentiu em relação a {attribute}?",
    submit: "Enviar avaliação", next: "Continuar com uma alternativa", saved: "Progresso guardado. Pode retomar esta avaliação mais tarde.", pending: "A guardar…",
    saveError: "Não foi possível guardar. As respostas continuam visíveis. Tente antes de sair.", loadError: "Não foi possível carregar o progresso. Os dados existentes não foram apagados.", retry: "Tentar novamente",
    required: "Responda à pergunta geral e a todas as perguntas apresentadas.", complete: "Avaliações concluídas", noSignal: "Não avaliável: sem sinal de agrado, alteração ADN ou avaliação completa registada.",
    updated: "Avaliação guardada. O próximo perfume considera as novas respostas.", conflicts: "Atualizado por evidência direta, substituindo a preferência inicial do Grounding",
    legacy: "Os antigos cursores são preservados como perceção, não como preferências.", confirm: "Confirmar a preferência por {attribute}", clarify: "Clarificar a resposta a {attribute}", explore: "Explorar um perfil {attribute} não testado",
    fallback: "Nenhum perfume disponível combina uma preferência Love por confirmar com outra característica inexplorada. Este candidato oferece a melhor aprendizagem restante.",
    exhausted: "Sem alternativas por avaliar no catálogo elegível. Progresso guardado.", perceptionOnly: "Não percebido regista apenas perceção, não desagrado.",
  },
};

const ids = "elegant charismatic mysterious citrus honeyed woody aromatic spices sweetness musk_clean distinct intense luminous green rose oud amber freshness tea water metallic airiness luxury smoothness reflection white_florals creaminess warmth tobacco lavender floral coconut cherry fruity tropical leather smoky powdery".split(" ");
const attributeNames: Record<Locale, string[]> = {
  en: "Elegance|Charisma|Mystery|Citrus|Honeyed / gourmand|Woods|Aromatic|Spices|Sweetness|Clean musk|Distinctiveness|Intensity|Luminosity|Green|Rose|Oud|Amber|Freshness|Tea|Aquatic|Metallic|Airiness|Luxury|Smoothness|Reflective character|White flowers|Creaminess|Warmth|Tobacco|Lavender|Floral|Coconut|Cherry|Fruity|Tropical|Leather|Smoky|Powdery".split("|"),
  ro: "Eleganță|Carismă|Mister|Citrice|Miere / gurmand|Lemnos|Aromatic|Condimente|Dulceață|Mosc curat|Distinctivitate|Intensitate|Luminozitate|Verde|Trandafir|Oud|Ambră|Prospețime|Ceai|Acvatic|Metalic|Aerisit|Lux|Finețe|Caracter meditativ|Flori albe|Cremozitate|Căldură|Tutun|Lavandă|Floral|Cocos|Cireașă|Fructat|Tropical|Piele|Fumuriu|Pudrat".split("|"),
  fr: "Élégance|Charisme|Mystère|Agrumes|Miellé / gourmand|Boisé|Aromatique|Épices|Douceur|Musc propre|Singularité|Intensité|Luminosité|Vert|Rose|Oud|Ambre|Fraîcheur|Thé|Aquatique|Métallique|Aérien|Luxe|Velouté|Caractère contemplatif|Fleurs blanches|Crémeux|Chaleur|Tabac|Lavande|Floral|Noix de coco|Cerise|Fruité|Tropical|Cuir|Fumé|Poudré".split("|"),
  de: "Eleganz|Charisma|Geheimnis|Zitrus|Honig / Gourmand|Holz|Aromatisch|Gewürze|Süße|Sauberer Moschus|Eigenständigkeit|Intensität|Leuchtkraft|Grün|Rose|Oud|Amber|Frische|Tee|Aquatisch|Metallisch|Luftigkeit|Luxus|Geschmeidigkeit|Besinnlicher Charakter|Weiße Blüten|Cremigkeit|Wärme|Tabak|Lavendel|Blumig|Kokos|Kirsche|Fruchtig|Tropisch|Leder|Rauchig|Pudrig".split("|"),
  es: "Elegancia|Carisma|Misterio|Cítricos|Miel / gourmand|Maderas|Aromático|Especias|Dulzor|Almizcle limpio|Singularidad|Intensidad|Luminosidad|Verde|Rosa|Oud|Ámbar|Frescura|Té|Acuático|Metálico|Ligereza|Lujo|Suavidad|Carácter reflexivo|Flores blancas|Cremosidad|Calidez|Tabaco|Lavanda|Floral|Coco|Cereza|Afrutado|Tropical|Cuero|Ahumado|Empolvado".split("|"),
  it: "Eleganza|Carisma|Mistero|Agrumi|Miele / gourmand|Legni|Aromatico|Spezie|Dolcezza|Muschio pulito|Originalità|Intensità|Luminosità|Verde|Rosa|Oud|Ambra|Freschezza|Tè|Acquatico|Metallico|Ariosità|Lusso|Morbidezza|Carattere contemplativo|Fiori bianchi|Cremosità|Calore|Tabacco|Lavanda|Floreale|Cocco|Ciliegia|Fruttato|Tropicale|Cuoio|Affumicato|Cipriato".split("|"),
  pt: "Elegância|Carisma|Mistério|Cítricos|Mel / gourmand|Madeiras|Aromático|Especiarias|Doçura|Almíscar limpo|Singularidade|Intensidade|Luminosidade|Verde|Rosa|Oud|Âmbar|Frescura|Chá|Aquático|Metálico|Leveza|Luxo|Suavidade|Caráter contemplativo|Flores brancas|Cremosidade|Calor|Tabaco|Lavanda|Floral|Coco|Cereja|Frutado|Tropical|Couro|Fumado|Atalcado".split("|"),
};
export const getEvaluationCopy = (locale: Locale) => copies[locale];
export function evaluationAttributeLabel(id: string, locale: Locale): string {
  const index = ids.indexOf(id);
  if (index < 0) throw new Error(`Missing localized canonical attribute: ${id}`);
  return attributeNames[locale][index];
}

const qualityIds = "elegant charismatic mysterious honeyed woody aromatic sweetness musk_clean distinct intense luminous green freshness water metallic airiness luxury smoothness reflection creaminess warmth floral fruity tropical smoky powdery".split(" ");
const qualityAdjectives: Record<Locale, string[]> = {
  en: "elegant|charismatic|mysterious|honeyed|woody|aromatic|sweet|clean and musky|distinctive|intense|luminous|green|fresh|aquatic|metallic|airy|luxurious|smooth|contemplative|creamy|warm|floral|fruity|tropical|smoky|powdery".split("|"),
  ro: "elegant|carismatic|misterios|mieros|lemnos|aromatic|dulce|curat și moscat|distinctiv|intens|luminos|verde|proaspăt|acvatic|metalic|aerisit|luxos|fin|meditativ|cremos|cald|floral|fructat|tropical|fumuriu|pudrat".split("|"),
  fr: "élégant|charismatique|mystérieux|miellé|boisé|aromatique|doux|propre et musqué|singulier|intense|lumineux|vert|frais|aquatique|métallique|aérien|luxueux|soyeux|contemplatif|crémeux|chaleureux|floral|fruité|tropical|fumé|poudré".split("|"),
  de: "elegant|charismatisch|geheimnisvoll|honigartig|holzig|aromatisch|süß|sauber und moschusartig|unverwechselbar|intensiv|strahlend|grün|frisch|aquatisch|metallisch|luftig|luxuriös|geschmeidig|besinnlich|cremig|warm|blumig|fruchtig|tropisch|rauchig|pudrig".split("|"),
  es: "elegante|carismático|misterioso|meloso|amaderado|aromático|dulce|limpio y almizclado|distintivo|intenso|luminoso|verde|fresco|acuático|metálico|ligero|lujoso|suave|contemplativo|cremoso|cálido|floral|afrutado|tropical|ahumado|empolvado".split("|"),
  it: "elegante|carismatico|misterioso|mielato|legnoso|aromatico|dolce|pulito e muschiato|distintivo|intenso|luminoso|verde|fresco|acquatico|metallico|arioso|lussuoso|morbido|contemplativo|cremoso|caldo|floreale|fruttato|tropicale|affumicato|cipriato".split("|"),
  pt: "elegante|carismático|misterioso|melado|amadeirado|aromático|doce|limpo e almiscarado|distintivo|intenso|luminoso|verde|fresco|aquático|metálico|leve|luxuoso|suave|contemplativo|cremoso|quente|floral|frutado|tropical|fumado|atalcado".split("|"),
};
const qualityQuestions: Record<Locale, { perception: string; preference: string; options: string[] }> = {
  en: { perception: "How {quality} did you find it?", preference: "Did you like how {quality} it was?", options: ["Not at all", "Slightly", "Moderately", "Very"] },
  ro: { perception: "Cât de {quality} ți s-a părut parfumul?", preference: "Ți-a plăcut cât de {quality} a fost parfumul?", options: ["Deloc", "Puțin", "Moderat", "Foarte"] },
  fr: { perception: "À quel point avez-vous trouvé ce parfum {quality} ?", preference: "Avez-vous aimé son côté {quality} ?", options: ["Pas du tout", "Légèrement", "Modérément", "Très"] },
  de: { perception: "Wie {quality} fanden Sie den Duft?", preference: "Hat Ihnen gefallen, wie {quality} der Duft war?", options: ["Überhaupt nicht", "Leicht", "Mäßig", "Sehr"] },
  es: { perception: "¿Qué tan {quality} te pareció el perfume?", preference: "¿Te gustó lo {quality} que era?", options: ["Nada", "Ligeramente", "Moderadamente", "Muy"] },
  it: { perception: "Quanto ti è sembrato {quality} questo profumo?", preference: "Ti è piaciuto quanto era {quality}?", options: ["Per niente", "Leggermente", "Moderatamente", "Molto"] },
  pt: { perception: "Quão {quality} lhe pareceu o perfume?", preference: "Gostou de como o perfume era {quality}?", options: ["Nada", "Ligeiramente", "Moderadamente", "Muito"] },
};

export function evaluationAttributeQuestions(id: string, locale: Locale): { perception: string; preference: string; perceptionOptions: string[] } {
  const index = qualityIds.indexOf(id);
  if (index >= 0) {
    const adjective = qualityAdjectives[locale][index];
    if (!adjective) throw new Error(`Missing localized quality adjective: ${id}`);
    const question = qualityQuestions[locale];
    return { perception: question.perception.replace("{quality}", adjective),
      preference: question.preference.replace("{quality}", adjective), perceptionOptions: question.options };
  }
  const label = evaluationAttributeLabel(id, locale);
  const copy = copies[locale];
  return { perception: copy.noticed.replace("{attribute}", label),
    preference: copy.feeling.replace("{attribute}", label), perceptionOptions: copy.perceptionOptions };
}

const compositionReasons: Record<Locale, string> = {
  en: "Your attribute preferences already have clear evidence. Checking how this whole composition fits your taste.",
  ro: "Preferințele pentru aceste caracteristici au deja dovezi clare. Verificăm cum se potrivește întreaga compoziție gustului tău.",
  fr: "Vos préférences pour ces caractéristiques sont déjà claires. Vérifions si cette composition vous plaît.",
  de: "Ihre Vorlieben für diese Merkmale sind bereits klar. Wir prüfen, wie Ihnen die gesamte Komposition gefällt.",
  es: "Tus preferencias por estas características ya están claras. Comprobamos si te gusta esta composición.",
  it: "Le tue preferenze per queste caratteristiche sono già chiare. Verifichiamo se ti piace questa composizione.",
  pt: "As suas preferências por estas características já são claras. Vamos verificar se gosta desta composição.",
};
export const evaluationReason = (reason: SelectionReason, attributeId: string | null, locale: Locale): string =>
  reason === "composition" ? compositionReasons[locale] : copies[locale][reason].replace("{attribute}", attributeId ? evaluationAttributeLabel(attributeId, locale) : "");
