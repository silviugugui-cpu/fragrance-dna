'use client';

import { useEffect, useMemo, useState } from 'react';
import DnaRadar, { DNA_AXES, type DnaAxis, type DnaAxisValues } from '@/components/dna/DnaRadar';
import { buildSummary, loadDnaSession } from '@/lib/dnaSession';
import { getOrCreateUserProfile } from '@/lib/engine/userProfileManager';
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
    <main className="main-container dna-background">
      <section className="glass p-6 md:p-8 lg:p-10">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.48em] text-[rgba(165,185,150,0.85)]">
            <span className="dna-script-font large">Fragrance</span> DNA
          </p>
          <h1 className="text-4xl font-light tracking-[0.04em] text-[rgba(220,188,132,0.96)] md:text-5xl">
            DNA Matrix Visualization
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[rgba(194,173,142,0.78)] md:text-lg">
            Understand your final olfactory identity and how testing shifted your profile from grounding baseline.
          </p>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.72fr_1fr]">
          <DnaRadar baselineValues={baselineAxisValues} finalValues={finalAxisValues} />

          <aside className="glass-card p-6 md:p-7">
            <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.82)]">DNA SUMMARY</p>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[rgba(170,187,156,0.74)]">Profile Type</p>
                <p className="mt-2 text-xl text-[rgba(224,194,140,0.96)]">{profileType}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[rgba(170,187,156,0.74)]">Confidence</p>
                <p className="mt-2 text-3xl font-semibold text-[rgba(224,194,140,0.98)]">{finalConfidence}%</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[rgba(170,187,156,0.74)]">Profile Maturity</p>
                <p className="mt-2 text-lg text-[rgba(224,194,140,0.92)]">{profileMaturity}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[rgba(170,187,156,0.74)]">Data Coverage</p>
                <p className="mt-2 text-lg text-[rgba(224,194,140,0.92)]">{testedCount} fragrances tested</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[rgba(170,187,156,0.74)]">Last Updated</p>
                <p className="mt-2 text-lg text-[rgba(224,194,140,0.92)]">{lastUpdated}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 rounded-[24px] border border-[rgba(212,175,120,0.2)] bg-[rgba(6,8,12,0.72)] p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[rgba(170,187,156,0.74)]">Average Shift</p>
                <p className="mt-2 text-2xl font-semibold text-[rgba(224,194,140,0.98)]">+{averageShift}%</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[rgba(170,187,156,0.74)]">Profile Evolution</p>
                <p className="mt-2 text-lg text-[rgba(224,194,140,0.92)]">{profileEvolution}</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="glass-card p-6 md:p-7">
            <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.82)]">TOP DOMINANT AXES</p>
            <div className="mt-5 space-y-3">
              {dominantAxes.map((item, index) => (
                <div key={item.axis} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm text-[rgba(216,199,171,0.95)]">{index + 1}. {item.axis}</p>
                  <p className="text-sm font-semibold text-[rgba(224,194,140,0.95)]">{item.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card p-6 md:p-7">
            <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.82)]">MOST INFLUENCED BY TESTING</p>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                {positiveChanges.map((item) => (
                  <p key={item.axis} className="rounded-2xl border border-[rgba(108,196,219,0.35)] bg-[rgba(108,196,219,0.10)] px-4 py-3 text-sm text-[rgba(188,232,244,0.96)]">
                    ↑ {item.axis} +{item.delta}
                  </p>
                ))}
                {positiveChanges.length === 0 ? (
                  <p className="text-sm text-[rgba(190,170,140,0.72)]">No positive shifts yet.</p>
                ) : null}
              </div>
              <div className="space-y-2">
                {negativeChanges.map((item) => (
                  <p key={item.axis} className="rounded-2xl border border-[rgba(212,175,120,0.28)] bg-[rgba(212,175,120,0.12)] px-4 py-3 text-sm text-[rgba(236,203,147,0.96)]">
                    ↓ {item.axis} {item.delta}
                  </p>
                ))}
                {negativeChanges.length === 0 ? (
                  <p className="text-sm text-[rgba(190,170,140,0.72)]">No negative shifts yet.</p>
                ) : null}
              </div>
            </div>
          </article>
        </section>

        <section className="mt-6">
          <article className="glass-card p-6 md:p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.82)]">DNA NARRATIVE</p>
            <p className="mt-4 text-base leading-8 text-[rgba(214,198,171,0.9)]">{narrative}</p>
          </article>
        </section>
      </section>
    </main>
  );
}
