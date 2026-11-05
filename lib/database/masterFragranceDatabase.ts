import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { BadgeFilters, FragranceBadges } from "../fragranceBadges";
import { fragranceBadgeSchema, badgeFilterSql, badgesFromColumns, type BadgeColumns } from "./fragranceBadgeStorage";
import { INSPIRATION_SQL } from "../fragranceClassification";

export interface MasterFragranceRecord {
  [key: string]: unknown;
  id?: string;
  canonicalKey?: string;
  perfume?: string;
  name?: string;
  brand?: string;
  brandType?: string;
  launchYear?: string;
  confidence?: number;
  status?: string;
  source?: string;
  externalId?: string;
  imageUrl?: string;
  localImagePath?: string;
  externalUrl?: string;
  rating?: string | number;
  voteCount?: string | number;
  sourceFingerprint?: string;
  gender?: string;
  perfumer?: string;
  notes?: string[];
  mainAccords?: string[];
  description?: string;
  userDnaTestEnabled?: boolean;
  userDnaProfiles?: UserDnaProfileRecord[];
  badges?: FragranceBadges;
}

export interface UserDnaProfileRecord {
  [key: string]: unknown;
  name?: string;
  testProfileId?: string;
  canonicalFragranceId?: string;
  canonicalBrand?: string;
  canonicalPerfume?: string;
  canonicalImageUrl?: string;
  canonicalLocalImagePath?: string;
  type?: string;
  dna_axes?: Record<string, number>;
  semantic_v1?: Record<string, number>;
  user_attributes_v3?: {
    abstract?: string[];
    concrete?: string[];
  };
}

type SqliteConnection = InstanceType<typeof Database>;
type IndexedRecord = { row_id: number; record_id: string; record_json: string };

const DATABASE_PATH = process.env.FRAGRANCEDNA_SQLITE_PATH
  ? path.resolve(process.env.FRAGRANCEDNA_SQLITE_PATH)
  : path.join(process.cwd(), "data", "generated", "fragrancedna.sqlite");

const schemaSql = `
  CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS fragrances (
    row_id INTEGER PRIMARY KEY,
    record_id TEXT NOT NULL,
    canonical_key TEXT NOT NULL,
    brand TEXT NOT NULL,
    brand_type TEXT NOT NULL DEFAULT 'N/A',
    perfume TEXT NOT NULL,
    launch_year TEXT NOT NULL DEFAULT '',
    rating TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    local_image_path TEXT NOT NULL DEFAULT '',
    user_dna_test_enabled INTEGER NOT NULL DEFAULT 0,
    record_json TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_fragrances_record_id ON fragrances(record_id);
  ${fragranceBadgeSchema}
  CREATE INDEX IF NOT EXISTS idx_fragrances_canonical_key ON fragrances(canonical_key);
  CREATE INDEX IF NOT EXISTS idx_fragrances_brand ON fragrances(brand COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_fragrances_perfume ON fragrances(perfume COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_fragrances_brand_type ON fragrances(brand_type);
  CREATE INDEX IF NOT EXISTS idx_fragrances_brand_type_brand ON fragrances(brand_type, brand COLLATE NOCASE);
  CREATE INDEX IF NOT EXISTS idx_fragrances_launch_year ON fragrances(launch_year);
  CREATE INDEX IF NOT EXISTS idx_fragrances_rating ON fragrances(CAST(rating AS REAL));
  CREATE VIRTUAL TABLE IF NOT EXISTS fragrance_search USING fts5(
    brand,
    perfume,
    content = 'fragrances',
    content_rowid = 'row_id',
    tokenize = 'unicode61 remove_diacritics 2'
  );
`;

const normalizeIdentity = (value: string): string =>
  value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");

const toText = (value: unknown): string => String(value ?? "").trim();

const toSearchText = (value: unknown): string => Array.isArray(value)
  ? value.map((entry) => String(entry)).join(" ")
  : "";

const buildCanonicalKey = (record: MasterFragranceRecord): string => {
  const brand = normalizeIdentity(toText(record.brand));
  const perfume = normalizeIdentity(toText(record.perfume ?? record.name));
  return String(record.canonicalKey ?? `${brand}::${perfume}`).trim().toLowerCase();
};

const buildRecordId = (record: MasterFragranceRecord): string =>
  toText(record.id ?? record.canonicalKey) || buildCanonicalKey(record);

