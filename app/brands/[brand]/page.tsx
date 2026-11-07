'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PerfumeImageWithFallback } from '@/components/design-system/PerfumeImageWithFallback';
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
import type { PublicFragrance } from '@/lib/database/publicFragrances';
import { getFragranceHref } from '@/lib/fragranceNavigation';
import { getPerfumeImageCandidates } from '@/lib/design/perfumeImage';

function isPublicFragrance(value: unknown): value is PublicFragrance {
  if (!value || typeof value !== 'object') return false;
  const fragrance = value as Record<string, unknown>;
  return typeof fragrance.id === 'string'
    && typeof fragrance.brand === 'string'
    && typeof fragrance.perfume === 'string'
    && Array.isArray(fragrance.mainAccords)
    && fragrance.mainAccords.every((accord) => typeof accord === 'string')
    && Array.isArray(fragrance.notes)
    && fragrance.notes.every((note) => typeof note === 'string');
}

export default function BrandDetailPage() {
  const params = useParams();
  const brandParam = typeof params?.brand === 'string' ? params.brand : '';
  const brandName = decodeURIComponent(brandParam);
  const [brandFragrances, setBrandFragrances] = useState<PublicFragrance[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadFragrances = async () => {
      setLoading(true);
      setBrandFragrances([]);
      setLoadError(null);
      try {
        const query = new URLSearchParams({ brand: brandName, limit: '200' });
        const response = await fetch(`/api/fragrances/search?${query.toString()}`);
        const payload: unknown = await response.json();
        if (!response.ok) {
          const message = payload && typeof payload === 'object' && 'error' in payload
            ? String(payload.error)
            : 'Could not load fragrances for this brand.';
          throw new Error(message);
        }
        const results = payload && typeof payload === 'object' && 'results' in payload
          ? payload.results
          : undefined;
        if (!Array.isArray(results) || !results.every(isPublicFragrance)) {
          throw new Error('The fragrance response is invalid.');
        }
        if (active) setBrandFragrances(results);
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : 'Could not load fragrances for this brand.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadFragrances();
    return () => { active = false; };
  }, [brandName]);

  const seasonalDistribution = useMemo(() => {
    const distribution = { spring: 0, summer: 0, autumn: 0, winter: 0 };
    const keywords = {
      spring: ['fresh', 'green', 'light', 'floral'],
      summer: ['citrus', 'aquatic', 'fresh', 'crisp'],
      autumn: ['warm', 'woody', 'spice', 'amber'],
      winter: ['warm', 'woody', 'vanilla', 'oriental'],
    };
    for (const fragrance of brandFragrances) {
      const terms = [...fragrance.notes, ...fragrance.mainAccords].map((term) => term.toLowerCase());
      for (const [season, seasonKeywords] of Object.entries(keywords) as Array<[keyof typeof distribution, string[]]>) {
        distribution[season] += seasonKeywords.filter((keyword) => terms.some((term) => term.includes(keyword))).length;
      }
    }
    return distribution;
  }, [brandFragrances]);
  const strongestSeason = Object.entries(seasonalDistribution)
    .sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'spring';
  const hasSeasonalData = Object.values(seasonalDistribution).some((value) => value > 0);
  const leadingAccord = useMemo(() => {
    const counts = new Map<string, number>();
    for (const fragrance of brandFragrances) {
      for (const accord of fragrance.mainAccords) counts.set(accord, (counts.get(accord) ?? 0) + 1);
    }
    return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'Not available';
  }, [brandFragrances]);

  if (!loading && !loadError && brandFragrances.length === 0) {
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

          {loadError && <p role="alert" className="mb-6 text-red-300">{loadError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard label="Portfolio" value={brandFragrances.length.toString()} subtitle="fragrances" icon={<BottleOutlineIcon className="h-5 w-5" />} />
            <StatCard
              label="Signature Accord"
              value={leadingAccord}
              subtitle="most common portfolio accord"
              icon={<DNAHelixIcon className="h-5 w-5" />}
            />
            <StatCard
              label="Strongest Season"
              value={hasSeasonalData ? strongestSeason.charAt(0).toUpperCase() + strongestSeason.slice(1) : 'Not available'}
              subtitle="highest seasonal weight"
              icon={<CrystalGlyphIcon className="h-5 w-5" />}
            />
          </div>

          <PremiumCard variant="dark" className="p-6 md:p-8 mb-10">
            <p className="text-sm uppercase tracking-wider text-gold mb-5">Seasonal Distribution</p>
            {hasSeasonalData ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(seasonalDistribution).map(([season, value]) => {
                const maximum = Math.max(...Object.values(seasonalDistribution));
                const normalized = maximum > 0 ? (value * 100) / maximum : 0;
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
            </div> : <p className="text-sm text-gray-400">Seasonal data is not available for this house.</p>}
          </PremiumCard>

          <SectionHeader
            label="FRAGRANCES"
            title={`${brandFragrances.length} Selections`}
            description="Fragrances currently available for this house."
            className="mb-6"
          />

          {loading && <p role="status" className="mb-6 text-gray-400">Loading fragrances…</p>}

          <div className="grid gap-6 lg:grid-cols-2">
            {brandFragrances.map((fragrance, idx) => (
              <div key={fragrance.id} className="relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30 z-10">
                  <span className="text-xs font-semibold text-gold">{idx + 1}</span>
                </div>
                <PremiumCard variant="dark" className="flex h-full gap-4 p-4">
                  <PerfumeImageWithFallback
                    candidates={getPerfumeImageCandidates(fragrance)}
                    alt={`${fragrance.brand} ${fragrance.perfume}`}
                    className="h-36 w-28 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <Link
                      href={getFragranceHref(fragrance.id, fragrance.brand, fragrance.perfume)}
                      className="text-lg font-semibold text-white underline-offset-4 hover:underline"
                    >
                      {fragrance.perfume}
                    </Link>
                    <p className="mt-1 text-sm text-gray-300">
                      {[fragrance.launchYear, fragrance.gender].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-3 text-sm text-gray-400">
                      {fragrance.mainAccords.slice(0, 4).join(' · ')}
                    </p>
                  </div>
                </PremiumCard>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
