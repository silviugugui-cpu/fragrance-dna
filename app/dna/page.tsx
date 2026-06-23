'use client';

import { useEffect, useMemo, useState } from 'react';
import DnaRadar, { DNA_AXES, type DnaAxis } from '@/components/dna/DnaRadar';
import DnaMetrics from '@/components/dna/DnaMetrics';
import FragranceSelector from '@/components/dna/FragranceSelector';
import { getAllFragrances } from '@/engine/dataLoader';
import { buildSummary, loadDnaSession } from '@/lib/dnaSession';
import { getOrCreateUserProfile } from '@/lib/engine/userProfileManager';
import type { DNASessionState, Fragrance, OlfactoryVector, UserDNAProfile } from '@/lib/types';

const INITIAL_SELECTION_COUNT = 8;
const DEFAULT_CONFIDENCE = 75;
const DEFAULT_TESTED = 10;
const DEFAULT_REMAINING = 0;
const FALLBACK_DOMINANT_AXES = 'Sweetness • Warmth';
const FINAL_STATE_LABEL = 'Final DNA';

const VECTOR_AXIS_KEYS: Array<{
  axis: DnaAxis;
  key: keyof OlfactoryVector;
}> = [
  { axis: 'Freshness', key: 'freshness' },
  { axis: 'Warmth', key: 'warmth' },
  { axis: 'Elegance', key: 'elegance' },
];

const DERIVED_AXIS_BASE_WEIGHTS = {
  comfortCleanliness: 0.62,
  comfortSweetness: 0.38,
  characterWarmth: 0.46,
  characterDarkness: 0.36,
  characterSweetness: 0.18,
  versatilityBalanceScale: 62,
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
    return 50;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function axisValue(fragrance: Fragrance, axis: DnaAxis): number | null {
  const source = fragrance.dna_axes?.find((entry) => entry.name === axis)?.value;
  if (typeof source !== 'number' || Number.isNaN(source)) {
    return null;
  }
  return toScore(source);
}

function buildSelectedAggregate(selectedFragrances: Fragrance[]): Partial<Record<DnaAxis, number>> {
  const aggregate: Partial<Record<DnaAxis, number>> = {};

  for (const axis of DNA_AXES) {
    const values = selectedFragrances
      .map((fragrance) => axisValue(fragrance, axis))
      .filter((value): value is number => typeof value === 'number');

    if (values.length > 0) {
      aggregate[axis] = mean(values);
    }
  }

  return aggregate;
}

function deriveDominantAxes(vector: OlfactoryVector): string {
  const labels: Array<{ label: string; value: number }> = [
    { label: 'Freshness', value: toScore(vector.freshness) },
    { label: 'Warmth', value: toScore(vector.warmth) },
    { label: 'Sweetness', value: toScore(vector.sweetness) },
    { label: 'Darkness', value: toScore(vector.darkness) },
    { label: 'Cleanliness', value: toScore(vector.cleanliness) },
    { label: 'Elegance', value: toScore(vector.elegance) },
  ];

  return labels
    .sort((left, right) => right.value - left.value)
    .slice(0, 2)
    .map((item) => item.label)
    .join(' • ');
}

function buildDnaValues(
  vector: OlfactoryVector | null,
  confidence: number,
  selectedAggregate: Partial<Record<DnaAxis, number>>
): Partial<Record<DnaAxis, number>> {
  if (!vector) {
    return selectedAggregate;
  }

  const freshness = toScore(vector.freshness);
  const warmth = toScore(vector.warmth);
  const sweetness = toScore(vector.sweetness);
  const darkness = toScore(vector.darkness);
  const cleanliness = toScore(vector.cleanliness);
  const elegance = toScore(vector.elegance);

  const inferred: Partial<Record<DnaAxis, number>> = {
    Freshness: freshness,
    Warmth: warmth,
    Elegance: elegance,
    Comfort: Math.round(
      cleanliness * DERIVED_AXIS_BASE_WEIGHTS.comfortCleanliness +
        sweetness * DERIVED_AXIS_BASE_WEIGHTS.comfortSweetness
    ),
    Character: Math.round(
      warmth * DERIVED_AXIS_BASE_WEIGHTS.characterWarmth +
        darkness * DERIVED_AXIS_BASE_WEIGHTS.characterDarkness +
        sweetness * DERIVED_AXIS_BASE_WEIGHTS.characterSweetness
    ),
    Presence: confidence,
    Versatility: Math.max(0, Math.min(100, Math.round(100 - (Math.abs(warmth - freshness) / 100) * DERIVED_AXIS_BASE_WEIGHTS.versatilityBalanceScale))),
    Luxury: Math.round((elegance + warmth) / 2),
    Formality: Math.round((elegance + cleanliness) / 2),
  };

  for (const axis of DNA_AXES) {
    if (typeof inferred[axis] !== 'number' && typeof selectedAggregate[axis] === 'number') {
      inferred[axis] = selectedAggregate[axis];
    }
  }

  return inferred;
}

export default function DnaPage() {
  const fragrances = useMemo(() => getAllFragrances(), []);

  const initialSelectedIds = useMemo(
    () => fragrances.slice(0, INITIAL_SELECTION_COUNT).map((fragrance) => fragrance.id || fragrance.name),
    [fragrances]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [dnaSession, setDnaSession] = useState<DNASessionState | null>(null);
  const [userProfile, setUserProfile] = useState<UserDNAProfile | null>(null);

  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const session = loadDnaSession();
        const profile = getOrCreateUserProfile();
        setDnaSession(session);
        setUserProfile(profile);
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

  const selectedFragrances = useMemo(() => {
    const selectedMap = new Set(selectedIds);
    return fragrances.filter((fragrance) => selectedMap.has(fragrance.id || fragrance.name));
  }, [fragrances, selectedIds]);

  const selectedAggregate = useMemo(
    () => buildSelectedAggregate(selectedFragrances),
    [selectedFragrances]
  );

  const activeVector = summary?.finalVector ?? dnaSession?.currentVector ?? userProfile?.dnaVector ?? null;
  const confidence = summary?.confidenceScore ?? userProfile?.confidenceLevel ?? DEFAULT_CONFIDENCE;
  const radarValues = useMemo(
    () => buildDnaValues(activeVector, confidence, selectedAggregate),
    [activeVector, confidence, selectedAggregate]
  );

  const dominantAxes = summary?.dominantAxes?.length
    ? summary.dominantAxes.join(' • ')
    : activeVector
      ? deriveDominantAxes(activeVector)
      : FALLBACK_DOMINANT_AXES;

  const testedCount = summary?.answeredCount ?? dnaSession?.answeredOrder.length ?? DEFAULT_TESTED;
  const remainingCount = Math.max(0, fragrances.length - testedCount) || DEFAULT_REMAINING;
  const stateLabel = summary ? FINAL_STATE_LABEL : FINAL_STATE_LABEL;

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
            Explore the olfactory signature profiles across multiple dimensions.
          </p>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
          <DnaRadar values={radarValues} />
          <FragranceSelector
            fragrances={fragrances}
            selectedIds={selectedIds}
            onToggle={(fragranceId) => {
              setSelectedIds((previous) => {
                if (previous.includes(fragranceId)) {
                  return previous.filter((currentId) => currentId !== fragranceId);
                }
                return [...previous, fragranceId];
              });
            }}
          />
        </section>

        <section className="mt-6">
          <DnaMetrics
            confidence={confidence}
            dominantAxes={dominantAxes}
            testedCount={testedCount}
            remainingCount={remainingCount}
            stateLabel={stateLabel}
          />
        </section>
      </section>
    </main>
  );
}
