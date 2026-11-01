import type { Metadata } from 'next';
import { Great_Vibes, Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { DEFAULT_LOCALE, LOCALE_COOKIE, LanguageProvider, isLocale } from '@/lib/i18n';
import RootAppFrame from '@/components/design-system/RootAppFrame';

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
    default: 'OlfactiveDNA — FragranceDNA',
    template: '%s | OlfactiveDNA',
  },
  description: 'Discover your olfactory identity through science, data, and discovery.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://olfactivedna.com',
    siteName: 'OlfactiveDNA',
    title: 'OlfactiveDNA — Discover your scent DNA',
    description: 'Decode your scent identity. Discover perfumes you truly love.',
    images: [
      {
        url: '/Logo/Logo Fragrance DNA with text.png',
        width: 1200,
        height: 630,
        alt: 'OlfactiveDNA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OlfactiveDNA — Discover your scent DNA',
    description: 'Decode your scent identity. Discover perfumes you truly love.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return (
    <html lang={locale} suppressHydrationWarning className={`${greatVibes.variable} ${inter.variable}`}>
      <body>
        <LanguageProvider initialLocale={cookieLocale}>
          <AuthProvider>
            <RootAppFrame>{children}</RootAppFrame>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
