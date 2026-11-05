'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import ArticlesRail from '../ArticlesRail';
import ArticlesIntroHero from '../ArticlesIntroHero';
import { articlesMenuItems } from '../articlesMenu';
import { useLanguage } from '@/lib/i18n';
import { filterPerfumerProfiles } from '@/lib/data/topPerfumerProfiles';
import type { EvidencedPerfumerProfile } from '@/lib/database/perfumerProfiles';
import { getDiscoveryCopy } from '@/lib/i18n/discoveryCopy';
import { getPerfumerText } from '@/lib/data/topPerfumerTranslations';
import PerfumerPortrait from './PerfumerPortrait';

type CountFilter = 'all' | '15' | '25' | '50';
type SortMode = 'count' | 'name';

export default function PerfumersPage({ profiles }: { profiles: EvidencedPerfumerProfile[] }) {
  const pathname = usePathname();
  const { locale, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [minimum, setMinimum] = useState<CountFilter>('all');
  const [sort, setSort] = useState<SortMode>('count');
  const copy = t.articles.perfumers.directory;
  const discovery = getDiscoveryCopy(locale);

  const filteredProfiles = useMemo(() => {
    return filterPerfumerProfiles(query, minimum === 'all' ? 0 : Number(minimum), sort, locale, profiles);
  }, [minimum, query, sort, locale, profiles]);

  return (
    <main className="relative pb-16 pt-8 lg:pt-10">
      <section className="articles-intro-wrap relative z-10 mx-auto w-[90vw] max-w-[1600px]">
        <ArticlesIntroHero imageSrc="/Pictures/Smels/perfumers-atelier-pop-art-hero-2x.jpg" title={t.articles.perfumers.title} />
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
                  {articlesMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const menuEntry = t.articles.menu.items[item.key];
                    return (
                      <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined} data-active={isActive ? 'true' : 'false'} className="articles-rail-button w-full rounded-2xl border px-4 py-4 text-left transition-all duration-300">
                        <p className="font-articles-heading text-[1.12rem] leading-tight text-[color:var(--public-ink-primary,#f4ddb2)]">{menuEntry.label}</p>
                        <p className="mt-2 font-articles-body text-[10px] uppercase tracking-[0.2em] text-[color:var(--public-ink-muted,#bb9660)]">{menuEntry.hint}</p>
                      </Link>
                    );
                  })}
                </div>
              </ArticlesRail>
            </aside>

            <section className="articles-content-column relative z-10 min-w-0">
              <div className="mb-5 rounded-3xl border border-[rgba(var(--public-champagne-channels,156,120,65),0.35)] bg-[rgba(var(--public-surface-channels,10,10,10),0.45)] p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[color:var(--public-ink-muted,#caa46b)]">{copy.eyebrow}</p>
                    <p aria-live="polite" className="mt-2 font-articles-heading text-xl text-[color:var(--public-ink-primary,#f2ddb1)]">
                      {copy.count(filteredProfiles.length, profiles.length)}
                    </p>
                  </div>
                  <p className="max-w-2xl font-articles-body text-sm leading-relaxed text-[color:var(--public-ink-secondary,#d9c7a2)]">
                    {copy.intro}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[minmax(220px,1fr)_200px_200px]">
                  <label className="font-articles-body text-xs uppercase tracking-[0.12em] text-[color:var(--public-ink-secondary,#d9c7a2)]">
                    <span className="mb-2 block">{copy.search}</span>
                    <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.placeholder} className="w-full rounded-xl border border-[rgba(var(--public-champagne-channels,176,138,83),0.45)] bg-[rgba(var(--public-surface-channels,10,10,10),0.7)] px-3 py-2.5 normal-case tracking-normal text-[color:var(--public-ink-primary,#f2ddb1)] outline-none placeholder:text-[color:var(--public-ink-muted,#bb9660)] focus:border-[color:var(--public-ink-secondary,#e2c185)]" />
                  </label>
                  <label className="font-articles-body text-xs uppercase tracking-[0.12em] text-[color:var(--public-ink-secondary,#d9c7a2)]">
                    <span className="mb-2 block">{discovery.top}</span>
                    <select value={minimum} onChange={(event) => {
                      const value = event.target.value;
                      if (value === 'all' || value === '15' || value === '25' || value === '50') setMinimum(value);
                    }} className="w-full rounded-xl border border-[rgba(var(--public-champagne-channels,176,138,83),0.45)] bg-[rgb(var(--public-surface-channels,21,18,13))] px-3 py-2.5 text-[color:var(--public-ink-primary,#f2ddb1)] outline-none focus:border-[color:var(--public-ink-secondary,#e2c185)]">
                      <option value="all">{copy.all}</option>
                      <option value="15">15+</option><option value="25">25+</option><option value="50">50+</option>
                    </select>
                  </label>
                  <label className="font-articles-body text-xs uppercase tracking-[0.12em] text-[color:var(--public-ink-secondary,#d9c7a2)]">
                    <span className="mb-2 block">{copy.sort}</span>
                    <select value={sort} onChange={(event) => {
                      const value = event.target.value;
                      if (value === 'count' || value === 'name') setSort(value);
                    }} className="w-full rounded-xl border border-[rgba(var(--public-champagne-channels,176,138,83),0.45)] bg-[rgb(var(--public-surface-channels,21,18,13))] px-3 py-2.5 text-[color:var(--public-ink-primary,#f2ddb1)] outline-none focus:border-[color:var(--public-ink-secondary,#e2c185)]">
                      <option value="count">{discovery.top}</option><option value="name">{copy.name}</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                {filteredProfiles.map((profile) => {
                  const text = getPerfumerText(profile, locale);
                  return (
                  <article key={profile.slug} className="overflow-hidden rounded-3xl border border-[rgba(var(--public-champagne-channels,156,120,65),0.35)] bg-[rgba(var(--public-surface-channels,10,10,10),0.45)]" style={{ boxShadow: 'var(--public-panel-shadow, 0 14px 26px rgba(0,0,0,0.35), inset 0 1px 0 rgba(var(--public-champagne-channels,255,228,177),0.14))' }}>
                    <div className="grid sm:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="relative min-h-[220px] bg-black/30 sm:min-h-full">
                        <PerfumerPortrait profile={profile} />
                      </div>
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <h2 className="font-articles-heading text-[1.4rem] leading-tight text-[color:var(--public-ink-primary,#f2ddb1)]">
                            <Link href={`/articles/perfumers/${profile.slug}`}>{profile.name}</Link>
                          </h2>
                          <span className="rounded-full border border-[rgba(var(--public-champagne-channels,176,138,83),0.55)] bg-black/25 px-3 py-1 font-articles-body text-[10px] uppercase tracking-[0.12em] text-[color:var(--public-ink-secondary,#d8be8a)]">
                            {discovery.profile}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-[color:var(--public-ink-muted,#bb9660)]">{profile.rank === null ? discovery.notRanked : copy.profileRank(profile.rank)}</p>
                        <p lang={locale} className="mt-2 font-articles-body text-sm leading-relaxed text-[color:var(--public-ink-secondary,#d9c7a2)]">{text.bio}</p>
                        <p lang={locale} className="mt-4 font-articles-body text-sm leading-relaxed text-[color:var(--public-ink-primary,#e4d7bc)]">{text.approach}</p>
                        <div className="mt-4 flex items-baseline gap-2">
                          <strong className="font-articles-heading text-3xl text-[color:var(--public-ink-primary,#f2ddb1)]">{profile.topCreations}</strong>
                          <span className="font-articles-body text-xs uppercase tracking-[0.12em] text-[color:var(--public-ink-muted,#caa46b)]">{discovery.top} · {profile.evaluatedCreations} {discovery.evaluated}</span>
                        </div>
                        <div className="mt-4">
                          <p className="font-articles-body text-[10px] uppercase tracking-[0.2em] text-[color:var(--public-ink-muted,#caa46b)]">{discovery.works}</p>
                          <ul className="mt-2 space-y-1.5">
                            {profile.works.slice(0, 3).map((creation) => <li key={creation.id} className="font-articles-body text-sm text-[color:var(--public-ink-secondary,#d9c7a2)]"><span className="text-[color:var(--public-ink-primary,#f2ddb1)]">{creation.name}</span> <span className="text-[color:var(--public-ink-muted,#bb9660)]">— {creation.brand}</span></li>)}
                          </ul>
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-4">
                          <Link href={`/articles/perfumers/${profile.slug}`} className="rounded-full border border-[rgba(var(--public-champagne-channels,176,138,83),0.55)] px-4 py-2 font-articles-body text-xs uppercase tracking-[0.12em] text-[color:var(--public-ink-primary,#f2ddb1)] transition hover:bg-white/5">
                            {copy.view}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );})}
                {filteredProfiles.length === 0 && <p role="status" className="rounded-2xl border border-current p-6 font-articles-body text-[color:var(--public-ink-secondary,#d9c7a2)]">{copy.empty}</p>}
              </div>
              <p className="mt-6 text-sm text-[color:var(--public-ink-secondary,#d9c7a2)]">{discovery.rankingHelp}</p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
