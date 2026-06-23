/**
 * Site Header Component
 * Premium navigation header with logo, nav links, and sign in
 * Uses the design system for consistent styling
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import SiteLogo from '@/app/components/SiteLogo';
import { PremiumButton } from './PremiumButton';

const navLinks = [
  { href: '/', label: 'DISCOVER', mobile: 'Home' },
  { href: '/territories', label: 'TERRITORIES', mobile: 'Territory' },
  { href: '/profiles', label: 'PROFILE', mobile: 'Profile' },
  { href: '/dna', label: 'SCIENCE', mobile: 'DNA' },
  { href: '/grounding', label: 'GROUNDING', mobile: 'Ground' },
  { href: '/collection', label: 'COLLECTION', mobile: 'Collect' },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="main-container header-inner">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <SiteLogo />
          </Link>
        </div>

        {/* Navigation - Desktop */}
        <nav
          className="site-nav hidden md:flex"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link uppercase text-xs font-medium transition-all duration-300 ${
                  isActive ? 'active text-gold' : 'text-gray-400 hover:text-gold'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign In Button */}
        <div className="flex-shrink-0">
          <PremiumButton
            variant="secondary"
            size="sm"
            onClick={() => {
              // TODO: Implement sign in navigation
              // window.location.href = '/signin';
            }}
          >
            SIGN IN
          </PremiumButton>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
