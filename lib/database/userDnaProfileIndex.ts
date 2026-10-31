import type { MasterFragranceRecord, UserDnaProfileRecord } from "@/lib/database/masterFragranceDatabase";

type ProfileAssignment = { recordId: string; profiles: UserDnaProfileRecord[] };

const normalizeIdentity = (value: string): string =>
  value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");

const slugify = (value: string): string =>
  value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const profileCompleteness = (profile: UserDnaProfileRecord): number =>
  Object.keys(profile.dna_axes ?? {}).length * 100
  + Object.keys(profile.semantic_v1 ?? {}).length * 10
  + (profile.user_attributes_v3?.abstract?.length ?? 0)
  + (profile.user_attributes_v3?.concrete?.length ?? 0);

const canonicalRecordOverrides = new Map(Object.entries({
  "Azzaro The Most Wanted": "azzaro::themostwanted",
  "Bleu de Chanel EDP": "chanel::bleudechaneleaudeparfum",
  "Bleu de Chanel EDT": "chanel::bleudechanel",
  "Chanel Allure Homme Sport": "chanel::allurehommesport",
  "Chanel Egoiste Platinum": "chanel::egoisteplatinum",
  "Chanel Platinum Egoiste": "chanel::egoisteplatinum",
  "Dior Sauvage Elixir": "dior::sauvageelixir",
  "Erba Gold": "xerjoff::erbagold",
  Follow: "kerosene::follow",
  "Givenchy Gentleman Society": "givenchy::gentlemansociety",
  "Ile Pourpre": "lesliquidesimaginaires::lilepourpre",
  "Montabaco Intensivo": "ormondejayne::4montabacointensivo",
  "Montblanc Explorer": "montblanc::explorer",
  "Narcotic Delight": "initio::narcoticdelight",
  "Ombre Leather": "tomford::ombreleather2018",
  "Prada Luna Rossa Carbon": "prada::lunarossacarbon",
  Renaissance: "xerjoff::xj1861renaissance",
  "Royal Oud": "creed::royaloud",
  "Sauvage EDP": "dior::sauvageeaudeparfum",
  "Sauvage EDT": "dior::sauvage",
  "Terre d'Hermes EDT": "hermes::terredhermes",
  "Valentino Born In Roma": "valentino::valentinodonnaborninroma",
  "Versace Dylan Blue": "versace::versacepourhommedylanblue",
  "Versace Eros": "versace::eros",
  "Y EDP": "yvessaintlaurent::yeaudeparfum",
  "YSL Y EDP": "yvessaintlaurent::yeaudeparfum",
}).map(([name, recordId]) => [normalizeIdentity(name), recordId]));

export const buildMasterUserDnaAssignments = (
  records: MasterFragranceRecord[],
  sourceProfiles: UserDnaProfileRecord[],
): ProfileAssignment[] => {
  const recordsById = new Map<string, MasterFragranceRecord[]>();
  const recordsByPerfume = new Map<string, MasterFragranceRecord[]>();
  for (const record of records) {
    const recordId = String(record.id ?? record.canonicalKey ?? "").trim();
    const perfumeKey = normalizeIdentity(String(record.perfume ?? record.name ?? ""));
    if (recordId) recordsById.set(recordId, [...(recordsById.get(recordId) ?? []), record]);
    if (perfumeKey) recordsByPerfume.set(perfumeKey, [...(recordsByPerfume.get(perfumeKey) ?? []), record]);
  }

  const mappedProfiles = sourceProfiles.map((profile, index) => {
    const name = String(profile.name ?? "").trim();
    const key = normalizeIdentity(name);
    if (!name || !key) throw new Error(`User DNA profile at row ${index + 1} has no name.`);

    const override = canonicalRecordOverrides.get(key);
    const exactMatches = recordsByPerfume.get(key) ?? [];
    const recordId = override ?? (exactMatches.length === 1
      ? String(exactMatches[0].id ?? exactMatches[0].canonicalKey ?? "").trim()
      : "");
    if (!recordId || !recordsById.has(recordId)) {
      throw new Error(`Unable to resolve User DNA profile "${name}" to one canonical fragrance record.`);
    }

    return { profile, recordId, index };
  });

  const profilesByName = new Map<string, typeof mappedProfiles>();
  for (const entry of mappedProfiles) {
    const base = slugify(String(entry.profile.name ?? "")) || `fragrance-${entry.index + 1}`;
    profilesByName.set(base, [...(profilesByName.get(base) ?? []), entry]);
  }

  const usedProfileIds = new Set<string>();
  for (const [base, entries] of profilesByName) {
    entries.sort((left, right) => profileCompleteness(right.profile) - profileCompleteness(left.profile) || left.index - right.index);
    entries.forEach((entry, index) => {
      let profileId = index === 0 ? base : `${base}-${index + 1}`;
      let suffix = index + 2;
      while (usedProfileIds.has(profileId)) {
        profileId = `${base}-${suffix}`;
        suffix += 1;
      }
      usedProfileIds.add(profileId);
      entry.profile.testProfileId = profileId;
    });
  }

  const assignments = new Map<string, UserDnaProfileRecord[]>();
  for (const { recordId, profile } of mappedProfiles) {
    assignments.set(recordId, [...(assignments.get(recordId) ?? []), profile]);
  }
  return Array.from(assignments, ([recordId, profiles]) => ({ recordId, profiles }));
};