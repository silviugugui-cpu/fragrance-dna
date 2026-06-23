"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildSeed } from "@/lib/engine/seedBuilder";
import { buildUserVector } from "@/lib/engine/userVectorBuilder";
import { scoreFragrances } from "@/lib/engine/scoringEngine";
import { loadDnaSession } from "@/lib/dnaSession";
import type { DNASummary } from "@/lib/types";
import db from "@/data/FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json";
import { PageShell, SectionHeader, StatCard, PremiumButton } from "@/components/design-system";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<DNASummary | null>(null);

  useEffect(() => {
    const session = loadDnaSession();
    const grounding = JSON.parse(
      localStorage.getItem("fragrance_grounding") || "{}"
    );

    const seed = buildSeed(grounding);
    const fallbackVector = buildUserVector(seed);
    const vector = session.summary?.finalVector ?? session.currentVector ?? fallbackVector;
    const ranked = scoreFragrances(vector, db);

    setSummary(session.summary ?? null);
    setResults(ranked);
  }, []);

  const topMatches = useMemo(() => {
    if (summary?.compatibilitySnapshot?.length) {
      return summary.compatibilitySnapshot;
    }

    return results.slice(0, 3).map((item) => ({
      fragranceId: item.fragrance.id ?? item.fragrance.name,
      fragranceName: item.fragrance.name,
      score: item.score,
    }));
  }, [results, summary]);

  return (
    <PageShell>
      {/* Hero Section - Identity Revelation */}
      <section className="py-12 md:py-24 mb-4">
        <div className="main-container">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wider text-gold mb-4">REVEALED</p>
            <h1 className="text-5xl md:text-6xl font-light mb-6 text-white">Your Olfactory Identity</h1>
            <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
              A comprehensive mapping of your fragrance DNA. Discover your aligned collection and explore fragrances that resonate with your unique olfactory signature.
            </p>
          </div>
        </div>
      </section>

      {/* Summary Stats Section */}
      {summary && (
        <section className="py-12 md:py-16">
          <div className="main-container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Final Confidence"
                value={`${summary.confidenceScore}%`}
                subtitle="profile certainty"
              />
              <StatCard
                label="Dominant Axes"
                value={summary.dominantAxes.join(" • ")}
                subtitle="key characteristics"
              />
              <StatCard
                label="Tests Completed"
                value={summary.answeredCount.toString()}
                subtitle="fragrances evaluated"
              />
              <StatCard
                label="Profile State"
                value="Complete"
                subtitle="DNA finalized"
              />
            </div>
          </div>
        </section>
      )}

      {/* Top Matches Showcase */}
      {topMatches.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="main-container">
            <SectionHeader
              label="ALIGNED"
              title="Your Top Fragrance Matches"
              description="Fragrances with the highest compatibility to your olfactory DNA profile."
              className="mb-10"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topMatches.map((item, index) => (
                <div key={`${item.fragranceId}-${index}`} className="premium-card-dark p-8 text-center border-t-4 border-t-gold hover:shadow-gold transition-all">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/20 border border-gold/40 mb-4">
                      <span className="text-gold font-bold text-lg">#{index + 1}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{item.fragranceName}</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-6">
                    <span className="text-4xl font-bold text-gold">{(item.score * 100).toFixed(0)}</span>
                    <span className="text-gray-400">% compatible</span>
                  </div>
                  
                  <div className="h-1 bg-black-700 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-1 bg-gradient-to-r from-gold to-warm-400"
                      style={{ width: `${item.score * 100}%` }}
                    />
                  </div>

                  <p className="text-sm text-gray-400">Your DNA alignment score</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Results Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <SectionHeader
            label="EXPLORE"
            title={`All ${results.length} Fragrance Alignments`}
            description="Complete compatibility ranking of fragrances aligned with your olfactory identity."
            className="mb-10"
          />

          <div className="space-y-4">
            {results.map((r, i) => (
              <div
                key={`${r.fragrance.id ?? r.fragrance.name ?? i}`}
                className="premium-card-dark p-6 md:p-8 hover:shadow-gold transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Left: Rank and Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex-shrink-0">
                        <span className="text-gold font-semibold">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Rank {i + 1}</p>
                        <h3 className="text-lg md:text-xl font-bold text-white truncate">{r.fragrance.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 ml-14">{r.fragrance.brand || "Maison Fragrance"}</p>
                  </div>

                  {/* Right: Score */}
                  <div className="flex-shrink-0 text-right md:text-left">
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Compatibility Score</p>
                    <div className="flex items-baseline gap-2 justify-end md:justify-start">
                      <span className="text-3xl font-bold text-gold">{(r.score * 100).toFixed(1)}</span>
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-2 bg-black-700 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-gold to-warm-400 transition-all"
                    style={{ width: `${r.score * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action Section */}
      <section className="py-12 md:py-16 mb-8">
        <div className="main-container">
          <div className="premium-card-dark p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Refine Your Collection?</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              View your complete DNA profile, explore your territory affinities, and begin curating fragrances aligned with your olfactory identity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={summary ? "/dna" : "/test"}>
                <PremiumButton variant="primary" size="lg">
                  {summary ? "View DNA Profile" : "Continue Testing"}
                </PremiumButton>
              </Link>
              <Link href="/collection">
                <PremiumButton variant="secondary" size="lg">
                  Open Collection
                </PremiumButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
