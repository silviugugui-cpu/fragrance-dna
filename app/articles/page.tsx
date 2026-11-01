'use client';

import Link from 'next/link';
import ArticlesRail from './ArticlesRail';
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
        <div
          className="rounded-[28px] border border-[#9f7b44]/45 p-6 sm:p-8 lg:p-10"
          style={{
            background:
              'radial-gradient(circle at 12% 12%, rgba(250,223,164,0.17), transparent 40%), radial-gradient(circle at 84% 30%, rgba(176,118,48,0.22), transparent 42%), linear-gradient(135deg, rgba(11,11,11,0.93), rgba(22,16,11,0.9))',
            boxShadow: '0 30px 58px rgba(0,0,0,0.55), inset 0 1px 0 rgba(248,221,163,0.2)',
          }}
        >
          <p className="font-articles-body text-xs uppercase tracking-[0.28em] text-[#d8bc83]/85">{t.articles.needToKnow.kicker}</p>
          <h1 className="mt-3 font-articles-heading text-[clamp(1.75rem,3.1vw,3.2rem)] leading-[1.08] text-[#f4deb2]">
            {t.articles.needToKnow.title}
          </h1>
          <p className="mt-4 max-w-[70ch] font-articles-body text-[1.01rem] leading-relaxed text-[#e4d8bf]">
            {t.articles.needToKnow.intro}
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-4 grid w-[90vw] max-w-[1600px] gap-4 lg:grid-cols-3">
        <div className="w-full lg:col-span-3">
          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
            <aside className="articles-brand-rail-shell">
              <ArticlesRail>
                <div className="articles-rail-dynamic-mist" aria-hidden="true" />

                <div>
                  <p className="font-articles-body text-center text-[10px] uppercase tracking-[0.28em] text-[#d5b97f]">{t.articles.menu.passionMenu}</p>
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
                        <p className="font-articles-heading text-[1.12rem] leading-tight text-[#f4ddb2]">{menuEntry.label}</p>
                        <p className="mt-2 font-articles-body text-[10px] uppercase tracking-[0.2em] text-[#bb9660]">{menuEntry.hint}</p>
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
                            borderColor: isActive ? 'rgba(243, 210, 147, 0.9)' : 'rgba(168, 129, 70, 0.45)',
                            background: isActive
                              ? 'linear-gradient(160deg, rgba(35,25,13,0.96), rgba(16,13,10,0.98))'
                              : 'linear-gradient(160deg, rgba(19,16,14,0.88), rgba(12,12,12,0.92))',
                            boxShadow: isActive
                              ? '0 16px 34px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,228,173,0.24)'
                              : '0 10px 20px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,228,173,0.1)',
                            transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                          }}
                        >
                          <p className="font-articles-body text-[11px] uppercase tracking-[0.24em] text-[#d4b67a]">{t.articles.needToKnow.sectionLabel}</p>
                          <h2 className="mt-2 font-articles-heading text-[1.55rem] text-[#f5dfb4]">{section.title}</h2>
                          <p className="mt-3 font-articles-body text-base leading-relaxed text-[#dacfb7]">{section.description}</p>
                          <p className="mt-4 font-articles-body text-xs uppercase tracking-[0.2em] text-[#b7955f]">
                            {t.articles.needToKnow.articleCount(section.articles.length)}
                          </p>
                        </button>
                      );
                    })}
                  </section>

                  <section className="relative z-10 w-full">
                    <div
                      className="rounded-[30px] border border-[#9f7b44]/45 p-6 sm:p-8 lg:p-10"
                      style={{
                        background:
                          'linear-gradient(170deg, rgba(18,14,11,0.96) 0%, rgba(12,10,9,0.98) 60%), radial-gradient(circle at 85% 8%, rgba(164,118,64,0.25), transparent 36%)',
                        boxShadow: '0 30px 58px rgba(0,0,0,0.52), inset 0 1px 0 rgba(244,220,165,0.18)',
                      }}
                    >
                      <div className="border-b border-[#aa8447]/35 pb-5">
                        <p className="font-articles-body text-xs uppercase tracking-[0.28em] text-[#d1b57d]">{t.articles.needToKnow.nowReading}</p>
                        <h2 className="mt-2 font-articles-heading text-[clamp(1.5rem,2.5vw,2.5rem)] text-[#f1dcaf]">
                          {activeSection.title}
                        </h2>
                        <p className="mt-3 max-w-[75ch] font-articles-body text-[1rem] leading-relaxed text-[#dfd3ba]">
                          {activeSection.intro}
                        </p>
                      </div>

                      <div className="mt-6 space-y-5">
                        {activeSection.articles.map((article) => (
                          <article
                            key={article.title}
                            className="rounded-2xl border border-[#9c7841]/35 bg-[rgba(10,10,10,0.45)] p-5 sm:p-6"
                            style={{ boxShadow: 'inset 0 1px 0 rgba(255,228,177,0.14)' }}
                          >
                            <h3 className="font-articles-heading text-[1.45rem] leading-tight text-[#f2ddb1]">{article.title}</h3>
                            <p className="mt-2 font-articles-body text-[1.05rem] font-semibold text-[#caa46b]">{article.subtitle}</p>

                            {article.callout && (
                              <blockquote className="mt-4 whitespace-pre-line rounded-xl border border-[#b08a53]/45 bg-black/25 px-4 py-3 font-articles-body text-base leading-relaxed text-[#e4d7bc]">
                                {article.callout}
                              </blockquote>
                            )}

                            <div className="mt-4 space-y-3 font-articles-body text-[0.98rem] leading-relaxed text-[#e3d7be]">
                              {article.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                              ))}
                            </div>

                            {article.bullets && article.bullets.length > 0 && (
                              <ul className="mt-4 list-disc space-y-2 pl-5 font-articles-body text-[0.97rem] leading-relaxed text-[#dfd2b6] marker:text-[#c49a5e]">
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
