'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { buildCollectionSummary } from '@/lib/collection';
import { EMPTY_COLLECTION, loadCollection, subscribeToCollection } from '@/lib/collection/storage';
import { useResolvedCollection } from '@/lib/collection/useResolvedCollection';
import { useLanguage } from '@/lib/i18n';

const EMPTY_LABEL = '—';

export default function CollectionSummaryCard() {
  const { t } = useLanguage();
  const collection = useSyncExternalStore(subscribeToCollection, loadCollection, () => EMPTY_COLLECTION);
  const resolvedCollection = useResolvedCollection(collection);
  const summary = buildCollectionSummary(resolvedCollection);
  const isEmpty = summary.size === 0;

  return (
    <article className="glass-card relative overflow-hidden p-10 transition duration-300 hover:-translate-y-1 hover:shadow-glass-soft">
      <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none bg-[radial-gradient(circle_at_18%_18%,rgba(212,175,120,0.14),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(165,185,150,0.08),transparent_22%)]" />
      <div className="relative space-y-6">
        <div className="space-y-3 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--public-readable-text,rgba(165,185,150,0.85))]">{t.collection.summaryCard.eyebrow}</p>
          <h2 className="text-4xl font-semibold text-[color:var(--public-readable-text,rgba(212,175,120,0.95))]">{t.collection.summaryCard.title}</h2>
          <p className="text-base leading-7 text-[color:var(--public-readable-text,rgba(190,170,140,0.65))]">
            {t.collection.summaryCard.description}
          </p>
        </div>

        {isEmpty ? (
          <div className="flex flex-col gap-6 rounded-[28px] border border-[rgba(212,175,120,0.12)] bg-black/20 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <p className="text-2xl font-light text-[color:var(--public-readable-text,rgba(212,175,120,0.95))]">{t.collection.summaryCard.emptyTitle}</p>
              <p className="max-w-2xl text-sm leading-7 text-[color:var(--public-readable-text,rgba(190,170,140,0.65))]">
                {t.collection.summaryCard.emptyDescription}
              </p>
            </div>
            <Link
              href="/collection"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(212,175,120,0.94),rgba(186,153,110,0.9))] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#121212] shadow-[0_20px_70px_rgba(212,175,120,0.18)] transition duration-300 hover:brightness-110"
            >
              {t.collection.summaryCard.addFirst}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label={t.collection.summaryCard.size} value={t.collection.summaryCard.sizeValue(summary.size)} />
            <MetricCard label={t.collection.summaryCard.averageRating} value={summary.averageRating != null ? `${summary.averageRating.toFixed(1)}` : EMPTY_LABEL} />
            <MetricCard label={t.collection.summaryCard.topBrand} value={summary.topBrand ?? EMPTY_LABEL} />
            <MetricCard label={t.collection.summaryCard.diversity} value={summary.diversity ?? EMPTY_LABEL} />
            <MetricCard label={t.collection.summaryCard.dnaCoverage} value={summary.dnaCoverage != null ? `${summary.dnaCoverage}%` : EMPTY_LABEL} />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--public-readable-text,rgba(165,185,150,0.68))]">
            {t.collection.summaryCard.footer}
          </p>
          <Link
            href="/collection"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(212,175,120,0.18)] bg-white/5 px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--public-readable-text,rgba(212,175,120,0.92))] transition duration-300 hover:bg-white/10"
          >
            {t.collection.summaryCard.manage}
          </Link>
        </div>
      </div>
    </article>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="collection-metric-card rounded-[24px] border border-[rgba(212,175,120,0.12)] bg-[rgba(var(--public-surface-channels,7,8,12),0.75)] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--public-readable-text,rgba(165,185,150,0.7))]">{label}</p>
      <p className="mt-3 text-lg font-light text-[color:var(--public-readable-text,rgba(242,229,199,0.95))]">{value}</p>
    </div>
  );
}
