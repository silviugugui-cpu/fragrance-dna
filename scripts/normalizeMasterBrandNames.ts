import Database from "better-sqlite3";
import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import {
  MASTER_BRAND_NAME_GROUPS,
  normalizeMasterBrandName,
} from "../lib/database/brandNames";

type JsonRecord = Record<string, unknown>;

interface FragranceRow {
  row_id: number;
  record_id: string;
  canonical_key: string;
  brand: string;
  perfume: string;
  launch_year: string;
  record_json: string;
}

interface EditorialHouseRow {
  brand_id: string;
  brand_name: string;
  data_json: string;
}

const ROOT = process.cwd();
const JSON_PATH = path.join(ROOT, "data", "generated", "complete-fragrance-database.json");
const PROFILE_PATH = path.join(ROOT, "data", "FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json");
const REPORT_PATH = path.join(ROOT, "data", "generated", "brand-name-normalization-report.json");
const ALIAS_NAMES = new Set<string>(MASTER_BRAND_NAME_GROUPS.flatMap(([canonical, ...aliases]) => [canonical, ...aliases]));
const CANONICAL_NAMES = new Set<string>(MASTER_BRAND_NAME_GROUPS.map(([canonical]) => canonical));
const APPLY = process.argv.includes("--apply");
const KNOWN_ARGUMENTS = new Set(["--apply"]);

function assertArguments(): void {
  if (process.argv.slice(2).some((argument) => !KNOWN_ARGUMENTS.has(argument))) {
    throw new Error("Usage: npx tsx scripts/normalizeMasterBrandNames.ts [--apply]");
  }
}

