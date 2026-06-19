'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import FragranceCard from '@/components/FragranceCard';
import { getAllFragrances } from '@/engine/dataLoader';

export default function BrandDetailPage() {
  const params = useParams();
  const brandParam = typeof params?.brand === 'string' ? params.brand : '';
  const brandName = decodeURIComponent(brandParam);
  const fragrances = useMemo(() => getAllFragrances(), []);

  // Filter fragrances for this brand
  const brandFragrances = useMemo(() => {
    return fragrances
      .filter((f: any) => (f.brand || 'Independent') === brandName)
      .slice(0, 10);
  }, [fragrances, brandName]);

  // Calculate brand DNA (aggregate vector)
  const calculateBrandDNA = () => {
    if (brandFragrances.length === 0) {
      return {
        freshness: 0.5,
        warmth: 0.5,
        sweetness: 0.5,
        darkness: 0.5,
        cleanliness: 0.5,
        elegance: 0.5,
      };
    }

    const axes = ['freshness', 'warmth', 'sweetness', 'darkness', 'cleanliness', 'elegance'] as const;
    const aggregated: Record<string, number> = {};

    for (const axis of axes) {
      let sum = 0;
      let count = 0;

      for (const frag of brandFragrances) {
        if (frag.semantic_v1?.[axis] !== undefined) {
          sum += frag.semantic_v1[axis];
          count++;
        }
      }

      aggregated[axis] = count > 0 ? sum / count : 0.5;
    }

    return aggregated;
  };

  const brandDNA = calculateBrandDNA();

  // Calculate seasonal distribution
  const calculateSeasonalDistribution = () => {
    const distribution = { spring: 0, summer: 0, autumn: 0, winter: 0 };
    const seasonKeywords = {
      spring: ['fresh', 'green', 'light', 'floral'],
      summer: ['citrus', 'aquatic', 'fresh', 'crisp'],
      autumn: ['warm', 'woody', 'spice', 'amber'],
      winter: ['warm', 'woody', 'vanilla', 'oriental'],
    };

    for (const frag of brandFragrances) {
      const notes = (frag.notes || []).map((n: string) => n.toLowerCase());
      
      for (const [season, keywords] of Object.entries(seasonKeywords)) {
        const matches = (keywords as string[]).filter((keyword) =>
          notes.some((note: string) => note.includes(keyword))
        ).length;
        (distribution as any)[season] += matches;
      }
    }

    // Normalize
    const total = Object.values(distribution).reduce((a, b) => a + b, 1);
    for (const season of Object.keys(distribution)) {
      (distribution as any)[season] /= total;
    }

    return distribution;
  };

  const seasonalDistribution = calculateSeasonalDistribution();

  if (brandFragrances.length === 0) {
    return (
      <main className="main-container page-background">
        <section className="glass p-10 space-y-10">
          <div className="space-y-6">
            <Link
              href="/brands"
              className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.7)] hover:text-[rgba(165,185,150,1)] transition"
            >
              ← Back to brands
            </Link>
            <h1 className="text-5xl font-light text-[rgba(212,175,120,0.95)]">
              {brandName}
            </h1>
            <p className="text-[rgba(190,170,140,0.65)]">
              No fragrances found for this brand.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="main-container page-background">
      <section className="glass p-10 space-y-10">
        {/* Header */}
        <div className="space-y-6 max-w-3xl">
          <Link
            href="/brands"
            className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.7)] hover:text-[rgba(165,185,150,1)] transition"
          >
            ← Back to brands
          </Link>
          <h1 className="text-5xl font-light tracking-[0.04em] text-[rgba(212,175,120,0.95)]">
            {brandName}
          </h1>
          <p className="text-lg leading-9 text-[rgba(190,170,140,0.65)]">
            Explore {brandFragrances.length} iconic fragrances from {brandName}. 
            Discover the brand's signature DNA and seasonal strengths.
          </p>
        </div>

        {/* Brand DNA Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">
              Portfolio
            </p>
            <p className="mt-2 text-3xl font-semibold text-[rgba(212,175,120,0.95)]">
              {brandFragrances.length}
            </p>
            <p className="text-sm text-[rgba(190,170,140,0.65)]">fragrances</p>
          </div>

          <div className="glass-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">
              Brand Character
            </p>
            <p className="mt-2 text-sm text-[rgba(212,175,120,0.85)]">
              Predominantly{' '}
              {brandDNA.elegance > 0.6
                ? 'Elegant'
                : brandDNA.freshness > 0.6
                  ? 'Fresh'
                  : brandDNA.warmth > 0.6
                    ? 'Warm'
                    : 'Balanced'}
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">
              Strongest Season
            </p>
            <p className="mt-2 text-sm text-[rgba(212,175,120,0.85)]">
              {Object.entries(seasonalDistribution)
                .sort((a, b) => (b[1] as number) - (a[1] as number))[0][0]
                .charAt(0)
                .toUpperCase() +
                Object.entries(seasonalDistribution)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))[0][0]
                  .slice(1)}
            </p>
          </div>
        </div>

        {/* Seasonal Distribution */}
        <div className="glass-card p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)] mb-6">
            Seasonal Distribution
          </p>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(seasonalDistribution).map(([season, value]) => (
              <div key={season}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs uppercase text-[rgba(190,170,140,0.7)]">
                    {season.substring(0, 3)}
                  </p>
                  <p className="text-sm font-semibold text-[rgba(212,175,120,0.8)]">
                    {(((value as number) * 100) / Math.max(...Object.values(seasonalDistribution))).toFixed(0)}%
                  </p>
                </div>
                <div className="h-6 rounded-full bg-[rgba(0,0,0,0.3)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[rgba(212,175,120,0.5)] to-[rgba(212,175,120,0.9)]"
                    style={{
                      width: `${((value as number) * 100) / Math.max(...Object.values(seasonalDistribution))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Fragrances */}
      <section className="mt-10 space-y-6">
        <div className="glass p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">
            Top Fragrances
          </p>
          <p className="mt-2 text-[rgba(190,170,140,0.65)]">
            {brandFragrances.length === 10
              ? 'Showing top 10 fragrances'
              : `All ${brandFragrances.length} fragrances`}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {brandFragrances.map((f: any, idx: number) => (
            <div
              key={f.id || f.name}
              className="relative"
            >
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[rgba(212,175,120,0.15)] flex items-center justify-center border border-[rgba(212,175,120,0.3)]">
                <span className="text-xs font-semibold text-[rgba(212,175,120,0.8)]">
                  {idx + 1}
                </span>
              </div>
              <FragranceCard f={f} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
