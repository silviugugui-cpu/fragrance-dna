import type { Locale } from "./config";

const copy: Record<Locale, [string, string, string, string, string, string, string]> = {
  en: ["Not evaluated", "Move at least two categories to Love or Avoid to continue. Untouched categories do not affect your DNA. Click a category name to explicitly mark it Neutral.", "Not enough classified fragrances", "Territory coverage requires documented, reviewed classifications. Unclassified fragrances and wishlist items are not counted.", "Origin region", "Any origin", "Middle East"],
  ro: ["Neevaluat", "Mută cel puțin două categorii în Love sau Avoid pentru a continua. Categoriile neatinse nu influențează ADN-ul. Apasă numele unei categorii pentru a o marca explicit Neutră.", "Nu există suficiente parfumuri clasificate", "Acoperirea necesită clasificări documentate și revizuite. Parfumurile neclasificate și cele din wishlist nu sunt numărate.", "Regiune de origine", "Orice origine", "Orientul Mijlociu"],
  fr: ["Non évalué", "Déplacez au moins deux catégories dans Love ou Avoid. Les catégories non évaluées ne modifient pas votre ADN. Cliquez sur un nom pour choisir explicitement Neutre.", "Pas assez de parfums classifiés", "La couverture exige des classifications documentées et vérifiées. Les parfums non classifiés et les souhaits ne sont pas comptés.", "Région d'origine", "Toutes les origines", "Moyen-Orient"],
  de: ["Nicht bewertet", "Verschieben Sie mindestens zwei Kategorien nach Love oder Avoid. Unbewertete Kategorien verändern Ihre DNA nicht. Ein Klick auf den Namen wählt ausdrücklich Neutral.", "Nicht genügend klassifizierte Düfte", "Die Abdeckung erfordert dokumentierte, geprüfte Zuordnungen. Nicht klassifizierte Düfte und Wunschlisten zählen nicht.", "Herkunftsregion", "Jede Herkunft", "Naher Osten"],
  es: ["Sin evaluar", "Mueve al menos dos categorías a Love o Avoid. Las categorías sin evaluar no afectan a tu ADN. Pulsa un nombre para elegir Neutral explícitamente.", "No hay suficientes perfumes clasificados", "La cobertura requiere clasificaciones documentadas y revisadas. Los perfumes sin clasificar y los deseos no se cuentan.", "Región de origen", "Cualquier origen", "Oriente Medio"],
  it: ["Non valutato", "Sposta almeno due categorie in Love o Avoid. Le categorie non valutate non influiscono sul DNA. Premi un nome per scegliere esplicitamente Neutro.", "Profumi classificati insufficienti", "La copertura richiede classificazioni documentate e verificate. Profumi non classificati e desideri non vengono contati.", "Regione di origine", "Qualsiasi origine", "Medio Oriente"],
  pt: ["Não avaliado", "Mova pelo menos duas categorias para Love ou Avoid. Categorias não avaliadas não alteram o ADN. Clique num nome para escolher Neutro explicitamente.", "Perfumes classificados insuficientes", "A cobertura exige classificações documentadas e revistas. Perfumes sem classificação e desejos não são contados.", "Região de origem", "Qualquer origem", "Médio Oriente"],
};
export function getPriorityCopy(locale: Locale) {
  const [unrated, groundingHelp, insufficient, coverageHelp, region, anyRegion, middleEast] = copy[locale];
  const loadError = {
    en: "Saved preferences could not be loaded. Please evaluate the categories again before saving.",
    ro: "Preferințele salvate nu au putut fi încărcate. Evaluează din nou categoriile înainte de salvare.",
    fr: "Impossible de charger les préférences enregistrées. Évaluez de nouveau les catégories avant de sauvegarder.",
    de: "Gespeicherte Präferenzen konnten nicht geladen werden. Bewerten Sie die Kategorien vor dem Speichern erneut.",
    es: "No se pudieron cargar las preferencias guardadas. Evalúa de nuevo las categorías antes de guardar.",
    it: "Impossibile caricare le preferenze salvate. Valuta nuovamente le categorie prima di salvare.",
    pt: "Não foi possível carregar as preferências guardadas. Avalie novamente as categorias antes de guardar.",
  }[locale];
  return { unrated, groundingHelp, insufficient, coverageHelp, region, anyRegion, middleEast, loadError };
}
