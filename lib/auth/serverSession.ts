import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getAuthUserById } from "@/lib/auth/serverUserStore";
import type { User } from "@/lib/auth/types";

export const SESSION_COOKIE_NAME = "fragrancedna_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = { userId: string; expiresAt: number };

const getSessionSecret = (): string => {
  const configuredSecret = process.env.AUTH_SESSION_SECRET?.trim();
  if (configuredSecret) return configuredSecret;
  if (process.env.NODE_ENV !== "production") return "fragrancedna-local-development-session-secret";
  throw new Error("AUTH_SESSION_SECRET must be configured before enabling production authentication.");
};

export const assertSessionSigningConfigured = (): void => {
  getSessionSecret();
};

const sign = (payload: string): string =>
  createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");

export const createSessionToken = (userId: string): string => {
  const payload: SessionPayload = {
    userId,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
};

export const verifySessionToken = (token: string | null | undefined): SessionPayload | null => {
  if (!token) return null;
  const [encodedPayload, suppliedSignature] = token.split(".");
  if (!encodedPayload || !suppliedSignature) return null;

  try {
    const expectedSignature = sign(encodedPayload);
    const expectedBytes = Buffer.from(expectedSignature);
    const suppliedBytes = Buffer.from(suppliedSignature);
    if (expectedBytes.length !== suppliedBytes.length || !timingSafeEqual(expectedBytes, suppliedBytes)) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (!payload.userId || !Number.isFinite(payload.expiresAt) || Number(payload.expiresAt) <= Math.floor(Date.now() / 1000)) return null;
    return { userId: payload.userId, expiresAt: Number(payload.expiresAt) };
  } catch {
    return null;
  }
};

export const setSessionCookie = (response: { cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void } }, userId: string): void => {
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
};

export const clearSessionCookie = (response: { cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void } }): void => {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

export const getCurrentSessionUser = async (): Promise<User | null> => {
  const cookieStore = cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session) return null;
  return getAuthUserById(session.userId);
};

export const requireAdminSession = async (): Promise<User> => {
  const user = await getCurrentSessionUser();
  if (!user || user.isAdmin !== true) {
    throw new Error("Administrator authentication is required.");
  }
  return user;
};
