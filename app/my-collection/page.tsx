'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import FragranceCard from '@/components/FragranceCard';
import { getAllFragrances } from '@/engine/dataLoader';
import { getOrCreateUserProfile } from '@/lib/engine/userProfileManager';
import { scoreWithExplanation } from '@/lib/engine/matchingEngine';
import { ExtendedFragrance, OlfactoryVector } from '@/lib/types';

interface CollectionItemWithScore {
  fragrance: ExtendedFragrance;
  compatibility: number;
  matchExplanation: string;
  seasonalUse: string;
  occasionUse: string;
  collectionRank: number;
}

export default function MyCollectionPage() {
  const allFragrances = useMemo(() => getAllFragrances(), []);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [collection, setCollection] = useState<CollectionItemWithScore[]>([]);
  const [filter, setFilter] = useState<'all' | 'season' | 'occasion'>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  useEffect(() => {
    // Load user profile
    try {
      const profile = getOrCreateUserProfile();
      setUserProfile(profile);

      // Initialize collection from localStorage (mock for now)
      const storedCollection = localStorage.getItem('fragrance_collection');
      let collectionIds: string[] = [];

      if (storedCollection) {
        collectionIds = JSON.parse(storedCollection);
      } else {
        // Default collection: first 5 fragrances
        collectionIds = allFragrances.slice(0, 5).map((f: any) => f.id || f.name);
      }

      // Build collection items with scores
      const items = collectionIds
        .map((id) => allFragrances.find((f: any) => (f.id || f.name) === id))
        .filter((f): f is any => f !== undefined)
        .map((frag: any, idx: number) => {
          const explanation = scoreWithExplanation(profile.dnaVector, frag as ExtendedFragrance);
          return {
            fragrance: frag,
            compatibility: explanation.score,
            matchExplanation: explanation.matchReasoning,
            seasonalUse: suggestSeasonalUse(frag),
            occasionUse: suggestOccasionUse(frag),
            collectionRank: idx + 1,
          };
        })
        .sort((a, b) => b.compatibility - a.compatibility);

      setCollection(items);
    } catch (e) {
      console.warn('Could not load collection:', e);
    }
  }, [allFragrances]);

  // Filter collection based on selected view
  const filteredCollection = useMemo(() => {
    if (filter === 'season' && selectedSeason !== 'all') {
      return collection.filter((item) => item.seasonalUse === selectedSeason);
    }
    return collection;
  }, [collection, filter, selectedSeason]);

  if (!userProfile) {
    return (
      <main className="main-container page-background">
        <section className="glass p-10">
          <p className="text-[rgba(190,170,140,0.65)]">Loading your collection...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="main-container page-background">
      <section className="glass p-10 space-y-10">
        {/* Header */}
        <div className="space-y-6 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.48em] text-[rgba(165,185,150,0.85)]">
            Your Scent Wardrobe
          </p>
          <h1 className="text-5xl font-light tracking-[0.04em] text-[rgba(212,175,120,0.95)]">
            My Collection
          </h1>
          <p className="text-lg leading-9 text-[rgba(190,170,140,0.65)]">
            Your curated fragrances ranked by DNA compatibility. Discover seasonal recommendations,
            occasion pairings, and personalized usage insights.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">
              Total Fragrances
            </p>
            <p className="mt-2 text-3xl font-semibold text-[rgba(212,175,120,0.95)]">
              {collection.length}
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">
              Avg Compatibility
            </p>
            <p className="mt-2 text-3xl font-semibold text-[rgba(212,175,120,0.95)]">
              {collection.length > 0
                ? ((collection.reduce((sum, item) => sum + item.compatibility, 0) / collection.length) * 100).toFixed(0)
                : '0'}
              %
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">
              Top Match
            </p>
            <p className="mt-2 text-sm text-[rgba(212,175,120,0.85)]">
              {collection.length > 0 ? collection[0].fragrance.name : 'N/A'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm uppercase tracking-[0.18em] transition duration-200 ${
              filter === 'all'
                ? 'bg-[#c7a86b] text-black'
                : 'border border-[#c7a86b]/30 text-[#c7a86b] hover:bg-white/5'
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setFilter('season');
              setSelectedSeason('all');
            }}
            className={`px-4 py-2 rounded-full text-sm uppercase tracking-[0.18em] transition duration-200 ${
              filter === 'season'
                ? 'bg-[#c7a86b] text-black'
                : 'border border-[#c7a86b]/30 text-[#c7a86b] hover:bg-white/5'
            }`}
          >
            By Season
          </button>
        </div>

        {/* Season filter */}
        {filter === 'season' && (
          <div className="flex flex-wrap gap-2">
            {['all', 'spring', 'summer', 'autumn', 'winter'].map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.15em] transition ${
                  selectedSeason === season
                    ? 'bg-white/10 text-white'
                    : 'text-[rgba(190,170,140,0.65)] hover:text-white'
                }`}
              >
                {season === 'all' ? 'All Seasons' : season}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Collection Grid */}
      <section className="mt-10 space-y-6">
        {filteredCollection.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-[rgba(190,170,140,0.65)]">
              No fragrances in this category. Start by adding fragrances to your collection.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredCollection.map((item, idx) => (
              <article
                key={item.fragrance.id || item.fragrance.name}
                className="glass-card p-8 space-y-6 hover:shadow-[0_32px_90px_rgba(199,168,107,0.20)] transition duration-300"
              >
                {/* Rank badge */}
                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[rgba(212,175,120,0.15)] flex items-center justify-center border border-[rgba(212,175,120,0.3)]">
                  <span className="text-sm font-bold text-[rgba(212,175,120,0.9)]">
                    #{item.collectionRank}
                  </span>
                </div>

                {/* Fragrance info */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">
                    {item.fragrance.brand || 'Brand'}
                  </p>
                  <h3 className="text-2xl font-light text-[rgba(212,175,120,0.95)]">
                    {item.fragrance.name}
                  </h3>
                </div>

                {/* Compatibility score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">
                      DNA Compatibility
                    </p>
                    <p className="text-lg font-semibold text-[rgba(212,175,120,0.95)]">
                      {(item.compatibility * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-[rgba(0,0,0,0.3)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[rgba(212,175,120,0.5)] to-[rgba(212,175,120,0.95)]"
                      style={{ width: `${item.compatibility * 100}%` }}
                    />
                  </div>
                </div>

                {/* Match explanation */}
                <p className="text-sm text-[rgba(190,170,140,0.7)] italic">
                  "{item.matchExplanation}"
                </p>

                {/* Usage recommendations */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgba(212,175,120,0.15)]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-[rgba(165,185,150,0.6)]">
                      Season
                    </p>
                    <p className="mt-1 text-sm text-[rgba(212,175,120,0.8)]">
                      {item.seasonalUse}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-[rgba(165,185,150,0.6)]">
                      Occasion
                    </p>
                    <p className="mt-1 text-sm text-[rgba(212,175,120,0.8)]">
                      {item.occasionUse}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      {collection.length > 0 && (
        <section className="mt-10">
          <Link
            href="/dna"
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(212,175,120,0.9),rgba(186,153,110,0.88))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#1A1A1A] shadow-[0_16px_60px_rgba(212,175,120,0.14)] transition duration-300 hover:brightness-110"
          >
            View Your DNA Profile
          </Link>
        </section>
      )}
    </main>
  );
}

// Helper functions for recommendations
function suggestSeasonalUse(fragrance: any): string {
  const notes = (fragrance.notes || []).map((n: string) => n.toLowerCase());

  if (
    notes.some((n: string) =>
      ['citrus', 'aquatic', 'fresh', 'bergamot', 'lemon'].some((k) => n.includes(k))
    )
  ) {
    return 'Spring / Summer';
  }

  if (notes.some((n: string) => ['warm', 'amber', 'spice', 'vanilla'].some((k) => n.includes(k)))) {
    return 'Fall / Winter';
  }

  return 'Year-Round';
}

function suggestOccasionUse(fragrance: any): string {
  const notes = (fragrance.notes || []).map((n: string) => n.toLowerCase());

  if (notes.some((n: string) => ['floral', 'elegant', 'soft'].some((k) => n.includes(k)))) {
    return 'Office / Casual';
  }

  if (notes.some((n: string) => ['dark', 'smoky', 'intense'].some((k) => n.includes(k)))) {
    return 'Evening / Events';
  }

  return 'Versatile';
}
