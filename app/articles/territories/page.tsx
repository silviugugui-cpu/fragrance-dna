'use client';

import Link from 'next/link';
import ArticlesRail from '../ArticlesRail';
import { usePathname } from 'next/navigation';
import TerritoriesFullSection from '@/components/territories/TerritoriesFullSection';
import { articlesMenuItems } from '../articlesMenu';
import { useLanguage } from '@/lib/i18n';

const menuItems = articlesMenuItems;

export default function ArticlesTerritoriesPage() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <main className="relative pb-16 pt-8 lg:pt-10">
      <section className="relative z-10 mx-auto grid w-[90vw] max-w-[1600px] gap-4 lg:grid-cols-3">
        <div className="w-full lg:col-span-3">
          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
            <aside className="articles-brand-rail-shell">
              <ArticlesRail>

                <div>
                  <p className="font-articles-body text-center text-[10px] uppercase tracking-[0.28em] text-[#d5b97f]">{t.articles.menu.passionMenu}</p>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const menuEntry = t.articles.menu.items[item.key];
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-active={isActive ? 'true' : 'false'}
                        className="articles-rail-button w-full rounded-2xl border px-4 py-4 text-left transition-all duration-300"
                      >
                        <p className="font-articles-heading text-[1.12rem] leading-tight text-[#f4ddb2]">{menuEntry.label}</p>
                        <p className="mt-2 font-articles-body text-[10px] uppercase tracking-[0.2em] text-[#bb9660]">{menuEntry.hint}</p>
                      </Link>
                    );
                  })}
                </div>
              </ArticlesRail>
            </aside>

            <div className="articles-content-column min-w-0">
              <TerritoriesFullSection embedded />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
