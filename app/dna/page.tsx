'use client';

import React, { useState, useMemo, useEffect } from 'react';
import DNAVisualizer from '../../components/DNAVisualizer';
import FragranceCard from '../../components/FragranceCard';
import ConfidenceProgressionChart from '../../components/ConfidenceProgressionChart';
import DominantAxisHighlight from '../../components/DominantAxisHighlight';
import CompatibilityBreakdown from '../../components/CompatibilityBreakdown';
import { getAllFragrances } from '../../engine/dataLoader';
import { getOrCreateUserProfile } from '@/lib/engine/userProfileManager';
import { buildSummary, loadDnaSession } from '@/lib/dnaSession';
import { DNASessionState, OlfactoryVector } from '@/lib/types';

const GROUNDING_AXES = [
  'Freshness',
  'Warmth',
  'Sweetness',
  'Darkness',
  'Cleanliness',
  'Elegance',
];

export default function DNAPage() {
  const all = useMemo(() => getAllFragrances(), []);
  const [selected, setSelected] = useState<string[]>(all.slice(0, 3).map((f: any) => f.id ?? f.name ?? String(Math.random())));
  
  // Extended user profile
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dnaSession, setDnaSession] = useState<DNASessionState | null>(null);
  const [groundingVector, setGroundingVector] = useState<OlfactoryVector | null>(null);
  const [userVector, setUserVector] = useState<OlfactoryVector>({
    freshness: 0.5,
    warmth: 0.5,
    sweetness: 0.5,
    darkness: 0.5,
    cleanliness: 0.5,
    elegance: 0.5,
  });

  useEffect(() => {
    // Load user profile on mount
    try {
      const profile = getOrCreateUserProfile();
      const session = loadDnaSession();
      const storedGroundingVector = window.localStorage.getItem('fragrance_vector');
      setUserProfile(profile);
      setDnaSession(session);
      setUserVector(session.currentVector ?? profile.dnaVector);
      setGroundingVector(storedGroundingVector ? JSON.parse(storedGroundingVector) as OlfactoryVector : null);
    } catch (e) {
      console.warn('Could not load user profile:', e);
    }
  }, []);

  useEffect(() => {
    const syncSession = () => {
      const session = loadDnaSession();
      const storedGroundingVector = window.localStorage.getItem('fragrance_vector');
      setDnaSession(session);
      setUserVector(session.currentVector ?? getOrCreateUserProfile().dnaVector);
      setGroundingVector(storedGroundingVector ? JSON.parse(storedGroundingVector) as OlfactoryVector : null);
    };

    window.addEventListener('fragrance-dna-session-updated', syncSession);
    window.addEventListener('storage', syncSession);

    return () => {
      window.removeEventListener('fragrance-dna-session-updated', syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  const series = selected.map((id, idx) => {
    const f: any = all.find((x: any) => (x.id ?? x.name) === id) || all[idx];
    // map dna_axes array to record; default to 50 if no data
    const rec: Record<string, number> = {};
    (f.dna_axes || []).forEach((a: any) => (rec[a.name] = a.value ?? a.score ?? 50));
    // Fill in default axes with 50 if not present
    const axes = ['Freshness', 'Warmth', 'Complexity', 'Elegance', 'Character', 'Presence', 'Comfort', 'Uniqueness', 'Versatility', 'Luxury', 'Formality'];
    axes.forEach((axis) => {
      if (!(axis in rec)) rec[axis] = 50;
    });
    return { id: id, label: f.name, values: rec, color: idx === 0 ? undefined : `rgba(${120 + idx * 30},${140},${200},0.85)` };
  });

  const activeSummary = useMemo(() => {
    if (!dnaSession) {
      return null;
    }
    return dnaSession.summary ?? buildSummary(dnaSession.currentVector, dnaSession.answers);
  }, [dnaSession]);

  const compatibilityScores = useMemo(() => {
    if (!activeSummary) {
      return userProfile?.compatibilityHeatmap || {};
    }

    return activeSummary.compatibilitySnapshot.reduce((acc, item) => {
      acc[item.fragranceId] = item.score;
      return acc;
    }, {} as Record<string, number>);
  }, [activeSummary, userProfile]);

  const groundingComparisonSeries = useMemo(() => {
    if (!groundingVector) {
      return [];
    }

    return [
      {
        id: 'grounding-vector',
        label: 'Grounding DNA',
        values: {
          Freshness: groundingVector.freshness,
          Warmth: groundingVector.warmth,
          Sweetness: groundingVector.sweetness,
          Darkness: groundingVector.darkness,
          Cleanliness: groundingVector.cleanliness,
          Elegance: groundingVector.elegance,
        },
        color: 'rgba(165,185,150,0.85)',
      },
      {
        id: 'test-vector',
        label: activeSummary?.answeredCount === all.length ? 'Refined Test DNA' : 'Live Test DNA',
        values: {
          Freshness: userVector.freshness,
          Warmth: userVector.warmth,
          Sweetness: userVector.sweetness,
          Darkness: userVector.darkness,
          Cleanliness: userVector.cleanliness,
          Elegance: userVector.elegance,
        },
        color: 'rgba(212,175,120,0.92)',
      },
    ];
  }, [activeSummary?.answeredCount, all.length, groundingVector, userVector]);

  const groundingShift = useMemo(() => {
    if (!groundingVector) {
      return [];
    }

    return [
      { axis: 'Freshness', before: groundingVector.freshness, after: userVector.freshness },
      { axis: 'Warmth', before: groundingVector.warmth, after: userVector.warmth },
      { axis: 'Sweetness', before: groundingVector.sweetness, after: userVector.sweetness },
      { axis: 'Darkness', before: groundingVector.darkness, after: userVector.darkness },
      { axis: 'Cleanliness', before: groundingVector.cleanliness, after: userVector.cleanliness },
      { axis: 'Elegance', before: groundingVector.elegance, after: userVector.elegance },
    ].sort((left, right) => Math.abs(right.after - right.before) - Math.abs(left.after - left.before));
  }, [groundingVector, userVector]);

  return (
    <main className="main-container dna-background">
      <section className="glass p-10 space-y-10">
        <div className="space-y-6 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.48em] text-[rgba(165,185,150,0.85)]"><span className="dna-script-font large">Fragrance</span> DNA</p>
          <h1 className="text-5xl font-light tracking-[0.04em] text-[rgba(212,175,120,0.95)]">DNA Matrix Visualization</h1>
          <p className="text-lg leading-9 text-[rgba(190,170,140,0.65)]">Explore the olfactory signature profiles across multiple dimensions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <article className="glass-card p-8">
              <DNAVisualizer series={series} />
            </article>
          </div>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">Select fragrances</p>
            {all.slice(0, 8).map((f: any) => (
              <div key={f.id ?? f.name} className={`cursor-pointer transition duration-200 ${selected.includes(f.id ?? f.name) ? 'ring-2 ring-[#c7a86b] rounded-[32px]' : ''}`} onClick={() => {
                const key = f.id ?? f.name;
                setSelected((s) => s.includes(key) ? s.filter(x => x !== key) : (s.length < 3 ? [...s, key] : [key]));
              }}>
                <FragranceCard f={f} />
              </div>
            ))}
          </div>
        </div>

        {dnaSession && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <article className="glass-card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[rgba(165,185,150,0.75)]">Confidence</p>
              <p className="mt-3 text-3xl font-semibold text-[rgba(212,175,120,0.95)]">{activeSummary?.confidenceScore ?? 0}%</p>
            </article>
            <article className="glass-card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[rgba(165,185,150,0.75)]">Dominant Axes</p>
              <p className="mt-3 text-lg text-[rgba(212,175,120,0.9)]">{activeSummary?.dominantAxes.join(' • ') || 'Emerging'}</p>
            </article>
            <article className="glass-card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[rgba(165,185,150,0.75)]">Test Influence</p>
              <p className="mt-3 text-lg text-[rgba(212,175,120,0.9)]">{dnaSession.answeredOrder.length} / {all.length} tested</p>
            </article>
            <article className="glass-card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[rgba(165,185,150,0.75)]">State</p>
              <p className="mt-3 text-lg text-[rgba(212,175,120,0.9)]">{dnaSession.summary ? 'Final DNA' : 'Live DNA'}</p>
            </article>
          </div>
        )}
      </section>

      {/* 🧬 EXTENDED DNA PROFILE SECTION */}
      {userProfile && (
        <section className="mt-10 space-y-8">
          {groundingComparisonSeries.length > 0 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <article className="glass-card p-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">Grounding vs Test Refinement</p>
                  <p className="text-sm text-[rgba(190,170,140,0.7)]">
                    Compare the initial scent calibration from grounding with the DNA refined by live test interactions.
                  </p>
                </div>
                <div className="mt-6 flex justify-center overflow-x-auto">
                  <DNAVisualizer series={groundingComparisonSeries} axes={GROUNDING_AXES} size={360} />
                </div>
              </article>

              <article className="glass-card p-8 space-y-5">
                <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">Before / After Axis Shift</p>
                {groundingShift.map((item) => {
                  const delta = item.after - item.before;
                  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'steady';
                  return (
                    <div key={item.axis} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm uppercase tracking-[0.24em] text-[rgba(212,175,120,0.85)]">{item.axis}</p>
                        <p className="text-xs text-[rgba(190,170,140,0.7)]">
                          {direction === 'steady' ? 'Steady' : `${direction === 'up' ? '+' : ''}${(delta * 100).toFixed(0)} pts`}
                        </p>
                      </div>
                      <div className="mt-3 grid grid-cols-[70px_1fr_70px] items-center gap-3 text-sm text-[rgba(190,170,140,0.72)]">
                        <span>Grounding {(item.before * 100).toFixed(0)}</span>
                        <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[rgba(165,185,150,0.75)] to-[rgba(212,175,120,0.9)]" style={{ width: `${Math.max(item.before, item.after) * 100}%` }} />
                        </div>
                        <span className="text-right">Test {(item.after * 100).toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })}
              </article>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dominant Axis */}
            <DominantAxisHighlight vector={userVector} />
            
            {/* Confidence Progression */}
            <ConfidenceProgressionChart
              snapshots={
                dnaSession?.snapshots.map((snapshot) => ({
                  timestamp: snapshot.completedAt,
                  vector: snapshot.vector,
                  confidenceLevel: snapshot.confidenceScore,
                })) || userProfile.identityDriftHistory || []
              }
            />
          </div>

          {/* Compatibility Breakdown */}
          <CompatibilityBreakdown 
            fragrances={all.slice(0, 12)}
            compatibilityScores={compatibilityScores}
          />

          {dnaSession && (
            <article className="glass-card p-8 space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">Test History Influence</p>
              <div className="grid gap-3 lg:grid-cols-2">
                {dnaSession.snapshots.slice(-6).reverse().map((snapshot, index) => (
                  <div key={`${snapshot.fragranceId}-${index}`} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm uppercase tracking-[0.22em] text-[rgba(165,185,150,0.7)]">Step {dnaSession.snapshots.length - index}</p>
                    <p className="mt-2 text-lg text-[rgba(212,175,120,0.92)]">{snapshot.fragranceName}</p>
                    <p className="mt-1 text-sm text-[rgba(190,170,140,0.7)]">Confidence reached {snapshot.confidenceScore}% after this test.</p>
                  </div>
                ))}
              </div>
            </article>
          )}
        </section>
      )}
    </main>
  );
}
