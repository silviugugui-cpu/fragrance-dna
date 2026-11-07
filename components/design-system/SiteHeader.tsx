/**
 * Site Header Component
 * Premium navigation header with logo, nav links, and sign in
 * Uses the design system for consistent styling
 */

'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SiteLogo from '@/app/components/SiteLogo';
import LuxuryLoginButton from './LuxuryLoginButton';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { usePublicTheme } from '@/lib/theme/PublicThemeProvider';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { isAdminUser } from '@/lib/auth/adminAccess';
import { getDnaConfidenceBadge, loadDnaSession } from '@/lib/dnaSession';
import { articlesMenuItems } from '@/app/articles/articlesMenu';

const NAV_LINKS = [
  { href: '/', key: 'home' },
  { href: '/grounding', key: 'grounding' },
  { href: '/test', key: 'test' },
  { href: '/dna', key: 'dna' },
  { href: '/collection', key: 'collection' },
  { href: '/faq', key: 'faq' },
  { href: '/articles', key: 'articles' },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const { t } = useLanguage();
  const { assets } = usePublicTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState<'dna' | 'passion' | null>(null);
  const [confidence, setConfidence] = useState(0);
  const userBadge = getDnaConfidenceBadge(confidence);
  const userBadgeLabel = t.common.badges[userBadge.id] ?? userBadge.label;

  useEffect(() => {
    const syncConfidence = () => {
      setConfidence(user ? loadDnaSession(user.id).summary?.confidenceScore ?? 0 : 0);
    };

    syncConfidence();
    window.addEventListener('fragrance-dna-session-updated', syncConfidence);
    window.addEventListener('storage', syncConfidence);
    return () => {
      window.removeEventListener('fragrance-dna-session-updated', syncConfidence);
      window.removeEventListener('storage', syncConfidence);
    };
  }, [user?.id]);

  useEffect(() => {
    setActiveMobileMenu(null);
    setIsDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!activeMobileMenu) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeMobileMenu]);

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <LanguageSwitcher className="header-language-switcher" />
        <ThemeToggle />
        {/* Logo */}
        <div className="brand-logo-lock relative flex h-full flex-shrink-0 items-center">
          <div className="brand-logo-fixed relative z-[90] inline-block hover:opacity-80 transition-opacity">
            <div className="relative z-[120]">
              <SiteLogo href={!isLoading && isAdminUser(user) ? '/studio' : '/'} imageSrc={assets.logo} />
            </div>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav
          className="site-nav relative z-[70] hidden md:flex"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
              || (link.key === 'articles' && (pathname.startsWith('/articles/') || pathname === '/fragrances' || pathname.startsWith('/fragrances/')));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link uppercase font-medium transition-all duration-300 ${
                  isActive ? 'active text-gold' : 'text-gray-400 hover:text-gold'
                } ${link.key === 'collection' ? 'nav-encyclopedia-start' : ''}`}
              >
                {t.header.nav[link.key].label}
              </Link>
            );
          })}
        </nav>

        {/* Sign In / User Menu */}
        <div className="hidden flex-shrink-0 relative z-[70] items-center gap-3 md:flex">
          {!user ? (
            <div className="origin-right scale-[1.3]">
              <LuxuryLoginButton className="h-[38px] !border-0 !rounded-none hover:!shadow-none" />
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label={t.header.dnaBadgeAria(user.name, userBadgeLabel)}
                title={t.header.dnaBadgeTitle(userBadgeLabel)}
                className="flex items-center gap-2 px-3 py-2 text-gold transition-opacity duration-300 hover:opacity-80"
              >
                <span className="max-w-[clamp(80px,9vw,150px)] truncate text-sm font-medium">{user.name}</span>
                <Image src={userBadge.imageSrc} alt="" width={102} height={102} className="h-[6.3rem] w-[6.3rem] shrink-0 object-contain" />
                <span className={`text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-gold/30 rounded-lg shadow-lg shadow-gold/20 overflow-hidden z-50">
                  <div className="p-3 border-b border-gold/20">
                    <p className="text-xs text-gray-400">{t.header.signedInAs}</p>
                    <p className="text-sm font-medium text-gold">{user.email}</p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/dna"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {t.header.myDnaProfile}
                    </Link>
                    <Link
                      href="/collection"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {t.header.myCollection}
                    </Link>
                    <Link
                      href="/faq"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {t.header.dnaBadgesFaq}
                    </Link>
                  </div>

                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-gold/20 disabled:opacity-50"
                  >
                    {isLoading ? t.header.signingOut : t.header.signOut}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mobile-header-actions md:hidden">
          {!user ? (
            <Link href="/auth/sign-in" className="mobile-login-btn" aria-label={t.header.signIntoYourDna}>
              {t.header.login}
            </Link>
          ) : (
            <Link href="/dna" className="mobile-login-btn inline-flex items-center gap-1.5" aria-label={t.header.openDnaProfileAria(userBadgeLabel)}>
              <span className="min-w-0 truncate">{user.name.split(' ')[0]}</span>
              <Image src={userBadge.imageSrc} alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
            </Link>
          )}
          <button
            type="button"
            className={`mobile-menu-btn ${activeMobileMenu === 'dna' ? 'active' : ''}`}
            onClick={() => setActiveMobileMenu((current) => current === 'dna' ? null : 'dna')}
            aria-label={t.header.mobileMenuSections.exploreYourDna}
            aria-expanded={activeMobileMenu === 'dna'}
            aria-controls="mobile-primary-nav"
          >
            {t.header.mobileMenuSections.exploreYourDnaButton}
          </button>
          <button
            type="button"
            className={`mobile-menu-btn ${activeMobileMenu === 'passion' ? 'active' : ''}`}
            onClick={() => setActiveMobileMenu((current) => current === 'passion' ? null : 'passion')}
            aria-label={t.header.mobileMenuSections.yourPassion}
            aria-expanded={activeMobileMenu === 'passion'}
            aria-controls="mobile-primary-nav"
          >
            {t.header.mobileMenuSections.yourPassionButton}
          </button>
        </div>
      </div>

      {activeMobileMenu && typeof document !== 'undefined' && createPortal(
        <>
          <button
            type="button"
            className="mobile-nav-backdrop md:hidden"
            aria-label={t.header.closeMobileMenu}
            onClick={() => setActiveMobileMenu(null)}
          />

          <div id="mobile-primary-nav" className="mobile-nav-panel md:hidden">
            {activeMobileMenu === 'dna' && <section className="mobile-nav-section">
              <h2 className="mobile-nav-section-title">{t.header.mobileMenuSections.exploreYourDna}</h2>
              <nav className="mobile-nav-list" aria-label={t.header.mobileMenuSections.exploreYourDna}>
                {NAV_LINKS.filter((link) => link.key !== 'articles').map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                    >
                      <span className="mobile-nav-link-title">{t.header.nav[link.key].mobile}</span>
                      <span className="mobile-nav-link-hint">{t.header.nav[link.key].hint}</span>
                    </Link>
                  );
                })}
              </nav>
            </section>}

            {activeMobileMenu === 'passion' && <section className="mobile-nav-section">
              <h2 className="mobile-nav-section-title">{t.header.mobileMenuSections.yourPassion}</h2>
              <nav className="mobile-nav-list" aria-label={t.header.mobileMenuSections.yourPassion}>
                {articlesMenuItems.map((item) => {
                  const isActive = pathname === item.href
                    || (item.href !== '/articles' && pathname.startsWith(`${item.href}/`));
                  const menuEntry = t.articles.menu.items[item.key];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveMobileMenu(null)}
                    >
                      <span className="mobile-nav-link-title">{menuEntry.label}</span>
                      <span className="mobile-nav-link-hint">{menuEntry.hint}</span>
                    </Link>
                  );
                })}
              </nav>
            </section>}

            {user && (
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="mobile-signout-btn"
                type="button"
              >
                {isLoading ? t.header.signingOut : t.header.signOut}
              </button>
            )}
          </div>
        </>,
        document.body,
      )}
    </header>
  );
}

export default SiteHeader;
