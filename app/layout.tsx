import type { Metadata } from 'next';
import { Great_Vibes } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/design-system/SiteHeader';

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FragranceDNA',
  description: 'Discover your olfactory identity through science, data, and discovery.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={greatVibes.variable}>
      <body>
        <div className="app-background-layer" aria-hidden="true" />
        <div className="app-overlay-layer" aria-hidden="true" />
        <div className="app-ambient-layer" aria-hidden="true" />
        <div className="page-shell content-layer">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
