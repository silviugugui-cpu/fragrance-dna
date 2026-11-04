import type { Metadata } from 'next';
import { Great_Vibes, Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { DEFAULT_LOCALE, LOCALE_COOKIE, LanguageProvider, isLocale } from '@/lib/i18n';
import RootAppFrame from '@/components/design-system/RootAppFrame';
import { BRAND_ASSETS } from '@/lib/branding';
import { DEFAULT_PUBLIC_THEME, PUBLIC_THEME_COOKIE, isPublicTheme } from '@/lib/theme/publicTheme';
import { PublicThemeProvider } from '@/lib/theme/PublicThemeProvider';

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});

// Platform-wide body font: high x-height and excellent dark-background legibility.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body-base',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://olfactivedna.com'),
  title: {
    default: 'OlfactiveDNA',
    template: '%s | OlfactiveDNA',
  },
  description: 'Discover your olfactive identity through science, data, and discovery.',
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: 'website',
    url: './',
    siteName: 'OlfactiveDNA',
    title: 'OlfactiveDNA — Discover your olfactive DNA',
    description: 'Decode your olfactive identity. Discover perfumes you truly love.',
    images: [
      {
        url: BRAND_ASSETS.dark.preview,
        width: 2906,
        height: 2164,
        alt: 'OlfactiveDNA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OlfactiveDNA — Discover your olfactive DNA',
    description: 'Decode your olfactive identity. Discover perfumes you truly love.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const cookieTheme = cookies().get(PUBLIC_THEME_COOKIE)?.value;
  const theme = isPublicTheme(cookieTheme) ? cookieTheme : DEFAULT_PUBLIC_THEME;

  return (
    <html lang={locale} data-public-theme={theme} suppressHydrationWarning className={`${greatVibes.variable} ${inter.variable}`}>
      <body>
        <LanguageProvider initialLocale={cookieLocale}>
          <AuthProvider>
            <PublicThemeProvider initialTheme={theme}>
              <RootAppFrame>{children}</RootAppFrame>
            </PublicThemeProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
