'use client';

import Link from 'next/link';
import ArticlesRail from './ArticlesRail';
import ArticlesIntroHero from './ArticlesIntroHero';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { articlesMenuItems } from './articlesMenu';
import { useLanguage } from '@/lib/i18n';
import type { ArticleSectionId } from '@/lib/i18n/dictionaries/en/articles';

const SECTION_IDS: ArticleSectionId[] = [
  'scent-fundamentals',
  'application-technique',
  'testing-selection',
  'performance-science',
  'formula-evolution',
  'market-reality',
];

export default function ArticlesPage() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [selectedSection, setSelectedSection] = useState<ArticleSectionId>('scent-fundamentals');

  const submenuItems = articlesMenuItems;

  const sections = t.articles.needToKnow.sections;
  const activeSection = sections[selectedSection] ?? sections['scent-fundamentals'];

  return (
    <main className="relative pb-16 pt-8 lg:pt-10">
      <section className="articles-intro-wrap relative z-10 mx-auto w-[90vw] max-w-[1600px]">
        <ArticlesIntroHero imageSrc="/Pictures/Smels/need-to-know-pop-art-hero-2x.jpg" title={t.articles.needToKnow.intro} />
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
                  {submenuItems.map((item) => {
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

            <div className="articles-content-column space-y-6">
              <>
                  <section className="relative z-10 grid w-full gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                    {SECTION_IDS.map((sectionId) => {
                      const section = sections[sectionId];
                      const isActive = selectedSection === sectionId;
                      return (
                        <button
                          key={sectionId}
                          type="button"
                          onClick={() => setSelectedSection(sectionId)}
                          className="rounded-3xl border p-5 text-left transition-all duration-300"
                          style={{
                            borderColor: isActive ? 'rgba(var(--public-champagne-channels,243,210,147),0.9)' : 'rgba(var(--public-champagne-channels,168,129,70),0.45)',
                            background: isActive
                              ? 'linear-gradient(160deg, rgba(var(--public-surface-channels,35,25,13),0.96), rgba(var(--public-surface-channels,16,13,10),0.98))'
                              : 'linear-gradient(160deg, rgba(var(--public-surface-channels,19,16,14),0.88), rgba(var(--public-surface-channels,12,12,12),0.92))',
                            boxShadow: isActive
                              ? 'var(--public-panel-shadow, 0 16px 34px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,228,173,0.24))'
                              : 'var(--public-panel-shadow, 0 10px 20px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,228,173,0.1))',
                            transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                          }}
                        >
                          <p className="font-articles-body text-[11px] uppercase tracking-[0.24em] text-[color:var(--public-ink-secondary,#d4b67a)]">{t.articles.needToKnow.sectionLabel}</p>
                          <h2 className="mt-2 font-articles-heading text-[1.55rem] text-[color:var(--public-ink-primary,#f5dfb4)]">{section.title}</h2>
                          <p className="mt-3 font-articles-body text-base leading-relaxed text-[color:var(--public-ink-secondary,#dacfb7)]">{section.description}</p>
                          <p className="mt-4 font-articles-body text-xs uppercase tracking-[0.2em] text-[color:var(--public-ink-muted,#b7955f)]">
                            {t.articles.needToKnow.articleCount(section.articles.length)}
                          </p>
                        </button>
                      );
                    })}
                  </section>

                  <section className="relative z-10 w-full">
                    <div
                      className="rounded-[30px] border border-[rgba(var(--public-champagne-channels,159,123,68),0.45)] p-6 sm:p-8 lg:p-10"
                      style={{
                        background:
                          'linear-gradient(170deg, rgba(var(--public-surface-channels,18,14,11),0.96) 0%, rgba(var(--public-surface-channels,12,10,9),0.98) 60%), radial-gradient(circle at 85% 8%, rgba(164,118,64,0.25), transparent 36%)',
                        boxShadow: 'var(--public-panel-shadow, 0 30px 58px rgba(0,0,0,0.52), inset 0 1px 0 rgba(var(--public-champagne-channels,244,220,165),0.18))',
                      }}
                    >
                      <div className="border-b border-[rgba(var(--public-champagne-channels,170,132,71),0.35)] pb-5">
                        <p className="font-articles-body text-xs uppercase tracking-[0.28em] text-[color:var(--public-ink-secondary,#d1b57d)]">{t.articles.needToKnow.nowReading}</p>
                        <h2 className="mt-2 font-articles-heading text-[clamp(1.5rem,2.5vw,2.5rem)] text-[color:var(--public-ink-primary,#f1dcaf)]">
                          {activeSection.title}
                        </h2>
                        <p className="mt-3 max-w-[75ch] font-articles-body text-[1rem] leading-relaxed text-[color:var(--public-ink-secondary,#dfd3ba)]">
                          {activeSection.intro}
                        </p>
                      </div>

                      <div className="mt-6 space-y-5">
                        {activeSection.articles.map((article) => (
                          <article
                            key={article.title}
                            className="rounded-2xl border border-[rgba(var(--public-champagne-channels,156,120,65),0.35)] bg-[rgba(var(--public-surface-channels,10,10,10),0.45)] p-5 sm:p-6"
                            style={{ boxShadow: 'var(--public-panel-shadow, inset 0 1px 0 rgba(var(--public-champagne-channels,255,228,177),0.14))' }}
                          >
                            <h3 className="font-articles-heading text-[1.45rem] leading-tight text-[color:var(--public-ink-primary,#f2ddb1)]">{article.title}</h3>
                            <p className="mt-2 font-articles-body text-[1.05rem] font-semibold text-[color:var(--public-ink-muted,#caa46b)]">{article.subtitle}</p>

                            {article.callout && (
                              <blockquote className="mt-4 whitespace-pre-line rounded-xl border border-[rgba(var(--public-champagne-channels,176,138,83),0.45)] bg-black/25 px-4 py-3 font-articles-body text-base leading-relaxed text-[color:var(--public-ink-primary,#e4d7bc)]">
                                {article.callout}
                              </blockquote>
                            )}

                            <div className="mt-4 space-y-3 font-articles-body text-[0.98rem] leading-relaxed text-[color:var(--public-ink-primary,#e3d7be)]">
                              {article.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                              ))}
                            </div>

                            {article.bullets && article.bullets.length > 0 && (
                              <ul className="mt-4 list-disc space-y-2 pl-5 font-articles-body text-[0.97rem] leading-relaxed text-[color:var(--public-ink-secondary,#dfd2b6)] marker:text-[color:var(--public-ink-muted,#c49a5e)]">
                                {article.bullets.map((bullet) => (
                                  <li key={bullet}>{bullet}</li>
                                ))}
                              </ul>
                            )}
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
              </>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
