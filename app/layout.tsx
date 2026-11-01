import type { Metadata } from 'next';
import { Great_Vibes, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
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
  return (
    <html lang="en" suppressHydrationWarning className={`${greatVibes.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <RootAppFrame>{children}</RootAppFrame>
        </AuthProvider>
      </body>
    </html>
  );
}
