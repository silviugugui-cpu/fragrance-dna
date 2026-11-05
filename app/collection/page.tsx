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
import ArticlesIntroHero from '@/app/articles/ArticlesIntroHero';
import { collectionTerritoryCoverage } from '@/lib/collection/territoryCoverage';
import { getPriorityCopy } from '@/lib/i18n/priorityCopy';
import { classificationBasisLabel, getEvidenceCopy } from '@/lib/i18n/evidenceCopy';
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
  const { t, locale } = useLanguage();
  const copy = getPriorityCopy(locale);
  const evidenceCopy = getEvidenceCopy(locale);
  const collection = useSyncExternalStore(subscribeToCollection, loadCollection, () => EMPTY_COLLECTION);
  const resolved = useResolvedCollection(collection);
  const territoryInsights = useMemo(() => {
    const coverage = collectionTerritoryCoverage(resolved);
    return {
      ...coverage,
      suggestion: copy.coverageHelp,
    };
  }, [resolved, copy.coverageHelp]);

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
                    {territoryInsights.coverage === null ? '—' : `${territoryInsights.coverage}%`}
                  </span>
                  <span className="text-sm text-gray-400">
                    {territoryInsights.coverage === null ? copy.insufficient : t.collection.territory.territoriesCount(territoryInsights.represented)}
                  </span>
                </div>
              </div>
              <MapMarkerIcon className="h-7 w-7 text-[rgba(var(--public-champagne-channels,212,175,55),0.75)]" />
            </div>

            {/* Coverage Bar */}
            {territoryInsights.coverage !== null && <div className="mb-4">
              <div className="h-2 bg-black-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-warm-500 transition-all duration-500"
                  style={{ width: `${territoryInsights.coverage}%` }}
                />
              </div>
            </div>}

            <p className="text-sm text-gray-400">{territoryInsights.suggestion}</p>
            <p data-classification-basis className="mt-3 text-sm text-gold">
              {classificationBasisLabel(territoryInsights.classified, territoryInsights.total, locale)}
            </p>

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
                <p className="text-xs font-semibold text-gold uppercase mb-2">{evidenceCopy.represented}</p>
                <h3 data-territories-represented className="text-lg font-bold text-white">
                  {t.collection.territory.territoriesCount(territoryInsights.represented)}
                </h3>
              </div>
              <CompassRoseIcon className="h-7 w-7 text-[rgba(var(--public-champagne-channels,212,175,55),0.75)]" />
            </div>

            <div className="space-y-3 mb-4 text-sm text-gray-400">
              <p>
                {evidenceCopy.coverageScope}
              </p>
            </div>

            {/* Recommendations */}
            <div className="bg-black-700 border border-gold-900 rounded p-4 text-sm text-gray-300">
              <p className="font-semibold text-gold mb-2">{t.collection.territory.nextSteps}</p>
              <ul className="space-y-1 text-xs">
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
    <PageShell showBackgroundLayers className="home-aligned-page">
      <div className="main-container">
        <ArticlesIntroHero imageSrc="/images/your-collection-pop-art.png" sizes="(min-width: 1778px) 1600px, 90vw" />
      </div>
      {/* Header */}
      <section className="py-12">
        <div className="main-container text-center">
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
            <BottleOutlineIcon className="mx-auto mb-4 h-9 w-9 text-[rgba(var(--public-champagne-channels,212,175,55),0.75)]" />
            <h3 className="text-xl font-bold text-white mb-2">{t.collection.page.emptyTitle}</h3>
            <p className="text-gray-400 mb-6">
              {t.collection.page.emptyDescription}
            </p>
            <Link href="/fragrances">
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