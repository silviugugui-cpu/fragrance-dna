'use client';

import { useLanguage } from '@/lib/i18n';

export default function ThemeToggle() {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className="header-theme-toggle"
      aria-label={t.header.themeComingSoon}
      title={t.header.themeComingSoon}
      aria-pressed="true"
      disabled
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
      </svg>
    </button>
  );
}
