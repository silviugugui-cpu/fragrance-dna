import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { MasterFragranceRecord } from "../lib/database/masterFragranceDatabase";
import { normalizeMasterBrandName } from "../lib/database/brandNames";

type JsonRecord = Record<string, unknown>;

interface ResearchedPerfume {
  fragrance_id: string;
  brand: string;
  perfume: string;
  launch_year: string | null;
  gender: string | null;
  perfumers_json: string | null;
  description: string | null;
  accords_json: string;
  canonical_profile_id: string;
}

interface ResearchedProfile {
  profile_id: string;
  fragrance_id: string;
  profile_type: string;
  source_id: string;
  is_canonical: number;
  top_notes_json: string | null;
  heart_notes_json: string | null;
  base_notes_json: string | null;
  key_notes_json: string | null;
  remarks_ro: string | null;
}

interface ResearchedImage {
  image_id: number;
  fragrance_id: string;
  role: string;
  local_path: string;
  image_url: string | null;
  source_page: string | null;
  source_type: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  byte_size: number;
  sha256: string;
  visual_status: string;
  visual_qa_ro: string | null;
  rights_status: string;
}

interface SourceRow {
  source_id: string;
  title: string;
  url: string;
  source_type: string;
  accessed_on: string | null;
  access_method: string | null;
}

interface MasterRow {
  row_id: number;
  record_id: string;
  canonical_key: string;
  source: string;
  record_json: string;
}

const ROOT = process.cwd();
const MASTER_JSON_PATH = path.join(ROOT, "data", "generated", "complete-fragrance-database.json");
const MASTER_SQLITE_PATH = path.join(ROOT, "data", "generated", "fragrancedna.sqlite");
const USER_DNA_PATH = path.join(ROOT, "data", "FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json");
const IMAGE_DESTINATION = path.join(ROOT, "public", "images", "documented-perfumes");
const LEGACY_SOURCE_PATTERN = /fragdb/i;

const ACCORD_CANONICAL: Record<string, string> = {
  ambrat: "amber",
  aromatic: "aromatic",
  cafea: "coffee",
  citrice: "citrus",
  condimentat: "spicy",
  "condimentat cald": "warm spicy",
  "condimentat proaspăt": "fresh spicy",
  dulce: "sweet",
  floral: "floral",
  "floral alb": "white floral",
  "floral întunecat": "dark floral",
  fructat: "fruity",
  "fructat verde": "green fruity",
  "fructe uscate": "dried fruit",
  gourmand: "gourmand",
  iris: "iris",
  lemnos: "woody",
  mentolat: "minty",
  moscat: "musky",
  patchouli: "patchouli",
  pudrat: "powdery",
  pământiu: "earthy",
  solar: "solar",
  tutun: "tobacco",
  vanilat: "vanilla",
};

const normalizeIdentity = (value: string): string => value
  .normalize("NFKD")
  .replace(/\p{Diacritic}/gu, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "");

const identityFor = (brand: string, perfume: string): string =>
  `${normalizeIdentity(brand)}::${normalizeIdentity(perfume)}`;

const parseStringArray = (value: string | null, label: string): string[] => {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
    throw new Error(`Invalid string array in ${label}.`);
  }
  return parsed;
};

const sha256 = (filename: string): string =>
  createHash("sha256").update(fs.readFileSync(filename)).digest("hex");

const stripLegacyReferences = (value: unknown): void => {
  if (Array.isArray(value)) {
    for (let index = value.length - 1; index >= 0; index -= 1) {
      const item: unknown = value[index];
      if (typeof item === "string" && LEGACY_SOURCE_PATTERN.test(item)) {
        value.splice(index, 1);
      } else {
        stripLegacyReferences(item);
      }
    }
    return;
  }

  if (value === null || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (LEGACY_SOURCE_PATTERN.test(key) ||
      typeof child === "string" && LEGACY_SOURCE_PATTERN.test(child)) {
      delete (value as JsonRecord)[key];
    } else {
      stripLegacyReferences(child);
    }
  }
};

