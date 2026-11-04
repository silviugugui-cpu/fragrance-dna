'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { PUBLIC_THEME_ASSETS, PUBLIC_THEME_COOKIE, type PublicTheme } from './publicTheme';

interface PublicThemeContextValue {
  theme: PublicTheme;
  assets: (typeof PUBLIC_THEME_ASSETS)[PublicTheme];
  toggleTheme: () => void;
}

const PublicThemeContext = createContext<PublicThemeContextValue | null>(null);

export function PublicThemeProvider({ initialTheme, children }: { initialTheme: PublicTheme; children: ReactNode }) {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.publicTheme = theme;
    document.cookie = `${PUBLIC_THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [theme]);

  return (
    <PublicThemeContext.Provider value={{
      theme,
      assets: PUBLIC_THEME_ASSETS[theme],
      toggleTheme: () => setTheme((current) => current === 'dark' ? 'normal' : 'dark'),
    }}>
      {children}
    </PublicThemeContext.Provider>
  );
}

export function usePublicTheme() {
  const context = useContext(PublicThemeContext);
  if (!context) {
    throw new Error('usePublicTheme must be used within PublicThemeProvider');
  }
  return context;
}
