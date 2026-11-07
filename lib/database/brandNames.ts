const BRAND_NAME_GROUPS = [
  ["Victoria's Secret", "Victoria s Secret"],
  ["Bath & Body Works", "Bath Body Works"],
  ["Xerjoff", "XerJoff"],
  ["L'Occitane en Provence", "L Occitane En Provence"],
  ["Lancôme", "Lancome"],
  ["M. Micallef", "M Micallef"],
  ["Bond No. 9", "Bond No 9"],
  ["Boadicea the Victorious", "Boadicea The Victorious"],
  ["JAFRA", "Jafra"],
  ["Hermès", "Hermes"],
  ["Dolce&Gabbana", "Dolce Gabbana", "Dolce & Gabbana"],
  ["Penhaligon's", "Penhaligon S"],
  ["Acqua di Parma", "Acqua Di Parma"],
  ["Réminiscence", "Reminiscence"],
  ["s.Oliver", "S Oliver"],
  ["Ramón Monegal", "Ramon Monegal"],
  ["Farmacia SS. Annunziata 1561", "Farmacia Ss Annunziata", "Farmacia SS. Annunziata"],
  ["Histoires de Parfums", "Histoires De Parfums"],
  ["Parfums de Marly", "Parfums De Marly"],
  ["Masakï Matsushïma", "Masaki Matsushima"],
  ["Rancé 1795", "Rance 1795"],
  ["Stéphane Humbert Lucas 777", "Stephane Humbert Lucas 777"],
  ["Floraïku", "Floraiku"],
  ["MPF", "Mpf"],
  ["BDK Parfums", "bdk Parfums"],
  ["Rosendo Mateu", "Rosendo Mateu Olfactive Expressions", "Rosendo Mateu - Olfactive Expressions"],
  ["bugatti Fashion", "Bugatti Fashion"],
  ["CÂLINE", "Caline", "Câline"],
] as const;

const CANONICAL_BRAND_NAMES = new Map<string, string>();

for (const [canonical, ...aliases] of BRAND_NAME_GROUPS) {
  CANONICAL_BRAND_NAMES.set(canonical, canonical);
  for (const alias of aliases) CANONICAL_BRAND_NAMES.set(alias, canonical);
}

export const MASTER_BRAND_NAME_GROUPS = BRAND_NAME_GROUPS;

export const normalizeMasterBrandName = (brand: string): string =>
  CANONICAL_BRAND_NAMES.get(brand) ?? brand;
