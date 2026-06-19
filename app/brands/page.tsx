'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { getAllFragrances } from '@/engine/dataLoader';

interface BrandStats {
  name: string;
  count: number;
  topFragrance: string;
  avgScore?: number;
}

export default function BrandsPage() {
  const fragrances = useMemo(() => getAllFragrances(), []);

  // Group fragrances by brand
  const brandMap = new Map<string, any[]>();
  
  fragrances.forEach((f: any) => {
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

  return (
    <main className="main-container page-background">
      <section className="glass p-10 space-y-10">
        <div className="space-y-6 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.48em] text-[rgba(165,185,150,0.85)]">
            Fragrance Houses
          </p>
          <h1 className="text-5xl font-light tracking-[0.04em] text-[rgba(212,175,120,0.95)]">
            Brand Universe
          </h1>
          <p className="text-lg leading-9 text-[rgba(190,170,140,0.65)]">
            Explore iconic fragrance houses and their signature collections. Discover brand DNA, 
            seasonal patterns, and top-ranked fragrances.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={`/brands/${encodeURIComponent(brand.name)}`}
              className="group"
            >
              <article className="glass-card p-8 h-full transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_90px_rgba(199,168,107,0.20)]">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[rgba(165,185,150,0.7)]">
                      Fragrance House
                    </p>
                    <h2 className="mt-2 text-2xl font-light text-[rgba(212,175,120,0.95)] group-hover:text-[rgba(212,175,120,1)]">
                      {brand.name}
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[rgba(190,170,140,0.65)]">Portfolio size</span>
                      <span className="font-semibold text-[rgba(212,175,120,0.85)]">
                        {brand.count} fragrances
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[rgba(190,170,140,0.65)]">Signature</span>
                      <span className="text-[rgba(212,175,120,0.75)]">{brand.topFragrance}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[rgba(212,175,120,0.15)] flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.6)]">
                    Explore
                  </span>
                  <span className="text-lg text-[rgba(212,175,120,0.6)] group-hover:translate-x-1 transition">
                    →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {brands.length === 0 && (
          <div className="rounded-[28px] bg-white/5 p-12 text-center">
            <p className="text-[rgba(190,170,140,0.65)]">
              No brands found in the database.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
