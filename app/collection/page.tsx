'use client';

import { useSyncExternalStore, useMemo } from 'react';
import Link from 'next/link';
import {
  loadCollection,
  subscribeToCollection,
  buildCollectionSummary,
} from '@/lib/collection';
import CollectionManager from '@/components/collection/CollectionManager';
import {
  PageShell,
  PremiumButton,
  StatCard,
  SectionHeader,
} from '@/components/design-system';

function CollectionStatsSection() {
  const collection = useSyncExternalStore(subscribeToCollection, loadCollection, () => []);
  const summary = useMemo(() => buildCollectionSummary(collection), [collection]);

  const stats = useMemo(() => {
    const owned = collection.filter(item => item.owned).length;
    const wishlist = collection.filter(item => item.wishlist).length;
    const rated = collection.filter(item => typeof item.personalRating === 'number').length;

    return { owned, wishlist, rated };
  }, [collection]);

  return (
    <section className="py-12 border-b border-black-600">
      <div className="main-container">
        <SectionHeader
          label="YOUR LIBRARY"
          title="Fragrance Collection"
          description="Track the fragrances you own and explore your olfactory landscape."
          className="mb-8"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Fragrances"
            value={collection.length.toString()}
            subtitle="in your collection"
            icon="📚"
          />
          <StatCard
            label="Owned"
            value={stats.owned.toString()}
            subtitle={`${Math.round((stats.owned / Math.max(collection.length, 1)) * 100)}% of collection`}
            icon="✓"
          />
          <StatCard
            label="Wishlist"
            value={stats.wishlist.toString()}
            subtitle="Items to acquire"
            icon="⭐"
          />
          <StatCard
            label="Avg Rating"
            value={
              summary.averageRating !== null
                ? summary.averageRating.toFixed(1)
                : '—'
            }
            subtitle={`${stats.rated} rated`}
            icon="🎯"
          />
        </div>
      </div>
    </section>
  );
}

function TerritoryInsightSection() {
  const collection = useSyncExternalStore(subscribeToCollection, loadCollection, () => []);

  // Calculate territory coverage based on collection size and diversity
  const territoryInsights = useMemo(() => {
    if (collection.length === 0) {
      return {
        coverage: 0,
        represented: 0,
        diverse: false,
        suggestion: 'Start your collection to explore territory coverage.',
      };
    }

    // Simple heuristic: assume each fragrance maps to ~2-3 territories on average
    const estimatedTerritoryReach = Math.min(
      Math.ceil(collection.length / 2),
      10
    );

    const coverage = (estimatedTerritoryReach / 10) * 100;
    const diverse = estimatedTerritoryReach >= 5;

    return {
      coverage: Math.round(coverage),
      represented: estimatedTerritoryReach,
      diverse,
      suggestion:
        estimatedTerritoryReach < 5
          ? 'Build diversity by exploring underrepresented territories.'
          : 'Your collection shows strong territory balance.',
    };
  }, [collection.length]);

  return (
    <section className="py-12 border-b border-black-600">
      <div className="main-container">
        <SectionHeader
          label="TERRITORY INSIGHTS"
          title="Olfactory Coverage"
          description="Understand which fragrance territories are represented in your collection."
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coverage Card */}
          <div className="premium-card-dark p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gold uppercase mb-2">Territory Coverage</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">
                    {territoryInsights.coverage}%
                  </span>
                  <span className="text-sm text-gray-400">
                    ({territoryInsights.represented}/10 territories)
                  </span>
                </div>
              </div>
              <span className="text-3xl">🗺️</span>
            </div>

            {/* Coverage Bar */}
            <div className="mb-4">
              <div className="h-2 bg-black-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-warm-500 transition-all duration-500"
                  style={{ width: `${territoryInsights.coverage}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-400">{territoryInsights.suggestion}</p>

            {/* CTA */}
            <div className="mt-6">
              <Link href="/territories">
                <PremiumButton variant="secondary" size="sm" className="w-full">
                  EXPLORE TERRITORIES
                </PremiumButton>
              </Link>
            </div>
          </div>

          {/* Diversity Insight Card */}
          <div className="premium-card-dark p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gold uppercase mb-2">Collection Character</p>
                <h3 className="text-lg font-bold text-white">
                  {territoryInsights.diverse ? 'Diverse Explorer' : 'Building Explorer'}
                </h3>
              </div>
              <span className="text-3xl">{territoryInsights.diverse ? '🧭' : '🔍'}</span>
            </div>

            <div className="space-y-3 mb-4 text-sm text-gray-400">
              <p>
                {territoryInsights.diverse
                  ? 'Your collection spans multiple fragrance territories, showing a sophisticated and exploratory taste profile.'
                  : 'Your collection is developing. Diversifying across territories will reveal your full olfactory identity.'}
              </p>
            </div>

            {/* Recommendations */}
            <div className="bg-black-700 border border-gold-900 rounded p-4 text-sm text-gray-300">
              <p className="font-semibold text-gold mb-2">Next Steps:</p>
              <ul className="space-y-1 text-xs">
                <li>• Add {Math.max(0, 3 - collection.length)} more fragrances to unlock DNA insights</li>
                <li>• Explore underrepresented territories</li>
                <li>• Rate your fragrances to refine your profile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CollectionPage() {
  const collection = useSyncExternalStore(subscribeToCollection, loadCollection, () => []);

  return (
    <PageShell showBackgroundLayers>
      {/* Header */}
      <section className="py-12">
        <div className="main-container text-center">
          <p className="text-gold text-sm font-semibold uppercase mb-2">YOUR LIBRARY</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My Collection</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Build and manage your fragrance library. Track ownership, rate fragrances, and discover patterns
            in your olfactory preferences.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <CollectionStatsSection />

      {/* Territory Insights Section */}
      <TerritoryInsightSection />

      {/* Collection Manager */}
      <section className="py-12">
        <div className="main-container">
          <CollectionManager />
        </div>
      </section>

      {/* Empty State Message */}
      {collection.length === 0 && (
        <section className="py-16 text-center">
          <div className="premium-card-dark p-12 max-w-2xl mx-auto">
            <p className="text-4xl mb-4">🧴</p>
            <h3 className="text-xl font-bold text-white mb-2">Start Your Collection</h3>
            <p className="text-gray-400 mb-6">
              Add your first fragrance to unlock collection insights, territory coverage analysis, and
              personalized discovery recommendations.
            </p>
            <Link href="/grounding">
              <PremiumButton variant="primary" size="md">
                DISCOVER FRAGRANCES →
              </PremiumButton>
            </Link>
          </div>
        </section>
      )}
    </PageShell>
  );
}