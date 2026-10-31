import { randomBytes, sign as cryptoSign } from 'node:crypto';
import type { NextRequest } from 'next/server';
import type { NextResponse } from 'next/server';

export type OAuthProviderName = 'google' | 'apple';

const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const APPLE_AUTHORIZE_URL = 'https://appleid.apple.com/auth/authorize';
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';

const STATE_COOKIE_PREFIX = 'fragrancedna_oauth_state_';
const STATE_TTL_SECONDS = 60 * 10;

const trimmed = (value: string | undefined): string => value?.trim() ?? '';

export const isGoogleOAuthConfigured = (): boolean =>
  Boolean(trimmed(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) && trimmed(process.env.GOOGLE_CLIENT_SECRET));

export const isAppleOAuthConfigured = (): boolean =>
  Boolean(
    trimmed(process.env.NEXT_PUBLIC_APPLE_SERVICE_ID) &&
    trimmed(process.env.APPLE_TEAM_ID) &&
    trimmed(process.env.APPLE_KEY_ID) &&
    trimmed(process.env.APPLE_PRIVATE_KEY),
  );

// Resolve the public origin of the current request, honouring Vercel's proxy headers.
const resolveRequestOrigin = (request: NextRequest): string => {
  const url = new URL(request.url);
  const proto = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? url.host;
  return `${proto}://${host}`;
};

export const resolveRedirectUri = (provider: OAuthProviderName, request: NextRequest): string => {
  const configured = trimmed(
    provider === 'google' ? process.env.GOOGLE_OAUTH_REDIRECT_URI : process.env.APPLE_OAUTH_REDIRECT_URI,
  );
  if (configured) return configured;
  return `${resolveRequestOrigin(request)}/api/auth/oauth/${provider}/callback`;
};

export const createOAuthState = (): string => randomBytes(24).toString('base64url');

export const setOAuthStateCookie = (
  response: NextResponse,
  provider: OAuthProviderName,
  state: string,
): void => {
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(`${STATE_COOKIE_PREFIX}${provider}`, state, {
    httpOnly: true,
    secure,
    // Apple returns the authorization response as a cross-site form POST, so its
    // state cookie must be SameSite=None (requires Secure, i.e. production HTTPS).
    sameSite: provider === 'apple' && secure ? 'none' : 'lax',
    path: '/',
    maxAge: STATE_TTL_SECONDS,
  });
};

export const consumeOAuthStateCookie = (
  request: NextRequest,
  response: NextResponse,
  provider: OAuthProviderName,
  suppliedState: string | null,
): boolean => {
  const cookieName = `${STATE_COOKIE_PREFIX}${provider}`;
  const expected = request.cookies.get(cookieName)?.value ?? '';
  response.cookies.set(cookieName, '', { httpOnly: true, path: '/', maxAge: 0 });
  return Boolean(expected && suppliedState && expected === suppliedState);
};

export interface VerifiedOAuthIdentity {
  provider: OAuthProviderName;
  oauthProviderId: string;
  email?: string;
  name?: string;
  avatar?: string;
}

interface IdTokenClaims {
  iss?: string;
  aud?: string;
  exp?: number;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
}

// The id_token is obtained directly from the provider's token endpoint over TLS,
// so the channel authenticates it; we validate the issuer, audience and expiry claims.
const decodeIdTokenClaims = (idToken: string): IdTokenClaims => {
  const segments = idToken.split('.');
  if (segments.length !== 3) {
    throw new Error('Malformed identity token');
  }
  return JSON.parse(Buffer.from(segments[1], 'base64url').toString('utf8')) as IdTokenClaims;
};

const assertClaims = (claims: IdTokenClaims, expectedIssuers: string[], expectedAudience: string): void => {
  if (!claims.iss || !expectedIssuers.includes(claims.iss)) {
    throw new Error('Identity token issuer mismatch');
  }
  if (claims.aud !== expectedAudience) {
    throw new Error('Identity token audience mismatch');
  }
  if (!Number.isFinite(claims.exp) || Number(claims.exp) <= Math.floor(Date.now() / 1000)) {
    throw new Error('Identity token is expired');
  }
  if (!claims.sub) {
    throw new Error('Identity token is missing a subject');
  }
};

