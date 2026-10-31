import { NextResponse, type NextRequest } from 'next/server';
import { signInOAuthUser } from '@/lib/auth/serverUserStore';
import { setSessionCookie } from '@/lib/auth/serverSession';
import { consumeOAuthStateCookie, exchangeGoogleCode } from '@/lib/auth/oauthProviders';

export const dynamic = 'force-dynamic';

const redirectWithError = (request: NextRequest, message: string): NextResponse =>
  NextResponse.redirect(new URL(`/auth/sign-in?oauthError=${encodeURIComponent(message)}`, request.url));

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const providerError = url.searchParams.get('error');

  if (providerError) {
    return redirectWithError(request, providerError === 'access_denied' ? 'Google sign-in was cancelled.' : 'Google sign-in failed.');
  }

  const response = NextResponse.redirect(new URL('/', request.url));
  if (!code || !consumeOAuthStateCookie(request, response, 'google', state)) {
    return redirectWithError(request, 'Google sign-in could not be verified. Please try again.');
  }

  try {
    const identity = await exchangeGoogleCode(request, code);
    const user = await signInOAuthUser(identity);
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google sign-in failed';
    return redirectWithError(request, message);
  }
}
