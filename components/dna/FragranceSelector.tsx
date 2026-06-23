'use client';

import { useMemo, useState } from 'react';
import type { Fragrance } from '@/lib/types';

type FragranceSelectorProps = {
  fragrances: Fragrance[];
  selectedIds: string[];
  onToggle: (fragranceId: string) => void;
};

type FragranceImageProps = {
  fragrance: Fragrance;
};

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0%" stop-color="%23101218"/><stop offset="100%" stop-color="%23212634"/></linearGradient></defs><rect width="140" height="140" rx="20" fill="url(%23g)"/><circle cx="70" cy="48" r="16" fill="%23cda35f" fill-opacity="0.9"/><rect x="40" y="66" width="60" height="42" rx="10" fill="%23d6bc8b" fill-opacity="0.88"/><text x="70" y="124" font-size="11" text-anchor="middle" fill="%23cdb48a" font-family="serif">Fragrance</text></svg>';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function imageCandidates(fragrance: Fragrance): string[] {
  const baseCandidates = [fragrance.id, fragrance.name]
    .filter((value): value is string => Boolean(value))
    .map((value) => slugify(value));

  const generated = baseCandidates.map((base) => `/Scents/${base}.png`);

  return [...generated, PLACEHOLDER_IMAGE];
}

function FragranceImage({ fragrance }: FragranceImageProps) {
  const sources = useMemo(() => imageCandidates(fragrance), [fragrance]);
  const [sourceIndex, setSourceIndex] = useState(0);

  const currentSource = sources[Math.min(sourceIndex, sources.length - 1)];

  return (
    <img
      src={currentSource}
      alt={fragrance.name}
      className="h-14 w-14 rounded-xl border border-white/10 object-cover"
      loading="lazy"
      onError={() => {
        setSourceIndex((previous) => Math.min(previous + 1, sources.length - 1));
      }}
    />
  );
}

export default function FragranceSelector({
  fragrances,
  selectedIds,
  onToggle,
}: FragranceSelectorProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return fragrances;
    }

    return fragrances.filter((fragrance) => {
      const searchableText = `${fragrance.brand ?? ''} ${fragrance.name}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [fragrances, query]);

  return (
    <aside className="glass-card p-5 md:p-6">
      <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">SELECT FRAGRANCES</p>

      <label className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-[rgba(7,8,11,0.6)] px-4 py-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="rgba(212,175,120,0.75)" strokeWidth="1.5" />
          <path d="M20 20L17 17" stroke="rgba(212,175,120,0.75)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for fragrances..."
          className="w-full bg-transparent text-sm text-[rgba(225,212,186,0.95)] outline-none placeholder:text-[rgba(180,162,134,0.65)]"
        />
      </label>

      <div className="mt-4 max-h-[500px] space-y-3 overflow-y-auto pr-1">
        {filtered.map((fragrance) => {
          const fragranceId = fragrance.id || fragrance.name;
          const isSelected = selectedIds.includes(fragranceId);

          return (
            <article
              key={fragranceId}
              className="flex items-center gap-3 rounded-2xl border border-[rgba(212,175,120,0.14)] bg-[rgba(11,13,18,0.78)] p-3"
            >
              <FragranceImage fragrance={fragrance} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs uppercase tracking-[0.18em] text-[rgba(165,185,150,0.75)]">
                  {fragrance.brand ?? 'Independent'}
                </p>
                <p className="truncate text-base text-[rgba(232,217,191,0.96)]">{fragrance.name}</p>
              </div>

              <button
                type="button"
                onClick={() => onToggle(fragranceId)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                  isSelected
                    ? 'bg-[rgba(212,175,120,0.9)] text-black'
                    : 'border border-[rgba(212,175,120,0.4)] text-[rgba(219,196,158,0.95)] hover:bg-[rgba(212,175,120,0.14)]'
                }`}
              >
                {isSelected ? 'Selected' : 'Select'}
              </button>
            </article>
          );
        })}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[rgba(190,170,140,0.75)]">
            No fragrances match this search.
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-[rgba(212,175,120,0.14)] bg-[rgba(8,9,13,0.72)] px-4 py-3 text-sm text-[rgba(214,188,136,0.88)]">
        <span>{selectedIds.length} selected</span>
        <span className="text-[rgba(190,170,140,0.72)]">Browse all fragrances</span>
      </div>
    </aside>
  );
}
