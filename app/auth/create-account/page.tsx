'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { AuthForm } from '@/components/auth/AuthForm';
import { OAuthProviders } from '@/components/auth/OAuthProviders';
import { useLanguage } from '@/lib/i18n';

export default function CreateAccountPage() {
  const { t } = useLanguage();
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
      setError(err instanceof Error ? err.message : t.auth.signUp.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <p className="text-sm font-medium uppercase tracking-wider text-gold">{t.auth.signUp.kicker}</p>
        <h1 className="text-4xl font-light text-white">{t.auth.signUp.title}</h1>
        <p className="text-gray-400">{t.auth.signUp.subtitle}</p>
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
        <AuthForm type="signup" onSubmit={handleSignUp} isLoading={isSubmitting} submitLabel={t.auth.signUp.submit} />

        {/* Social Sign Up (only rendered for configured providers) */}
        <OAuthProviders />

        {/* Terms */}
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          {t.auth.signUp.termsPrefix}{' '}
          <Link href="/terms" className="text-gold hover:text-gold/80">
            {t.auth.signUp.termsOfService}
          </Link>{' '}
          {t.auth.signUp.termsAnd}{' '}
          <Link href="/privacy" className="text-gold hover:text-gold/80">
            {t.auth.signUp.privacyPolicy}
          </Link>
        </p>
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-gray-400">
          {t.auth.signUp.alreadyHaveAccount}{' '}
          <Link href="/auth/sign-in" className="text-gold hover:text-gold/80 font-semibold transition-colors">
            {t.auth.signUp.signInLink}
          </Link>
        </p>
      </div>

      {/* Benefits Section */}
      <div className="border-t border-gold/10 pt-8 space-y-4 text-sm text-gray-400">
        <h3 className="text-white font-semibold mb-4">{t.auth.signUp.benefitsTitle}</h3>
        <div className="flex gap-3">
          <span className="text-gold font-bold">✦</span>
          <p>{t.auth.signUp.benefit1}</p>
        </div>
        <div className="flex gap-3">
          <span className="text-gold font-bold">✦</span>
          <p>{t.auth.signUp.benefit2}</p>
        </div>
        <div className="flex gap-3">
          <span className="text-gold font-bold">✦</span>
          <p>{t.auth.signUp.benefit3}</p>
        </div>
        <div className="flex gap-3">
          <span className="text-gold font-bold">✦</span>
          <p>{t.auth.signUp.benefit4}</p>
        </div>
      </div>
    </div>
  );
}
