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
  title: 'FragranceDNA',
  description: 'Discover your olfactory identity through science, data, and discovery.',
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
