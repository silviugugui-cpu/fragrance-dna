import { NextResponse, type NextRequest } from 'next/server';
import { signInOAuthUser } from '@/lib/auth/serverUserStore';
import { setSessionCookie } from '@/lib/auth/serverSession';
import { consumeOAuthStateCookie, exchangeAppleCode } from '@/lib/auth/oauthProviders';

export const dynamic = 'force-dynamic';

const redirectWithError = (request: NextRequest, message: string): NextResponse =>
  NextResponse.redirect(new URL(`/auth/sign-in?oauthError=${encodeURIComponent(message)}`, request.url), 303);

// Apple delivers the authorization response as a cross-site form POST (response_mode=form_post).
export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirectWithError(request, 'Apple sign-in failed. Please try again.');
  }

  const code = form.get('code');
  const state = form.get('state');
  const userField = form.get('user');
  const providerError = form.get('error');

  if (typeof providerError === 'string' && providerError) {
    return redirectWithError(request, providerError === 'user_cancelled_authorize' ? 'Apple sign-in was cancelled.' : 'Apple sign-in failed.');
  }

  const response = NextResponse.redirect(new URL('/', request.url), 303);
  if (
    typeof code !== 'string' ||
    !code ||
    !consumeOAuthStateCookie(request, response, 'apple', typeof state === 'string' ? state : null)
  ) {
    return redirectWithError(request, 'Apple sign-in could not be verified. Please try again.');
  }

  try {
    const identity = await exchangeAppleCode(request, code, typeof userField === 'string' ? userField : null);
    const user = await signInOAuthUser(identity);
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Apple sign-in failed';
    return redirectWithError(request, message);
  }
}
