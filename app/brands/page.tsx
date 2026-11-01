'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { getAllFragrances } from '@/engine/dataLoader';
import { useLanguage } from '@/lib/i18n';
import type { Fragrance } from '@/lib/types';
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
  avgScore?: number;
}

export default function BrandsPage() {
  const { t } = useLanguage();
  const fragrances = useMemo(() => getAllFragrances(), []);

  // Group fragrances by brand
  const brandMap = new Map<string, Fragrance[]>();

  fragrances.forEach((f: Fragrance) => {
    const brand = f.brand || 'Independent';
    if (!brandMap.has(brand)) {
      brandMap.set(brand, []);
    }
    brandMap.get(brand)!.push(f);
  });

  // Convert to sorted array
  const brands: BrandStats[] = Array.from(brandMap.entries())
    .map(([name, items]) => ({
      name,
      count: items.length,
      topFragrance: items[0]?.name || t.brands.notAvailable,
    }))
    .sort((a, b) => b.count - a.count);

  const totalFragrances = fragrances.length;
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

          {brands.length === 0 && (
            <div className="premium-card-dark p-10 text-center mt-8">
              <p className="text-gray-400">{t.brands.empty}</p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
