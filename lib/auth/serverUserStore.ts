import { randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import type { AuthProvider, AuthUsersDatabase, StoredUserRecord, User } from './types';
import { ADMIN_DISPLAY_NAME, ADMIN_USER_ID, ADMIN_USERNAME, normalizeIdentifier } from './adminIdentity';
import { ensureNeonSchema, getNeonSql, isNeonConfigured, type NeonUserRow } from '@/lib/database/neonDatabase';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'generated', 'auth-users.json');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const mapToPublicUser = (record: StoredUserRecord): User => ({
  id: record.id,
  email: record.email,
  name: record.name,
  avatar: record.avatar,
  provider: record.provider,
  createdAt: record.createdAt,
  isAdmin: record.isAdmin ?? record.id === ADMIN_USER_ID,
});

const mapNeonUser = (row: NeonUserRow): StoredUserRecord => ({
  id: row.id,
  email: row.email,
  name: row.name,
  provider: row.provider,
  createdAt: new Date(row.created_at).toISOString(),
  passwordHash: row.password_hash ?? undefined,
  avatar: row.avatar ?? undefined,
  oauthProviderId: row.oauth_provider_id ?? undefined,
  isAdmin: row.is_admin,
});

const assertLocalAuthAllowed = (): void => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Persistent authentication is not configured. Connect Neon with DATABASE_URL before accepting production users.');
  }
};

const ensureDbExists = async (): Promise<void> => {
  const dir = path.dirname(DB_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(DB_FILE_PATH);
  } catch {
    const initial: AuthUsersDatabase = { users: [] };
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(initial, null, 2), 'utf8');
  }
};

const readDb = async (): Promise<AuthUsersDatabase> => {
  assertLocalAuthAllowed();
  await ensureDbExists();
  const raw = await fs.readFile(DB_FILE_PATH, 'utf8');

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUsersDatabase>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return { users: [] };
  }
};

const writeDb = async (db: AuthUsersDatabase): Promise<void> => {
  assertLocalAuthAllowed();
  await fs.writeFile(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf8');
};

const hashPassword = (password: string): string => {
  const salt = randomUUID().replace(/-/g, '');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, encoded: string): boolean => {
  const [salt, savedHash] = encoded.split(':');
  if (!salt || !savedHash) {
    return false;
  }

  const hashBuffer = scryptSync(password, salt, 64);
  const savedBuffer = Buffer.from(savedHash, 'hex');

  if (hashBuffer.length !== savedBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, savedBuffer);
};

export interface StudioManagedUser {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
  createdAt: string;
  isAdmin: boolean;
  hasPassword: boolean;
}

export const createEmailUser = async (input: {
  email: string;
  password: string;
  name: string;
}): Promise<User> => {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();

  if (!email || !input.password || !name) {
    throw new Error('All fields are required');
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Please provide a valid email address');
  }

  if (normalizeIdentifier(email) === ADMIN_USERNAME) {
    throw new Error('This account is reserved');
  }
  const configuredAdminEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? '');
  if (configuredAdminEmail && email === configuredAdminEmail) {
    throw new Error('This account is reserved');
  }

  if (input.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  if (isNeonConfigured()) {
    await ensureNeonSchema();
    const id = `user_${randomUUID()}`;
    const now = new Date().toISOString();
    const rows = await getNeonSql()`
      INSERT INTO app_users (id, email, name, provider, created_at, password_hash, is_admin)
      VALUES (${id}, ${email}, ${name}, 'email', ${now}, ${hashPassword(input.password)}, FALSE)
      ON CONFLICT DO NOTHING
      RETURNING id, email, name, provider, created_at, password_hash, avatar, oauth_provider_id, is_admin
    ` as NeonUserRow[];
    if (!rows[0]) throw new Error('An account with this email already exists');
    return mapToPublicUser(mapNeonUser(rows[0]));
  }

  const db = await readDb();
  const alreadyExists = db.users.some((user) => normalizeEmail(user.email) === email);
  if (alreadyExists) {
    throw new Error('An account with this email already exists');
  }

  const now = new Date().toISOString();
  const record: StoredUserRecord = {
    id: `user_${randomUUID()}`,
    email,
    name,
    provider: 'email',
    createdAt: now,
    passwordHash: hashPassword(input.password),
  };

  db.users.push(record);
  await writeDb(db);

  return mapToPublicUser(record);
};

export const signInEmailUser = async (input: {
  email: string;
  password: string;
}): Promise<User> => {
  const identifier = normalizeIdentifier(input.email);

  if (!identifier || !input.password) {
    throw new Error('Username/email and password are required');
  }

  if (isNeonConfigured()) {
    await ensureNeonSchema();
    await ensureConfiguredAdmin();
    const email = identifier === ADMIN_USERNAME && process.env.ADMIN_EMAIL
      ? normalizeEmail(process.env.ADMIN_EMAIL)
      : normalizeEmail(input.email);
    const rows = await getNeonSql()`
      SELECT id, email, name, provider, created_at, password_hash, avatar, oauth_provider_id, is_admin
      FROM app_users WHERE LOWER(email) = ${email} AND provider = 'email' LIMIT 1
    ` as NeonUserRow[];
    const record = rows[0] ? mapNeonUser(rows[0]) : null;
    if (!record?.passwordHash || !verifyPassword(input.password, record.passwordHash)) {
      throw new Error('Invalid username/email or password');
    }
    return mapToPublicUser(record);
  }

  const configuredAdminEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? '');
  const isConfiguredAdmin = identifier === ADMIN_USERNAME || (configuredAdminEmail.length > 0 && normalizeEmail(input.email) === configuredAdminEmail);
  if (process.env.NODE_ENV !== 'production' && isConfiguredAdmin && process.env.ADMIN_PASSWORD && input.password === process.env.ADMIN_PASSWORD) {
    return {
      id: ADMIN_USER_ID,
      email: configuredAdminEmail || ADMIN_USERNAME,
      name: ADMIN_DISPLAY_NAME,
      provider: 'email',
      createdAt: '2026-01-01T00:00:00.000Z',
      isAdmin: true,
    };
  }

  const db = await readDb();
  const record = db.users.find((user) => normalizeEmail(user.email) === identifier && user.provider === 'email');

  if (!record || !record.passwordHash || !verifyPassword(input.password, record.passwordHash)) {
    throw new Error('Invalid username/email or password');
  }

  return mapToPublicUser(record);
};

