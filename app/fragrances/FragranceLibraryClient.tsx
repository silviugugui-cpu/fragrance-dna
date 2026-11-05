'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ArticlesRail from '../articles/ArticlesRail';
import ArticlesIntroHero from '../articles/ArticlesIntroHero';
import AnchoredSelect from '@/components/design-system/AnchoredSelect';
import { articlesMenuItems } from '../articles/articlesMenu';
import { PerfumeImageWithFallback } from '@/components/design-system/PerfumeImageWithFallback';
import { useLanguage } from '@/lib/i18n';
import type { PublicFragrance } from '@/lib/database/publicFragrances';
import { getFragranceHref } from '@/lib/fragranceNavigation';
import FragranceRelationships from '@/components/FragranceRelationships';
import FragranceBadges from '@/components/FragranceBadges';
import FragranceBadgeFilters from '@/components/FragranceBadgeFilters';
import type { BadgeFilters } from '@/lib/fragranceBadges';
import { getDiscoveryCopy } from '@/lib/i18n/discoveryCopy';
import { isCueSeason, seasonalCueAccords } from '@/lib/seasonalCues';
import { getPerfumeImageCandidates } from '@/lib/design/perfumeImage';

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

const CATEGORY_OPTIONS = [
  { value: '', key: 'all' },
  { value: 'niche', key: 'niche' },
  { value: 'designer', key: 'designer' },
  { value: 'dupe', key: 'dupe' },
] as const;

const SEASON_OPTIONS = [
  { value: '', key: 'any' },
  { value: 'spring', key: 'spring' },
  { value: 'summer', key: 'summer' },
  { value: 'autumn', key: 'autumn' },
  { value: 'winter', key: 'winter' },
] as const;

const AUDIENCE_OPTIONS = [
  { value: '', key: 'any' },
  { value: 'women', key: 'women' },
  { value: 'men', key: 'men' },
  { value: 'unisex', key: 'unisex' },
] as const;

const ERA_OPTIONS = [
  { value: '', key: 'any' },
  { value: '2020s', key: '2020s' },
  { value: '2010s', key: '2010s' },
  { value: '2000s', key: '2000s' },
  { value: '1990s', key: '1990s' },
  { value: 'classics', key: 'classics' },
] as const;

const ACCORD_OPTIONS = [
  'woody', 'citrus', 'sweet', 'aromatic', 'warm spicy', 'floral', 'fresh spicy', 'amber',
  'musky', 'fruity', 'white floral', 'vanilla', 'fresh', 'green', 'rose', 'powdery',
  'earthy', 'balsamic', 'patchouli', 'leather', 'aquatic', 'lavender', 'iris', 'oud',
  'smoky', 'tropical', 'tobacco', 'marine', 'honey', 'caramel',
] as const;

function PerfumeImage({
  fragrance,
  className,
}: {
  fragrance: PublicFragrance;
  className?: string;
}) {
  return (
    <PerfumeImageWithFallback
      candidates={getPerfumeImageCandidates(fragrance)}
      alt={`${fragrance.brand} ${fragrance.perfume}`}
      className={className}
    />
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[rgba(var(--public-champagne-channels,156,120,65),0.25)] py-2.5">
      <dt className="shrink-0 font-articles-body text-[11px] uppercase tracking-[0.22em] text-[color:var(--public-ink-muted,#b7955f)]">{label}</dt>
      <dd className="text-right font-articles-body text-[0.98rem] text-[color:var(--public-ink-primary,#ecdcbb)]">{value}</dd>
    </div>
  );
}

function SeasonalEvidence({ fragrance, season }: { fragrance: PublicFragrance; season: string }) {
  const { locale, t } = useLanguage();
  if (!isCueSeason(season)) return null;
  const accords = seasonalCueAccords(fragrance.mainAccords, season);
  if (!accords.length) return null;
  const copy = getDiscoveryCopy(locale);
  return <p className="mt-3 text-sm text-[color:var(--public-ink-secondary,#dacfb7)]">
    {copy.seasonal} · {t.fragrances.seasonOptions[season]} — {copy.cueReason}: {accords.map((accord) => t.fragrances.accordLabels[accord] ?? accord).join(", ")}
  </p>;
}

