'use client';

import { useEffect, useRef, useState } from 'react';
import { PerfumeImageWithFallback } from '@/components/design-system/PerfumeImageWithFallback';
import type { PublicFragrance } from '@/app/api/fragrances/search/route';

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

const CATEGORY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'niche', label: 'Niche' },
  { value: 'designer', label: 'Designer' },
  { value: 'dupe', label: 'Dupe · Middle Eastern' },
] as const;

const SEASON_OPTIONS = [
  { value: '', label: 'Any season' },
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'winter', label: 'Winter' },
] as const;

const AUDIENCE_OPTIONS = [
  { value: '', label: 'Anyone' },
  { value: 'women', label: 'For women' },
  { value: 'men', label: 'For men' },
  { value: 'unisex', label: 'Unisex' },
] as const;

const ERA_OPTIONS = [
  { value: '', label: 'Any era' },
  { value: '2020s', label: '2020s' },
  { value: '2010s', label: '2010s' },
  { value: '2000s', label: '2000s' },
  { value: '1990s', label: '1990s' },
  { value: 'classics', label: 'Classics (pre-1990)' },
] as const;

const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '4.5', label: '4.5+' },
  { value: '4', label: '4.0+' },
  { value: '3.5', label: '3.5+' },
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
      candidates={[fragrance.localImagePath, fragrance.imageUrl]}
      alt={`${fragrance.brand} ${fragrance.perfume}`}
      className={className}
    />
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#9c7841]/25 py-2.5">
      <dt className="shrink-0 font-articles-body text-[11px] uppercase tracking-[0.22em] text-[#b7955f]">{label}</dt>
      <dd className="text-right font-articles-body text-[0.98rem] text-[#ecdcbb]">{value}</dd>
    </div>
  );
}

