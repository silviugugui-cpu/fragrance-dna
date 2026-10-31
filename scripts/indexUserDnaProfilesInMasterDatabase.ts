import fs from "node:fs";
import path from "node:path";
import {
  getMasterFragranceDatabasePath,
  getMasterFragranceDatabase,
  readAllMasterFragrances,
  readMasterUserDnaProfiles,
  replaceMasterUserDnaProfiles,
} from "../lib/database/masterFragranceDatabase";
import { buildMasterUserDnaAssignments } from "../lib/database/userDnaProfileIndex";
import type { UserDnaProfileRecord } from "../lib/database/masterFragranceDatabase";

const ROOT = process.cwd();
const USER_DNA_PATH = path.join(ROOT, "data", "FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json");

const indexProfiles = (): void => {
  if (!fs.existsSync(USER_DNA_PATH)) throw new Error(`User DNA profile file not found: ${USER_DNA_PATH}`);

  const databasePath = getMasterFragranceDatabasePath();
  if (!fs.existsSync(databasePath)) throw new Error(`Master SQLite database not found: ${databasePath}`);

  const backupDirectory = path.join(ROOT, "tmp", "user-dna-migration-backups");
  fs.mkdirSync(backupDirectory, { recursive: true });
  const backupName = `fragrancedna-before-user-dna-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`;
  const backupPath = path.join(backupDirectory, backupName);
  fs.copyFileSync(databasePath, backupPath);

  const source = JSON.parse(fs.readFileSync(USER_DNA_PATH, "utf8")) as {
    FragranceDNA_USER_ATTRIBUTE_LAYER_v3?: { layers?: UserDnaProfileRecord[] };
    layers?: UserDnaProfileRecord[];
  };
  const profiles = source.FragranceDNA_USER_ATTRIBUTE_LAYER_v3?.layers ?? source.layers ?? [];
  const assignments = buildMasterUserDnaAssignments(readAllMasterFragrances(), profiles);
  replaceMasterUserDnaProfiles(assignments);

  const indexedProfiles = readMasterUserDnaProfiles();
  if (indexedProfiles.length !== profiles.length) {
    throw new Error(`Indexed profile count mismatch: expected ${profiles.length}, found ${indexedProfiles.length}.`);
  }

  const database = getMasterFragranceDatabase();
  const indexedRows = database.prepare("SELECT COUNT(*) AS count FROM fragrances WHERE user_dna_test_enabled = 1")
    .get() as { count: number };
  const indexes = database.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_fragrances_user_dna%'")
    .all() as Array<{ name: string }>;

  console.log(JSON.stringify({
    databasePath: path.relative(ROOT, databasePath),
    backupPath: path.relative(ROOT, backupPath),
    masterFragrances: countMasterRecords(database),
    sourceProfiles: profiles.length,
    indexedProfiles: indexedProfiles.length,
    canonicalRowsInPool: indexedRows.count,
    userDnaIndexes: indexes.map((index) => index.name),
  }, null, 2));
};

const countMasterRecords = (database: ReturnType<typeof getMasterFragranceDatabase>): number => {
  const result = database.prepare("SELECT COUNT(*) AS count FROM fragrances").get() as { count: number };
  return result.count;
};

try {
  indexProfiles();
} catch (error) {
  console.error(`[user-dna-master-index] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}