const ensureConfiguredAdmin = async (): Promise<void> => {
  const email = normalizeEmail(process.env.ADMIN_EMAIL ?? '');
  const password = process.env.ADMIN_PASSWORD ?? '';
  if (!email || password.length < 12) return;

  const sql = getNeonSql();
  const rows = await sql`SELECT id FROM app_users WHERE is_admin = TRUE OR id = ${ADMIN_USER_ID} LIMIT 1` as Array<{ id: string }>;
  if (rows.length > 0) return;

  await sql`
    INSERT INTO app_users (id, email, name, provider, password_hash, is_admin)
    VALUES (${ADMIN_USER_ID}, ${email}, ${ADMIN_DISPLAY_NAME}, 'email', ${hashPassword(password)}, TRUE)
    ON CONFLICT DO NOTHING
  `;
};

export const getAuthUserById = async (userId: string): Promise<User | null> => {
  const id = userId.trim();
  if (!id) return null;

  if (isNeonConfigured()) {
    await ensureNeonSchema();
    await ensureConfiguredAdmin();
    const rows = await getNeonSql()`
      SELECT id, email, name, provider, created_at, password_hash, avatar, oauth_provider_id, is_admin
      FROM app_users WHERE id = ${id} LIMIT 1
    ` as NeonUserRow[];
    return rows[0] ? mapToPublicUser(mapNeonUser(rows[0])) : null;
  }

  if (id === ADMIN_USER_ID) {
    return {
      id: ADMIN_USER_ID,
      email: process.env.ADMIN_EMAIL ?? ADMIN_USERNAME,
      name: ADMIN_DISPLAY_NAME,
      provider: 'email',
      createdAt: '2026-01-01T00:00:00.000Z',
      isAdmin: true,
    };
  }

  const db = await readDb();
  const record = db.users.find((user) => user.id === id);
  return record ? mapToPublicUser(record) : null;
};

// Called only from the OAuth callback routes, after the provider's id_token has
// been exchanged and validated — `input` is a verified identity, never user input.
export const signInOAuthUser = async (input: {
  provider: AuthProvider;
  oauthProviderId: string;
  email?: string;
  name?: string;
  avatar?: string;
}): Promise<User> => {
  const provider = input.provider;
  if (provider !== 'google' && provider !== 'apple') {
    throw new Error('Unsupported OAuth provider');
  }

  const oauthProviderId = input.oauthProviderId.trim();
  if (!oauthProviderId) {
    throw new Error('The OAuth provider did not return an account identifier.');
  }

  const email = input.email ? normalizeEmail(input.email) : '';
  const name = (input.name ?? '').trim() || (email ? email.split('@')[0] : provider === 'apple' ? 'Apple User' : 'Google User');

  if (isNeonConfigured()) {
    await ensureNeonSchema();
    const sql = getNeonSql();
    const existingRows = await sql`
      SELECT id, email, name, provider, created_at, password_hash, avatar, oauth_provider_id, is_admin
      FROM app_users
      WHERE provider = ${provider} AND (
        oauth_provider_id = ${oauthProviderId} OR (${email} <> '' AND LOWER(email) = ${email})
      ) LIMIT 1
    ` as NeonUserRow[];
    if (existingRows[0]) {
      const record = mapNeonUser(existingRows[0]);
      if (record.oauthProviderId !== oauthProviderId || (input.avatar && record.avatar !== input.avatar)) {
        await sql`
          UPDATE app_users
          SET oauth_provider_id = ${oauthProviderId}, avatar = COALESCE(${input.avatar ?? null}, avatar)
          WHERE id = ${record.id}
        `;
        record.oauthProviderId = oauthProviderId;
        if (input.avatar) record.avatar = input.avatar;
      }
      return mapToPublicUser(record);
    }

    if (!email) {
      throw new Error('The OAuth provider did not share an email address for this account.');
    }

    const id = `user_${randomUUID()}`;
    const createdAt = new Date().toISOString();
    const insertedRows = await sql`
      INSERT INTO app_users (id, email, name, provider, created_at, avatar, oauth_provider_id, is_admin)
      VALUES (${id}, ${email}, ${name}, ${provider}, ${createdAt}, ${input.avatar ?? null}, ${oauthProviderId}, FALSE)
      ON CONFLICT DO NOTHING
      RETURNING id, email, name, provider, created_at, password_hash, avatar, oauth_provider_id, is_admin
    ` as NeonUserRow[];
    if (insertedRows[0]) return mapToPublicUser(mapNeonUser(insertedRows[0]));
    throw new Error('Unable to create the OAuth account.');
  }

  const db = await readDb();
  const existing = db.users.find((user) => {
    if (user.provider !== provider) {
      return false;
    }

    if (user.oauthProviderId === oauthProviderId) {
      return true;
    }

    return email !== '' && normalizeEmail(user.email) === email;
  });

  if (existing) {
    let changed = false;
    if (existing.oauthProviderId !== oauthProviderId) {
      existing.oauthProviderId = oauthProviderId;
      changed = true;
    }
    if (input.avatar && existing.avatar !== input.avatar) {
      existing.avatar = input.avatar;
      changed = true;
    }
    if (changed) {
      await writeDb(db);
    }
    return mapToPublicUser(existing);
  }

  if (!email) {
    throw new Error('The OAuth provider did not share an email address for this account.');
  }

  const now = new Date().toISOString();
  const newRecord: StoredUserRecord = {
    id: `user_${randomUUID()}`,
    email,
    name,
    provider,
    avatar: input.avatar,
    oauthProviderId,
    createdAt: now,
  };

  db.users.push(newRecord);
  await writeDb(db);

  return mapToPublicUser(newRecord);
};

