'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import DnaRadar, { DNA_AXES, type DnaAxis, type DnaAxisValues } from '@/components/dna/DnaRadar';
import { buildSummary, DNA_CONFIDENCE_BADGES, getDnaConfidenceBadge, loadDnaSession, loadGroundingVector } from '@/lib/dnaSession';
import { getOrCreateUserProfile } from '@/lib/engine/userProfileManager';
import { PageShell, SectionHeader, StatCard, PremiumButton } from '@/components/design-system';
import { AscendGlyphIcon, DescendGlyphIcon } from '@/components/design-system/FragranceIcons';
import { calculateTerritoryAffinities } from '@/lib/engine/territoryAffinities';
import { getDiscoveryCopy } from '@/lib/i18n/discoveryCopy';
import type { DNASessionState, OlfactoryVector, UserDNAProfile } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/dictionaries/en';
import { RecommendationsClient } from '@/app/results/RecommendationsClient';

const SHIFT_MINIMAL_THRESHOLD = 8;
const SHIFT_MODERATE_THRESHOLD = 16;

const PREVIEW_VECTOR: OlfactoryVector = {
  freshness: 0.7,
  warmth: 0.64,
  sweetness: 0.58,
  darkness: 0.52,
  cleanliness: 0.66,
  elegance: 0.61,
};

function toScore(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 50;
  }

  const asPercentage = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, Math.round(asPercentage)));
}

function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((total, current) => total + current, 0) / values.length;
}

function buildAxisValues(vector: OlfactoryVector | null, confidence: number): DnaAxisValues {
  const source = vector ?? PREVIEW_VECTOR;

  const freshness = toScore(source.freshness);
  const warmth = toScore(source.warmth);
  const sweetness = toScore(source.sweetness);
  const darkness = toScore(source.darkness);
  const cleanliness = toScore(source.cleanliness);
  const elegance = toScore(source.elegance);

  const complexity = Math.round((elegance * 0.5) + (darkness * 0.3) + (warmth * 0.2));
  const character = Math.round((warmth * 0.42) + (darkness * 0.4) + (sweetness * 0.18));
  const comfort = Math.round((cleanliness * 0.62) + (sweetness * 0.38));
  const uniqueness = Math.round((darkness * 0.58) + (elegance * 0.42));
  const versatility = Math.max(0, Math.min(100, Math.round(100 - Math.abs(warmth - freshness) * 0.6)));
  const luxury = Math.round((elegance * 0.68) + (warmth * 0.32));
  const formality = Math.round((elegance * 0.62) + (cleanliness * 0.38));

  return {
    Freshness: freshness,
    Warmth: warmth,
    Complexity: complexity,
    Elegance: elegance,
    Character: character,
    Presence: Math.max(0, Math.min(100, Math.round(confidence))),
    Comfort: comfort,
    Uniqueness: uniqueness,
    Versatility: versatility,
    Luxury: luxury,
    Formality: formality,
  };
}

function getEvolutionStrength(averageShift: number): 'Minimal' | 'Moderate' | 'Strong' {
  if (averageShift < SHIFT_MINIMAL_THRESHOLD) {
    return 'Minimal';
  }
  if (averageShift < SHIFT_MODERATE_THRESHOLD) {
    return 'Moderate';
  }
  return 'Strong';
}

function formatLastUpdated(timestamp: number | null, todayLabel: string): string {
  if (!timestamp) {
    return todayLabel;
  }

  const date = new Date(timestamp);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return todayLabel;
  }

  return date.toLocaleDateString();
}

