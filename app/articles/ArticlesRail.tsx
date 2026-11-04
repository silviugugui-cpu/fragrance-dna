'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

export default function ArticlesRail({ children }: { children: ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const header = document.querySelector('.header-inner');
    const logo = document.querySelector('.brand-logo-fixed .fragrance-logo');
    const rail = railRef.current;
    if (!header || !logo || !rail) return;

    const alignRail = () => {
      const bounds = logo.getBoundingClientRect();
      rail.style.setProperty('--articles-logo-bottom', `${bounds.bottom}px`);
      rail.style.setProperty('--articles-header-left', `${header.getBoundingClientRect().left}px`);
    };

    alignRail();
    const observer = new ResizeObserver(alignRail);
    observer.observe(header);
    observer.observe(logo);
    window.addEventListener('scroll', alignRail, { passive: true });
    window.addEventListener('resize', alignRail);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', alignRail);
      window.removeEventListener('resize', alignRail);
    };
  }, []);

  return (
    <div ref={railRef} className="articles-brand-rail relative overflow-hidden p-4 sm:p-5">
      {children}
    </div>
  );
}
