'use client';

import { OAuthButton } from './OAuthButton';
import { isAppleSignInAvailable, isGoogleSignInAvailable } from '@/lib/auth/oauthAvailability';

// Renders the social sign-in section only for providers with configured credentials,
// so no dead buttons are ever shown to users.
export function OAuthProviders() {
  const googleAvailable = isGoogleSignInAvailable();
  const appleAvailable = isAppleSignInAvailable();

  if (!googleAvailable && !appleAvailable) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gold/20" />
        <span className="text-xs uppercase tracking-wider text-gray-500">or continue with</span>
        <div className="h-px flex-1 bg-gold/20" />
      </div>
      {googleAvailable && <OAuthButton provider="google" />}
      {appleAvailable && <OAuthButton provider="apple" />}
    </div>
  );
}