export const listManagedUsers = async (): Promise<StudioManagedUser[]> => {
  if (isNeonConfigured()) {
    await ensureNeonSchema();
    await ensureConfiguredAdmin();
    const rows = await getNeonSql()`
      SELECT id, email, name, provider, created_at, password_hash, is_admin
      FROM app_users ORDER BY created_at DESC
    ` as Array<Pick<NeonUserRow, 'id' | 'email' | 'name' | 'provider' | 'created_at' | 'password_hash' | 'is_admin'>>;
    return rows.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
      createdAt: new Date(user.created_at).toISOString(),
      isAdmin: user.is_admin,
      hasPassword: Boolean(user.password_hash),
    }));
  }

  const db = await readDb();

  const rows: StudioManagedUser[] = db.users
    .map((record) => ({
      id: record.id,
      email: record.email,
      name: record.name,
      provider: record.provider,
      createdAt: record.createdAt,
      isAdmin: false,
      hasPassword: Boolean(record.passwordHash),
    }))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return [
    {
      id: ADMIN_USER_ID,
      email: ADMIN_USERNAME,
      name: ADMIN_DISPLAY_NAME,
      provider: "email",
      createdAt: "2026-01-01T00:00:00.000Z",
      isAdmin: true,
      hasPassword: true,
    },
    ...rows,
  ];
};

export const deleteManagedUser = async (userId: string): Promise<void> => {
  const id = userId.trim();
  if (!id) {
    throw new Error("User id is required");
  }

  if (id === ADMIN_USER_ID) {
    throw new Error("Admin user cannot be deleted");
  }

  if (isNeonConfigured()) {
    await ensureNeonSchema();
    const rows = await getNeonSql()`
      DELETE FROM app_users WHERE id = ${id} AND is_admin = FALSE RETURNING id
    ` as Array<{ id: string }>;
    if (rows.length === 0) throw new Error("User not found or protected");
    return;
  }

  const db = await readDb();
  const nextUsers = db.users.filter((user) => user.id !== id);
  if (nextUsers.length === db.users.length) {
    throw new Error("User not found");
  }

  db.users = nextUsers;
  await writeDb(db);
};

export const resetManagedUserPassword = async (input: {
  userId: string;
  newPassword: string;
}): Promise<void> => {
  const userId = input.userId.trim();
  const newPassword = input.newPassword;

  if (!userId || !newPassword) {
    throw new Error("User id and password are required");
  }

  if (userId === ADMIN_USER_ID) {
    throw new Error("Admin password is managed separately");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  if (isNeonConfigured()) {
    await ensureNeonSchema();
    const rows = await getNeonSql()`
      UPDATE app_users SET password_hash = ${hashPassword(newPassword)}
      WHERE id = ${userId} AND provider = 'email' AND is_admin = FALSE
      RETURNING id
    ` as Array<{ id: string }>;
    if (rows.length === 0) throw new Error("User not found or password reset is not allowed");
    return;
  }

  const db = await readDb();
  const record = db.users.find((user) => user.id === userId);
  if (!record) {
    throw new Error("User not found");
  }

  if (record.provider !== "email") {
    throw new Error("Only email users can have local password reset");
  }

  record.passwordHash = hashPassword(newPassword);
  await writeDb(db);
};
