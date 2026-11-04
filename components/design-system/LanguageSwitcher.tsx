'use client';

import { useEffect, useRef, useState } from 'react';
import { LOCALES, LOCALE_LABELS, useLanguage } from '@/lib/i18n';

interface LanguageSwitcherProps {
  /** Compact renders the header dropdown; full renders a list for the mobile menu. */
  variant?: 'compact' | 'full';
  className?: string;
}

export function LanguageSwitcher({ variant = 'compact', className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  if (variant === 'full') {
    return (
      <div className={className}>
        <p className="mb-2 text-xs uppercase tracking-wider text-gray-400">{t.header.language}</p>
        <div className="grid grid-cols-2 gap-2">
          {LOCALES.map((code) => {
            const isActive = code === locale;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                aria-pressed={isActive}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'border-gold/60 bg-gold/10 text-gold'
                    : 'border-white/10 bg-black/30 text-gray-300 hover:border-gold/40 hover:text-gold'
                }`}
              >
                <span aria-hidden="true">{LOCALE_LABELS[code].flag}</span>
                <span>{LOCALE_LABELS[code].native}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative self-stretch ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t.header.selectLanguage}
        title={t.header.selectLanguage}
        className="flex h-full min-h-[2.75rem] items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-gold transition-opacity duration-300 hover:opacity-80"
      >
        <span>{locale.toUpperCase()}</span>
        <span className={`text-[9px] transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">▼</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t.header.selectLanguage}
          className="absolute left-0 top-full z-[130] mt-2 flex flex-col items-stretch gap-1 whitespace-nowrap rounded-2xl border border-gold/40 bg-[#0b0b0b] px-2 py-1.5 shadow-lg shadow-black/80 md:flex-row md:items-center md:rounded-full"
        >
          {LOCALES.map((code) => {
            const isActive = code === locale;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={isActive}
                title={LOCALE_LABELS[code].english}
                onClick={() => {
                  setLocale(code);
                  setIsOpen(false);
                }}
                className={`rounded-full px-3 py-3 text-left text-sm transition-colors md:py-1.5 md:text-center ${
                  isActive ? 'bg-gold/20 text-gold' : 'text-gray-300 hover:bg-gold/10 hover:text-gold'
                }`}
              >
                {LOCALE_LABELS[code].native}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
