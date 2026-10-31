import { neon } from "@neondatabase/serverless";
import { promises as fs } from "fs";
import path from "path";

export type PersistentUserProfile = {
  dnaProfile?: unknown;
  dnaSession?: unknown;
  grounding?: unknown;
  groundingVector?: unknown;
  seed?: unknown;
  collection?: unknown;
  ratedAttributes?: unknown;
  testPlanSelections?: unknown;
  profileResetAt?: string;
};

export type NeonUserRow = {
  id: string;
  email: string;
  name: string;
  provider: "email" | "google" | "apple";
  created_at: string;
  password_hash: string | null;
  avatar: string | null;
  oauth_provider_id: string | null;
  is_admin: boolean;
};

let schemaReady: Promise<void> | null = null;

export const isNeonConfigured = (): boolean => Boolean(process.env.DATABASE_URL?.trim());

export const getNeonSql = () => {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("Neon is not configured. Add DATABASE_URL to the deployment environment.");
  }
  return neon(databaseUrl);
};

export const ensureNeonSchema = async (): Promise<void> => {
  if (schemaReady) return schemaReady;
  const sql = getNeonSql();
  schemaReady = (async () => {
    await sql`CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      provider TEXT NOT NULL CHECK (provider IN ('email', 'google', 'apple')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      password_hash TEXT,
      avatar TEXT,
      oauth_provider_id TEXT,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE
    )`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS app_users_email_provider_idx ON app_users (LOWER(email), provider)`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS app_users_oauth_identity_idx ON app_users (provider, oauth_provider_id) WHERE oauth_provider_id IS NOT NULL`;
    await sql`CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
      dna_profile JSONB,
      dna_session JSONB,
      grounding JSONB,
      grounding_vector JSONB,
      seed JSONB,
      collection JSONB,
      rated_attributes JSONB,
      test_plan_selections JSONB,
      profile_reset_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS rated_attributes JSONB`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS test_plan_selections JSONB`;
    await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_reset_at TIMESTAMPTZ`;
  })().catch((error: unknown) => {
    schemaReady = null;
    throw error;
  });
  return schemaReady;
};

// Local development fallback: when Neon is not configured, persist profiles to a
// local JSON file, mirroring the auth-users.json fallback in serverUserStore.
const LOCAL_PROFILES_PATH = path.join(process.cwd(), "data", "generated", "user-profiles.json");

type LocalProfilesFile = Record<string, PersistentUserProfile>;

const assertLocalProfilesAllowed = (): void => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Neon is not configured. Add DATABASE_URL to the deployment environment.");
  }
};

const readLocalProfiles = async (): Promise<LocalProfilesFile> => {
  assertLocalProfilesAllowed();
  try {
    const raw = await fs.readFile(LOCAL_PROFILES_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as LocalProfilesFile)
      : {};
  } catch {
    return {};
  }
};

const writeLocalProfiles = async (profiles: LocalProfilesFile): Promise<void> => {
  assertLocalProfilesAllowed();
  await fs.mkdir(path.dirname(LOCAL_PROFILES_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PROFILES_PATH, JSON.stringify(profiles, null, 2), "utf8");
};

export const readPersistentUserProfile = async (userId: string): Promise<PersistentUserProfile | null> => {
  if (!isNeonConfigured()) {
    const profiles = await readLocalProfiles();
    return profiles[userId] ?? null;
  }
  await ensureNeonSchema();
  const sql = getNeonSql();
  const rows = await sql`
    SELECT dna_profile AS "dnaProfile", dna_session AS "dnaSession", grounding,
      grounding_vector AS "groundingVector", seed, collection,
      rated_attributes AS "ratedAttributes", test_plan_selections AS "testPlanSelections",
      profile_reset_at AS "profileResetAt"
    FROM user_profiles WHERE user_id = ${userId} LIMIT 1
  ` as PersistentUserProfile[];
  return rows[0] ?? null;
};

export const upsertPersistentUserProfile = async (
  userId: string,
  profile: PersistentUserProfile,
): Promise<void> => {
  if (!isNeonConfigured()) {
    const profiles = await readLocalProfiles();
    const merged: PersistentUserProfile = { ...(profiles[userId] ?? {}) };
    for (const [key, value] of Object.entries(profile)) {
      if (value !== undefined) {
        (merged as Record<string, unknown>)[key] = value;
      }
    }
    // Mirrors the SQL upsert, which clears profile_reset_at on every write.
    delete merged.profileResetAt;
    profiles[userId] = merged;
    await writeLocalProfiles(profiles);
    return;
  }
  await ensureNeonSchema();
  const sql = getNeonSql();
  const json = (value: unknown): string | null => value === undefined ? null : JSON.stringify(value);
  await sql`
    INSERT INTO user_profiles (
      user_id, dna_profile, dna_session, grounding, grounding_vector, seed, collection,
      rated_attributes, test_plan_selections, profile_reset_at, updated_at
    ) VALUES (
      ${userId}, ${json(profile.dnaProfile)}::jsonb, ${json(profile.dnaSession)}::jsonb,
      ${json(profile.grounding)}::jsonb, ${json(profile.groundingVector)}::jsonb,
      ${json(profile.seed)}::jsonb, ${json(profile.collection)}::jsonb,
      ${json(profile.ratedAttributes)}::jsonb, ${json(profile.testPlanSelections)}::jsonb, NULL, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      dna_profile = COALESCE(EXCLUDED.dna_profile, user_profiles.dna_profile),
      dna_session = COALESCE(EXCLUDED.dna_session, user_profiles.dna_session),
      grounding = COALESCE(EXCLUDED.grounding, user_profiles.grounding),
      grounding_vector = COALESCE(EXCLUDED.grounding_vector, user_profiles.grounding_vector),
      seed = COALESCE(EXCLUDED.seed, user_profiles.seed),
      collection = COALESCE(EXCLUDED.collection, user_profiles.collection),
      rated_attributes = COALESCE(EXCLUDED.rated_attributes, user_profiles.rated_attributes),
      test_plan_selections = COALESCE(EXCLUDED.test_plan_selections, user_profiles.test_plan_selections),
      profile_reset_at = NULL,
      updated_at = NOW()
  `;
};

export const clearPersistentUserProfile = async (userId: string): Promise<void> => {
  if (!isNeonConfigured()) {
    const profiles = await readLocalProfiles();
    profiles[userId] = { profileResetAt: new Date().toISOString() };
    await writeLocalProfiles(profiles);
    return;
  }
  await ensureNeonSchema();
  const sql = getNeonSql();
  await sql`
    INSERT INTO user_profiles (user_id, profile_reset_at, updated_at)
    VALUES (${userId}, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      dna_profile = NULL,
      dna_session = NULL,
      grounding = NULL,
      grounding_vector = NULL,
      seed = NULL,
      collection = NULL,
      rated_attributes = NULL,
      test_plan_selections = NULL,
      profile_reset_at = NOW(),
      updated_at = NOW()
  `;
};