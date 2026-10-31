import { randomUUID, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { ensureNeonSchema, getNeonSql, isNeonConfigured, type NeonUserRow } from "../lib/database/neonDatabase";
import { ADMIN_DISPLAY_NAME, ADMIN_USER_ID } from "../lib/auth/adminIdentity";
import type { AuthUsersDatabase } from "../lib/auth/types";

const ROOT = process.cwd();
loadEnvConfig(ROOT);
const AUTH_USERS_PATH = path.join(ROOT, "data", "generated", "auth-users.json");

const hashPassword = (password: string): string => {
  const salt = randomUUID().replace(/-/g, "");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
};

const migrateUsers = async (): Promise<void> => {
  if (!isNeonConfigured()) throw new Error("Set DATABASE_URL before migrating auth users.");
  if (!fs.existsSync(AUTH_USERS_PATH)) throw new Error(`Auth user export not found: ${AUTH_USERS_PATH}`);

  const database = JSON.parse(fs.readFileSync(AUTH_USERS_PATH, "utf8")) as Partial<AuthUsersDatabase>;
  const users = Array.isArray(database.users) ? database.users : [];
  await ensureNeonSchema();
  const sql = getNeonSql();
  let imported = 0;
  let skipped = 0;

  for (const user of users) {
    const rows = await sql`
      INSERT INTO app_users (
        id, email, name, provider, created_at, password_hash, avatar, oauth_provider_id, is_admin
      ) VALUES (
        ${user.id}, ${user.email.trim().toLowerCase()}, ${user.name}, ${user.provider},
        ${user.createdAt}, ${user.passwordHash ?? null}, ${user.avatar ?? null},
        ${user.oauthProviderId ?? null}, FALSE
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    ` as Array<{ id: string }>;
    if (rows.length > 0) imported += 1;
    else skipped += 1;
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  let adminSeeded = false;
  if (adminEmail && adminPassword.length >= 12) {
    const rows = await sql`
      INSERT INTO app_users (id, email, name, provider, password_hash, is_admin)
      VALUES (${ADMIN_USER_ID}, ${adminEmail}, ${ADMIN_DISPLAY_NAME}, 'email', ${hashPassword(adminPassword)}, TRUE)
      ON CONFLICT DO NOTHING
      RETURNING id
    ` as NeonUserRow[];
    adminSeeded = rows.length > 0;
  }

  console.log(JSON.stringify({
    database: "Neon PostgreSQL",
    source: path.relative(ROOT, AUTH_USERS_PATH),
    sourceUsers: users.length,
    imported,
    skippedExisting: skipped,
    adminSeeded,
    profileData: "Browser-only profile data syncs on each user's first successful sign-in; it is not present in this server-side JSON export.",
  }, null, 2));
};

try {
  await migrateUsers();
} catch (error) {
  console.error(`[auth-users-neon-migration] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}