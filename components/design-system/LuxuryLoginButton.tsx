'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

type LuxuryLoginButtonProps = {
  href?: string;
  className?: string;
};

export default function LuxuryLoginButton({
  href = '/auth/sign-in',
  className = '',
}: LuxuryLoginButtonProps) {
  const { t } = useLanguage();

  return (
    <Link
      href={href}
      className={`inline-flex h-[38px] items-center rounded-[12px] border border-[#b8860b] bg-transparent px-4 font-home-mission text-[12px] font-medium uppercase tracking-[0.18em] text-[#d4af78] transition-all duration-300 hover:text-[#f0d28a] hover:shadow-[0_0_14px_rgba(184,134,11,0.28)] ${className}`}
      aria-label={t.auth.loginButton.label}
    >
      <span>{t.auth.loginButton.label}</span>
    </Link>
  );
}
