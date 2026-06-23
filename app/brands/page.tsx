'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { getAllFragrances } from '@/engine/dataLoader';
import type { Fragrance } from '@/lib/types';
import { PageShell, SectionHeader, StatCard, PremiumCard, PremiumButton } from '@/components/design-system';

interface BrandStats {
  name: string;
  count: number;
  topFragrance: string;
  avgScore?: number;
}

export default function BrandsPage() {
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
      topFragrance: items[0]?.name || 'N/A',
    }))
    .sort((a, b) => b.count - a.count);

  const totalFragrances = fragrances.length;
  const dominantHouse = brands[0]?.name ?? 'N/A';

  return (
    <PageShell>
      <section className="py-12 md:py-16">
        <div className="main-container">
          <SectionHeader
            label="FRAGRANCE HOUSES"
            title="Brand Universe"
            description="Explore iconic fragrance houses and their signature collections through a consistent premium discovery experience."
            className="mb-8"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label="Houses" value={brands.length.toString()} subtitle="available brands" icon="🏛️" />
            <StatCard label="Fragrances" value={totalFragrances.toString()} subtitle="total catalog" icon="🧴" />
            <StatCard label="Largest House" value={brands[0]?.count?.toString() ?? '0'} subtitle="fragrances in one house" icon="📊" />
            <StatCard label="Leading Name" value={dominantHouse} subtitle="current leader" icon="✨" />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {brands.map((brand) => (
              <PremiumCard key={brand.name} variant="dark" className="p-6 h-full flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold/70 mb-2">Fragrance House</p>
                  <h2 className="text-2xl font-light text-white mb-4">{brand.name}</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Portfolio size</span>
                      <span className="text-gold font-semibold">{brand.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-300">
                      <span>Signature</span>
                      <span className="text-gold/80 text-right max-w-[60%] truncate">{brand.topFragrance}</span>
                    </div>
                  </div>
                </div>

                <Link href={`/brands/${encodeURIComponent(brand.name)}`} className="mt-6">
                  <PremiumButton variant="secondary" size="sm" className="w-full">
                    EXPLORE HOUSE
                  </PremiumButton>
                </Link>
              </PremiumCard>
            ))}
          </div>

          {brands.length === 0 && (
            <div className="premium-card-dark p-10 text-center mt-8">
              <p className="text-gray-400">No brands found in the database.</p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