const hasLegacyReference = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(hasLegacyReference);
  if (value === null || typeof value !== "object") {
    return typeof value === "string" && LEGACY_SOURCE_PATTERN.test(value);
  }
  return Object.entries(value).some(([key, child]) =>
    LEGACY_SOURCE_PATTERN.test(key) || hasLegacyReference(child));
};

const oneMatch = <T>(matches: T[], description: string): T => {
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${description}, found ${matches.length}.`);
  }
  return matches[0];
};

const main = (): void => {
  const [sourceArgument, applyArgument, ...extraArguments] = process.argv.slice(2);
  if (!sourceArgument || applyArgument !== "--apply" || extraArguments.length > 0) {
    throw new Error("Usage: npx tsx scripts/importDocumentedPerfumes.ts <research.sqlite> --apply");
  }

  const sourcePath = path.resolve(sourceArgument);
  if (!fs.existsSync(sourcePath)) throw new Error(`Research database not found: ${sourcePath}`);
  if (!fs.existsSync(MASTER_JSON_PATH)) throw new Error(`Master JSON not found: ${MASTER_JSON_PATH}`);
  if (!fs.existsSync(MASTER_SQLITE_PATH)) throw new Error(`Master SQLite not found: ${MASTER_SQLITE_PATH}`);

  const sourceDatabase = new Database(sourcePath, { readonly: true, fileMustExist: true });
  const database = new Database(MASTER_SQLITE_PATH);
  const sourceDirectory = path.dirname(sourcePath);
  const createdImages: string[] = [];
  const temporaryJsonPath = `${MASTER_JSON_PATH}.documented-import.tmp`;
  const backupJsonPath = `${MASTER_JSON_PATH}.documented-import.bak`;
  let masterJsonWasReplaced = false;
  let databaseCommitted = false;

  try {
    const researchedPerfumes = sourceDatabase
      .prepare("SELECT * FROM perfumes ORDER BY brand, perfume")
      .all() as ResearchedPerfume[];
    if (researchedPerfumes.length !== 10) {
      throw new Error(`Expected 10 documented perfumes, found ${researchedPerfumes.length}.`);
    }

    const masterPayload = JSON.parse(fs.readFileSync(MASTER_JSON_PATH, "utf8")) as JsonRecord;
    if (!Array.isArray(masterPayload.records)) throw new Error("Master JSON has no records array.");
    const masterRecords = masterPayload.records as MasterFragranceRecord[];
    const sqliteRows = database.prepare("SELECT row_id, record_id, canonical_key, source, record_json FROM fragrances")
      .all() as MasterRow[];
    const imageRows = sourceDatabase.prepare("SELECT * FROM images ORDER BY fragrance_id, role")
      .all() as ResearchedImage[];
    const allProfiles = sourceDatabase.prepare("SELECT * FROM note_profiles ORDER BY fragrance_id, profile_id")
      .all() as ResearchedProfile[];
    const provenanceRows = sourceDatabase.prepare("SELECT * FROM field_provenance ORDER BY fragrance_id, field_name")
      .all() as JsonRecord[];
    const issueRows = sourceDatabase.prepare("SELECT * FROM research_issues ORDER BY fragrance_id, issue_id")
      .all() as JsonRecord[];
    const photoResearchRows = sourceDatabase.prepare("SELECT * FROM product_photo_research ORDER BY fragrance_id")
      .all() as JsonRecord[];

    const preparedImages = imageRows.map((image) => {
      const sourceImagePath = path.resolve(sourceDirectory, image.local_path);
      const relativeSourcePath = path.relative(sourceDirectory, sourceImagePath);
      if (relativeSourcePath.startsWith("..") || path.isAbsolute(relativeSourcePath)) {
        throw new Error(`Image path escapes the supplied package: ${image.local_path}`);
      }
      if (!fs.existsSync(sourceImagePath)) throw new Error(`Documented image not found: ${sourceImagePath}`);
      const stats = fs.statSync(sourceImagePath);
      if (!stats.isFile() || stats.size !== image.byte_size || sha256(sourceImagePath) !== image.sha256) {
        throw new Error(`Documented image failed manifest verification: ${sourceImagePath}`);
      }
      const filename = `${image.fragrance_id}--${path.basename(image.local_path)}`;
      const destinationPath = path.join(IMAGE_DESTINATION, filename);
      if (fs.existsSync(destinationPath) && sha256(destinationPath) !== image.sha256) {
        throw new Error(`Conflicting image already exists: ${destinationPath}`);
      }
      return {
        ...image,
        sourceImagePath,
        destinationPath,
        publicPath: `/images/documented-perfumes/${filename}`,
      };
    });

    const replacements = researchedPerfumes.map((researched) => {
      const identity = identityFor(researched.brand, researched.perfume);
      const identityRows = masterRecords.filter((record) =>
        identityFor(String(record.brand ?? ""), String(record.perfume ?? record.name ?? "")) === identity);
      const legacyRecord = oneMatch(
        identityRows.filter((record) => record.source === "fragdb-sample"),
        `legacy master JSON record for ${researched.brand} ${researched.perfume}`,
      );
      const canonicalKey = String(legacyRecord.canonicalKey ?? "");
      if (!canonicalKey) throw new Error(`Missing canonical key for ${researched.brand} ${researched.perfume}.`);

      const matchingSqliteRows = sqliteRows.filter((row) => row.canonical_key === canonicalKey);
      const legacyRow = oneMatch(
        matchingSqliteRows.filter((row) => row.source === "fragdb-sample"),
        `legacy SQLite row for ${researched.brand} ${researched.perfume}`,
      );
      const preexistingRows = matchingSqliteRows.filter((row) => row.source !== "fragdb-sample");
      if (preexistingRows.length > 1) {
        throw new Error(`Multiple non-legacy SQLite rows found for ${researched.brand} ${researched.perfume}.`);
      }
      const masterRow = preexistingRows[0] ?? legacyRow;
      const sourceRecord = masterRow === legacyRow
        ? legacyRecord
        : oneMatch(
            identityRows.filter((record) => record.source === masterRow.source),
            `pre-existing master JSON record for ${researched.brand} ${researched.perfume}`,
          );
      const duplicateLegacyRecord = sourceRecord === legacyRecord ? undefined : legacyRecord;
      const duplicateLegacyRow = masterRow === legacyRow ? undefined : legacyRow;

      const canonicalProfile = oneMatch(
        allProfiles.filter((profile) =>
          profile.profile_id === researched.canonical_profile_id &&
          profile.fragrance_id === researched.fragrance_id &&
          Boolean(profile.is_canonical)),
        `canonical note profile for ${researched.brand} ${researched.perfume}`,
      );
      const profiles = allProfiles.filter((profile) => profile.fragrance_id === researched.fragrance_id);
      const top = parseStringArray(canonicalProfile.top_notes_json, `${canonicalProfile.profile_id}.top`);
      const heart = parseStringArray(canonicalProfile.heart_notes_json, `${canonicalProfile.profile_id}.heart`);
      const base = parseStringArray(canonicalProfile.base_notes_json, `${canonicalProfile.profile_id}.base`);
      const keyNotes = parseStringArray(canonicalProfile.key_notes_json, `${canonicalProfile.profile_id}.key`);
      const notes = [...top, ...heart, ...base, ...keyNotes];
      if (notes.length === 0) throw new Error(`No documented notes for ${researched.brand} ${researched.perfume}.`);

      const accords = parseStringArray(researched.accords_json, `${researched.fragrance_id}.accords`)
        .map((accord) => {
          const canonical = ACCORD_CANONICAL[accord];
          if (!canonical) throw new Error(`Unmapped researched accord "${accord}" on ${researched.perfume}.`);
          return canonical;
        });
      const primaryImage = oneMatch(
        preparedImages.filter((image) => image.fragrance_id === researched.fragrance_id && image.role === "primary"),
        `primary image for ${researched.brand} ${researched.perfume}`,
      );

      const provenance = provenanceRows.filter((row) => row.fragrance_id === researched.fragrance_id);
      const sourceIds = new Set<string>([
        ...profiles.map((profile) => profile.source_id),
        ...provenance.map((row) => String(row.source_id)),
      ]);
      const sourceList = sourceIds.size === 0 ? [] : sourceDatabase.prepare(
        `SELECT * FROM sources WHERE source_id IN (${[...sourceIds].map(() => "?").join(",")}) ORDER BY source_id`,
      ).all(...sourceIds) as SourceRow[];
      const documentation = {
        sourceRecordId: researched.fragrance_id,
        canonicalProfileId: canonicalProfile.profile_id,
        noteProfiles: profiles.map((profile) => ({
          profileType: profile.profile_type,
          isCanonical: Boolean(profile.is_canonical),
          sourceId: profile.source_id,
          top: parseStringArray(profile.top_notes_json, `${profile.profile_id}.top`),
          heart: parseStringArray(profile.heart_notes_json, `${profile.profile_id}.heart`),
          base: parseStringArray(profile.base_notes_json, `${profile.profile_id}.base`),
          key: parseStringArray(profile.key_notes_json, `${profile.profile_id}.key`),
          remarksRo: profile.remarks_ro,
        })),
        fieldProvenance: provenance,
        researchIssues: issueRows.filter((row) => row.fragrance_id === researched.fragrance_id),
        sources: sourceList,
        images: preparedImages.filter((image) => image.fragrance_id === researched.fragrance_id).map((image) => ({
          role: image.role,
          path: image.publicPath,
          sourcePage: image.source_page,
          sourceType: image.source_type,
          visualStatus: image.visual_status,
          rightsStatus: image.rights_status,
          publicationPermissionConfirmed: true,
          visualQaRo: image.visual_qa_ro,
          sha256: image.sha256,
        })),
        photoResearch: photoResearchRows.filter((row) => row.fragrance_id === researched.fragrance_id),
        editorialDescriptionRo: researched.description,
      };

      const notesByStage = top.length + heart.length + base.length > 0
        ? { top, heart, base }
        : undefined;
      const updatedRecord = { ...sourceRecord } as MasterFragranceRecord & JsonRecord;
      updatedRecord.brand = normalizeMasterBrandName(String(updatedRecord.brand ?? researched.brand));
      updatedRecord.source = "documented-research";
      updatedRecord.launchYear = researched.launch_year ?? undefined;
      updatedRecord.gender = researched.gender ?? undefined;
      updatedRecord.perfumer = parseStringArray(
        researched.perfumers_json,
        `${researched.fragrance_id}.perfumers`,
      ).join(", ") || undefined;
      updatedRecord.mainAccords = accords;
      updatedRecord.notes = notes;
      updatedRecord.localImagePath = primaryImage.publicPath;
      updatedRecord.researchDocumentation = documentation;
      if (notesByStage) updatedRecord.notesByStage = notesByStage;
      else delete updatedRecord.notesByStage;
      delete updatedRecord.description;
      delete updatedRecord.imageUrl;
      delete updatedRecord.blobImageUrl;
      delete updatedRecord.externalId;
      delete updatedRecord.externalUrl;
      delete updatedRecord.sourceFingerprint;
      delete updatedRecord.confidence;
      delete updatedRecord.rating;
      delete updatedRecord.voteCount;
      delete updatedRecord.badges;

      return {
        researched,
        identity,
        sourceRecord,
        duplicateLegacyRecord,
        masterRow,
        duplicateLegacyRow,
        updatedRecord,
        primaryImage,
      };
    });

    const targetRecordIds = new Set(replacements.map((replacement) => replacement.masterRow.record_id));
    if (targetRecordIds.size !== 10) throw new Error("The ten imported identities are not unique.");
    const recordsToRemove = new Set(replacements.flatMap(({ duplicateLegacyRecord }) =>
      duplicateLegacyRecord ? [duplicateLegacyRecord] : []));
    const replacementBySourceRecord = new Map(replacements.map((replacement) => [
      replacement.sourceRecord,
      replacement.updatedRecord,
    ]));
    const replacementsByRecordId = new Map(replacements.map((replacement) => [
      replacement.masterRow.record_id,
      replacement.primaryImage.publicPath,
    ]));
    const replacementsByIdentity = new Map(replacements.map((replacement) => [
      replacement.identity,
      replacement.primaryImage.publicPath,
    ]));
    const updateDnaImageReferences = (value: unknown): number => {
      if (Array.isArray(value)) {
        return value.reduce((count, item) => count + updateDnaImageReferences(item), 0);
      }
      if (value === null || typeof value !== "object") return 0;
      const record = value as JsonRecord;
      const recordId = String(record.canonicalFragranceId ?? "");
      const brand = String(record.canonicalBrand ?? record.brand ?? "");
      const perfume = String(record.canonicalPerfume ?? record.perfume ?? "");
      const imagePath = replacementsByRecordId.get(recordId) ??
        replacementsByIdentity.get(identityFor(brand, perfume));
      let updated = 0;
      if (typeof imagePath === "string" && imagePath.length > 0) {
        record.canonicalLocalImagePath = imagePath;
        delete record.canonicalImageUrl;
        updated += 1;
      }
      for (const child of Object.values(record)) {
        updated += updateDnaImageReferences(child);
      }
      return updated;
    };
    for (const replacement of replacements) {
      updateDnaImageReferences(replacement.updatedRecord.userDnaProfiles);
    }

    const updatedMasterRecords = masterRecords.flatMap((record) => {
      if (recordsToRemove.has(record)) return [];
      return [replacementBySourceRecord.get(record) ?? record];
    });
    masterPayload.records = updatedMasterRecords;
    updateDnaImageReferences(updatedMasterRecords);
    stripLegacyReferences(masterPayload);
    masterPayload.totalCombinedPerfumes = updatedMasterRecords.length;
    masterPayload.generatedAt = new Date().toISOString();
    if (hasLegacyReference(masterPayload)) {
      throw new Error("Legacy source references remain in the master JSON after cleanup.");
    }

    const jsonTempContents = `${JSON.stringify(masterPayload, null, 2)}\n`;
    fs.writeFileSync(temporaryJsonPath, jsonTempContents, "utf8");
    fs.copyFileSync(MASTER_JSON_PATH, backupJsonPath, fs.constants.COPYFILE_EXCL);

    fs.mkdirSync(IMAGE_DESTINATION, { recursive: true });
    for (const image of preparedImages) {
      if (fs.existsSync(image.destinationPath)) continue;
      fs.copyFileSync(image.sourceImagePath, image.destinationPath, fs.constants.COPYFILE_EXCL);
      createdImages.push(image.destinationPath);
      if (sha256(image.destinationPath) !== image.sha256) {
        throw new Error(`Copied image failed checksum verification: ${image.destinationPath}`);
      }
    }

    const replaceRow = database.prepare(`
      UPDATE fragrances
      SET source = ?, launch_year = ?, rating = '', image_url = '', local_image_path = ?, record_json = ?
      WHERE row_id = ? AND record_id = ?
    `);
    const deleteBadges = database.prepare("DELETE FROM fragrance_badges WHERE row_id = ?");
    const deleteDuplicate = database.prepare("DELETE FROM fragrances WHERE row_id = ? AND source = 'fragdb-sample'");
    const selectLegacyRows = database.prepare(`
      SELECT row_id, record_id, source, local_image_path, record_json
      FROM fragrances
      WHERE lower(source) LIKE '%fragdb%'
         OR lower(local_image_path) LIKE '%fragdb%'
         OR lower(record_json) LIKE '%fragdb%'
    `);
    const legacyRows = selectLegacyRows.all() as Array<{
      row_id: number;
      record_id: string;
      source: string;
      local_image_path: string;
      record_json: string;
    }>;
    const legacyRecordUpdates = legacyRows.flatMap((row) => {
      if (targetRecordIds.has(row.record_id)) return [];
      const record = JSON.parse(row.record_json) as JsonRecord;
      stripLegacyReferences(record);
      const source = typeof record.source === "string" ? record.source : "";
      return [{ rowId: row.row_id, source, image: String(record.localImagePath ?? ""), recordJson: JSON.stringify(record) }];
    });
    const updateLegacy = database.prepare(`
      UPDATE fragrances SET source = ?, local_image_path = ?, record_json = ? WHERE row_id = ?
    `);
    const deleteLegacyMetadata = database.prepare("DELETE FROM metadata WHERE lower(key) LIKE '%fragdb%' OR lower(value) LIKE '%fragdb%'");

    const persist = database.transaction(() => {
      for (const replacement of replacements) {
        const record = replacement.updatedRecord;
        const changed = replaceRow.run(
          "documented-research",
          replacement.researched.launch_year,
          replacement.primaryImage.publicPath,
          JSON.stringify(record),
          replacement.masterRow.row_id,
          replacement.masterRow.record_id,
        );
        if (changed.changes !== 1) throw new Error(`Failed to update canonical record ${replacement.masterRow.record_id}.`);
        deleteBadges.run(replacement.masterRow.row_id);
        if (replacement.duplicateLegacyRow) {
          deleteBadges.run(replacement.duplicateLegacyRow.row_id);
          const deleted = deleteDuplicate.run(replacement.duplicateLegacyRow.row_id);
          if (deleted.changes !== 1) {
            throw new Error(`Failed to remove duplicate legacy row ${replacement.duplicateLegacyRow.record_id}.`);
          }
        }
      }
      for (const row of legacyRecordUpdates) {
        updateLegacy.run(row.source, row.image, row.recordJson, row.rowId);
      }
      deleteLegacyMetadata.run();
      const recordCount = database.prepare("SELECT COUNT(*) AS count FROM fragrances").get() as { count: number };
      database.prepare("UPDATE metadata SET value = ? WHERE key = 'record_count'").run(String(recordCount.count));
      database.prepare("INSERT INTO fragrance_search(fragrance_search) VALUES ('rebuild')").run();
      fs.renameSync(temporaryJsonPath, MASTER_JSON_PATH);
      masterJsonWasReplaced = true;
      const integrity = database.pragma("integrity_check", { simple: true });
      if (integrity !== "ok") throw new Error(`Master SQLite integrity check failed: ${String(integrity)}`);
    });
    databaseCommitted = true;

    try {
      persist();
    } catch (error) {
      if (!databaseCommitted && masterJsonWasReplaced && fs.existsSync(backupJsonPath)) {
        fs.copyFileSync(backupJsonPath, MASTER_JSON_PATH);
      }
      throw error;
    }

    fs.unlinkSync(backupJsonPath);
    const finalLegacyCount = database.prepare(`
      SELECT COUNT(*) AS count FROM fragrances
      WHERE lower(source) LIKE '%fragdb%'
         OR lower(local_image_path) LIKE '%fragdb%'
         OR lower(record_json) LIKE '%fragdb%'
    `).get() as { count: number };
    if (finalLegacyCount.count !== 0 || hasLegacyReference(updatedMasterRecords)) {
      throw new Error(`Legacy references remain after import (${finalLegacyCount.count} SQLite rows).`);
    }

    if (fs.existsSync(USER_DNA_PATH)) {
      const userDnaPayload = JSON.parse(fs.readFileSync(USER_DNA_PATH, "utf8")) as JsonRecord;
      stripLegacyReferences(userDnaPayload);
      updateDnaImageReferences(userDnaPayload);
      fs.writeFileSync(USER_DNA_PATH, `${JSON.stringify(userDnaPayload, null, 2)}\n`, "utf8");
    }

    console.log(JSON.stringify({
      imported: replacements.length,
      preservedCanonicalIds: replacements.map(({ masterRow }) => masterRow.record_id),
      importedPhotos: preparedImages.length,
      clearedBadges: replacements.length,
      removedDuplicateRows: replacements.filter(({ duplicateLegacyRow }) => duplicateLegacyRow).length,
      clearedLegacyRows: legacyRows.length,
      clearedLegacyFingerprintsFromExport: true,
      integrity: "ok",
    }, null, 2));
  } catch (error) {
    if (fs.existsSync(temporaryJsonPath)) fs.unlinkSync(temporaryJsonPath);
    if (fs.existsSync(backupJsonPath)) {
      if (!databaseCommitted && masterJsonWasReplaced) fs.copyFileSync(backupJsonPath, MASTER_JSON_PATH);
      fs.unlinkSync(backupJsonPath);
    }
    if (!databaseCommitted) {
      for (const filename of createdImages) {
        if (fs.existsSync(filename)) fs.unlinkSync(filename);
      }
    }
    throw error;
  } finally {
    sourceDatabase.close();
    database.close();
  }
};

try {
  main();
} catch (error) {
  console.error(`[documented-perfume-import] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
