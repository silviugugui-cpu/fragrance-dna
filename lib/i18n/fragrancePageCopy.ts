import type { Locale } from "./config";

type Copy = { back: string; source: string; evidence: string; attribution: string; cloneOf: string };
const copies: Record<Locale, Copy> = {
  en: { back: "Fragrance Library", source: "Source", evidence: "Evidence source", attribution: "Attribution source", cloneOf: "Clone of" },
  ro: { back: "Biblioteca de parfumuri", source: "Sursă", evidence: "Sursa dovezii", attribution: "Sursa atribuirii", cloneOf: "Clonă a" },
  fr: { back: "Bibliothèque de parfums", source: "Source", evidence: "Source de la preuve", attribution: "Source d’attribution", cloneOf: "Clone de" },
  de: { back: "Duftbibliothek", source: "Quelle", evidence: "Belegquelle", attribution: "Zuschreibungsquelle", cloneOf: "Klon von" },
  es: { back: "Biblioteca de perfumes", source: "Fuente", evidence: "Fuente de evidencia", attribution: "Fuente de atribución", cloneOf: "Clon de" },
  it: { back: "Biblioteca dei profumi", source: "Fonte", evidence: "Fonte della prova", attribution: "Fonte dell’attribuzione", cloneOf: "Clone di" },
  pt: { back: "Biblioteca de perfumes", source: "Fonte", evidence: "Fonte da evidência", attribution: "Fonte de atribuição", cloneOf: "Clone de" },
};

export const getFragrancePageCopy = (locale: Locale): Copy => copies[locale];
