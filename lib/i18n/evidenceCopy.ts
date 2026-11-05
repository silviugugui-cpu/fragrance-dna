import type { Locale } from "./config";

const en = {
  fit: "Preference fit",
  fitHelp: "A comparative score from 0 to 100 for ranking fragrances using your saved preferences, not a probability or a guarantee of liking.",
  provisional: "Provisional difference from Grounding — more explicit feedback is needed to confirm this preference.",
  classificationBasis: "{classified} of {total} owned fragrances have verified territory classifications.",
  represented: "Territories represented",
  coverageScope: "This describes only classified fragrances, not the diversity of your entire collection or your personal taste.",
};
type Copy = { [K in keyof typeof en]: string };
const copies: Record<Locale, Copy> = {
  en,
  ro: {
    fit: "Potrivire cu preferințele",
    fitHelp: "Un scor comparativ de la 0 la 100 pentru ordonarea parfumurilor după preferințele salvate, nu o probabilitate sau o garanție că îți vor plăcea.",
    provisional: "Diferență provizorie față de Grounding — sunt necesare alte răspunsuri explicite pentru a confirma această preferință.",
    classificationBasis: "{classified} din {total} parfumuri deținute au clasificări teritoriale verificate.",
    represented: "Teritorii reprezentate",
    coverageScope: "Sunt descrise doar parfumurile clasificate, nu diversitatea întregii colecții sau gustul tău personal.",
  },
  fr: {
    fit: "Affinité avec vos préférences",
    fitHelp: "Un score comparatif de 0 à 100 pour classer les parfums selon vos préférences enregistrées, pas une probabilité ni une garantie de plaisir.",
    provisional: "Écart provisoire avec l’Ancrage — davantage de réponses explicites sont nécessaires pour confirmer cette préférence.",
    classificationBasis: "{classified} sur {total} parfums possédés ont des classifications territoriales vérifiées.",
    represented: "Territoires représentés",
    coverageScope: "Seuls les parfums classifiés sont décrits, pas la diversité de toute votre collection ni vos goûts personnels.",
  },
  de: {
    fit: "Passung zu Ihren Vorlieben",
    fitHelp: "Ein vergleichender Wert von 0 bis 100 zur Rangfolge anhand Ihrer gespeicherten Vorlieben, keine Wahrscheinlichkeit oder Garantie des Gefallens.",
    provisional: "Vorläufige Abweichung vom Grounding — weitere ausdrückliche Antworten sind zur Bestätigung dieser Vorliebe nötig.",
    classificationBasis: "{classified} von {total} eigenen Düften haben geprüfte Territorienzuordnungen.",
    represented: "Vertretene Territorien",
    coverageScope: "Dies beschreibt nur klassifizierte Düfte, nicht die Vielfalt Ihrer gesamten Sammlung oder Ihren persönlichen Geschmack.",
  },
  es: {
    fit: "Afinidad con tus preferencias",
    fitHelp: "Una puntuación comparativa de 0 a 100 para ordenar perfumes según tus preferencias guardadas, no una probabilidad ni una garantía de que te gusten.",
    provisional: "Diferencia provisional con Grounding — se necesitan más respuestas explícitas para confirmar esta preferencia.",
    classificationBasis: "{classified} de {total} perfumes propios tienen clasificaciones territoriales verificadas.",
    represented: "Territorios representados",
    coverageScope: "Esto describe solo los perfumes clasificados, no la diversidad de toda tu colección ni tu gusto personal.",
  },
  it: {
    fit: "Affinità con le preferenze",
    fitHelp: "Un punteggio comparativo da 0 a 100 per ordinare i profumi secondo le preferenze salvate, non una probabilità o una garanzia di gradimento.",
    provisional: "Differenza provvisoria dal Grounding — servono altre risposte esplicite per confermare questa preferenza.",
    classificationBasis: "{classified} su {total} profumi posseduti hanno classificazioni territoriali verificate.",
    represented: "Territori rappresentati",
    coverageScope: "Descrive solo i profumi classificati, non la diversità dell’intera collezione o il tuo gusto personale.",
  },
  pt: {
    fit: "Afinidade com as preferências",
    fitHelp: "Uma pontuação comparativa de 0 a 100 para ordenar perfumes pelas preferências guardadas, não uma probabilidade nem uma garantia de agrado.",
    provisional: "Diferença provisória face ao Grounding — são necessárias mais respostas explícitas para confirmar esta preferência.",
    classificationBasis: "{classified} de {total} perfumes próprios têm classificações territoriais verificadas.",
    represented: "Territórios representados",
    coverageScope: "Isto descreve apenas os perfumes classificados, não a diversidade de toda a coleção ou o seu gosto pessoal.",
  },
};
export const getEvidenceCopy = (locale: Locale): Copy => copies[locale];
export const classificationBasisLabel = (classified: number, total: number, locale: Locale): string =>
  copies[locale].classificationBasis.replace("{classified}", String(classified)).replace("{total}", String(total));
