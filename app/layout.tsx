import type { Metadata } from 'next';
import './globals.css';
import SiteLogo from './components/SiteLogo';

export const metadata: Metadata = {
  title: 'FragranceDNA',
  description: 'Olfactory intelligence MVP for fragrance profiling.',
};

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/profiles', label: 'Profiles' },
  { href: '/grounding', label: 'Grounding' },
  { href: '/test', label: 'Test' },
  { href: '/results', label: 'Results' },
  { href: '/dna', label: 'DNA' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="page-shell">
          <header className="site-header">
            <div className="main-container header-inner">
              <SiteLogo />
              <nav className="site-nav" aria-label="Primary navigation">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className="nav-link">
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