const buildIndexedValues = (record: MasterFragranceRecord) => ({
  recordId: buildRecordId(record),
  canonicalKey: buildCanonicalKey(record),
  brand: toText(record.brand),
  brandType: toText(record.brandType) || "N/A",
  perfume: toText(record.perfume ?? record.name),
  launchYear: toText(record.launchYear),
  rating: toText(record.rating),
  source: toText(record.source),
  imageUrl: toText(record.imageUrl),
  localImagePath: toText(record.localImagePath),
  userDnaTestEnabled: record.userDnaTestEnabled === true ? 1 : 0,
  notes: toSearchText(record.notes),
  accords: toSearchText(record.mainAccords),
  json: JSON.stringify(record),
});

const globalDatabase = globalThis as typeof globalThis & { __fragranceDatabase?: SqliteConnection };
let localConnection: SqliteConnection | undefined;

export const getMasterFragranceDatabasePath = (): string => DATABASE_PATH;

export const isMasterFragranceDatabaseReadOnly = (): boolean =>
  process.env.VERCEL === "1" || process.env.FRAGRANCEDNA_SQLITE_READONLY === "true";

const assertMasterDatabaseWritable = (): void => {
  if (isMasterFragranceDatabaseReadOnly()) {
    throw new Error("The standalone SQLite database is read-only in this deployment. Edit locally and redeploy to publish changes.");
  }
};

