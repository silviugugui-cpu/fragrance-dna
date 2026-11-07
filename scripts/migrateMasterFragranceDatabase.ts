import fs from "node:fs";
import path from "node:path";
import {
  countMasterFragrances,
  getMasterDatabaseIndexes,
  getMasterFragranceDatabasePath,
  rebuildFragranceSearchIndex,
  replaceMasterUserDnaProfiles,
  replaceMasterFragrances,
  vacuumMasterFragranceDatabase,
  type MasterFragranceRecord,
  type UserDnaProfileRecord,
} from "../lib/database/masterFragranceDatabase";
import { buildMasterUserDnaAssignments } from "../lib/database/userDnaProfileIndex";

const ROOT = process.cwd();
const MASTER_JSON_PATH = path.join(ROOT, "data", "generated", "complete-fragrance-database.json");
const USER_DNA_PATH = path.join(ROOT, "data", "FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json");
const REPLACE_EXISTING = process.argv.includes("--replace");

const migrate = (): void => {
  if (!fs.existsSync(MASTER_JSON_PATH)) throw new Error(`Master JSON not found: ${MASTER_JSON_PATH}`);
  if (!fs.existsSync(USER_DNA_PATH)) throw new Error(`User DNA profile file not found: ${USER_DNA_PATH}`);

  const databasePath = getMasterFragranceDatabasePath();
  if (fs.existsSync(databasePath)) {
    if (!REPLACE_EXISTING) throw new Error(`SQLite DB already exists. Pass --replace to back it up and rebuild: ${databasePath}`);
    const backupPath = `${databasePath}.before-${new Date().toISOString().replace(/[:.]/g, "-")}.bak`;
    fs.copyFileSync(databasePath, backupPath);
  }

  rebuildFragranceSearchIndex();

  const masterPayload = JSON.parse(fs.readFileSync(MASTER_JSON_PATH, "utf8")) as {
    generatedAt?: string;
    records?: MasterFragranceRecord[];
  };
  const records = Array.isArray(masterPayload.records) ? masterPayload.records : [];
  if (records.length === 0) throw new Error("Master JSON has no fragrance records.");

  const userDnaPayload = JSON.parse(fs.readFileSync(USER_DNA_PATH, "utf8")) as {
    FragranceDNA_USER_ATTRIBUTE_LAYER_v3?: { layers?: UserDnaProfileRecord[] };
    layers?: UserDnaProfileRecord[];
  };
  const profiles = userDnaPayload.FragranceDNA_USER_ATTRIBUTE_LAYER_v3?.layers ?? userDnaPayload.layers ?? [];
  const userDnaAssignments = buildMasterUserDnaAssignments(records, profiles);

  replaceMasterFragrances(records);
  replaceMasterUserDnaProfiles(userDnaAssignments);
  vacuumMasterFragranceDatabase();

  const actualCount = countMasterFragrances();
  if (actualCount !== records.length) throw new Error(`Master row count mismatch: expected ${records.length}, found ${actualCount}`);
  const report = {
    mode: REPLACE_EXISTING ? "replaced" : "created",
    databasePath: path.relative(ROOT, databasePath),
    sourceMasterJson: path.relative(ROOT, MASTER_JSON_PATH),
    userDnaSourceFile: path.relative(ROOT, USER_DNA_PATH),
    masterGeneratedAt: masterPayload.generatedAt ?? "unknown",
    masterRecords: actualCount,
    sourceUserDnaProfileRows: profiles.length,
    uniqueUserDnaProfiles: profiles.length,
    canonicalFragrancesWithUserDnaProfiles: userDnaAssignments.length,
    indexes: getMasterDatabaseIndexes(),
    createdAt: new Date().toISOString(),
  };
  const reportPath = path.join(ROOT, "data", "generated", "master-fragrance-sqlite-migration.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
};

try {
  migrate();
} catch (error) {
  console.error(`[master-fragrance-sqlite-migration] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}