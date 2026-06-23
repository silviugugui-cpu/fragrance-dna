"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadDnaSession, loadGroundingVector } from "@/lib/dnaSession";
import { getOrCreateUserProfile } from "@/lib/engine/userProfileManager";
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
    <main className="main-container page-background">
      <section className="glass p-10 space-y-10">
        <div className="space-y-6 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.48em] text-[rgba(165,185,150,0.85)]">Live Identity Dashboard</p>
          <h1 className="text-5xl font-light tracking-[0.04em] text-[rgba(212,175,120,0.95)]">Profiles sync with your latest DNA</h1>
          <p className="max-w-2xl text-lg leading-9 text-[rgba(190,170,140,0.65)]">
            This page reads the active state from grounding and test flow in real time and reflects your latest olfactory identity.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <article className="glass-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Confidence level</p>
            <p className="mt-3 text-3xl font-semibold text-[rgba(212,175,120,0.95)]">{confidence}%</p>
          </article>
          <article className="glass-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Evolution stage</p>
            <p className="mt-3 text-xl text-[rgba(212,175,120,0.95)] capitalize">{evolutionStage}</p>
          </article>
          <article className="glass-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Tests influence</p>
            <p className="mt-3 text-3xl font-semibold text-[rgba(212,175,120,0.95)]">{snapshotCount}</p>
          </article>
          <article className="glass-card p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Last refresh</p>
            <p className="mt-3 text-sm text-[rgba(212,175,120,0.9)]">
              {refreshedAt ? new Date(refreshedAt).toLocaleTimeString() : "--:--:--"}
            </p>
          </article>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="glass-card p-8 space-y-5">
            <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">Current DNA vector</p>
            {vector ? (
              (Object.keys(vector) as Array<keyof OlfactoryVector>).map((axis) => (
                <div key={axis}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[rgba(212,175,120,0.85)]">{axisLabel(axis)}</span>
                    <span className="text-xs text-[rgba(190,170,140,0.7)]">{formatPercent(vector[axis])}</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[rgba(165,185,150,0.75)] to-[rgba(212,175,120,0.9)]"
                      style={{ width: `${Math.round(vector[axis] * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[rgba(190,170,140,0.65)]">No DNA vector found yet. Start with grounding then continue to test flow.</p>
            )}
          </article>

          <article className="glass-card p-8 space-y-5">
            <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">Latest test result influence</p>
            {latestInfluence ? (
              <>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Most recent fragrance</p>
                  <p className="mt-2 text-2xl text-[rgba(212,175,120,0.95)]">{latestInfluence.fragranceName}</p>
                  <p className="mt-2 text-sm text-[rgba(190,170,140,0.72)]">Confidence after this step: {latestInfluence.confidenceScore}%</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Dominant axes</p>
                  <p className="mt-2 text-sm text-[rgba(212,175,120,0.9)]">{dominantAxes.join(" • ") || "Emerging"}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-[rgba(190,170,140,0.65)]">No test influence yet. Run at least one fragrance step in test flow.</p>
            )}

            {groundingVector && (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Grounding state detected</p>
                <p className="mt-2 text-sm text-[rgba(190,170,140,0.72)]">
                  Grounding vector is available and synced into the shared DNA state.
                </p>
              </div>
            )}
          </article>
        </div>

        <div className="rounded-[32px] bg-[rgba(20,22,24,0.6)] border border-[rgba(212,175,120,0.15)] p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm uppercase tracking-[0.28em] text-[rgba(165,185,150,0.85)]">Debug controls</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={refreshData}
                className="inline-flex items-center justify-center rounded-full border border-[#c7a86b]/30 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#e7dfd1] transition duration-300 hover:border-[#c7a86b] hover:bg-white/10"
              >
                Refresh DNA
              </button>
              <Link
                href="/test"
                className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(212,175,120,0.9),rgba(186,153,110,0.88))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#1A1A1A] shadow-[0_16px_60px_rgba(212,175,120,0.14)] transition duration-300 hover:brightness-110"
              >
                Continue test flow
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
