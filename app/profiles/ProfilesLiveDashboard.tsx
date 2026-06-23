"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadDnaSession, loadGroundingVector } from "@/lib/dnaSession";
import { getOrCreateUserProfile } from "@/lib/engine/userProfileManager";
import { PageShell, SectionHeader, StatCard, PremiumButton } from "@/components/design-system";
import { territories } from "@/lib/data/territories";
import type { DNASessionState, OlfactoryVector, UserDNAProfile } from "@/lib/types";

function formatPercent(value: number): string {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

function axisLabel(axis: keyof OlfactoryVector): string {
  return axis.charAt(0).toUpperCase() + axis.slice(1);
}

export default function ProfilesLiveDashboard() {
  const [session, setSession] = useState<DNASessionState | null>(null);
  const [profile, setProfile] = useState<UserDNAProfile | null>(null);
  const [groundingVector, setGroundingVector] = useState<OlfactoryVector | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null);

  const refreshData = useCallback(() => {
    setSession(loadDnaSession());
    setProfile(getOrCreateUserProfile());
    setGroundingVector(loadGroundingVector());
    setRefreshedAt(Date.now());
  }, []);

  useEffect(() => {
    refreshData();

    const handleLiveUpdate = () => refreshData();
    window.addEventListener("fragrance-dna-session-updated", handleLiveUpdate);
    window.addEventListener("fragrance-user-profile-updated", handleLiveUpdate);
    window.addEventListener("storage", handleLiveUpdate);

    return () => {
      window.removeEventListener("fragrance-dna-session-updated", handleLiveUpdate);
      window.removeEventListener("fragrance-user-profile-updated", handleLiveUpdate);
      window.removeEventListener("storage", handleLiveUpdate);
    };
  }, [refreshData]);

  const vector = session?.summary?.finalVector ?? session?.currentVector ?? profile?.dnaVector ?? null;
  const confidence = session?.summary?.confidenceScore ?? profile?.confidenceLevel ?? 0;
  const evolutionStage = profile?.evolutionStage ?? "early";

  const dominantAxes = useMemo(() => {
    if (!vector) {
      return [];
    }

    return (Object.keys(vector) as Array<keyof OlfactoryVector>)
      .map((axis) => ({ axis, distance: Math.abs(vector[axis] - 0.5) }))
      .sort((left, right) => right.distance - left.distance)
      .slice(0, 3)
      .map(({ axis }) => axisLabel(axis));
  }, [vector]);

  const latestInfluence = session?.snapshots?.at(-1);
  const snapshotCount = session?.snapshots?.length ?? 0;

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="py-12 md:py-20 mb-4">
        <div className="main-container">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-wider text-gold mb-4">DISCOVER</p>
            <h1 className="text-4xl md:text-5xl font-light mb-6 text-white">Your Profile Explorer</h1>
            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
              Real-time reflection of your olfactory identity. Your profile syncs continuously with grounding baselines and test discoveries, evolving as you explore.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Confidence Level"
              value={`${confidence}%`}
              subtitle="DNA profile certainty"
            />
            <StatCard
              label="Evolution Stage"
              value={evolutionStage.charAt(0).toUpperCase() + evolutionStage.slice(1)}
              subtitle="Profile maturity"
            />
            <StatCard
              label="Tests Influence"
              value={snapshotCount.toString()}
              subtitle="Fragrance evaluations"
            />
            <StatCard
              label="Last Refresh"
              value={refreshedAt ? new Date(refreshedAt).toLocaleTimeString() : "--:--:--"}
              subtitle="Data sync time"
            />
          </div>
        </div>
      </section>

      {/* DNA Vector Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <SectionHeader
            label="ANALYZE"
            title="Current DNA Vector"
            description="Your olfactory signature across 11 signature dimensions, expressed as values from 0 (low presence) to 100 (very high presence)."
            className="mb-8"
          />

          {vector ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(Object.keys(vector) as Array<keyof OlfactoryVector>).map((axis) => (
                <div key={axis} className="premium-card-dark p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-white">{axisLabel(axis)}</span>
                    <span className="text-sm text-gold font-medium">{formatPercent(vector[axis])}</span>
                  </div>
                  <div className="h-3 rounded-full bg-black-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold to-warm-400 transition-all duration-500"
                      style={{ width: `${Math.round(vector[axis] * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="premium-card-dark p-8 text-center">
              <p className="text-gray-400">No DNA vector found yet. Start with grounding then continue to test flow.</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Test Result Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <SectionHeader
            label="INSIGHTS"
            title="Latest Test Influence"
            description="How your most recent fragrance evaluation shaped your DNA profile."
            className="mb-8"
          />

          {latestInfluence ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="premium-card-dark p-8">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Most Recent Fragrance</p>
                <h3 className="text-2xl font-bold text-white mb-4">{latestInfluence.fragranceName}</h3>
                <p className="text-sm text-gray-300 mb-6">
                  Confidence after this evaluation: <span className="text-gold font-semibold">{latestInfluence.confidenceScore}%</span>
                </p>
                <div className="h-1 bg-gradient-to-r from-gold to-transparent rounded-full" />
              </div>

              <div className="premium-card-dark p-8">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Dominant Axes</p>
                <p className="text-lg text-gold font-semibold mb-4">
                  {dominantAxes.length > 0 ? dominantAxes.join(" • ") : "Emerging"}
                </p>
                {groundingVector && (
                  <p className="text-sm text-gray-400 mt-6">
                    ✓ Grounding baseline detected and synced into your DNA profile.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="premium-card-dark p-8 text-center">
              <p className="text-gray-400">No test influence yet. Run at least one fragrance evaluation in the test flow to populate this section.</p>
            </div>
          )}
        </div>
      </section>

      {/* Territory Affinities Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <SectionHeader
            label="EXPLORE"
            title="Territory Affinities"
            description="Fragrance territories that align with your current olfactory profile."
            className="mb-8"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(territories).slice(0, 6).map((territory) => (
              <div key={territory.id} className="premium-card-dark p-6 cursor-pointer hover:shadow-gold transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: territory.color }} />
                  <h4 className="font-bold text-white">{territory.name}</h4>
                </div>
                <p className="text-sm text-gray-400 mb-4">{territory.description.slice(0, 100)}...</p>
                <div className="flex gap-2 flex-wrap">
                  {territory.dnaAxes.slice(0, 2).map((axis) => (
                    <span key={axis} className="text-xs bg-black-700 text-gold px-2 py-1 rounded-sm">
                      {axis}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/territories">
              <PremiumButton variant="secondary" size="lg">
                Explore All Territories
              </PremiumButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Action Section */}
      <section className="py-12 md:py-16 mb-8">
        <div className="main-container">
          <div className="premium-card-dark p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Continue Your Olfactory Journey</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Discover more fragrances to refine your DNA profile. Each test brings you closer to understanding your complete olfactory identity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PremiumButton onClick={refreshData} variant="secondary" size="lg">
                Refresh Profile
              </PremiumButton>
              <Link href="/test">
                <PremiumButton variant="primary" size="lg">
                  Continue Testing
                </PremiumButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
