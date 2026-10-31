import { NextResponse, type NextRequest } from 'next/server';
import { assertSessionSigningConfigured } from '@/lib/auth/serverSession';
import {
  buildGoogleAuthorizationUrl,
  createOAuthState,
  setOAuthStateCookie,
} from '@/lib/auth/oauthProviders';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    assertSessionSigningConfigured();
    const state = createOAuthState();
    const response = NextResponse.redirect(buildGoogleAuthorizationUrl(request, state));
    setOAuthStateCookie(response, 'google', state);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google sign-in failed';
    return NextResponse.redirect(
      new URL(`/auth/sign-in?oauthError=${encodeURIComponent(message)}`, request.url),
    );
  }
}
