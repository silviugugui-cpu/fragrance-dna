import { NextResponse } from 'next/server';
import { signInEmailUser } from '@/lib/auth/serverUserStore';
import { assertSessionSigningConfigured, setSessionCookie } from '@/lib/auth/serverSession';

interface SignInRequestBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    assertSessionSigningConfigured();
    const body = (await request.json()) as SignInRequestBody;
    const user = await signInEmailUser({
      email: body.email ?? '',
      password: body.password ?? '',
    });

    const response = NextResponse.json({ user });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign in';
    const configurationError = message.includes('AUTH_SESSION_SECRET') || message.includes('DATABASE_URL');
    return NextResponse.json({ error: message }, { status: configurationError ? 503 : 401 });
  }
}
