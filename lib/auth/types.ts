export type AuthProvider = 'email' | 'google' | 'apple';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: AuthProvider;
  createdAt: string;
  isAdmin?: boolean;
}

export interface StoredUserRecord {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
  createdAt: string;
  passwordHash?: string;
  avatar?: string;
  oauthProviderId?: string;
  isAdmin?: boolean;
}

export interface AuthUsersDatabase {
  users: StoredUserRecord[];
}