function parseRecord(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected a JSON object in ${label}.`);
  }
  return value as JsonRecord;
}

function normalizeNamedBrandFields(value: unknown): number {
  if (Array.isArray(value)) return value.reduce((count, item) => count + normalizeNamedBrandFields(item), 0);
  if (!value || typeof value !== "object") return 0;
  let changed = 0;
  for (const [key, child] of Object.entries(value)) {
    if ((key === "brand" || key === "canonicalBrand") && typeof child === "string") {
      const normalized = normalizeMasterBrandName(child);
      if (normalized !== child) {
        (value as JsonRecord)[key] = normalized;
        changed += 1;
      }
    } else {
      changed += normalizeNamedBrandFields(child);
    }
  }
  return changed;
}

function replaceNamedBrandTokens(source: string): { text: string; replacements: number } {
  let replacements = 0;
  const text = source.replace(
    /("(?:brand|canonicalBrand)"\s*:\s*)("(?:\\.|[^"\\])*")/g,
    (_match, prefix: string, encodedValue: string) => {
      const value: unknown = JSON.parse(encodedValue);
      if (typeof value !== "string") return `${prefix}${encodedValue}`;
      const normalized = normalizeMasterBrandName(value);
      if (normalized === value) return `${prefix}${encodedValue}`;
      replacements += 1;
      return `${prefix}${JSON.stringify(normalized)}`;
    },
  );
  return { text, replacements };
}

function countExact(database: InstanceType<typeof Database>, sql: string, name: string): number {
  return (database.prepare(sql).get(name) as { count: number }).count;
}

function exactBrandCounts(database: InstanceType<typeof Database>, names: string[]): Record<string, number> {
  const count = database.prepare("SELECT count(*) AS count FROM fragrances WHERE brand = ? COLLATE BINARY");
  return Object.fromEntries(names.map((name) => [name, (count.get(name) as { count: number }).count]));
}

function normalizeIdentity(value: string): string {
  return value.trim().toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function rowsForDatabase(database: InstanceType<typeof Database>): FragranceRow[] {
  return database.prepare(`
    SELECT row_id, record_id, canonical_key, brand, perfume, launch_year, record_json
    FROM fragrances ORDER BY row_id
  `).all() as FragranceRow[];
}

function expectedCanonicalKey(record: JsonRecord): string {
  const existing = typeof record.canonicalKey === "string" ? record.canonicalKey.trim().toLowerCase() : "";
  if (existing) return existing;
  const brand = normalizeIdentity(normalizeMasterBrandName(String(record.brand ?? "")));
  const perfume = normalizeIdentity(String(record.perfume ?? record.name ?? ""));
  return `${brand}::${perfume}`.toLowerCase();
}

function assertSourceMatchesRows(
  sourceRecords: JsonRecord[],
  rows: FragranceRow[],
): Array<Record<string, unknown>> {
  const identities = new Map<string, Map<string, number>>();
  const keyFor = (recordId: string, canonicalKey: string): string =>
    JSON.stringify([recordId, canonicalKey]);
  for (const record of sourceRecords) {
    const canonicalKey = expectedCanonicalKey(record);
    const recordId = typeof record.id === "string" && record.id.trim()
      ? record.id.trim()
      : typeof record.canonicalKey === "string" && record.canonicalKey.trim()
        ? record.canonicalKey.trim()
        : canonicalKey;
    const brand = typeof record.brand === "string" ? record.brand : "";
    const key = keyFor(recordId, canonicalKey);
    const brands = identities.get(key) ?? new Map<string, number>();
    brands.set(brand, (brands.get(brand) ?? 0) + 1);
    identities.set(key, brands);
  }
  const conflicts: Array<Record<string, unknown>> = [];
  for (const row of rows) {
    const key = keyFor(row.record_id, row.canonical_key);
    const brands = identities.get(key);
    if (!brands || brands.size === 0) {
      throw new Error(`Master JSON identity/brand mismatch for product ${row.record_id}.`);
    }
    const matchingBrand = [...brands.keys()].find((brand) =>
      normalizeMasterBrandName(brand) === normalizeMasterBrandName(row.brand));
    const sourceBrand = matchingBrand ?? brands.keys().next().value as string;
    if (!matchingBrand) {
      conflicts.push({
        productId: row.record_id, rowId: row.row_id,
        sqliteBrand: row.brand, masterJsonBrand: sourceBrand,
      });
    }
    const remaining = (brands.get(sourceBrand) ?? 0) - 1;
    if (remaining === 0) brands.delete(sourceBrand);
    else brands.set(sourceBrand, remaining);
    if (brands.size === 0) identities.delete(key);
  }
  if (identities.size > 0) {
    throw new Error(`Master JSON contains ${identities.size} product identity/brand row(s) absent from SQLite.`);
  }
  return conflicts;
}

function identitySnapshot(database: InstanceType<typeof Database>): string {
  const fragrances = database.prepare(`
    SELECT row_id, record_id, canonical_key FROM fragrances ORDER BY row_id
  `).all();
  const badges = database.prepare("SELECT row_id FROM fragrance_badges ORDER BY row_id").all();
  const editorialFragrances = database.prepare(`
    SELECT row_id, brand_id, source_record_id FROM editorial_fragrances ORDER BY row_id
  `).all();
  const houses = database.prepare("SELECT brand_id FROM editorial_houses ORDER BY brand_id").all();
  return JSON.stringify({ fragrances, badges, editorialFragrances, houses });
}

function readReportCounts(
  database: InstanceType<typeof Database>,
  sourceRecords: JsonRecord[],
): Array<{
  brand: string;
  initialCanonical: number;
  initialAliases: Array<{ name: string; count: number }>;
  initialJsonCanonical: number;
  initialJsonAliases: Array<{ name: string; count: number }>;
  changed: number;
  finalTotal: number;
  sourceTotal: number;
}> {
  return MASTER_BRAND_NAME_GROUPS.map(([brand, ...aliases]) => {
    const names = [brand, ...aliases];
    const columnCounts = exactBrandCounts(database, names);
    const jsonCounts = Object.fromEntries(names.map((name) => [
      name,
      countExact(
        database,
        "SELECT count(*) AS count FROM fragrances WHERE json_extract(record_json, '$.brand') = ? COLLATE BINARY",
        name,
      ),
    ]));
    const sourceCount = sourceRecords.filter((record) =>
      typeof record.brand === "string" && names.some((name) => name === record.brand)).length;
    const initialAliases = aliases.map((name) => ({ name, count: columnCounts[name] }));
    return {
      brand,
      initialCanonical: columnCounts[brand],
      initialAliases,
      initialJsonCanonical: jsonCounts[brand],
      initialJsonAliases: aliases.map((name) => ({ name, count: jsonCounts[name] })),
      changed: initialAliases.reduce((count, alias) => count + alias.count, 0),
      finalTotal: names.reduce((count, name) => count + columnCounts[name], 0),
      sourceTotal: sourceCount,
    };
  });
}

function buildDuplicateCandidates(rows: FragranceRow[]): Array<{
  brand: string;
  perfume: string;
  products: Array<{ rowId: number; productId: string; year: string; concentration: string }>;
}> {
  const groups = new Map<string, {
    brand: string;
    perfume: string;
    products: Array<{ rowId: number; productId: string; year: string; concentration: string }>;
  }>();
  for (const row of rows) {
    const brand = normalizeMasterBrandName(row.brand);
    if (!CANONICAL_NAMES.has(brand)) continue;
    const record = parseRecord(JSON.parse(row.record_json), `fragrances.row_id=${row.row_id}`);
    const perfume = row.perfume || String(record.perfume ?? record.name ?? "");
    const key = `${brand}\u0000${normalizeIdentity(perfume)}`;
    const group = groups.get(key) ?? { brand, perfume, products: [] };
    group.products.push({
      rowId: row.row_id,
      productId: row.record_id,
      year: row.launch_year || String(record.launchYear ?? record.year ?? ""),
      concentration: String(
        record.concentration ?? record.concentrationType ?? record.concentration_type ?? record.strength ?? "",
      ),
    });
    groups.set(key, group);
  }
  return [...groups.values()].filter((group) => group.products.length > 1)
    .sort((left, right) => left.brand.localeCompare(right.brand) || left.perfume.localeCompare(right.perfume));
}

function prepareJson(sourcePath: string, tempPath: string): {
  changedFields: number;
  parsed: JsonRecord;
} {
  const original = fs.readFileSync(sourcePath, "utf8");
  const parsed = parseRecord(JSON.parse(original), sourcePath);
  const sourceChanged = normalizeNamedBrandFields(parsed);
  const prepared = replaceNamedBrandTokens(original);
  if (prepared.replacements !== sourceChanged) {
    throw new Error(
      `Could not preserve JSON formatting safely for ${sourcePath}: expected ${sourceChanged} replacements, found ${prepared.replacements}.`,
    );
  }
  if (sourceChanged > 0) {
    const verification = parseRecord(JSON.parse(prepared.text), `${sourcePath} (prepared)`);
    const remaining = normalizeNamedBrandFields(verification);
    if (remaining !== 0) throw new Error(`Mapped brand names remain in prepared file: ${sourcePath}`);
    fs.writeFileSync(tempPath, prepared.text, "utf8");
  }
  return { changedFields: sourceChanged, parsed };
}

function validateJsonFile(filename: string, expectedCount?: number): void {
  const parsed = parseRecord(JSON.parse(fs.readFileSync(filename, "utf8")), filename);
  if (expectedCount !== undefined && (!Array.isArray(parsed.records) || parsed.records.length !== expectedCount)) {
    throw new Error(`Fragrance record count changed in ${filename}.`);
  }
  if (normalizeNamedBrandFields(parsed) !== 0) throw new Error(`A dictionary alias remains in ${filename}.`);
}

function verifyDatabase(database: InstanceType<typeof Database>, expectedRows: number, verifySearchIndex = true): void {
  const integrity = database.pragma("integrity_check", { simple: true });
  if (integrity !== "ok") {
    throw new Error(`SQLite integrity_check failed: ${String(integrity)}`);
  }
  const foreignKeyViolations = database.pragma("foreign_key_check") as unknown[];
  if (foreignKeyViolations.length > 0) {
    throw new Error(`SQLite foreign_key_check found ${foreignKeyViolations.length} violation(s).`);
  }
  const rowCount = (database.prepare("SELECT count(*) AS count FROM fragrances").get() as { count: number }).count;
  if (rowCount !== expectedRows) throw new Error(`Fragrance count changed: expected ${expectedRows}, found ${rowCount}.`);
  if (verifySearchIndex) {
    database.prepare("INSERT INTO fragrance_search(fragrance_search, rank) VALUES ('integrity-check', 1)").run();
  }
}

function swapFile(tempPath: string, targetPath: string): void {
  const displacedPath = `${targetPath}.brand-normalization-old`;
  if (fs.existsSync(displacedPath)) fs.rmSync(displacedPath, { force: true });
  fs.renameSync(targetPath, displacedPath);
  try {
    fs.renameSync(tempPath, targetPath);
    fs.rmSync(displacedPath, { force: true });
  } catch (error) {
    if (!fs.existsSync(targetPath) && fs.existsSync(displacedPath)) {
      fs.renameSync(displacedPath, targetPath);
    }
    throw error;
  }
}

async function main(): Promise<void> {
  assertArguments();
  loadEnvConfig(ROOT);
  const databasePath = process.env.FRAGRANCEDNA_SQLITE_PATH
    ? path.resolve(process.env.FRAGRANCEDNA_SQLITE_PATH)
    : path.join(ROOT, "data", "generated", "fragrancedna.sqlite");
  const archivePath = `${databasePath}.gz`;
  for (const filename of [databasePath, archivePath, JSON_PATH, PROFILE_PATH]) {
    if (!fs.existsSync(filename)) throw new Error(`Required persistent source not found: ${filename}`);
  }

  const masterPayload = parseRecord(JSON.parse(fs.readFileSync(JSON_PATH, "utf8")), JSON_PATH);
  if (!Array.isArray(masterPayload.records)) throw new Error("Master JSON has no records array.");
  const sourceRecords = masterPayload.records.map((record, index) => parseRecord(record, `records[${index}]`));
  const database = new Database(databasePath);
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");

  const rows = rowsForDatabase(database);
  const initialRowCount = rows.length;
  if (sourceRecords.length !== initialRowCount) {
    throw new Error(`Master JSON/SQLite row counts differ: ${sourceRecords.length} vs ${initialRowCount}.`);
  }
  assertSourceMatchesRows(sourceRecords, rows);
  const sourceConflicts = assertSourceMatchesRows(sourceRecords, rows);
  const counts = readReportCounts(database, sourceRecords);
  const startingIdentitySnapshot = identitySnapshot(database);
  const conflicts: Array<Record<string, unknown>> = [...sourceConflicts];
  const fragranceUpdates: Array<{ row: FragranceRow; json: string; brand: string }> = [];
  for (const row of rows) {
    const record = parseRecord(JSON.parse(row.record_json), `fragrances.row_id=${row.row_id}`);
    const jsonBrand = typeof record.brand === "string" ? record.brand : "";
    const columnCanonical = normalizeMasterBrandName(row.brand);
    const jsonCanonical = normalizeMasterBrandName(jsonBrand);
    if (columnCanonical !== jsonCanonical) {
      if (ALIAS_NAMES.has(row.brand) || ALIAS_NAMES.has(jsonBrand)) {
        conflicts.push({
          rowId: row.row_id, productId: row.record_id, perfume: row.perfume,
          columnBrand: row.brand, jsonBrand,
        });
      }
      continue;
    }
    const nestedUpdates = normalizeNamedBrandFields(record);
    if (columnCanonical !== row.brand || jsonCanonical !== jsonBrand || nestedUpdates > 0) {
      record.brand = columnCanonical;
      fragranceUpdates.push({ row, brand: columnCanonical, json: JSON.stringify(record) });
    }
  }

  const houseRows = database.prepare(`
    SELECT brand_id, brand_name, data_json FROM editorial_houses ORDER BY brand_id
  `).all() as EditorialHouseRow[];
  const houseUpdates: Array<{ row: EditorialHouseRow; name: string; json: string }> = [];
  for (const row of houseRows) {
    const data = parseRecord(JSON.parse(row.data_json), `editorial_houses.${row.brand_id}`);
    const dataName = typeof data.name === "string" ? data.name : "";
    const normalizedColumn = normalizeMasterBrandName(row.brand_name);
    const normalizedName = normalizeMasterBrandName(dataName);
    if (normalizedColumn !== normalizedName) {
      if (ALIAS_NAMES.has(row.brand_name) || ALIAS_NAMES.has(dataName)) {
        conflicts.push({
          brandId: row.brand_id, brandName: row.brand_name, dataJsonName: dataName,
        });
      }
      continue;
    }
    if (normalizedColumn !== row.brand_name || normalizedName !== dataName) {
      data.name = normalizedColumn;
      houseUpdates.push({ row, name: normalizedColumn, json: JSON.stringify(data) });
    }
  }
  if (conflicts.length > 0) {
    database.close();
    throw new Error(`Found ${conflicts.length} conflicting brand identities; no changes were applied: ${JSON.stringify(conflicts)}`);
  }

  const temporaryJsonPath = `${JSON_PATH}.brand-normalization.tmp`;
  const temporaryProfilePath = `${PROFILE_PATH}.brand-normalization.tmp`;
  const temporaryArchivePath = `${archivePath}.brand-normalization.tmp`;
  const temporarySnapshotPath = `${databasePath}.brand-normalization.snapshot.tmp`;
  const preparedMaster = prepareJson(JSON_PATH, temporaryJsonPath);
  const preparedProfiles = prepareJson(PROFILE_PATH, temporaryProfilePath);
  const updatedMasterCount = Array.isArray(preparedMaster.parsed.records)
    ? (preparedMaster.parsed.records as unknown[]).length
    : 0;
  validateJsonFile(
    preparedMaster.changedFields > 0 ? temporaryJsonPath : JSON_PATH,
    updatedMasterCount,
  );
  validateJsonFile(
    preparedProfiles.changedFields > 0 ? temporaryProfilePath : PROFILE_PATH,
  );

  const plannedRows = fragranceUpdates.length;
  const plannedHouses = houseUpdates.length;
  const plannedFields = preparedMaster.changedFields + preparedProfiles.changedFields;
  const plannedChanges = plannedRows + plannedHouses + plannedFields;
  const plan = {
    mode: APPLY ? (plannedChanges ? "apply" : "already-normalized") : "plan-only",
    databasePath,
    archivePath,
    masterJsonPath: JSON_PATH,
    userDnaProfilePath: PROFILE_PATH,
    fragranceRows: initialRowCount,
    houses: counts.map((entry) => ({
      ...entry,
      changed: fragranceUpdates.filter((update) => update.brand === entry.brand).length,
    })),
    plannedFragranceRows: plannedRows,
    plannedEditorialHouses: plannedHouses,
    plannedMasterJsonFields: preparedMaster.changedFields,
    plannedUserDnaFields: preparedProfiles.changedFields,
    conflicts,
  };
  if (!APPLY) {
    console.log(JSON.stringify(plan, null, 2));
    database.close();
    fs.rmSync(temporaryJsonPath, { force: true });
    fs.rmSync(temporaryProfilePath, { force: true });
    return;
  }

  let backupDirectory = "";
  let backupDatabase = "";
  let backupArchive = "";
  let backupJson = "";
  let backupProfiles = "";
  if (plannedChanges > 0) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    backupDirectory = path.join(ROOT, "data", "generated", "brand-normalization-backups", timestamp);
    fs.mkdirSync(backupDirectory, { recursive: true });
    backupDatabase = path.join(backupDirectory, path.basename(databasePath));
    backupArchive = path.join(backupDirectory, path.basename(archivePath));
    backupJson = path.join(backupDirectory, path.basename(JSON_PATH));
    await database.backup(backupDatabase);
    fs.copyFileSync(archivePath, backupArchive);
    fs.copyFileSync(JSON_PATH, backupJson);
    if (preparedProfiles.changedFields > 0) {
      backupProfiles = path.join(backupDirectory, path.basename(PROFILE_PATH));
      fs.copyFileSync(PROFILE_PATH, backupProfiles);
    }
  }

  try {
    if (plannedRows > 0 || plannedHouses > 0) {
      const updateFragrance = database.prepare("UPDATE fragrances SET brand = ?, record_json = ? WHERE row_id = ?");
      const updateHouse = database.prepare("UPDATE editorial_houses SET brand_name = ?, data_json = ? WHERE brand_id = ?");
      const applyDatabaseUpdates = database.transaction(() => {
        for (const update of fragranceUpdates) {
          if (updateFragrance.run(update.brand, update.json, update.row.row_id).changes !== 1) {
            throw new Error(`Could not update fragrance row ${update.row.row_id}.`);
          }
        }
        for (const update of houseUpdates) {
          if (updateHouse.run(update.name, update.json, update.row.brand_id).changes !== 1) {
            throw new Error(`Could not update editorial house ${update.row.brand_id}.`);
          }
        }
        if (plannedRows > 0) {
          database.prepare("INSERT INTO fragrance_search(fragrance_search) VALUES ('rebuild')").run();
        }
      });
      applyDatabaseUpdates();
    }

    verifyDatabase(database, initialRowCount);
    if (identitySnapshot(database) !== startingIdentitySnapshot) {
      throw new Error("Product IDs or editorial relationships changed during normalization.");
    }
    const finalRows = rowsForDatabase(database);
    const remaining: Array<{ brand: string; column: number; json: number }> = [];
    for (const [canonical, ...aliases] of MASTER_BRAND_NAME_GROUPS) {
      const initial = counts.find((entry) => entry.brand === canonical);
      if (!initial) throw new Error(`Missing initial counts for ${canonical}.`);
      const total = [canonical, ...aliases]
        .reduce((sum, name) => sum + countExact(database, "SELECT count(*) AS count FROM fragrances WHERE brand = ? COLLATE BINARY", name), 0);
      if (total !== initial.finalTotal) {
        throw new Error(`Product total changed for ${canonical}: ${initial.finalTotal} vs ${total}.`);
      }
      for (const alias of aliases) {
        const column = countExact(database, "SELECT count(*) AS count FROM fragrances WHERE brand = ? COLLATE BINARY", alias);
        const json = countExact(
          database,
          "SELECT count(*) AS count FROM fragrances WHERE json_extract(record_json, '$.brand') = ? COLLATE BINARY",
          alias,
        );
        if (column > 0 || json > 0) remaining.push({ brand: alias, column, json });
      }
    }
    if (remaining.length > 0) throw new Error(`Aliases remain after migration: ${JSON.stringify(remaining)}`);

    const masterAfter = JSON.parse(fs.readFileSync(
      preparedMaster.changedFields > 0 ? temporaryJsonPath : JSON_PATH,
      "utf8",
    )) as JsonRecord;
    const profileAfter = JSON.parse(fs.readFileSync(
      preparedProfiles.changedFields > 0 ? temporaryProfilePath : PROFILE_PATH,
      "utf8",
    )) as JsonRecord;
    const duplicateCandidates = buildDuplicateCandidates(finalRows);
    const nextCounts = counts.map((entry) => {
      const total = countExact(database, "SELECT count(*) AS count FROM fragrances WHERE brand = ? COLLATE BINARY", entry.brand);
      return { brand: entry.brand, initialTotal: entry.finalTotal, changed: entry.changed, finalTotal: total };
    });
    const report = {
      ...plan,
      mode: plannedChanges > 0 ? "applied" : "already-normalized",
      backupDirectory: backupDirectory || null,
      backups: {
        sqlite: backupDatabase || null,
        sqliteArchive: backupArchive || null,
        masterJson: backupJson || null,
        userDnaProfiles: backupProfiles || null,
      },
      counts: nextCounts,
      conflictCount: 0,
      duplicateCandidateCount: duplicateCandidates.length,
      duplicateCandidates,
      checks: {
        rowCountUnchanged: finalRows.length === initialRowCount,
        identityAndRelationshipIdsUnchanged: true,
        oldSpellingsRemaining: 0,
        integrityCheck: "ok",
        foreignKeyViolations: 0,
        fullTextIndex: "integrity-check passed",
        masterJsonRecords: Array.isArray(masterAfter.records) ? masterAfter.records.length : 0,
        userDnaProfileFile: Boolean(profileAfter),
      },
      completedAt: new Date().toISOString(),
    };

    if (plannedChanges > 0) {
      await database.backup(temporarySnapshotPath);
      const snapshot = new Database(temporarySnapshotPath, { readonly: true, fileMustExist: true });
      try {
        verifyDatabase(snapshot, initialRowCount, false);
      } finally {
        snapshot.close();
      }
      fs.writeFileSync(temporaryArchivePath, gzipSync(fs.readFileSync(temporarySnapshotPath), { level: 9 }));
      const archiveVerification = gunzipSync(fs.readFileSync(temporaryArchivePath));
      if (archiveVerification.length !== fs.statSync(temporarySnapshotPath).size) {
        throw new Error("Prepared SQLite archive failed decompression-size verification.");
      }
      swapFile(temporaryJsonPath, JSON_PATH);
      if (preparedProfiles.changedFields > 0) swapFile(temporaryProfilePath, PROFILE_PATH);
      swapFile(temporaryArchivePath, archivePath);
      validateJsonFile(JSON_PATH, initialRowCount);
      if (preparedProfiles.changedFields > 0) validateJsonFile(PROFILE_PATH);
      fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    } else if (!fs.existsSync(REPORT_PATH) ||
      (JSON.parse(fs.readFileSync(REPORT_PATH, "utf8")) as JsonRecord).mode !== "applied") {
      fs.rmSync(temporaryJsonPath, { force: true });
      fs.rmSync(temporaryProfilePath, { force: true });
      fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    } else {
      fs.rmSync(temporaryJsonPath, { force: true });
      fs.rmSync(temporaryProfilePath, { force: true });
    }

    console.log(JSON.stringify({
      mode: report.mode,
      databasePath,
      rowCount: initialRowCount,
      backupDirectory: report.backupDirectory,
      reportPath: REPORT_PATH,
      houses: nextCounts,
      updatedEditorialHouses: plannedHouses,
      duplicateCandidateCount: duplicateCandidates.length,
      integrityCheck: "ok",
      foreignKeyViolations: 0,
    }, null, 2));
  } catch (error) {
    database.close();
    if (backupDatabase) fs.copyFileSync(backupDatabase, databasePath);
    if (backupJson) fs.copyFileSync(backupJson, JSON_PATH);
    if (backupProfiles) fs.copyFileSync(backupProfiles, PROFILE_PATH);
    if (backupArchive) fs.copyFileSync(backupArchive, archivePath);
    throw error;
  } finally {
    if (database.open) database.close();
    fs.rmSync(temporaryJsonPath, { force: true });
    fs.rmSync(temporaryProfilePath, { force: true });
    fs.rmSync(temporaryArchivePath, { force: true });
    fs.rmSync(temporarySnapshotPath, { force: true });
  }
}

main().catch((error: unknown) => {
  console.error(`[brand-name-normalization] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