function toAxisRows(values: DnaAxisValues): Array<{ axis: DnaAxis; value: number }> {
  return DNA_AXES.map((axis) => ({ axis, value: toScore(values[axis]) }));
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function buildNarrative(
  dominant: Array<{ axis: DnaAxis; value: number }>,
  positive: Array<{ axis: DnaAxis; delta: number }>,
  negative: Array<{ axis: DnaAxis; delta: number }>,
  dict: Dictionary['dna'],
  axisNames: Record<string, string>
): string {
  const leadAxes = dominant.slice(0, 3).map((item) => axisNames[item.axis] ?? item.axis);
  const strongestGain = positive[0];
  const strongestDrop = negative[0];

  const gainPart = strongestGain
    ? dict.narrativeGain(axisNames[strongestGain.axis] ?? strongestGain.axis, strongestGain.delta)
    : dict.narrativeGainNone;

  const dropPart = strongestDrop
    ? dict.narrativeDrop(axisNames[strongestDrop.axis] ?? strongestDrop.axis, strongestDrop.delta)
    : dict.narrativeDropNone;

  return `${dict.narrativeShaped(leadAxes)} ${gainPart} ${dropPart}`;
}

export default function DnaPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { locale, t } = useLanguage();
  const discoveryCopy = getDiscoveryCopy(locale);
  const [dnaSession, setDnaSession] = useState<DNASessionState | null>(null);
  const [userProfile, setUserProfile] = useState<UserDNAProfile | null>(null);
  const [groundingVector, setGroundingVector] = useState<OlfactoryVector | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null);

  useEffect(() => {
    const syncFromStorage = () => {
      if (isAuthLoading) return;
      try {
        const session = loadDnaSession(user?.id);
        const profile = getOrCreateUserProfile(user?.id);
        const storedGroundingVector = loadGroundingVector(user?.id);

        setDnaSession(session);
        setUserProfile(profile);
        setGroundingVector(storedGroundingVector);
        setRefreshedAt(Date.now());
      } catch (error) {
        console.warn('Failed to sync DNA dashboard state:', error);
      }
    };

    syncFromStorage();
    window.addEventListener('fragrance-dna-session-updated', syncFromStorage);
    window.addEventListener('fragrance-user-profile-updated', syncFromStorage as EventListener);
    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('fragrancedna-user-profile-loaded', syncFromStorage);

    return () => {
      window.removeEventListener('fragrance-dna-session-updated', syncFromStorage);
      window.removeEventListener('fragrance-user-profile-updated', syncFromStorage as EventListener);
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('fragrancedna-user-profile-loaded', syncFromStorage);
    };
  }, [isAuthLoading, user?.id]);

  const summary = useMemo(() => {
    if (!dnaSession) {
      return null;
    }
    return dnaSession.summary ?? buildSummary(
      dnaSession.currentVector,
      dnaSession.answers,
      undefined,
      undefined,
      undefined,
      dnaSession.answeredOrder,
    );
  }, [dnaSession]);

  const hasTestEvidence = (dnaSession?.answeredOrder.length ?? 0) > 0;
  const hasProfileEvidence = (userProfile?.totalInteractions ?? 0) > 0;
  const hasVersionedEvidence = Boolean(dnaSession?.evaluationState && (
    dnaSession.answeredOrder.length || Object.keys(dnaSession.preferenceProjection?.attributes ?? {}).length));
  const finalVector = dnaSession?.schemaVersion === 2
    ? hasVersionedEvidence ? dnaSession.currentVector : null
    : hasTestEvidence
    ? summary?.finalVector ?? dnaSession?.currentVector ?? null
    : hasProfileEvidence ? userProfile?.dnaVector ?? groundingVector : groundingVector;
  const finalConfidence = summary?.confidenceScore ?? userProfile?.confidenceLevel ?? 0;
  const currentBadge = getDnaConfidenceBadge(finalConfidence);
  const badgeIndex = DNA_CONFIDENCE_BADGES.findIndex((badge) => badge.id === currentBadge.id);
  const nextBadge = DNA_CONFIDENCE_BADGES[badgeIndex + 1] ?? null;
  const badgeProgress = nextBadge
    ? clampScore(((finalConfidence - currentBadge.minimum) / (nextBadge.minimum - currentBadge.minimum)) * 100)
    : 100;
  const baselineConfidence = Math.max(35, Math.round(finalConfidence * 0.7));

  const finalAxisValues = useMemo(() => buildAxisValues(finalVector, finalConfidence), [finalVector, finalConfidence]);
  const baselineAxisValues = useMemo(() => buildAxisValues(groundingVector, baselineConfidence), [groundingVector, baselineConfidence]);
  const territoryAffinities = useMemo(
    () => calculateTerritoryAffinities(finalVector ? finalAxisValues : null),
    [finalVector, finalAxisValues],
  );

  useEffect(() => {
    if (dnaSession && window.location.hash === '#olfactory-territories') {
      document.getElementById('olfactory-territories')?.scrollIntoView();
    }
  }, [dnaSession, isAuthLoading, finalVector]);

  const finalRows = useMemo(() => toAxisRows(finalAxisValues), [finalAxisValues]);
  const deltas = useMemo(
    () =>
      finalRows.map((item) => {
        const baseline = toScore(baselineAxisValues[item.axis]);
        return {
          axis: item.axis,
          final: item.value,
          baseline,
          delta: item.value - baseline,
        };
      }),
    [baselineAxisValues, finalRows]
  );

  const averageShift = useMemo(
    () => Math.round(mean(deltas.map((item) => Math.abs(item.delta)))),
    [deltas]
  );

  const dominantAxes = useMemo(
    () => [...finalRows].sort((left, right) => right.value - left.value).slice(0, 5),
    [finalRows]
  );

  const positiveChanges = useMemo(
    () => deltas.filter((item) => item.delta > 0).sort((left, right) => right.delta - left.delta).slice(0, 3),
    [deltas]
  );

  const negativeChanges = useMemo(
    () => deltas.filter((item) => item.delta < 0).sort((left, right) => left.delta - right.delta).slice(0, 3),
    [deltas]
  );

  const profileType = useMemo(
    () => dominantAxes.slice(0, 3).map((item) => t.dna.profileWords[item.axis] ?? item.axis).join(' '),
    [dominantAxes, t]
  );

  const profileEvolution = getEvolutionStrength(averageShift);
  const lastUpdated = formatLastUpdated(summary?.completedAt ?? dnaSession?.lastUpdatedAt ?? userProfile?.updatedAt ?? null, t.dna.today);
  const lastRefreshLabel = refreshedAt ? new Date(refreshedAt).toLocaleTimeString() : '--:--:--';
  const narrative = useMemo(
    () => buildNarrative(dominantAxes, positiveChanges, negativeChanges, t.dna, t.common.axes),
    [dominantAxes, positiveChanges, negativeChanges, t]
  );

  if (isAuthLoading || !dnaSession) {
    return <PageShell><div className="main-container py-16 text-sm text-gray-300">{t.dna.loading}</div></PageShell>;
  }

  if (finalVector === null) {
    return (
      <PageShell>
        <section className="py-16">
          <div className="main-container">
            <div id="olfactory-territories" className="premium-card-dark mx-auto max-w-2xl scroll-mt-32 border border-gold/20 p-8 md:p-10">
              <p className="mb-3 text-xs uppercase tracking-wider text-gold">{t.dna.inProgressEyebrow}</p>
              <h1 className="mb-4 text-2xl font-bold text-white">{t.dna.inProgressTitle}</h1>
              <p className="mb-6 leading-relaxed text-gray-300">
                {t.dna.inProgressDescription}
              </p>
              <p className="mb-6 text-sm text-gray-400">{t.dna.territoriesPending}</p>
              <PremiumButton
                variant="primary"
                size="lg"
                type="button"
                onClick={() => window.location.assign('/grounding')}
              >
                {t.dna.beginGrounding}
              </PremiumButton>
            </div>
            <div className="mt-12">
              <RecommendationsClient embedded />
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell showBackgroundLayers>
      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <p className="text-gold text-sm font-semibold uppercase mb-2">{t.dna.heroEyebrow}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.dna.heroTitle}</h1>
          <p className="text-lg text-gray-400 max-w-3xl">
            {t.dna.heroDescription}
          </p>
        </div>
      </section>

      {/* Live Snapshot */}
      <section className="py-8 md:py-10 border-b border-black-600">
        <div className="main-container">
          <SectionHeader
            label={t.dna.liveProfileLabel}
            title={t.dna.snapshotTitle}
            description={t.dna.snapshotDescription}
            className="mb-6"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label={t.dna.confidenceLabel}
              value={`${finalConfidence}%`}
              subtitle={t.dna.confidenceSubtitle}
            />
            <article className="premium-card-dark p-5">
              <p className="text-xs uppercase tracking-wider text-gray-400">{t.dna.currentBadge}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${currentBadge.colorClass}`} aria-hidden="true" />
                <p className="text-lg font-semibold text-white">{t.common.badges[currentBadge.id] ?? currentBadge.label}</p>
              </div>
              {nextBadge ? (
                <>
                  <p className="mt-3 text-xs text-gray-400">{t.dna.progressToward(t.common.badges[nextBadge.id] ?? nextBadge.label)}</p>
                  <div
                    role="progressbar"
                    aria-label={t.dna.progressToward(t.common.badges[nextBadge.id] ?? nextBadge.label)}
                    aria-valuemin={currentBadge.minimum}
                    aria-valuemax={nextBadge.minimum}
                    aria-valuenow={finalConfidence}
                    className="mt-2 h-2 overflow-hidden rounded-full bg-black-700"
                  >
                    <div className={`h-full ${nextBadge.colorClass}`} style={{ width: `${badgeProgress}%` }} />
                  </div>
                </>
              ) : <p className="mt-3 text-xs text-gray-400">{t.dna.highestBadgeReached}</p>}
            </article>
            <StatCard
              label={t.dna.lastRefresh}
              value={lastRefreshLabel}
              subtitle={t.dna.lastRefreshSubtitle}
            />
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-b border-black-600">
        <div className="main-container">
          <SectionHeader
            label={discoveryCopy.profile}
            title={discoveryCopy.profiles}
            description={discoveryCopy.profileHint}
            className="mb-8"
          />
          <a href="/articles/perfumers" className="text-gold underline underline-offset-4">{discoveryCopy.profiles} →</a>
        </div>
      </section>

      {/* DNA Visualization */}
      <section className="py-12 md:py-16 border-b border-black-600">
        <div className="main-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
            {/* Radar Chart */}
            <div className="premium-card-dark p-6 md:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold text-gold uppercase mb-2">{t.dna.dnaSignatureLabel}</p>
                <h3 className="text-xl font-bold text-white">{t.dna.finalVsBaseline}</h3>
                <p className="text-sm text-gray-400 mt-2">
                  {t.dna.scoresRange}
                </p>
              </div>
              <DnaRadar baselineValues={baselineAxisValues} finalValues={finalAxisValues} />
            </div>

            {/* DNA Summary Panel */}
            <div className="space-y-6">
              {/* Profile Summary Card */}
              <div className="premium-card-dark p-6">
                <p className="text-xs font-semibold text-gold uppercase mb-4">{t.dna.profileSummaryLabel}</p>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">{t.dna.profileSignature}</p>
                    <p className="text-lg font-bold text-gold mt-1">{profileType || t.dna.emerging}</p>
                  </div>

                  <div className="pt-4 border-t border-gold-900 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">{t.dna.lastUpdated}</span>
                      <span className="text-sm font-medium text-gray-300">{lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evolution Card */}
              <div className="premium-card-dark p-6">
                <p className="text-xs font-semibold text-gold uppercase mb-4">{t.dna.evolutionLabel}</p>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">{t.dna.averageShift}</p>
                    <p className="text-3xl font-bold text-white mt-2">+{averageShift}%</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">{t.dna.profileEvolution}</p>
                    <p className="text-sm font-medium text-gold">{t.dna.evolutionLabels[profileEvolution]}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t.dna.evolutionExplanations[profileEvolution]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section className="py-12 md:py-16 border-b border-black-600">
        <div className="main-container">
          <SectionHeader
            label={t.dna.insightsLabel}
            title={t.dna.insightsTitle}
            description={t.dna.insightsDescription}
            className="mb-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Axes */}
            <div className="premium-card-dark p-6">
              <h3 className="text-sm font-bold text-gold uppercase mb-4">{t.dna.topDominantAxes}</h3>
              <div className="space-y-3">
                {dominantAxes.map((item, index) => (
                  <div key={item.axis} className="flex items-center justify-between p-3 bg-black-700 rounded-lg border border-black-600 hover:border-gold transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-gold font-bold text-lg">{index + 1}.</span>
                      <span className="text-gray-300">{t.common.axes[item.axis] ?? item.axis}</span>
                    </div>
                    <span className="text-gold font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Influenced by Testing */}
            <div className="premium-card-dark p-6">
              <h3 className="text-sm font-bold text-gold uppercase mb-4">{t.dna.mostInfluenced}</h3>
              <div className="space-y-3">
                {positiveChanges.length > 0 ? (
                  positiveChanges.map((item) => (
                    <div key={item.axis} className="flex items-center justify-between p-3 bg-green-950 rounded-lg border border-green-900">
                      <span className="flex items-center gap-2 text-green-300">
                        <AscendGlyphIcon className="h-4 w-4 text-green-300" />
                        <span>{t.common.axes[item.axis] ?? item.axis}</span>
                      </span>
                      <span className="text-green-400 font-bold">+{item.delta}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">{t.dna.noPositiveShifts}</p>
                )}
                {negativeChanges.length > 0 ? (
                  negativeChanges.map((item) => (
                    <div key={item.axis} className="flex items-center justify-between p-3 bg-red-950 rounded-lg border border-red-900">
                      <span className="flex items-center gap-2 text-red-300">
                        <DescendGlyphIcon className="h-4 w-4 text-red-300" />
                        <span>{t.common.axes[item.axis] ?? item.axis}</span>
                      </span>
                      <span className="text-red-400 font-bold">{item.delta}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">{t.dna.noNegativeShifts}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DNA Narrative */}
      <section className="py-12 md:py-16 border-b border-black-600">
        <div className="main-container">
          <div className="premium-card-dark p-8">
            <h3 className="text-sm font-bold text-gold uppercase mb-4">{t.dna.dnaNarrative}</h3>
            <p className="text-base leading-7 text-gray-300">{narrative}</p>
          </div>
        </div>
      </section>

      {/* Territory Affinities Section */}
      <section id="olfactory-territories" className="scroll-mt-32 py-12 md:py-16" aria-labelledby="olfactory-territories-title">
        <div className="main-container">
          <p className="mb-2 text-xs uppercase tracking-wider text-gold">{t.dna.territoryAffinityLabel}</p>
          <h2 id="olfactory-territories-title" className="mb-3 text-3xl font-semibold">{t.dna.territoriesTitle}</h2>
          <p className="mb-3 max-w-3xl text-sm text-gray-300">
            {t.dna.territoriesDescription}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {territoryAffinities.map(({ territory, score, contributions }, index) => (
              <div key={territory.id} className="premium-card-dark p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: territory.color }} />
                  <h4 className="font-bold text-white">{t.territoryData[territory.id]?.name ?? territory.name}</h4>
                </div>
                <p className="mb-3 text-lg font-semibold text-gold">{t.dna.affinityScore(score)} <span className="text-xs text-gray-400">· {t.dna.rankLabel(index + 1)}</span></p>
                <p className="text-sm text-gray-400">{(t.territoryData[territory.id]?.description ?? territory.description).slice(0, 80)}...</p>
                <div className="mt-4 flex gap-2">
                  {contributions.map(({ axis, score: axisScore }) => (
                    <span key={axis} className="text-xs bg-black-700 text-gold px-2 py-1 rounded">
                      {t.common.axes[axis] ?? axis} {axisScore}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a href="/territories">
              <PremiumButton variant="secondary" size="md">
                {t.dna.exploreAllTerritories}
              </PremiumButton>
            </a>
          </div>
        </div>
      </section>

      <RecommendationsClient embedded />

      {/* CTA Section */}
      <section className="py-12 md:py-16 border-t border-black-600">
        <div className="main-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.dna.ctaTitle}</h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            {t.dna.ctaDescription}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/results">
              <PremiumButton variant="secondary" size="md">
                {t.dna.viewRecommendations}
              </PremiumButton>
            </a>
            <a href="/test">
              <PremiumButton variant="primary" size="md">
                {t.dna.continueTesting}
              </PremiumButton>
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
