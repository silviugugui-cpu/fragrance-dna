import { NextResponse } from 'next/server';
import { createEmailUser } from '@/lib/auth/serverUserStore';
import { assertSessionSigningConfigured, setSessionCookie } from '@/lib/auth/serverSession';

interface SignUpRequestBody {
  email?: string;
  password?: string;
  name?: string;
}

export async function POST(request: Request) {
  try {
    assertSessionSigningConfigured();
    const body = (await request.json()) as SignUpRequestBody;
    const user = await createEmailUser({
      email: body.email ?? '',
      password: body.password ?? '',
      name: body.name ?? '',
    });

    const response = NextResponse.json({ user });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create account';
    const configurationError = message.includes('AUTH_SESSION_SECRET') || message.includes('DATABASE_URL');
    return NextResponse.json({ error: message }, { status: configurationError ? 503 : 400 });
  }
}