const ensureUserDnaIndex = (database: SqliteConnection): void => {
  const columns = database.prepare("PRAGMA table_info(fragrances)").all() as Array<{ name: string }>;
  if (!columns.some((column) => column.name === "user_dna_test_enabled")) {
    database.exec("ALTER TABLE fragrances ADD COLUMN user_dna_test_enabled INTEGER NOT NULL DEFAULT 0;");
  }
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_fragrances_user_dna_test_enabled
    ON fragrances(user_dna_test_enabled, brand COLLATE NOCASE, perfume COLLATE NOCASE);
  `);
};

export const getMasterFragranceDatabase = (): SqliteConnection => {
  if (localConnection) return localConnection;
  if (globalDatabase.__fragranceDatabase) {
    localConnection = globalDatabase.__fragranceDatabase;
    return localConnection;
  }

  fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
  const readOnly = isMasterFragranceDatabaseReadOnly();
  const database = readOnly
    ? new Database(DATABASE_PATH, { readonly: true, fileMustExist: true })
    : new Database(DATABASE_PATH);
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  if (readOnly) {
    database.pragma("query_only = ON");
  } else {
    database.pragma("journal_mode = DELETE");
    database.exec(schemaSql);
    ensureUserDnaIndex(database);
  }
  localConnection = database;
  globalDatabase.__fragranceDatabase = database;
  return database;
};

const insertFragrance = (database: SqliteConnection, record: MasterFragranceRecord): number => {
  const value = buildIndexedValues(record);
  const result = database.prepare(`
    INSERT INTO fragrances (
      record_id, canonical_key, brand, brand_type, perfume, launch_year, rating,
      source, image_url, local_image_path, user_dna_test_enabled, record_json
    ) VALUES (
      @recordId, @canonicalKey, @brand, @brandType, @perfume, @launchYear, @rating,
      @source, @imageUrl, @localImagePath, @userDnaTestEnabled, @json
    )
  `).run(value);
  const rowId = Number(result.lastInsertRowid);
  database.prepare(`
    INSERT INTO fragrance_search(rowid, brand, perfume)
    VALUES (?, ?, ?)
  `).run(rowId, value.brand, value.perfume);
  return rowId;
};

const updateFragranceRow = (database: SqliteConnection, rowId: number, record: MasterFragranceRecord): void => {
  const value = buildIndexedValues(record);
  const previous = database.prepare("SELECT brand, perfume FROM fragrances WHERE row_id = ?")
    .get(rowId) as { brand: string; perfume: string } | undefined;
  if (previous) {
    database.prepare(`
      INSERT INTO fragrance_search(fragrance_search, rowid, brand, perfume)
      VALUES ('delete', ?, ?, ?)
    `).run(rowId, previous.brand, previous.perfume);
  }
  database.prepare(`
    UPDATE fragrances SET record_id=@recordId, canonical_key=@canonicalKey, brand=@brand,
      brand_type=@brandType, perfume=@perfume, launch_year=@launchYear, rating=@rating,
      source=@source, image_url=@imageUrl, local_image_path=@localImagePath,
      user_dna_test_enabled=@userDnaTestEnabled, record_json=@json
    WHERE row_id=@rowId
  `).run({ ...value, rowId });
  database.prepare(`
    INSERT INTO fragrance_search(rowid, brand, perfume)
    VALUES (?, ?, ?)
  `).run(rowId, value.brand, value.perfume);
};

export const readAllMasterFragrances = (): MasterFragranceRecord[] => {
  const rows = getMasterFragranceDatabase().prepare("SELECT record_json FROM fragrances ORDER BY row_id").all() as Array<{ record_json: string }>;
  return rows.map((row) => JSON.parse(row.record_json) as MasterFragranceRecord);
};

export const updateMasterFragranceLocalImage = (recordIdentity: string, localImagePath: string): number => {
  assertMasterDatabaseWritable();
  const identity = recordIdentity.trim();
  const imagePath = localImagePath.trim();
  if (!identity || !imagePath) {
    throw new Error("A fragrance identity and local image path are required.");
  }

  const database = getMasterFragranceDatabase();
  const update = database.transaction(() => {
    const rows = database.prepare(`
      SELECT row_id, record_json FROM fragrances
      WHERE record_id = ? OR canonical_key = ?
    `).all(identity, identity) as Array<{ row_id: number; record_json: string }>;
    const save = database.prepare(`
      UPDATE fragrances SET local_image_path = ?, record_json = ? WHERE row_id = ?
    `);

    for (const row of rows) {
      const record = JSON.parse(row.record_json) as MasterFragranceRecord;
      record.localImagePath = imagePath;
      if (Array.isArray(record.userDnaProfiles)) {
        record.userDnaProfiles = record.userDnaProfiles.map((profile) => ({
          ...profile,
          canonicalLocalImagePath: imagePath,
        }));
      }
      save.run(imagePath, JSON.stringify(record), row.row_id);
    }

    return rows.length;
  });

  return update();
};

export const readMasterFragrancesByRecordIds = (recordIds: string[]): MasterFragranceRecord[] => {
  const ids = [...new Set(recordIds.map((recordId) => recordId.trim()).filter(Boolean))].slice(0, 500);
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(", ");
  const rows = getMasterFragranceDatabase()
    .prepare(`SELECT record_json, b.community_level, b.popularity_level, b.olfactive_level
      FROM fragrances LEFT JOIN fragrance_badges b ON b.row_id = fragrances.row_id
      WHERE record_id IN (${placeholders}) OR canonical_key IN (${placeholders}) ORDER BY fragrances.row_id`)
    .all(...ids, ...ids) as Array<{ record_json: string } & BadgeColumns>;
  return rows.map((row) => ({ ...JSON.parse(row.record_json) as MasterFragranceRecord, badges: badgesFromColumns(row) }));
};

export const readMasterFragranceRecordsForCollection = (recordIds: string[]): MasterFragranceRecord[] => {
  const records = readMasterFragrancesByRecordIds(recordIds);
  const byRequestedId = new Map(records.flatMap((record) => {
    const id = buildRecordId(record);
    const canonical = buildCanonicalKey(record);
    return [[id, record], [canonical, record]] as Array<[string, MasterFragranceRecord]>;
  }));
  return [...new Set(recordIds.map((id) => byRequestedId.get(id.trim())).filter((record): record is MasterFragranceRecord => Boolean(record)))];
};

export const countMasterFragrances = (): number => {
  const result = getMasterFragranceDatabase().prepare("SELECT COUNT(*) AS count FROM fragrances").get() as { count: number };
  return result.count;
};

export const readMasterUserDnaProfiles = (): Array<UserDnaProfileRecord & { canonicalFragranceId: string }> => {
  const rows = getMasterFragranceDatabase().prepare(`
    SELECT record_id, record_json FROM fragrances
    WHERE user_dna_test_enabled = 1 ORDER BY row_id
  `).all() as Array<{ record_id: string; record_json: string }>;
  const profiles = new Map<string, UserDnaProfileRecord & { canonicalFragranceId: string }>();
  for (const row of rows) {
    const record = JSON.parse(row.record_json) as MasterFragranceRecord;
    for (const profile of record.userDnaProfiles ?? []) {
      const profileId = toText(profile.testProfileId);
      if (profileId && !profiles.has(profileId)) {
        profiles.set(profileId, {
          ...profile,
          canonicalFragranceId: row.record_id,
          canonicalBrand: toText(record.brand),
          canonicalPerfume: toText(record.perfume ?? record.name),
          canonicalImageUrl: toText(record.imageUrl),
          canonicalLocalImagePath: toText(record.localImagePath),
        });
      }
    }
  }
  return [...profiles.values()];
};

export const replaceMasterUserDnaProfiles = (
  assignments: Array<{ recordId: string; profiles: UserDnaProfileRecord[] }>,
): void => {
  assertMasterDatabaseWritable();
  const database = getMasterFragranceDatabase();
  const replace = database.transaction((items: typeof assignments) => {
    const previouslyEnabled = database.prepare(`
      SELECT row_id, record_json FROM fragrances WHERE user_dna_test_enabled = 1
    `).all() as Array<{ row_id: number; record_json: string }>;
    const clear = database.prepare(`
      UPDATE fragrances SET user_dna_test_enabled = 0, record_json = ? WHERE row_id = ?
    `);
    for (const row of previouslyEnabled) {
      const record = JSON.parse(row.record_json) as MasterFragranceRecord;
      delete record.userDnaProfiles;
      delete record.userDnaTestEnabled;
      clear.run(JSON.stringify(record), row.row_id);
    }

    const findRows = database.prepare("SELECT row_id, record_json FROM fragrances WHERE record_id = ?");
    const save = database.prepare(`
      UPDATE fragrances SET user_dna_test_enabled = 1, record_json = ? WHERE row_id = ?
    `);
    for (const assignment of items) {
      const rows = findRows.all(assignment.recordId) as Array<{ row_id: number; record_json: string }>;
      if (rows.length === 0) throw new Error(`Master fragrance not found for User DNA profile: ${assignment.recordId}`);
      for (const row of rows) {
        const record = JSON.parse(row.record_json) as MasterFragranceRecord;
        record.userDnaTestEnabled = true;
        record.userDnaProfiles = assignment.profiles;
        save.run(JSON.stringify(record), row.row_id);
      }
    }
    database.prepare("INSERT OR REPLACE INTO metadata(key, value) VALUES ('user_dna_profile_count', ?)")
      .run(String(items.reduce((count, item) => count + item.profiles.length, 0)));
    database.exec("DROP TABLE IF EXISTS user_dna_profiles;");
  });
  replace(assignments);
};

export const replaceMasterFragrances = (records: MasterFragranceRecord[]): void => {
  assertMasterDatabaseWritable();
  const database = getMasterFragranceDatabase();
  const replace = database.transaction((items: MasterFragranceRecord[]) => {
    database.prepare("INSERT INTO fragrance_search(fragrance_search) VALUES ('delete-all')").run();
    database.exec("DELETE FROM fragrances;");
    for (const record of items) insertFragrance(database, record);
    database.prepare("INSERT OR REPLACE INTO metadata(key, value) VALUES ('record_count', ?)").run(String(items.length));
  });
  replace(records);
};

export const insertMasterFragrance = (record: MasterFragranceRecord): void => {
  assertMasterDatabaseWritable();
  const database = getMasterFragranceDatabase();
  insertFragrance(database, record);
  database.prepare("INSERT OR REPLACE INTO metadata(key, value) VALUES ('record_count', ?)")
    .run(String(countMasterFragrances()));
};

export const updateMasterFragrancesByRecordId = (recordId: string, records: MasterFragranceRecord[]): boolean => {
  assertMasterDatabaseWritable();
  const database = getMasterFragranceDatabase();
  const rowIds = database.prepare("SELECT row_id FROM fragrances WHERE record_id = ? ORDER BY row_id")
    .all(recordId) as Array<{ row_id: number }>;
  if (rowIds.length === 0 || rowIds.length !== records.length) return false;
  const update = database.transaction(() => rowIds.forEach((row, index) => updateFragranceRow(database, row.row_id, records[index])));
  update();
  return true;
};

export const deleteMasterFragrancesByRecordId = (recordId: string): number => {
  assertMasterDatabaseWritable();
  const database = getMasterFragranceDatabase();
  const remove = database.transaction(() => {
    const rows = database.prepare("SELECT row_id, brand, perfume FROM fragrances WHERE record_id = ?")
      .all(recordId) as Array<{ row_id: number; brand: string; perfume: string }>;
    for (const row of rows) {
      database.prepare(`
        INSERT INTO fragrance_search(fragrance_search, rowid, brand, perfume)
        VALUES ('delete', ?, ?, ?)
      `).run(row.row_id, row.brand, row.perfume);
    }
    const result = database.prepare("DELETE FROM fragrances WHERE record_id = ?").run(recordId);
    database.prepare("INSERT OR REPLACE INTO metadata(key, value) VALUES ('record_count', ?)")
      .run(String(countMasterFragrances()));
    return result.changes;
  });
  return remove();
};

export const getMasterDatabaseIndexes = (): string[] => {
  const rows = getMasterFragranceDatabase().prepare("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name").all() as Array<{ name: string }>;
  return rows.map((row) => row.name);
};

export const getMasterDatabaseSearchResult = (searchText: string, limit = 50): MasterFragranceRecord[] => {
  const terms = searchText.trim().toLowerCase().replace(/[^a-z0-9\s]+/g, " ").split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const match = terms.map((term) => `"${term.replace(/"/g, "")}"*`).join(" AND ");
  const rows = getMasterFragranceDatabase().prepare(`
    SELECT fragrances.record_json, b.community_level, b.popularity_level, b.olfactive_level
    FROM fragrance_search JOIN fragrances ON fragrances.row_id = fragrance_search.rowid
    LEFT JOIN fragrance_badges b ON b.row_id = fragrances.row_id
    WHERE fragrance_search MATCH ? ORDER BY rank LIMIT ?
  `).all(match, Math.max(1, Math.min(500, limit))) as Array<{ record_json: string } & BadgeColumns>;
  return rows.map((row) => ({ ...JSON.parse(row.record_json) as MasterFragranceRecord, badges: badgesFromColumns(row) }));
};

