'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

export default function ArticlesRail({ children }: { children: ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const logo = document.querySelector('.brand-logo-fixed .fragrance-logo');
    const rail = railRef.current;
    if (!logo || !rail) return;

    const alignWithLogo = () => {
      const bounds = logo.getBoundingClientRect();
      rail.style.setProperty('--articles-logo-bottom', `${bounds.bottom}px`);
      rail.style.setProperty('--articles-logo-left', `${bounds.left}px`);
    };

    alignWithLogo();
    const observer = new ResizeObserver(alignWithLogo);
    observer.observe(logo);
    window.addEventListener('scroll', alignWithLogo, { passive: true });
    window.addEventListener('resize', alignWithLogo);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', alignWithLogo);
      window.removeEventListener('resize', alignWithLogo);
    };
  }, []);

  return (
    <div ref={railRef} className="articles-brand-rail relative overflow-hidden p-4 sm:p-5">
      {children}
    </div>
  );
}
