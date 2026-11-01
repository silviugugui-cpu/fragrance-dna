'use client';

import Link from "next/link";
import { useLanguage } from '@/lib/i18n';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-gold">{t.auth.forgotPassword.kicker}</p>
        <h1 className="text-4xl font-light text-white">{t.auth.forgotPassword.title}</h1>
        <p className="text-gray-400">{t.auth.forgotPassword.subtitle}</p>
      </div>

      <div role="status" className="premium-card-dark space-y-4 p-8">
        <p className="text-sm leading-6 text-gray-300">
          {t.auth.forgotPassword.body}
        </p>
        <Link href="/auth/sign-in" className="inline-flex rounded border border-gold/30 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10">
          {t.auth.forgotPassword.backToSignIn}
        </Link>
      </div>
    </div>
  );
}