export interface FragranceSearchFilters {
  inspiredBy?: boolean;
  originRegion?: string;
  query?: string;
  brandType?: string;
  brand?: string;
  gender?: string;
  accord?: string;
  anyAccords?: string[];
  yearFrom?: number;
  yearTo?: number;
  minRating?: number;
  badges?: BadgeFilters;
}

const hasAnyFilterCriteria = (filters: FragranceSearchFilters): boolean =>
  Boolean(
    filters.query?.trim() ||
    filters.inspiredBy || filters.originRegion ||
    filters.brandType ||
    filters.brand ||
    filters.gender ||
    filters.accord ||
    (filters.anyAccords && filters.anyAccords.length > 0) ||
    filters.yearFrom !== undefined ||
    filters.yearTo !== undefined ||
    filters.minRating !== undefined ||
    Object.values(filters.badges ?? {}).some(Boolean),
  );

// Some sources rate on a 0-10 scale; normalize everything to the 0-5 scale.
const NORMALIZED_RATING_SQL =
  "CASE WHEN CAST(fragrances.rating AS REAL) > 5 THEN CAST(fragrances.rating AS REAL) / 2 ELSE CAST(fragrances.rating AS REAL) END";

// Weight rating by vote count so obscure perfect scores do not dominate browsing.
const WEIGHTED_RATING_SQL =
  `(${NORMALIZED_RATING_SQL}) * (CAST(COALESCE(json_extract(fragrances.record_json, '$.voteCount'), '0') AS REAL) / (CAST(COALESCE(json_extract(fragrances.record_json, '$.voteCount'), '0') AS REAL) + 25.0))`;