function FragranceDetail({
  fragrance,
  onClose,
}: {
  fragrance: PublicFragrance;
  onClose: () => void;
}) {
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
        className="relative mt-6 w-full max-w-3xl rounded-[28px] border border-[#9f7b44]/55 p-6 sm:p-8"
        style={{
          background:
            'radial-gradient(circle at 15% 10%, rgba(250,223,164,0.14), transparent 42%), linear-gradient(165deg, rgba(20,15,10,0.98), rgba(11,10,9,0.99))',
          boxShadow: '0 40px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(248,221,163,0.22)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-[#b08a53]/50 px-3 py-1.5 font-articles-body text-xs uppercase tracking-[0.18em] text-[#d8bc83] transition-colors hover:border-[#f3d293] hover:text-[#f4deb2]"
        >
          Close
        </button>

        <div className="grid gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[220px]">
            <div className="overflow-hidden rounded-2xl border border-[#9c7841]/40 bg-black/40 p-3">
              <PerfumeImage fragrance={fragrance} className="h-48 w-full object-contain" />
            </div>
          </div>

          <div className="min-w-0">
            <p className="font-articles-body text-xs uppercase tracking-[0.26em] text-[#d1b57d]">{fragrance.brand}</p>
            <h2 className="mt-1 font-articles-heading text-[clamp(1.5rem,2.4vw,2.2rem)] leading-tight text-[#f4deb2]">
              {fragrance.perfume}
            </h2>

            <dl className="mt-4">
              <DetailRow label="Launched" value={fragrance.launchYear} />
              <DetailRow label="Perfumer" value={fragrance.perfumer} />
              <DetailRow label="Audience" value={fragrance.gender ? capitalize(fragrance.gender) : undefined} />
              <DetailRow label="Category" value={fragrance.brandType} />
              <DetailRow
                label="Community rating"
                value={
                  fragrance.rating
                    ? `${fragrance.rating} / 5${fragrance.voteCount ? ` · ${fragrance.voteCount} votes` : ''}`
                    : undefined
                }
              />
            </dl>
          </div>
        </div>

        {fragrance.mainAccords.length > 0 && (
          <div className="mt-6">
            <p className="font-articles-body text-[11px] uppercase tracking-[0.24em] text-[#b7955f]">Main accords</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {fragrance.mainAccords.map((accord) => (
                <span
                  key={accord}
                  className="rounded-full border border-[#b08a53]/45 bg-black/30 px-3 py-1 font-articles-body text-xs text-[#e4d7bc]"
                >
                  {capitalize(accord)}
                </span>
              ))}
            </div>
          </div>
        )}

        {fragrance.description && (
          <div className="mt-6">
            <p className="font-articles-body text-[11px] uppercase tracking-[0.24em] text-[#b7955f]">About this fragrance</p>
            <p className="mt-3 font-articles-body text-[0.98rem] leading-relaxed text-[#e3d7be]">
              {fragrance.description}
            </p>
          </div>
        )}

        {dnaEntries.length > 0 && (
          <div className="mt-6">
            <p className="font-articles-body text-[11px] uppercase tracking-[0.24em] text-[#b7955f]">FragranceDNA profile</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {dnaEntries.map(([axis, value]) => (
                <div key={axis}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-articles-body text-xs text-[#dacfb7]">{axis}</span>
                    <span className="font-articles-body text-xs text-[#caa46b]">{Math.round(value)}</span>
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

export default function FragranceLibraryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [season, setSeason] = useState('');
  const [audience, setAudience] = useState('');
  const [accord, setAccord] = useState('');
  const [era, setEra] = useState('');
  const [minRating, setMinRating] = useState('');
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [results, setResults] = useState<PublicFragrance[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<PublicFragrance | null>(null);
  const requestIdRef = useRef(0);

  const hasActiveFilters = Boolean(category || brand || season || audience || accord || era || minRating);

  const clearFilters = () => {
    setCategory('');
    setBrand('');
    setSeason('');
    setAudience('');
    setAccord('');
    setEra('');
    setMinRating('');
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
      if (minRating) params.set('minRating', minRating);

      void fetch(`/api/fragrances/search?${params.toString()}`, { cache: 'no-store' })
        .then(async (response) => {
          const payload = (await response.json().catch(() => ({}))) as {
            results?: PublicFragrance[];
            error?: string;
          };
          if (requestId !== requestIdRef.current) return;
          if (!response.ok) {
            throw new Error(payload.error ?? 'Search failed. Please try again.');
          }
          setResults(payload.results ?? []);
          setHasSearched(true);
        })
        .catch((searchError: unknown) => {
          if (requestId !== requestIdRef.current) return;
          setResults([]);
          setHasSearched(true);
          setError(searchError instanceof Error ? searchError.message : 'Search failed. Please try again.');
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setIsSearching(false);
        });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query, category, brand, season, audience, accord, era, minRating, hasActiveFilters]);

  return (
    <main className="relative pb-16 pt-8 lg:pt-10">
      <section className="relative z-10 mx-auto w-[90vw] max-w-[1280px]">
        <div
          className="rounded-[28px] border border-[#9f7b44]/45 p-6 sm:p-8 lg:p-10"
          style={{
            background:
              'radial-gradient(circle at 12% 12%, rgba(250,223,164,0.17), transparent 40%), radial-gradient(circle at 84% 30%, rgba(176,118,48,0.22), transparent 42%), linear-gradient(135deg, rgba(11,11,11,0.93), rgba(22,16,11,0.9))',
            boxShadow: '0 30px 58px rgba(0,0,0,0.55), inset 0 1px 0 rgba(248,221,163,0.2)',
          }}
        >
          <p className="font-articles-body text-xs uppercase tracking-[0.28em] text-[#d8bc83]/85">Fragrance Library</p>
          <h1 className="mt-3 font-articles-heading text-[clamp(1.75rem,3.1vw,3.2rem)] leading-[1.08] text-[#f4deb2]">
            Explore the Fragrance Library
          </h1>
          <p className="mt-4 max-w-[70ch] font-articles-body text-[1.01rem] leading-relaxed text-[#e4d8bf]">
            Search our master database of more than 68,000 fragrances. Open any result to see everything we
            know about it: accords, perfumer, launch year, community rating, and more.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-4 w-[90vw] max-w-[1280px] space-y-6">
        <section
          className="relative z-10 w-full rounded-[30px] border border-[#9f7b44]/45 p-6 sm:p-8"
          style={{
            background:
              'linear-gradient(170deg, rgba(18,14,11,0.96) 0%, rgba(12,10,9,0.98) 60%), radial-gradient(circle at 85% 8%, rgba(164,118,64,0.25), transparent 36%)',
            boxShadow: '0 30px 58px rgba(0,0,0,0.52), inset 0 1px 0 rgba(244,220,165,0.18)',
          }}
        >
          <label htmlFor="fragrance-search" className="font-articles-body text-xs uppercase tracking-[0.28em] text-[#d1b57d]">
            Search the library
          </label>
          <input
            id="fragrance-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try a perfume or brand name, e.g. Sauvage, Creed, Baccarat Rouge..."
            autoComplete="off"
            className="mt-3 w-full rounded-2xl border border-[#9c7841]/45 bg-black/40 px-5 py-4 font-articles-body text-[1.02rem] text-[#f1e3c4] placeholder-[#8a7450] transition-all duration-300 focus:border-[#f3d293]/80 focus:bg-black/55 focus:outline-none focus:ring-2 focus:ring-[#f3d293]/20"
          />

          <div className="mt-5 border-t border-[#9c7841]/25 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-articles-body text-[11px] uppercase tracking-[0.24em] text-[#b7955f]">Category</span>
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
                      borderColor: isActive ? 'rgba(243, 210, 147, 0.9)' : 'rgba(156, 120, 65, 0.45)',
                      color: isActive ? '#f4deb2' : '#b7955f',
                      background: isActive ? 'rgba(45, 33, 18, 0.85)' : 'rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <div className="xl:col-span-2">
                <label htmlFor="filter-brand" className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[#b7955f]">
                  Brand
                </label>
                <input
                  id="filter-brand"
                  type="text"
                  list="fragrance-brand-options"
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  placeholder="Any brand"
                  autoComplete="off"
                  className="mt-1.5 w-full rounded-xl border border-[#9c7841]/45 bg-black/40 px-3 py-2.5 font-articles-body text-sm text-[#f1e3c4] placeholder-[#8a7450] focus:border-[#f3d293]/80 focus:outline-none"
                />
                <datalist id="fragrance-brand-options">
                  {brandOptions.map((brandOption) => (
                    <option key={brandOption} value={brandOption} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="filter-season" className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[#b7955f]">
                  Season
                </label>
                <select
                  id="filter-season"
                  value={season}
                  onChange={(event) => setSeason(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#9c7841]/45 bg-black/40 px-3 py-2.5 font-articles-body text-sm text-[#f1e3c4] focus:border-[#f3d293]/80 focus:outline-none"
                >
                  {SEASON_OPTIONS.map((option) => (
                    <option key={option.value || 'any'} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-audience" className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[#b7955f]">
                  Audience
                </label>
                <select
                  id="filter-audience"
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#9c7841]/45 bg-black/40 px-3 py-2.5 font-articles-body text-sm text-[#f1e3c4] focus:border-[#f3d293]/80 focus:outline-none"
                >
                  {AUDIENCE_OPTIONS.map((option) => (
                    <option key={option.value || 'any'} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-accord" className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[#b7955f]">
                  Accord
                </label>
                <select
                  id="filter-accord"
                  value={accord}
                  onChange={(event) => setAccord(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#9c7841]/45 bg-black/40 px-3 py-2.5 font-articles-body text-sm text-[#f1e3c4] focus:border-[#f3d293]/80 focus:outline-none"
                >
                  <option value="">Any accord</option>
                  {ACCORD_OPTIONS.map((accordOption) => (
                    <option key={accordOption} value={accordOption}>{capitalize(accordOption)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-era" className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[#b7955f]">
                  Era
                </label>
                <select
                  id="filter-era"
                  value={era}
                  onChange={(event) => setEra(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#9c7841]/45 bg-black/40 px-3 py-2.5 font-articles-body text-sm text-[#f1e3c4] focus:border-[#f3d293]/80 focus:outline-none"
                >
                  {ERA_OPTIONS.map((option) => (
                    <option key={option.value || 'any'} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-rating" className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[#b7955f]">
                  Min rating
                </label>
                <select
                  id="filter-rating"
                  value={minRating}
                  onChange={(event) => setMinRating(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#9c7841]/45 bg-black/40 px-3 py-2.5 font-articles-body text-sm text-[#f1e3c4] focus:border-[#f3d293]/80 focus:outline-none"
                >
                  {RATING_OPTIONS.map((option) => (
                    <option key={option.value || 'any'} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-full border border-[#b08a53]/50 px-4 py-1.5 font-articles-body text-xs uppercase tracking-[0.18em] text-[#d8bc83] transition-colors hover:border-[#f3d293] hover:text-[#f4deb2]"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-4 min-h-[1.5rem]">
            {error && <p className="font-articles-body text-sm text-red-400">{error}</p>}
            {!error && isSearching && (
              <p className="font-articles-body text-sm text-[#b7955f]">Searching the library...</p>
            )}
            {!error && !isSearching && hasSearched && (
              <p className="font-articles-body text-sm text-[#b7955f]">
                {results.length === 0
                  ? 'No fragrances matched your search. Try a shorter or different name.'
                  : `${results.length} fragrance${results.length === 1 ? '' : 's'} found. Select one for the full profile.`}
              </p>
            )}
            {!error && !isSearching && !hasSearched && (
              <p className="font-articles-body text-sm text-[#8a7450]">
                Type at least two characters, or pick any filter to browse the library.
              </p>
            )}
          </div>
        </section>

        {results.length > 0 && (
          <section className="relative z-10 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {results.map((fragrance) => (
              <button
                key={fragrance.id}
                type="button"
                onClick={() => setSelected(fragrance)}
                className="group rounded-3xl border border-[#a88146]/45 p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f3d293]/90"
                style={{
                  background: 'linear-gradient(160deg, rgba(19,16,14,0.88), rgba(12,12,12,0.92))',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,228,173,0.1)',
                }}
              >
                <div className="overflow-hidden rounded-2xl border border-[#9c7841]/30 bg-black/40 p-3">
                  <PerfumeImage
                    key={fragrance.id}
                    fragrance={fragrance}
                    className="h-36 w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-4 font-articles-body text-[11px] uppercase tracking-[0.22em] text-[#d4b67a]">
                  {fragrance.brand}
                </p>
                <h3 className="mt-1 font-articles-heading text-[1.25rem] leading-tight text-[#f5dfb4]">
                  {fragrance.perfume}
                </h3>
                <p className="mt-2 font-articles-body text-xs uppercase tracking-[0.18em] text-[#b7955f]">
                  {[
                    fragrance.launchYear,
                    fragrance.rating ? `★ ${fragrance.rating}` : undefined,
                    fragrance.brandType,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </button>
            ))}
          </section>
        )}
      </section>

      {selected && <FragranceDetail fragrance={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