function FragranceDetail({
  fragrance,
  onClose,
  season,
}: {
  fragrance: PublicFragrance;
  onClose: () => void;
  season: string;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const dnaEntries = fragrance.dnaAxes ? Object.entries(fragrance.dnaAxes) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${fragrance.brand} ${fragrance.perfume}`}
    >
      <div
        className="relative mt-6 w-full max-w-3xl rounded-[28px] border border-[rgba(var(--public-champagne-channels,159,123,68),0.55)] p-6 sm:p-8"
        style={{
          background:
            'radial-gradient(circle at 15% 10%, rgba(250,223,164,0.14), transparent 42%), linear-gradient(165deg, rgba(var(--public-surface-channels,20,15,10),0.98), rgba(var(--public-surface-channels,11,10,9),0.99))',
          boxShadow: 'var(--public-panel-shadow, 0 40px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(var(--public-champagne-channels,248,221,163),0.22))',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-[rgba(var(--public-champagne-channels,176,138,83),0.5)] px-3 py-1.5 font-articles-body text-xs uppercase tracking-[0.18em] text-[color:var(--public-ink-secondary,#d8bc83)] transition-colors hover:border-[color:var(--public-ink-secondary,#f3d293)] hover:text-[color:var(--public-ink-primary,#f4deb2)]"
        >
          {t.common.close}
        </button>

        <div className="grid gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[220px]">
            <div className="overflow-hidden rounded-2xl border border-[rgba(var(--public-champagne-channels,156,120,65),0.4)] bg-black/40 p-3">
              <PerfumeImage fragrance={fragrance} className="h-48 w-full object-contain" />
            </div>
          </div>

          <div className="min-w-0">
            <p className="font-articles-body text-xs uppercase tracking-[0.26em] text-[color:var(--public-ink-secondary,#d1b57d)]">{fragrance.brand}</p>
            <h2 className="mt-1 font-articles-heading text-[clamp(1.5rem,2.4vw,2.2rem)] leading-tight text-[color:var(--public-ink-primary,#f4deb2)]">
              <Link href={getFragranceHref(fragrance.id, fragrance.brand, fragrance.perfume)} className="underline underline-offset-4">{fragrance.perfume}</Link>
            </h2>

            <dl className="mt-4">
              <DetailRow label={t.fragrances.detail.launched} value={fragrance.launchYear} />
              <DetailRow label={t.fragrances.detail.perfumer} value={fragrance.perfumer} />
              <DetailRow label={t.fragrances.detail.audience} value={fragrance.gender ? capitalize(fragrance.gender) : undefined} />
              <DetailRow label={t.fragrances.detail.category} value={fragrance.brandType} />
            </dl>
            <FragranceBadges badges={fragrance.badges} />
            <SeasonalEvidence fragrance={fragrance} season={season} />
            <p className="mt-3 text-xs text-[color:var(--public-ink-secondary,#dacfb7)]">{t.fragrances.badges.note}</p>
            <FragranceRelationships relationships={fragrance.relationships} />
          </div>
        </div>

        {fragrance.mainAccords.length > 0 && (
          <div className="mt-6">
            <p className="font-articles-body text-[11px] uppercase tracking-[0.24em] text-[color:var(--public-ink-muted,#b7955f)]">{t.fragrances.detail.mainAccords}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {fragrance.mainAccords.map((accord) => (
                <span
                  key={accord}
                  className="rounded-full border border-[rgba(var(--public-champagne-channels,176,138,83),0.45)] bg-black/30 px-3 py-1 font-articles-body text-xs text-[color:var(--public-ink-primary,#e4d7bc)]"
                >
                  {t.fragrances.accordLabels[accord] ?? capitalize(accord)}
                </span>
              ))}
            </div>
          </div>
        )}

        {fragrance.description && (
          <div className="mt-6">
            <p className="font-articles-body text-[11px] uppercase tracking-[0.24em] text-[color:var(--public-ink-muted,#b7955f)]">{t.fragrances.detail.about}</p>
            <p className="mt-3 font-articles-body text-[0.98rem] leading-relaxed text-[color:var(--public-ink-primary,#e3d7be)]">
              {fragrance.description}
            </p>
          </div>
        )}

        {dnaEntries.length > 0 && (
          <div className="mt-6">
            <p className="font-articles-body text-[11px] uppercase tracking-[0.24em] text-[color:var(--public-ink-muted,#b7955f)]">{t.fragrances.detail.dnaProfile}</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {dnaEntries.map(([axis, value]) => (
                <div key={axis}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-articles-body text-xs text-[color:var(--public-ink-secondary,#dacfb7)]">{t.common.axes[axis] ?? axis}</span>
                    <span className="font-articles-body text-xs text-[color:var(--public-ink-muted,#caa46b)]">{Math.round(value)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/50">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, value))}%`,
                        background: 'linear-gradient(90deg, #8a6a3a, #f3d293)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FragranceLibraryClient({ initialQuery }: { initialQuery: string }) {
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [season, setSeason] = useState('');
  const [audience, setAudience] = useState('');
  const [accord, setAccord] = useState('');
  const [era, setEra] = useState('');
  const [badgeFilters, setBadgeFilters] = useState<BadgeFilters>({});
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [brandOptionsOpen, setBrandOptionsOpen] = useState(false);
  const [activeBrandIndex, setActiveBrandIndex] = useState(-1);
  const matchingBrands = brandOptions.filter((option) => option.toLocaleLowerCase(locale).includes(brand.trim().toLocaleLowerCase(locale)));
  const [results, setResults] = useState<PublicFragrance[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<PublicFragrance | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const hasActiveFilters = Boolean(category || brand || season || audience || accord || era || Object.values(badgeFilters).some(Boolean));

  const clearFilters = () => {
    setCategory('');
    setBrand('');
    setSeason('');
    setAudience('');
    setAccord('');
    setEra('');
    setBadgeFilters({});
  };

  // Brand suggestions follow the selected category.
  useEffect(() => {
    let active = true;
    void fetch(`/api/fragrances/brands${category ? `?type=${category}` : ''}`)
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as { brands?: string[] };
        if (active && response.ok) setBrandOptions(payload.brands ?? []);
      })
      .catch(() => {
        if (active) setBrandOptions([]);
      });
    return () => {
      active = false;
    };
  }, [category]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 && !hasActiveFilters) {
      requestIdRef.current++;
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError('');
    const requestId = ++requestIdRef.current;
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams({ limit: '36' });
      if (trimmed.length >= 2) params.set('q', trimmed);
      if (category) params.set('type', category);
      if (brand) params.set('brand', brand);
      if (season) params.set('season', season);
      if (audience) params.set('audience', audience);
      if (accord) params.set('accord', accord);
      if (era) params.set('era', era);
      for (const [family, code] of Object.entries(badgeFilters)) {
        if (code) params.set(family, code);
      }

      void fetch(`/api/fragrances/search?${params.toString()}`, { cache: 'no-store' })
        .then(async (response) => {
          const payload = (await response.json().catch(() => ({}))) as {
            results?: PublicFragrance[];
            error?: string;
          };
          if (requestId !== requestIdRef.current) return;
          if (!response.ok) {
            throw new Error(payload.error ?? t.fragrances.status.searchFailed);
          }
          setResults(payload.results ?? []);
          setHasSearched(true);
        })
        .catch((searchError: unknown) => {
          if (requestId !== requestIdRef.current) return;
          setResults([]);
          setHasSearched(true);
          setError(searchError instanceof Error ? searchError.message : t.fragrances.status.searchFailed);
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setIsSearching(false);
        });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query, category, brand, season, audience, accord, era, badgeFilters, hasActiveFilters]);

  return (
    <main className="relative pb-16 pt-8 lg:pt-10">
      <div className="relative z-10 mx-auto grid w-[90vw] max-w-[1600px] gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
        <aside className="articles-brand-rail-shell">
          <ArticlesRail>
            <p className="text-center font-articles-body text-[10px] uppercase tracking-[0.28em] text-[color:var(--public-ink-secondary,#d5b97f)]">{t.articles.menu.passionMenu}</p>
            <nav aria-label={t.articles.menu.passionMenu} className="mt-6 flex flex-col gap-3">
              {articlesMenuItems.map((item) => {
                const entry = t.articles.menu.items[item.key];
                const active = item.href === '/fragrances';
                return (
                  <Link key={item.key} href={item.href} aria-current={active ? 'page' : undefined} data-active={String(active)} className="articles-rail-button">
                    <span>{entry.label}</span>
                  </Link>
                );
              })}
            </nav>
          </ArticlesRail>
        </aside>
        <div className="articles-content-column min-w-0">
      <section className="relative z-10 w-full">
        <ArticlesIntroHero imageSrc="/fragrances-library-pop-art.png" />
      </section>

      <section className="relative z-10 mt-4 w-full space-y-6">
        <section
          className="relative z-10 w-full rounded-[30px] border border-[rgba(var(--public-champagne-channels,159,123,68),0.45)] p-6 sm:p-8"
          style={{
            background:
              'linear-gradient(170deg, rgba(var(--public-surface-channels,18,14,11),0.96) 0%, rgba(var(--public-surface-channels,12,10,9),0.98) 60%), radial-gradient(circle at 85% 8%, rgba(164,118,64,0.25), transparent 36%)',
            boxShadow: 'var(--public-panel-shadow, 0 30px 58px rgba(0,0,0,0.52), inset 0 1px 0 rgba(var(--public-champagne-channels,244,220,165),0.18))',
          }}
        >
          <label htmlFor="fragrance-search" className="font-articles-body text-xs uppercase tracking-[0.28em] text-[color:var(--public-ink-secondary,#d1b57d)]">
            {t.fragrances.search.label}
          </label>
          <input
            id="fragrance-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.fragrances.search.placeholder}
            autoComplete="off"
            className="mt-3 w-full rounded-2xl border border-[rgba(var(--public-champagne-channels,156,120,65),0.45)] bg-black/40 px-5 py-4 font-articles-body text-[1.02rem] text-[color:var(--public-ink-primary,#f1e3c4)] placeholder-[#8a7450] transition-all duration-300 focus:border-[rgba(var(--public-champagne-channels,243,210,147),0.8)] focus:bg-black/55 focus:outline-none focus:ring-2 focus:ring-[rgba(var(--public-champagne-channels,243,210,147),0.2)]"
          />

          <div className="mt-5 border-t border-[rgba(var(--public-champagne-channels,156,120,65),0.25)] pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-articles-body text-[11px] uppercase tracking-[0.24em] text-[color:var(--public-ink-muted,#b7955f)]">{t.fragrances.search.category}</span>
              {CATEGORY_OPTIONS.map((option) => {
                const isActive = category === option.value;
                return (
                  <button
                    key={option.value || 'all'}
                    type="button"
                    onClick={() => {
                      setCategory(option.value);
                      setBrand('');
                    }}
                    className="rounded-full border px-4 py-1.5 font-articles-body text-xs uppercase tracking-[0.14em] transition-all duration-300"
                    style={{
                      borderColor: isActive ? 'rgba(var(--public-champagne-channels,243,210,147),0.9)' : 'rgba(var(--public-champagne-channels,156,120,65),0.45)',
                      color: isActive ? 'var(--public-ink-primary,#f4deb2)' : 'var(--public-ink-muted,#b7955f)',
                      background: isActive ? 'rgba(var(--public-surface-channels,45,33,18),0.85)' : 'rgba(var(--public-surface-channels,0,0,0),0.3)',
                    }}
                  >
                    {t.fragrances.categoryOptions[option.key]}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <div className="relative xl:col-span-2">
                <label htmlFor="filter-brand" className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[color:var(--public-ink-muted,#b7955f)]">
                  {t.fragrances.search.brand}
                </label>
                <input
                  id="filter-brand"
                  type="text"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={brandOptionsOpen && matchingBrands.length > 0}
                  aria-controls="fragrance-brand-options"
                  aria-activedescendant={brandOptionsOpen && activeBrandIndex >= 0 && activeBrandIndex < matchingBrands.length ? `fragrance-brand-option-${activeBrandIndex}` : undefined}
                  value={brand}
                  onFocus={() => { setBrandOptionsOpen(true); setActiveBrandIndex(-1); }}
                  onBlur={() => { setBrandOptionsOpen(false); setActiveBrandIndex(-1); }}
                  onChange={(event) => { setBrand(event.target.value); setBrandOptionsOpen(true); setActiveBrandIndex(-1); }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setBrandOptionsOpen(false);
                      setActiveBrandIndex(-1);
                    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                      event.preventDefault();
                      setBrandOptionsOpen(true);
                      const next = matchingBrands.length === 0 ? -1 : event.key === 'ArrowDown'
                        ? Math.min(activeBrandIndex + 1, matchingBrands.length - 1)
                        : Math.max(activeBrandIndex - 1, 0);
                      setActiveBrandIndex(next);
                      if (next >= 0) document.getElementById(`fragrance-brand-option-${next}`)?.scrollIntoView({ block: 'nearest' });
                    } else if (event.key === 'Enter' && brandOptionsOpen && matchingBrands[activeBrandIndex]) {
                      event.preventDefault();
                      setBrand(matchingBrands[activeBrandIndex]);
                      setBrandOptionsOpen(false);
                      setActiveBrandIndex(-1);
                    }
                  }}
                  placeholder={t.fragrances.search.brandPlaceholder}
                  autoComplete="off"
                  className="mt-1.5 w-full rounded-xl border border-[rgba(var(--public-champagne-channels,156,120,65),0.45)] bg-black/40 px-3 py-2.5 font-articles-body text-sm text-[color:var(--public-ink-primary,#f1e3c4)] placeholder-[#8a7450] focus:border-[rgba(var(--public-champagne-channels,243,210,147),0.8)] focus:outline-none"
                />
                {brandOptionsOpen && matchingBrands.length > 0 && (
                  <ul id="fragrance-brand-options" role="listbox" aria-label={t.fragrances.search.brand}
                    className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-[rgba(var(--public-champagne-channels,156,120,65),0.65)] bg-[rgb(var(--public-surface-channels,21,18,13))] p-1 shadow-xl">
                    {matchingBrands.map((brandOption, index) => (
                      <li key={brandOption} id={`fragrance-brand-option-${index}`} role="option"
                        aria-selected={brandOption === brand}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => { setBrand(brandOption); setBrandOptionsOpen(false); setActiveBrandIndex(-1); }}
                        className={`cursor-pointer rounded-lg px-3 py-2 text-sm text-[color:var(--public-ink-primary,#f1e3c4)] hover:bg-white/10 ${activeBrandIndex === index ? 'bg-white/10' : ''}`}>
                        {brandOption}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label htmlFor="filter-season" className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[color:var(--public-ink-muted,#b7955f)]">
                  {t.fragrances.search.season}
                </label>
                <AnchoredSelect id="filter-season" label={t.fragrances.search.season} value={season} onChange={setSeason} className="mt-1.5"
                  options={SEASON_OPTIONS.map((option) => ({ value: option.value, label: t.fragrances.seasonOptions[option.key] }))} />
              </div>

              <div>
                <label htmlFor="filter-audience" className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[color:var(--public-ink-muted,#b7955f)]">
                  {t.fragrances.search.audience}
                </label>
                <AnchoredSelect id="filter-audience" label={t.fragrances.search.audience} value={audience} onChange={setAudience} className="mt-1.5"
                  options={AUDIENCE_OPTIONS.map((option) => ({ value: option.value, label: t.fragrances.audienceOptions[option.key] }))} />
              </div>

              <div>
                <label htmlFor="filter-accord" className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[color:var(--public-ink-muted,#b7955f)]">
                  {t.fragrances.search.accord}
                </label>
                <AnchoredSelect id="filter-accord" label={t.fragrances.search.accord} value={accord} onChange={setAccord} className="mt-1.5"
                  options={[{ value: '', label: t.fragrances.search.anyAccord }, ...ACCORD_OPTIONS.map((option) => ({ value: option, label: t.fragrances.accordLabels[option] ?? capitalize(option) }))]} />
              </div>

              <div>
                <label htmlFor="filter-era" className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[color:var(--public-ink-muted,#b7955f)]">
                  {t.fragrances.search.era}
                </label>
                <AnchoredSelect id="filter-era" label={t.fragrances.search.era} value={era} onChange={setEra} className="mt-1.5"
                  options={ERA_OPTIONS.map((option) => ({ value: option.value, label: t.fragrances.eraOptions[option.key] }))} />
              </div>

            </div>
            <div className="mt-4"><FragranceBadgeFilters filters={badgeFilters} onChange={setBadgeFilters} anchored /></div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-full border border-[rgba(var(--public-champagne-channels,176,138,83),0.5)] px-4 py-1.5 font-articles-body text-xs uppercase tracking-[0.18em] text-[color:var(--public-ink-secondary,#d8bc83)] transition-colors hover:border-[color:var(--public-ink-secondary,#f3d293)] hover:text-[color:var(--public-ink-primary,#f4deb2)]"
              >
                {t.fragrances.search.clearFilters}
              </button>
            )}
          </div>

          <div className="mt-4 min-h-[1.5rem]">
            {error && <p className="font-articles-body text-sm text-red-400">{error}</p>}
            {!error && isSearching && (
              <p className="font-articles-body text-sm text-[color:var(--public-ink-muted,#b7955f)]">{t.fragrances.status.searching}</p>
            )}
            {!error && !isSearching && hasSearched && (
              <p className="font-articles-body text-sm text-[color:var(--public-ink-muted,#b7955f)]">
                {results.length === 0
                  ? t.fragrances.status.noMatches
                  : t.fragrances.status.found(results.length)}
              </p>
            )}
          </div>
        </section>

        {results.length > 0 && (
          <section aria-label={season ? getDiscoveryCopy(locale).seasonal : t.fragrances.hero.title} className="relative z-10 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {season && <h2 className="col-span-full text-xl">{getDiscoveryCopy(locale).seasonal}</h2>}
            {results.map((fragrance) => (
              <article
                key={fragrance.id}
                className="group rounded-3xl border border-[rgba(var(--public-champagne-channels,168,129,70),0.45)] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(var(--public-champagne-channels,243,210,147),0.9)]"
                style={{
                  background: 'linear-gradient(160deg, rgba(var(--public-surface-channels,19,16,14),0.88), rgba(var(--public-surface-channels,12,12,12),0.92))',
                  boxShadow: 'var(--public-panel-shadow, 0 10px 20px rgba(0,0,0,0.32), inset 0 1px 0 rgba(var(--public-champagne-channels,255,228,173),0.1))',
                }}
              >
                <Link href={getFragranceHref(fragrance.id, fragrance.brand, fragrance.perfume)} className="block overflow-hidden rounded-2xl border border-[rgba(var(--public-champagne-channels,156,120,65),0.3)] bg-black/40 p-3">
                  <PerfumeImage
                    key={fragrance.id}
                    fragrance={fragrance}
                    className="h-36 w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </Link>
                <p className="mt-4 font-articles-body text-[11px] uppercase tracking-[0.22em] text-[color:var(--public-ink-secondary,#d4b67a)]">
                  <Link href={getFragranceHref(fragrance.id, fragrance.brand, fragrance.perfume)}>{fragrance.brand}</Link>
                </p>
                <h3 className="mt-1 font-articles-heading text-[1.25rem] leading-tight text-[color:var(--public-ink-primary,#f5dfb4)]">
                  <Link href={getFragranceHref(fragrance.id, fragrance.brand, fragrance.perfume)} className="underline underline-offset-4">{fragrance.perfume}</Link>
                </h3>
                <p className="mt-2 font-articles-body text-xs uppercase tracking-[0.18em] text-[color:var(--public-ink-muted,#b7955f)]">
                  {[
                    fragrance.launchYear,
                    fragrance.brandType,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <FragranceBadges badges={fragrance.badges} />
                <SeasonalEvidence fragrance={fragrance} season={season} />
                <button type="button" onClick={() => setSelected(fragrance)} className="mt-3 text-xs underline underline-offset-4">{t.fragrances.detail.about}</button>
              </article>
            ))}
          </section>
        )}
      </section>

        </div>
      </div>
      {selected && <FragranceDetail fragrance={selected} season={season} onClose={() => setSelected(null)} />}
    </main>
  );
}