// Filtered search over indexed columns plus JSON1 lookups into record_json.
// Text matches rank first via FTS5; otherwise results order by community rating.
export const searchMasterFragrances = (
  filters: FragranceSearchFilters,
  limit = 36,
): MasterFragranceRecord[] => {
  if (!hasAnyFilterCriteria(filters)) return [];

  const where: string[] = [];
  const params: unknown[] = [];
  let join = "";
  let orderBy = `${WEIGHTED_RATING_SQL} DESC, fragrances.perfume COLLATE NOCASE ASC`;

  const terms = (filters.query ?? "").trim().toLowerCase().replace(/[^a-z0-9\s]+/g, " ").split(/\s+/).filter(Boolean);
  if (terms.length > 0) {
    join = "JOIN fragrance_search ON fragrances.row_id = fragrance_search.rowid";
    where.push("fragrance_search MATCH ?");
    params.push(terms.map((term) => `"${term.replace(/"/g, "")}"*`).join(" AND "));
    orderBy = "rank";
  }
  if (filters.brandType) {
    where.push("fragrances.brand_type = ?");
    params.push(filters.brandType);
  }
  if (filters.inspiredBy) where.push(INSPIRATION_SQL);
  if (filters.originRegion) {
    where.push("json_extract(fragrances.record_json, '$.originRegion') = ?");
    params.push(filters.originRegion);
  }
  if (filters.brand) {
    where.push("fragrances.brand = ? COLLATE NOCASE");
    params.push(filters.brand);
  }
  if (filters.gender) {
    where.push("json_extract(fragrances.record_json, '$.gender') = ?");
    params.push(filters.gender);
  }
  if (filters.accord) {
    where.push("EXISTS (SELECT 1 FROM json_each(fragrances.record_json, '$.mainAccords') WHERE json_each.value = ?)");
    params.push(filters.accord);
  }
  if (filters.anyAccords && filters.anyAccords.length > 0) {
    where.push(
      `EXISTS (SELECT 1 FROM json_each(fragrances.record_json, '$.mainAccords') WHERE json_each.value IN (${filters.anyAccords.map(() => "?").join(", ")}))`,
    );
    params.push(...filters.anyAccords);
  }
  if (filters.yearFrom !== undefined) {
    where.push("CAST(fragrances.launch_year AS INTEGER) >= ?");
    params.push(filters.yearFrom);
  }
  if (filters.yearTo !== undefined) {
    where.push("fragrances.launch_year <> '' AND CAST(fragrances.launch_year AS INTEGER) <= ?");
    params.push(filters.yearTo);
  }
  if (filters.minRating !== undefined) {
    where.push(`fragrances.rating <> '' AND ${NORMALIZED_RATING_SQL} >= ?`);
    params.push(filters.minRating);
  }
  const badgeFilters = badgeFilterSql(filters.badges ?? {});
  where.push(...badgeFilters.clauses);
  params.push(...badgeFilters.params);

  const rows = getMasterFragranceDatabase().prepare(`
    SELECT fragrances.record_json, b.community_level, b.popularity_level, b.olfactive_level
    FROM fragrances ${join} LEFT JOIN fragrance_badges b ON b.row_id = fragrances.row_id
    WHERE ${where.join(" AND ")}
    ORDER BY ${orderBy}
    LIMIT ?
  `).all(...params, Math.max(1, Math.min(200, limit))) as Array<{ record_json: string } & BadgeColumns>;
  return rows.map((row) => ({ ...JSON.parse(row.record_json) as MasterFragranceRecord, badges: badgesFromColumns(row) }));
};

