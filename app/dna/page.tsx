'use client';

import { useEffect, useMemo, useState } from 'react';
import DnaRadar, { DNA_AXES, type DnaAxis, type DnaAxisValues } from '@/components/dna/DnaRadar';
import { buildSummary, loadDnaSession } from '@/lib/dnaSession';
import { getOrCreateUserProfile } from '@/lib/engine/userProfileManager';
import { PageShell, SectionHeader, StatCard, PremiumButton } from '@/components/design-system';
import { territories } from '@/lib/data/territories';
import type { DNASessionState, OlfactoryVector, UserDNAProfile } from '@/lib/types';

const DEFAULT_CONFIDENCE = 66;
const LOW_MATURITY_THRESHOLD = 45;
const MID_MATURITY_THRESHOLD = 72;
const SHIFT_MINIMAL_THRESHOLD = 8;
const SHIFT_MODERATE_THRESHOLD = 16;

const PROFILE_WORDS: Record<DnaAxis, string> = {
  Freshness: 'Fresh',
  Warmth: 'Warm',
  Complexity: 'Refined',
  Elegance: 'Elegant',
  Character: 'Bold',
  Presence: 'Expressive',
  Comfort: 'Soft',
  Uniqueness: 'Distinct',
  Versatility: 'Modern',
  Luxury: 'Luxurious',
  Formality: 'Polished',
};

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

function getMaturity(confidence: number): 'Emerging' | 'Developing' | 'Mature' {
  if (confidence < LOW_MATURITY_THRESHOLD) {
    return 'Emerging';
  }
  if (confidence < MID_MATURITY_THRESHOLD) {
    return 'Developing';
  }
  return 'Mature';
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

function formatLastUpdated(timestamp: number | null): string {
  if (!timestamp) {
    return 'Today';
  }

  const date = new Date(timestamp);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return 'Today';
  }

  return date.toLocaleDateString();
}

function toAxisRows(values: DnaAxisValues): Array<{ axis: DnaAxis; value: number }> {
  return DNA_AXES.map((axis) => ({ axis, value: toScore(values[axis]) }));
}

function buildNarrative(
  dominant: Array<{ axis: DnaAxis; value: number }>,
  positive: Array<{ axis: DnaAxis; delta: number }>,
  negative: Array<{ axis: DnaAxis; delta: number }>
): string {
  const leadAxes = dominant.slice(0, 3).map((item) => item.axis.toLowerCase()).join(', ');
  const strongestGain = positive[0];
  const strongestDrop = negative[0];

  const gainPart = strongestGain
    ? `Testing reinforced ${strongestGain.axis.toLowerCase()} by +${strongestGain.delta}.`
    : 'Testing kept your DNA highly consistent.';

  const dropPart = strongestDrop
    ? `The biggest pullback was ${strongestDrop.axis.toLowerCase()} (${strongestDrop.delta}).`
    : 'No axis showed a meaningful negative regression.';

  return `Your profile is currently shaped by ${leadAxes}. ${gainPart} ${dropPart}`;
}

