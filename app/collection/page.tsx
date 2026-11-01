'use client';

import { useSyncExternalStore, useMemo } from 'react';
import Link from 'next/link';
import {
  loadCollection,
  subscribeToCollection,
  buildCollectionSummary,
} from '@/lib/collection';
import { EMPTY_COLLECTION } from '@/lib/collection/storage';
import { useResolvedCollection } from '@/lib/collection/useResolvedCollection';
import { useLanguage } from '@/lib/i18n';
import CollectionManager from '@/components/collection/CollectionManager';
import {
  PageShell,
  PremiumButton,
  StatCard,
  SectionHeader,
  ArchiveCabinetIcon,
  CheckSealIcon,
  StarGlyphIcon,
  TargetGlyphIcon,
  MapMarkerIcon,
  CompassRoseIcon,
  SearchLensIcon,
  BottleOutlineIcon,
} from '@/components/design-system';

function CollectionStatsSection() {
  const { t } = useLanguage();
  const collection = useSyncExternalStore(subscribeToCollection, loadCollection, () => EMPTY_COLLECTION);
  const resolvedCollection = useResolvedCollection(collection);
  const summary = useMemo(() => buildCollectionSummary(resolvedCollection), [resolvedCollection]);

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
          label={t.collection.stats.label}
          title={t.collection.stats.title}
          description={t.collection.stats.description}
          className="mb-8"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t.collection.stats.total}
            value={collection.length.toString()}
            subtitle={t.collection.stats.totalSubtitle}
            icon={<ArchiveCabinetIcon className="h-5 w-5" />}
          />
          <StatCard
            label={t.collection.stats.owned}
            value={stats.owned.toString()}
            subtitle={t.collection.stats.ownedSubtitle(Math.round((stats.owned / Math.max(collection.length, 1)) * 100))}
            icon={<CheckSealIcon className="h-5 w-5" />}
          />
          <StatCard
            label={t.collection.stats.wishlist}
            value={stats.wishlist.toString()}
            subtitle={t.collection.stats.wishlistSubtitle}
            icon={<StarGlyphIcon className="h-5 w-5" />}
          />
          <StatCard
            label={t.collection.stats.avgRating}
            value={
              summary.averageRating !== null
                ? summary.averageRating.toFixed(1)
                : '—'
            }
            subtitle={t.collection.stats.ratedSubtitle(stats.rated)}
            icon={<TargetGlyphIcon className="h-5 w-5" />}
          />
        </div>
      </div>
    </section>
  );
}

function TerritoryInsightSection() {
  const { t } = useLanguage();
  const collection = useSyncExternalStore(subscribeToCollection, loadCollection, () => EMPTY_COLLECTION);

  // Calculate territory coverage based on collection size and diversity
  const territoryInsights = useMemo(() => {
    if (collection.length === 0) {
      return {
        coverage: 0,
        represented: 0,
        diverse: false,
        suggestion: t.collection.territory.startSuggestion,
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
          ? t.collection.territory.buildSuggestion
          : t.collection.territory.balancedSuggestion,
    };
  }, [collection.length, t]);

  return (
    <section className="py-12 border-b border-black-600">
      <div className="main-container">
        <SectionHeader
          label={t.collection.territory.label}
          title={t.collection.territory.title}
          description={t.collection.territory.description}
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coverage Card */}
          <div className="premium-card-dark p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gold uppercase mb-2">{t.collection.territory.coverageLabel}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">
                    {territoryInsights.coverage}%
                  </span>
                  <span className="text-sm text-gray-400">
                    {t.collection.territory.territoriesCount(territoryInsights.represented)}
                  </span>
                </div>
              </div>
              <MapMarkerIcon className="h-7 w-7 text-[#D4AF37]/75" />
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
                  {t.collection.territory.exploreCta}
                </PremiumButton>
              </Link>
            </div>
          </div>

          {/* Diversity Insight Card */}
          <div className="premium-card-dark p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gold uppercase mb-2">{t.collection.territory.characterLabel}</p>
                <h3 className="text-lg font-bold text-white">
                  {territoryInsights.diverse ? t.collection.territory.diverseExplorer : t.collection.territory.buildingExplorer}
                </h3>
              </div>
              {territoryInsights.diverse ? (
                <CompassRoseIcon className="h-7 w-7 text-[#D4AF37]/75" />
              ) : (
                <SearchLensIcon className="h-7 w-7 text-[#D4AF37]/75" />
              )}
            </div>

            <div className="space-y-3 mb-4 text-sm text-gray-400">
              <p>
                {territoryInsights.diverse
                  ? t.collection.territory.diverseText
                  : t.collection.territory.buildingText}
              </p>
            </div>

            {/* Recommendations */}
            <div className="bg-black-700 border border-gold-900 rounded p-4 text-sm text-gray-300">
              <p className="font-semibold text-gold mb-2">{t.collection.territory.nextSteps}</p>
              <ul className="space-y-1 text-xs">
                <li>{t.collection.territory.stepAddMore(Math.max(0, 3 - collection.length))}</li>
                <li>{t.collection.territory.stepExplore}</li>
                <li>{t.collection.territory.stepRate}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CollectionPage() {
  const { t } = useLanguage();
  const collection = useSyncExternalStore(subscribeToCollection, loadCollection, () => EMPTY_COLLECTION);

  return (
    <PageShell showBackgroundLayers>
      {/* Header */}
      <section className="py-12">
        <div className="main-container text-center">
          <p className="text-gold text-sm font-semibold uppercase mb-2">{t.collection.page.eyebrow}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.collection.page.title}</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t.collection.page.description}
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
            <BottleOutlineIcon className="mx-auto mb-4 h-9 w-9 text-[#D4AF37]/75" />
            <h3 className="text-xl font-bold text-white mb-2">{t.collection.page.emptyTitle}</h3>
            <p className="text-gray-400 mb-6">
              {t.collection.page.emptyDescription}
            </p>
            <Link href="/grounding">
              <PremiumButton variant="primary" size="md">
                {t.collection.page.emptyCta}
              </PremiumButton>
            </Link>
          </div>
        </section>
      )}
    </PageShell>
  );
}