export const listMasterFragranceBrands = (brandType?: string): string[] => {
  if (brandType === "inspired_by") {
    return (getMasterFragranceDatabase().prepare(`SELECT DISTINCT brand FROM fragrances WHERE ${INSPIRATION_SQL} AND brand <> '' ORDER BY brand COLLATE NOCASE`).all() as Array<{ brand: string }>).map((row) => row.brand);
  }
  const rows = brandType
    ? getMasterFragranceDatabase().prepare(
        "SELECT DISTINCT brand FROM fragrances WHERE brand_type = ? AND brand <> '' ORDER BY brand COLLATE NOCASE",
      ).all(brandType) as Array<{ brand: string }>
    : getMasterFragranceDatabase().prepare(
        "SELECT DISTINCT brand FROM fragrances WHERE brand <> '' ORDER BY brand COLLATE NOCASE",
      ).all() as Array<{ brand: string }>;
  return rows.map((row) => row.brand);
};

export const rebuildFragranceSearchIndex = (): void => {
  assertMasterDatabaseWritable();
  const database = getMasterFragranceDatabase();
  database.exec("DROP TABLE IF EXISTS fragrance_search;");
  database.exec(`
    CREATE VIRTUAL TABLE fragrance_search USING fts5(
      brand,
      perfume,
      content = 'fragrances',
      content_rowid = 'row_id',
      tokenize = 'unicode61 remove_diacritics 2'
    );
  `);
  database.prepare("INSERT INTO fragrance_search(fragrance_search) VALUES ('rebuild')").run();
};

export const vacuumMasterFragranceDatabase = (): void => {
  assertMasterDatabaseWritable();
  getMasterFragranceDatabase().exec("VACUUM;");
};