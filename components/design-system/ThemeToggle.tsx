'use client';

import { useLanguage } from '@/lib/i18n';
import { usePublicTheme } from '@/lib/theme/PublicThemeProvider';

export default function ThemeToggle() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = usePublicTheme();
  const label = theme === 'dark' ? t.header.switchToNormal : t.header.switchToDark;

  return (
    <button
      type="button"
      className="header-theme-toggle"
      aria-label={label}
      title={label}
      aria-pressed={theme === 'normal'}
      onClick={toggleTheme}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        {theme === 'dark' ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </>
        ) : <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />}
      </svg>
    </button>
  );
}
