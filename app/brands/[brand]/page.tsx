'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import FragranceCard from '@/components/FragranceCard';
import { getAllFragrances } from '@/engine/dataLoader';
import type { Fragrance } from '@/lib/types';
import {
  PageShell,
  SectionHeader,
  PremiumCard,
  PremiumButton,
  StatCard,
  BottleOutlineIcon,
  DNAHelixIcon,
  CrystalGlyphIcon,
} from '@/components/design-system';

export default function BrandDetailPage() {
  const params = useParams();
  const brandParam = typeof params?.brand === 'string' ? params.brand : '';
  const brandName = decodeURIComponent(brandParam);
  const fragrances = useMemo(() => getAllFragrances(), []);

  // Filter fragrances for this brand
  const brandFragrances = useMemo(() => {
    return fragrances
      .filter((f: Fragrance) => (f.brand || 'Independent') === brandName)
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
        const matches = keywords.filter((keyword) =>
          notes.some((note: string) => note.includes(keyword))
        ).length;

        if (season === 'spring') distribution.spring += matches;
        if (season === 'summer') distribution.summer += matches;
        if (season === 'autumn') distribution.autumn += matches;
        if (season === 'winter') distribution.winter += matches;
      }
    }

    // Normalize
    const total = Object.values(distribution).reduce((a, b) => a + b, 1);
    distribution.spring /= total;
    distribution.summer /= total;
    distribution.autumn /= total;
    distribution.winter /= total;

    return distribution;
  };

  const seasonalDistribution = calculateSeasonalDistribution();
  const strongestSeason = Object.entries(seasonalDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'spring';

  if (brandFragrances.length === 0) {
    return (
      <PageShell>
        <section className="py-12 md:py-16">
          <div className="main-container">
            <PremiumCard variant="dark" className="p-8 md:p-12">
              <Link href="/brands" className="inline-block mb-6 text-sm uppercase tracking-wider text-gold hover:text-gold/80 transition">
                Back to brands
              </Link>
              <h1 className="text-4xl md:text-5xl font-light text-white mb-3">{brandName}</h1>
              <p className="text-gray-400 mb-6">No fragrances found for this brand.</p>
              <Link href="/brands">
                <PremiumButton variant="secondary" size="sm">RETURN TO BRAND UNIVERSE</PremiumButton>
              </Link>
            </PremiumCard>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="py-12 md:py-16">
        <div className="main-container">
          <div className="mb-6">
            <Link href="/brands" className="text-sm uppercase tracking-wider text-gold hover:text-gold/80 transition">
              Back to brands
            </Link>
          </div>

          <SectionHeader
            label="BRAND PROFILE"
            title={brandName}
            description={`Explore ${brandFragrances.length} fragrances from ${brandName} and review signature character and seasonality.`}
            className="mb-8"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard label="Portfolio" value={brandFragrances.length.toString()} subtitle="fragrances" icon={<BottleOutlineIcon className="h-5 w-5" />} />
            <StatCard
              label="Brand Character"
              value={
                brandDNA.elegance > 0.6
                  ? 'Elegant'
                  : brandDNA.freshness > 0.6
                    ? 'Fresh'
                    : brandDNA.warmth > 0.6
                      ? 'Warm'
                      : 'Balanced'
              }
              subtitle="dominant impression"
              icon={<DNAHelixIcon className="h-5 w-5" />}
            />
            <StatCard
              label="Strongest Season"
              value={strongestSeason.charAt(0).toUpperCase() + strongestSeason.slice(1)}
              subtitle="highest seasonal weight"
              icon={<CrystalGlyphIcon className="h-5 w-5" />}
            />
          </div>

          <PremiumCard variant="dark" className="p-6 md:p-8 mb-10">
            <p className="text-sm uppercase tracking-wider text-gold mb-5">Seasonal Distribution</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(seasonalDistribution).map(([season, value]) => {
                const normalized = (value * 100) / Math.max(...Object.values(seasonalDistribution));
                return (
                  <div key={season}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs uppercase text-gray-400">{season.substring(0, 3)}</p>
                      <p className="text-sm font-semibold text-gold/90">{normalized.toFixed(0)}%</p>
                    </div>
                    <div className="h-2 rounded-full bg-black-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold to-warm-500"
                        style={{ width: `${normalized}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </PremiumCard>

          <SectionHeader
            label="TOP FRAGRANCES"
            title={brandFragrances.length === 10 ? 'Top 10 Selections' : `All ${brandFragrances.length} Selections`}
            description="Highest-priority fragrances currently available for this house."
            className="mb-6"
          />

          <div className="grid gap-6 lg:grid-cols-2">
            {brandFragrances.map((f: Fragrance, idx: number) => (
              <div key={f.id || f.name} className="relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30 z-10">
                  <span className="text-xs font-semibold text-gold">{idx + 1}</span>
                </div>
                <FragranceCard f={f} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
