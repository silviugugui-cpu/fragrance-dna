'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { AuthForm } from '@/components/auth/AuthForm';
import { OAuthButton } from '@/components/auth/OAuthButton';

export default function CreateAccountPage() {
  const router = useRouter();
  const { user, isLoading, signUp } = useAuth();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSignUp = async (data: {
    email?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
  }) => {
    setIsSubmitting(true);
    setError('');

    try {
      await signUp(data.email || '', data.password || '', data.name || '');
      // Redirect will happen via useEffect
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <p className="text-sm font-medium uppercase tracking-wider text-gold">Join Us</p>
        <h1 className="text-4xl font-light text-white">Create Your Account</h1>
        <p className="text-gray-400">Begin your olfactory discovery with FragranceDNA</p>
      </div>

      {/* Main Card */}
      <div className="premium-card-dark p-8 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Sign Up Form */}
        <AuthForm type="signup" onSubmit={handleSignUp} isLoading={isSubmitting} submitLabel="Create Account" />

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gold/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-black/60 text-gray-400">Or sign up with</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <OAuthButton provider="google" variant="secondary" size="lg" disabled={isSubmitting} />
          <OAuthButton provider="apple" variant="secondary" size="lg" disabled={isSubmitting} />
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-gold hover:text-gold/80">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-gold hover:text-gold/80">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="text-gold hover:text-gold/80 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      {/* Benefits Section */}
      <div className="border-t border-gold/10 pt-8 space-y-4 text-sm text-gray-400">
        <h3 className="text-white font-semibold mb-4">What You'll Get:</h3>
        <div className="flex gap-3">
          <span className="text-gold font-bold">✦</span>
          <p>Personalized fragrance recommendations based on your olfactory DNA</p>
        </div>
        <div className="flex gap-3">
          <span className="text-gold font-bold">✦</span>
          <p>Access to exclusive territories and fragrance collections</p>
        </div>
        <div className="flex gap-3">
          <span className="text-gold font-bold">✦</span>
          <p>Your personal fragrance identity profile and insights</p>
        </div>
        <div className="flex gap-3">
          <span className="text-gold font-bold">✦</span>
          <p>Curated discovery experience with real-time compatibility scoring</p>
        </div>
      </div>
    </div>
  );
}
