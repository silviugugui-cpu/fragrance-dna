'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { AuthForm } from '@/components/auth/AuthForm';
import { OAuthButton } from '@/components/auth/OAuthButton';

export default function SignInPage() {
  const router = useRouter();
  const { user, isLoading, signIn } = useAuth();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

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
      // Redirect will happen via useEffect
      router.push('/');
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

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gold/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-black/60 text-gray-400">Or continue with</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <OAuthButton provider="google" variant="secondary" size="lg" disabled={isSubmitting} />
          <OAuthButton provider="apple" variant="secondary" size="lg" disabled={isSubmitting} />
        </div>
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
        <div className="flex gap-3">
          <span className="text-gold font-bold">⚡</span>
          <p>Seamless OAuth integration with Google and Apple for quick access.</p>
        </div>
      </div>
    </div>
  );
}
