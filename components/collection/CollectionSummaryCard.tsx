'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { buildCollectionSummary } from '@/lib/collection';
import { loadCollection, subscribeToCollection } from '@/lib/collection/storage';

const EMPTY_LABEL = '—';

export default function CollectionSummaryCard() {
  const collection = useSyncExternalStore(subscribeToCollection, loadCollection, () => []);
  const summary = buildCollectionSummary(collection);
  const isEmpty = summary.size === 0;

  return (
    <article className="glass-card relative overflow-hidden p-10 transition duration-300 hover:-translate-y-1 hover:shadow-glass-soft">
      <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none bg-[radial-gradient(circle_at_18%_18%,rgba(212,175,120,0.14),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(165,185,150,0.08),transparent_22%)]" />
      <div className="relative space-y-6">
        <div className="space-y-3 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">My Collection</p>
          <h2 className="text-4xl font-semibold text-[rgba(212,175,120,0.95)]">Track the fragrances you own.</h2>
          <p className="text-base leading-7 text-[rgba(190,170,140,0.65)]">
            Track the fragrances you own and understand the olfactory landscape you&apos;ve already built.
          </p>
        </div>

        {isEmpty ? (
          <div className="flex flex-col gap-6 rounded-[28px] border border-[rgba(212,175,120,0.12)] bg-black/20 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <p className="text-2xl font-light text-[rgba(212,175,120,0.95)]">Your collection starts here.</p>
              <p className="max-w-2xl text-sm leading-7 text-[rgba(190,170,140,0.65)]">
                Add the fragrances you already own to unlock collection-level insights and future recommendation features.
              </p>
            </div>
            <Link
              href="/collection"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(212,175,120,0.94),rgba(186,153,110,0.9))] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#121212] shadow-[0_20px_70px_rgba(212,175,120,0.18)] transition duration-300 hover:brightness-110"
            >
              Add First Fragrance
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Collection Size" value={`${summary.size} fragrances`} />
            <MetricCard label="Average Personal Rating" value={summary.averageRating != null ? `${summary.averageRating.toFixed(1)}` : EMPTY_LABEL} />
            <MetricCard label="Top Brand" value={summary.topBrand ?? EMPTY_LABEL} />
            <MetricCard label="Collection Diversity" value={summary.diversity ?? EMPTY_LABEL} />
            <MetricCard label="DNA Coverage" value={summary.dnaCoverage != null ? `${summary.dnaCoverage}%` : EMPTY_LABEL} />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm uppercase tracking-[0.24em] text-[rgba(165,185,150,0.68)]">
            Collection is a first-class domain for future DNA, gap, redundancy, and recommendation systems.
          </p>
          <Link
            href="/collection"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(212,175,120,0.18)] bg-white/5 px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[rgba(212,175,120,0.92)] transition duration-300 hover:bg-white/10"
          >
            Manage Collection
          </Link>
        </div>
      </div>
    </article>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[rgba(212,175,120,0.12)] bg-[rgba(7,8,12,0.75)] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">{label}</p>
      <p className="mt-3 text-lg font-light text-[rgba(242,229,199,0.95)]">{value}</p>
    </div>
  );
}