export const buildGoogleAuthorizationUrl = (request: NextRequest, state: string): string => {
  const clientId = trimmed(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  if (!isGoogleOAuthConfigured()) {
    throw new Error('Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }

  const url = new URL(GOOGLE_AUTHORIZE_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', resolveRedirectUri('google', request));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
};

export const exchangeGoogleCode = async (
  request: NextRequest,
  code: string,
): Promise<VerifiedOAuthIdentity> => {
  const clientId = trimmed(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const clientSecret = trimmed(process.env.GOOGLE_CLIENT_SECRET);

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: resolveRedirectUri('google', request),
      grant_type: 'authorization_code',
    }),
  });

  const payload = (await tokenResponse.json().catch(() => ({}))) as { id_token?: string; error?: string };
  if (!tokenResponse.ok || !payload.id_token) {
    throw new Error(`Google token exchange failed${payload.error ? `: ${payload.error}` : ''}`);
  }

  const claims = decodeIdTokenClaims(payload.id_token);
  assertClaims(claims, ['https://accounts.google.com', 'accounts.google.com'], clientId);

  const emailVerified = claims.email_verified === true || claims.email_verified === 'true';
  return {
    provider: 'google',
    oauthProviderId: String(claims.sub),
    email: emailVerified && claims.email ? claims.email : undefined,
    name: claims.name,
    avatar: claims.picture,
  };
};

const normalizeApplePrivateKey = (raw: string): string => raw.replace(/\\n/g, '\n');

// Apple requires the client secret to be a short-lived ES256 JWT signed with the
// developer private key (JWS with IEEE P1363 signature encoding).
const createAppleClientSecret = (): string => {
  const teamId = trimmed(process.env.APPLE_TEAM_ID);
  const keyId = trimmed(process.env.APPLE_KEY_ID);
  const serviceId = trimmed(process.env.NEXT_PUBLIC_APPLE_SERVICE_ID);
  const privateKey = normalizeApplePrivateKey(trimmed(process.env.APPLE_PRIVATE_KEY));

  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      iss: teamId,
      iat: nowSeconds,
      exp: nowSeconds + 60 * 10,
      aud: 'https://appleid.apple.com',
      sub: serviceId,
    }),
  ).toString('base64url');

  const signature = cryptoSign('sha256', Buffer.from(`${header}.${body}`), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  }).toString('base64url');

  return `${header}.${body}.${signature}`;
};

export const buildAppleAuthorizationUrl = (request: NextRequest, state: string): string => {
  const serviceId = trimmed(process.env.NEXT_PUBLIC_APPLE_SERVICE_ID);
  if (!isAppleOAuthConfigured()) {
    throw new Error('Apple sign-in is not configured. Set the APPLE_* and NEXT_PUBLIC_APPLE_SERVICE_ID variables.');
  }

  const url = new URL(APPLE_AUTHORIZE_URL);
  url.searchParams.set('client_id', serviceId);
  url.searchParams.set('redirect_uri', resolveRedirectUri('apple', request));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('response_mode', 'form_post');
  url.searchParams.set('scope', 'name email');
  url.searchParams.set('state', state);
  return url.toString();
};

export const exchangeAppleCode = async (
  request: NextRequest,
  code: string,
  userFormField?: string | null,
): Promise<VerifiedOAuthIdentity> => {
  const serviceId = trimmed(process.env.NEXT_PUBLIC_APPLE_SERVICE_ID);

  const tokenResponse = await fetch(APPLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: serviceId,
      client_secret: createAppleClientSecret(),
      redirect_uri: resolveRedirectUri('apple', request),
      grant_type: 'authorization_code',
    }),
  });

  const payload = (await tokenResponse.json().catch(() => ({}))) as { id_token?: string; error?: string };
  if (!tokenResponse.ok || !payload.id_token) {
    throw new Error(`Apple token exchange failed${payload.error ? `: ${payload.error}` : ''}`);
  }

  const claims = decodeIdTokenClaims(payload.id_token);
  assertClaims(claims, ['https://appleid.apple.com'], serviceId);

  // Apple only sends the user's name once, as a `user` form field on first authorization.
  let name: string | undefined;
  if (userFormField) {
    try {
      const parsed = JSON.parse(userFormField) as { name?: { firstName?: string; lastName?: string } };
      const fullName = [parsed.name?.firstName, parsed.name?.lastName].filter(Boolean).join(' ').trim();
      if (fullName) name = fullName;
    } catch {
      // Ignore malformed optional metadata.
    }
  }

  return {
    provider: 'apple',
    oauthProviderId: String(claims.sub),
    email: claims.email,
    name,
  };
};
