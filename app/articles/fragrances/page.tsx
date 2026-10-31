'use client';

import Link from 'next/link';
import ArticlesRail from '../ArticlesRail';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { articlesMenuItems } from '../articlesMenu';
import { PERFUME_FALLBACK_IMAGE_SRC } from '@/lib/design/perfumeImage';
import type { PublicFragrance } from '@/app/api/fragrances/search/route';

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

function PerfumeImage({
  fragrance,
  className,
}: {
  fragrance: PublicFragrance;
  className?: string;
}) {
  const sources = [fragrance.localImagePath, fragrance.imageUrl].filter(
    (source): source is string => Boolean(source),
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const src = sources[sourceIndex] ?? PERFUME_FALLBACK_IMAGE_SRC;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${fragrance.brand} ${fragrance.perfume}`}
      className={className}
      loading="lazy"
      onError={() => setSourceIndex((index) => index + 1)}
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
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicFragrance[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<PublicFragrance | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError('');
    const requestId = ++requestIdRef.current;
    const timeout = window.setTimeout(() => {
      void fetch(`/api/fragrances/search?q=${encodeURIComponent(trimmed)}&limit=30`, { cache: 'no-store' })
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
  }, [query]);

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

      <section className="relative z-10 mx-auto mt-4 grid w-[90vw] max-w-[1600px] gap-4 lg:grid-cols-3">
        <div className="w-full lg:col-span-3">
          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
            <aside className="articles-brand-rail-shell">
              <ArticlesRail>
                <div className="articles-rail-dynamic-mist" aria-hidden="true" />

                <div>
                  <p className="font-articles-body text-center text-[10px] uppercase tracking-[0.28em] text-[#d5b97f]">Passion Menu</p>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  {articlesMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-active={isActive ? 'true' : 'false'}
                        className="articles-rail-button w-full rounded-2xl border px-4 py-4 text-left transition-all duration-300"
                      >
                        <p className="font-articles-heading text-[1.12rem] leading-tight text-[#f4ddb2]">{item.label}</p>
                        <p className="mt-2 font-articles-body text-[10px] uppercase tracking-[0.2em] text-[#bb9660]">{item.hint}</p>
                      </Link>
                    );
                  })}
                </div>
              </ArticlesRail>
            </aside>

            <div className="articles-content-column space-y-6">
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
                      Type at least two characters to search across brands and perfumes.
                    </p>
                  )}
                </div>
              </section>

              {results.length > 0 && (
                <section className="relative z-10 grid w-full gap-4 sm:grid-cols-2 2xl:grid-cols-3">
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
            </div>
          </div>
        </div>
      </section>

      {selected && <FragranceDetail fragrance={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
