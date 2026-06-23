/**
 * Site Header Component
 * Premium navigation header with logo, nav links, and sign in
 * Uses the design system for consistent styling
 */

'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteLogo from '@/app/components/SiteLogo';
import { PremiumButton } from './PremiumButton';
import { useAuth } from '@/lib/auth';

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
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Logo */}
        <div className="-ml-[2.4rem] flex h-full flex-shrink-0 items-center lg:-ml-[2.6rem]">
          <div className="inline-block hover:opacity-80 transition-opacity">
            <SiteLogo />
          </div>
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

        {/* Sign In / User Menu */}
        <div className="flex-shrink-0 relative">
          {!user ? (
            <Link href="/auth/sign-in">
              <PremiumButton variant="secondary" size="sm">
                SIGN IN
              </PremiumButton>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 hover:bg-black/60 border border-gold/30 hover:border-gold text-gold transition-all duration-300"
              >
                <span className="text-sm font-medium">{user.name}</span>
                <span className={`text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-gold/30 rounded-lg shadow-lg shadow-gold/20 overflow-hidden z-50">
                  <div className="p-3 border-b border-gold/20">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-gold">{user.email}</p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/dna"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My DNA Profile
                    </Link>
                    <Link
                      href="/collection"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Collection
                    </Link>
                  </div>

                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-gold/20 disabled:opacity-50"
                  >
                    {isLoading ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