export default function DnaPage() {
  const [dnaSession, setDnaSession] = useState<DNASessionState | null>(null);
  const [userProfile, setUserProfile] = useState<UserDNAProfile | null>(null);
  const [groundingVector, setGroundingVector] = useState<OlfactoryVector | null>(null);

  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const session = loadDnaSession();
        const profile = getOrCreateUserProfile();
        const storedGroundingVector = window.localStorage.getItem('fragrance_vector');

        setDnaSession(session);
        setUserProfile(profile);
        setGroundingVector(storedGroundingVector ? (JSON.parse(storedGroundingVector) as OlfactoryVector) : null);
      } catch (error) {
        console.warn('Failed to sync DNA dashboard state:', error);
      }
    };

    syncFromStorage();
    window.addEventListener('fragrance-dna-session-updated', syncFromStorage);
    window.addEventListener('fragrance-user-profile-updated', syncFromStorage as EventListener);
    window.addEventListener('storage', syncFromStorage);

    return () => {
      window.removeEventListener('fragrance-dna-session-updated', syncFromStorage);
      window.removeEventListener('fragrance-user-profile-updated', syncFromStorage as EventListener);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  const summary = useMemo(() => {
    if (!dnaSession) {
      return null;
    }
    return dnaSession.summary ?? buildSummary(dnaSession.currentVector, dnaSession.answers);
  }, [dnaSession]);

  const finalVector = summary?.finalVector ?? dnaSession?.currentVector ?? userProfile?.dnaVector ?? null;
  const finalConfidence = summary?.confidenceScore ?? userProfile?.confidenceLevel ?? DEFAULT_CONFIDENCE;
  const baselineConfidence = Math.max(35, Math.round(finalConfidence * 0.7));

  const finalAxisValues = useMemo(() => buildAxisValues(finalVector, finalConfidence), [finalVector, finalConfidence]);
  const baselineAxisValues = useMemo(() => buildAxisValues(groundingVector, baselineConfidence), [groundingVector, baselineConfidence]);

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
    () => dominantAxes.slice(0, 3).map((item) => PROFILE_WORDS[item.axis]).join(' '),
    [dominantAxes]
  );

  const profileMaturity = getMaturity(finalConfidence);
  const profileEvolution = getEvolutionStrength(averageShift);
  const testedCount = summary?.answeredCount ?? dnaSession?.answeredOrder.length ?? 0;
  const lastUpdated = formatLastUpdated(summary?.completedAt ?? dnaSession?.lastUpdatedAt ?? userProfile?.updatedAt ?? null);
  const narrative = useMemo(
    () => buildNarrative(dominantAxes, positiveChanges, negativeChanges),
    [dominantAxes, positiveChanges, negativeChanges]
  );

  return (
    <PageShell showBackgroundLayers>
      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <p className="text-gold text-sm font-semibold uppercase mb-2">Your Identity</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Your Olfactory DNA</h1>
          <p className="text-lg text-gray-400 max-w-3xl">
            Your final olfactory identity decoded. See how testing shifted your profile from baseline and discover the
            DNA signature that defines your fragrance preferences across 11 dimensions.
          </p>
        </div>
      </section>

      {/* DNA Visualization */}
      <section className="py-12 md:py-16 border-b border-black-600">
        <div className="main-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
            {/* Radar Chart */}
            <div className="premium-card-dark p-6 md:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold text-gold uppercase mb-2">DNA SIGNATURE</p>
                <h3 className="text-xl font-bold text-white">Final DNA vs Baseline</h3>
                <p className="text-sm text-gray-400 mt-2">
                  Scores range from 0 (low presence) to 100 (very high presence).
                </p>
              </div>
              <DnaRadar baselineValues={baselineAxisValues} finalValues={finalAxisValues} />
            </div>

            {/* DNA Summary Panel */}
            <div className="space-y-6">
              {/* Profile Summary Card */}
              <div className="premium-card-dark p-6">
                <p className="text-xs font-semibold text-gold uppercase mb-4">PROFILE SUMMARY</p>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Profile Type</p>
                    <p className="text-lg font-bold text-gold mt-1">{profileType}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">Confidence</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{finalConfidence}%</span>
                      <span className="text-xs text-gray-400">High certainty</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gold-900 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Profile Maturity</span>
                      <span className="text-sm font-medium text-gold">{profileMaturity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Data Coverage</span>
                      <span className="text-sm font-medium text-gold">{testedCount} fragrances</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Last Updated</span>
                      <span className="text-sm font-medium text-gray-300">{lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evolution Card */}
              <div className="premium-card-dark p-6">
                <p className="text-xs font-semibold text-gold uppercase mb-4">EVOLUTION</p>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Average Shift</p>
                    <p className="text-3xl font-bold text-white mt-2">+{averageShift}%</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">Profile Evolution</p>
                    <p className="text-sm font-medium text-gold">{profileEvolution}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {profileEvolution === 'Minimal'
                        ? 'Your profile is highly consistent'
                        : profileEvolution === 'Moderate'
                        ? 'Moderate shifts across some dimensions'
                        : 'Significant profile evolution detected'}
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
            label="INSIGHTS"
            title="DNA Profile Analysis"
            description="Your most dominant axes and how testing influenced your profile."
            className="mb-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Axes */}
            <div className="premium-card-dark p-6">
              <h3 className="text-sm font-bold text-gold uppercase mb-4">Top Dominant Axes</h3>
              <div className="space-y-3">
                {dominantAxes.map((item, index) => (
                  <div key={item.axis} className="flex items-center justify-between p-3 bg-black-700 rounded-lg border border-black-600 hover:border-gold transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-gold font-bold text-lg">{index + 1}.</span>
                      <span className="text-gray-300">{item.axis}</span>
                    </div>
                    <span className="text-gold font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Influenced by Testing */}
            <div className="premium-card-dark p-6">
              <h3 className="text-sm font-bold text-gold uppercase mb-4">Most Influenced by Testing</h3>
              <div className="space-y-3">
                {positiveChanges.length > 0 ? (
                  positiveChanges.map((item) => (
                    <div key={item.axis} className="flex items-center justify-between p-3 bg-green-950 rounded-lg border border-green-900">
                      <span className="text-green-300">↑ {item.axis}</span>
                      <span className="text-green-400 font-bold">+{item.delta}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No positive shifts yet.</p>
                )}
                {negativeChanges.length > 0 ? (
                  negativeChanges.map((item) => (
                    <div key={item.axis} className="flex items-center justify-between p-3 bg-red-950 rounded-lg border border-red-900">
                      <span className="text-red-300">↓ {item.axis}</span>
                      <span className="text-red-400 font-bold">{item.delta}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No negative shifts yet.</p>
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
            <h3 className="text-sm font-bold text-gold uppercase mb-4">DNA Narrative</h3>
            <p className="text-base leading-7 text-gray-300">{narrative}</p>
          </div>
        </div>
      </section>

      {/* Territory Affinities Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <SectionHeader
            label="EXPLORE"
            title="Discover Your Territory Affinities"
            description="Based on your DNA profile, explore fragrance territories that align with your olfactory identity."
            className="mb-8"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(territories).slice(0, 6).map((territory) => (
              <div key={territory.id} className="premium-card-dark p-6 cursor-pointer hover:shadow-gold transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: territory.color }} />
                  <h4 className="font-bold text-white">{territory.name}</h4>
                </div>
                <p className="text-sm text-gray-400">{territory.description.slice(0, 80)}...</p>
                <div className="mt-4 flex gap-2">
                  {territory.dnaAxes.slice(0, 2).map((axis) => (
                    <span key={axis} className="text-xs bg-black-700 text-gold px-2 py-1 rounded">
                      {axis}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a href="/territories">
              <PremiumButton variant="secondary" size="md">
                EXPLORE ALL TERRITORIES →
              </PremiumButton>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 border-t border-black-600">
        <div className="main-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Refine Your DNA?</h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Test more fragrances to strengthen your profile, discover new territories, and deepen your olfactory identity.
          </p>
          <a href="/test">
            <PremiumButton variant="primary" size="md">
              CONTINUE TESTING →
            </PremiumButton>
          </a>
        </div>
      </section>
    </PageShell>
  );
}
