'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { AuthForm } from '@/components/auth/AuthForm';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const handleReset = async (data: {
    email?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
  }) => {
    setIsSubmitting(true);
    setError('');

    try {
      await resetPassword(data.email || '');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <p className="text-sm font-medium uppercase tracking-wider text-gold">Password Recovery</p>
        <h1 className="text-4xl font-light text-white">Reset Your Password</h1>
        <p className="text-gray-400">Enter your email to receive password reset instructions</p>
      </div>

      {/* Main Card */}
      <div className="premium-card-dark p-8 space-y-6">
        {!success ? (
          <>
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Reset Form */}
            <AuthForm
              type="reset"
              onSubmit={handleReset}
              isLoading={isSubmitting}
              submitLabel="Send Reset Link"
            />
          </>
        ) : (
          <>
            {/* Success Message */}
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✓</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Check Your Email</h2>
                <p className="text-gray-400">
                  We've sent password reset instructions to your email address. Click the link in the email to
                  proceed.
                </p>
              </div>
            </div>

            {/* Resend Link */}
            <button
              onClick={() => setSuccess(false)}
              className="w-full px-4 py-3 border border-gold/30 hover:border-gold text-gold font-semibold rounded-lg transition-all duration-300 hover:bg-gold/5"
            >
              Didn't receive the email? Resend
            </button>
          </>
        )}

        {/* Info Box */}
        <div className="p-4 bg-gold/5 border border-gold/20 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>Tip:</strong> Check your spam folder if you don't see the email in your inbox.
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="text-center space-y-2">
        <p className="text-gray-400">
          <Link href="/auth/sign-in" className="text-gold hover:text-gold/80 font-semibold transition-colors">
            Back to Sign In
          </Link>
        </p>
        <p className="text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/auth/create-account" className="text-gold hover:text-gold/80">
            Create one
          </Link>
        </p>
      </div>

      {/* Security Info */}
      <div className="border-t border-gold/10 pt-8 space-y-3 text-sm text-gray-400">
        <div className="flex gap-3">
          <span className="text-gold font-bold">🔐</span>
          <p>Your account security is important to us. Password reset links expire after 1 hour.</p>
        </div>
        <div className="flex gap-3">
          <span className="text-gold font-bold">⏱️</span>
          <p>If you did not request this reset, you can safely ignore this email.</p>
        </div>
      </div>
    </div>
  );
}
