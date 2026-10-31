'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { resolvePostSignInRoute } from '@/lib/auth';
import { AuthForm } from '@/components/auth/AuthForm';
import { OAuthProviders } from '@/components/auth/OAuthProviders';

export default function SignInPage() {
  const { user, isLoading, signIn } = useAuth();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigateAfterSignIn = () => {
    const target = resolvePostSignInRoute({
      user,
    });

    window.location.assign(target);
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      navigateAfterSignIn();
    }
  }, [user, isLoading]);

  // Surface errors forwarded by the OAuth callback routes (?oauthError=...).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('oauthError');
    if (oauthError) {
      setError(oauthError);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleSignIn = async (data: {
    email?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
  }) => {
    setIsSubmitting(true);
    setError('');

    try {
      await signIn(data.email || '', data.password || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <p className="text-sm font-medium uppercase tracking-wider text-gold">Authentication</p>
        <h1 className="text-4xl font-light text-white">Welcome Back</h1>
        <p className="text-gray-400">Sign in to your account to continue your olfactory journey</p>
      </div>

      {/* Main Card */}
      <div className="premium-card-dark p-8 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Sign In Form */}
        <AuthForm type="signin" onSubmit={handleSignIn} isLoading={isSubmitting} submitLabel="Sign In" />

        {/* Social Sign In (only rendered for configured providers) */}
        <OAuthProviders />

      </div>

      {/* Sign Up Link */}
      <div className="text-center space-y-2">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/create-account" className="text-gold hover:text-gold/80 font-semibold transition-colors">
            Create one
          </Link>
        </p>
        <p className="text-sm text-gray-500">
          <Link href="/auth/forgot-password" className="hover:text-gold transition-colors">
            Forgot your password?
          </Link>
        </p>
      </div>

      {/* Info Section */}
      <div className="border-t border-gold/10 pt-8 space-y-4 text-sm text-gray-400">
        <div className="flex gap-3">
          <span className="text-gold font-bold">🔒</span>
          <p>Your security is our priority. All data is encrypted and protected.</p>
        </div>
        <div className="flex gap-3">
          <span className="text-gold font-bold">📊</span>
          <p>Sign in to access your personal fragrance DNA profile and recommendations.</p>
        </div>
      </div>
    </div>
  );
}
