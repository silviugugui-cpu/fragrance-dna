'use client';

import Link from 'next/link';
import ArticlesRail from '../ArticlesRail';
import { usePathname } from 'next/navigation';
import { perfumers, type PerfumerDnaKey } from '@/lib/data/perfumers';
import { articlesMenuItems } from '../articlesMenu';
import { useLanguage } from '@/lib/i18n';

const menuItems = articlesMenuItems;

export default function PerfumersPage() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <main className="relative pb-16 pt-8 lg:pt-10">
      <section className="articles-intro-wrap relative z-10 mx-auto w-[90vw] max-w-[1600px]">
        <div
          className="rounded-[28px] border border-[rgba(var(--public-champagne-channels,159,123,68),0.45)] p-6 sm:p-8 lg:p-10"
          style={{
            background:
              'radial-gradient(circle at 12% 12%, rgba(250,223,164,0.17), transparent 40%), radial-gradient(circle at 84% 30%, rgba(176,118,48,0.22), transparent 42%), linear-gradient(135deg, rgba(11,11,11,0.93), rgba(22,16,11,0.9))',
            boxShadow: '0 30px 58px rgba(0,0,0,0.55), inset 0 1px 0 rgba(var(--public-champagne-channels,248,221,163),0.2)',
          }}
        >
          <p className="font-articles-body text-xs uppercase tracking-[0.28em] text-[rgba(var(--public-champagne-channels,216,188,131),0.85)]">{t.articles.perfumers.kicker}</p>
          <h1 className="mt-3 font-articles-heading text-[clamp(1.75rem,3.1vw,3.2rem)] leading-[1.08] text-[color:var(--public-ink-primary,#f4deb2)]">
            {t.articles.perfumers.title}
          </h1>
          <p className="mt-4 max-w-[70ch] font-articles-body text-[1.01rem] leading-relaxed text-[color:var(--public-ink-primary,#e4d8bf)]">
            {t.articles.perfumers.intro}
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-4 grid w-[90vw] max-w-[1600px] gap-4 lg:grid-cols-3">
        <div className="w-full lg:col-span-3">
          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
            <aside className="articles-brand-rail-shell">
              <ArticlesRail>

                <div>
                  <p className="font-articles-body text-center text-[10px] uppercase tracking-[0.28em] text-[color:var(--public-ink-secondary,#d5b97f)]">{t.articles.menu.passionMenu}</p>
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
                        <p className="font-articles-heading text-[1.12rem] leading-tight text-[color:var(--public-ink-primary,#f4ddb2)]">{menuEntry.label}</p>
                        <p className="mt-2 font-articles-body text-[10px] uppercase tracking-[0.2em] text-[color:var(--public-ink-muted,#bb9660)]">{menuEntry.hint}</p>
                      </Link>
                    );
                  })}
                </div>
              </ArticlesRail>
            </aside>

            <section className="articles-content-column relative z-10 grid min-w-0 gap-4 xl:grid-cols-2">
              {perfumers.map((perfumer) => (
                <article
                  key={perfumer.name}
                  className="rounded-3xl border border-[rgba(var(--public-champagne-channels,156,120,65),0.35)] bg-[rgba(10,10,10,0.45)] p-5 sm:p-6"
                  style={{ boxShadow: '0 14px 26px rgba(0,0,0,0.35), inset 0 1px 0 rgba(var(--public-champagne-channels,255,228,177),0.14)' }}
                >
                  <h2 className="font-articles-heading text-[1.4rem] leading-tight text-[color:var(--public-ink-primary,#f2ddb1)]">{perfumer.name}</h2>
                  <p className="mt-2 inline-flex rounded-full border border-[rgba(var(--public-champagne-channels,176,138,83),0.45)] bg-black/25 px-2.5 py-1 font-articles-body text-[10px] uppercase tracking-[0.18em] text-[color:var(--public-ink-secondary,#d8be8a)]">
                    {t.articles.perfumers.clusters[perfumer.cluster] ?? perfumer.cluster}
                  </p>
                  <p className="mt-2 font-articles-body text-base text-[color:var(--public-ink-secondary,#d9c7a2)]">
                    {t.articles.perfumers.profiles[perfumer.name]?.style ?? perfumer.style}
                  </p>
                  <p className="mt-2 font-articles-body text-base leading-relaxed text-[color:var(--public-ink-primary,#e4d7bc)]">
                    {t.articles.perfumers.profiles[perfumer.name]?.philosophy ?? perfumer.philosophy}
                  </p>

                  <div className="mt-4">
                    <p className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[color:var(--public-ink-muted,#caa46b)]">{t.articles.perfumers.iconicFragrances}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {perfumer.fragrances.map((fragrance) => (
                        <button
                          key={fragrance}
                          type="button"
                          className="rounded-full border border-[rgba(var(--public-champagne-channels,176,138,83),0.45)] bg-black/25 px-3 py-1 text-xs text-[color:var(--public-ink-primary,#e4d7bc)] transition-colors hover:border-[color:var(--public-ink-secondary,#e2c185)] hover:text-[color:var(--public-ink-primary,#f5e2bd)]"
                        >
                          {fragrance}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {(Object.entries(perfumer.dna) as Array<[PerfumerDnaKey, number]>).map(([label, value]) => (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em]">
                          <span className="font-articles-body text-[color:var(--public-ink-secondary,#d6be91)]">{t.common.axes[label] ?? label}</span>
                          <span className="font-articles-body text-[color:var(--public-ink-primary,#f0ddb8)]">{value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#2a1f12]">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#a7772f] via-[#c99a52] to-[#f2ce92]"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
