// Client-safe helpers: NEXT_PUBLIC_* values are inlined at build time, so these
// flags let the UI hide OAuth buttons for providers that are not configured.

export const isGoogleSignInAvailable = (): boolean =>
  Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());

export const isAppleSignInAvailable = (): boolean =>
  Boolean(process.env.NEXT_PUBLIC_APPLE_SERVICE_ID?.trim());
