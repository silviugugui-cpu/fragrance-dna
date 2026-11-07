'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import {
  PageShell,
  SectionHeader,
  StatCard,
  PremiumCard,
  PremiumButton,
  HouseSealIcon,
  BottleOutlineIcon,
  BarChartGlyphIcon,
  DNAHelixIcon,
} from '@/components/design-system';

interface BrandStats {
  name: string;
  count: number;
  topFragrance: string;
}

function isBrandStats(value: unknown): value is BrandStats {
  if (!value || typeof value !== 'object') return false;
  const summary = value as Record<string, unknown>;
  return typeof summary.name === 'string'
    && typeof summary.count === 'number'
    && Number.isInteger(summary.count)
    && typeof summary.topFragrance === 'string';
}

export default function BrandsPage() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState<BrandStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadBrands = async () => {
      try {
        const response = await fetch('/api/fragrances/brands');
        const payload: unknown = await response.json();
        if (!response.ok) {
          const message = payload && typeof payload === 'object' && 'error' in payload
            ? String(payload.error)
            : 'Could not load fragrance brands.';
          throw new Error(message);
        }
        const summaries = payload && typeof payload === 'object' && 'summaries' in payload
          ? payload.summaries
          : undefined;
        if (!Array.isArray(summaries) || !summaries.every(isBrandStats)) {
          throw new Error('The fragrance brand response is invalid.');
        }
        if (active) setBrands(summaries);
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : 'Could not load fragrance brands.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadBrands();
    return () => { active = false; };
  }, []);

  const totalFragrances = brands.reduce((total, brand) => total + brand.count, 0);
  const dominantHouse = brands[0]?.name ?? t.brands.notAvailable;

  return (
    <PageShell>
      <section className="py-12 md:py-16">
        <div className="main-container">
          <SectionHeader
            label={t.brands.header.label}
            title={t.brands.header.title}
            description={t.brands.header.description}
            className="mb-8"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label={t.brands.stats.houses} value={brands.length.toString()} subtitle={t.brands.stats.housesSubtitle} icon={<HouseSealIcon className="h-5 w-5" />} />
            <StatCard label={t.brands.stats.fragrances} value={totalFragrances.toString()} subtitle={t.brands.stats.fragrancesSubtitle} icon={<BottleOutlineIcon className="h-5 w-5" />} />
            <StatCard label={t.brands.stats.largestHouse} value={brands[0]?.count?.toString() ?? '0'} subtitle={t.brands.stats.largestHouseSubtitle} icon={<BarChartGlyphIcon className="h-5 w-5" />} />
            <StatCard label={t.brands.stats.leadingName} value={dominantHouse} subtitle={t.brands.stats.leadingNameSubtitle} icon={<DNAHelixIcon className="h-5 w-5" />} />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {brands.map((brand) => (
              <PremiumCard key={brand.name} variant="dark" className="p-6 h-full flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold/70 mb-2">{t.brands.card.house}</p>
                  <h2 className="text-2xl font-light text-white mb-4">{brand.name}</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-gray-300">
                      <span>{t.brands.card.portfolioSize}</span>
                      <span className="text-gold font-semibold">{brand.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-300">
                      <span>{t.brands.card.signature}</span>
                      <span className="text-gold/80 text-right max-w-[60%] truncate">{brand.topFragrance}</span>
                    </div>
                  </div>
                </div>

                <Link href={`/brands/${encodeURIComponent(brand.name)}`} className="mt-6">
                  <PremiumButton variant="secondary" size="sm" className="w-full">
                    {t.brands.card.explore}
                  </PremiumButton>
                </Link>
              </PremiumCard>
            ))}
          </div>

          {loadError && (
            <div role="alert" className="premium-card-dark p-10 text-center mt-8">
              <p className="text-red-300">{loadError}</p>
            </div>
          )}

          {loading && <p role="status" className="mt-8 text-center text-gray-400">Loading brands…</p>}

          {!loading && !loadError && brands.length === 0 && (
            <div className="premium-card-dark p-10 text-center mt-8">
              <p className="text-gray-400">{t.brands.empty}</p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
