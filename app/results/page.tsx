"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildSeed } from "@/lib/engine/seedBuilder";
import { buildUserVector } from "@/lib/engine/userVectorBuilder";
import { scoreFragrances } from "@/lib/engine/scoringEngine";
import { loadDnaSession } from "@/lib/dnaSession";
import type { DNASummary } from "@/lib/types";
import db from "@/data/FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json";

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
    <main className="main-container">
      <section className="glass p-10">
        <div className="space-y-8">
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.5em] text-[#b59f70]/70">
              Mapping Report
            </p>
            <h1 className="text-5xl font-light tracking-[0.04em] text-white">
              Your aligned <span className="dna-script-font large">scent</span> DNA results
            </h1>
            <p className="max-w-2xl leading-8 text-[#d5c9b8]/85">
              A structured set of compatibility mappings derived from your olfactory fingerprint.
            </p>
          </div>

          {summary && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <article className="rounded-[28px] bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
                <p className="text-xs uppercase tracking-[0.3em] text-[#b59f70]/70">Final confidence</p>
                <p className="mt-3 text-3xl font-semibold text-white">{summary.confidenceScore}%</p>
              </article>
              <article className="rounded-[28px] bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
                <p className="text-xs uppercase tracking-[0.3em] text-[#b59f70]/70">Dominant axes</p>
                <p className="mt-3 text-lg text-[#e7dfd1]">{summary.dominantAxes.join(" • ")}</p>
              </article>
              <article className="rounded-[28px] bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
                <p className="text-xs uppercase tracking-[0.3em] text-[#b59f70]/70">Tests completed</p>
                <p className="mt-3 text-3xl font-semibold text-white">{summary.answeredCount}</p>
              </article>
              <article className="rounded-[28px] bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
                <p className="text-xs uppercase tracking-[0.3em] text-[#b59f70]/70">Profile state</p>
                <p className="mt-3 text-lg text-[#e7dfd1]">Final DNA generated</p>
              </article>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-[#b59f70]/80">
                Alignments found
              </p>
              <p className="text-2xl font-semibold text-white">{results.length}</p>
            </div>

            <Link
              href={summary ? "/dna" : "/test"}
              className="inline-flex items-center justify-center rounded-full border border-[#c7a86b]/30 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#e7dfd1] transition duration-300 hover:border-[#c7a86b] hover:bg-white/10"
            >
              {summary ? "Open DNA profile" : "Continue mapping"}
            </Link>
          </div>

          {topMatches.length > 0 && (
            <div className="rounded-[32px] bg-white/5 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
              <p className="text-sm uppercase tracking-[0.32em] text-[#b59f70]/80">
                Compatibility snapshot
              </p>
              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {topMatches.map((item, index) => (
                  <div key={`${item.fragranceId}-${index}`} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#b59f70]/70">Top match {index + 1}</p>
                    <p className="mt-2 text-lg text-white">{item.fragranceName}</p>
                    <p className="mt-2 text-sm text-[#d5c9b8]/80">Compatibility {(item.score * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-6">
        {results.map((r, i) => (
          <article
            key={`${r.fragrance.id ?? r.fragrance.name ?? i}`}
            className="glass-card group overflow-hidden p-8 transition duration-500 hover:-translate-y-1 hover:shadow-[0_32px_90px_rgba(199,168,107,0.20)]"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-[#b59f70]/60">
                  Rank {i + 1}
                </p>
                <h2 className="text-3xl font-light tracking-[0.02em] text-white">
                  {r.fragrance.name}
                </h2>
                <p className="text-sm text-[#cfc3aa]">
                  {r.fragrance.brand || "Maison Fragrance"}
                </p>
              </div>

              <div className="rounded-full border border-[#c7a86b]/15 bg-[#c7a86b]/10 px-5 py-3 text-right text-[#d7c69f] shadow-[inset_0_0_0_1px_rgba(199,168,107,0.08)]">
                <p className="text-xs uppercase tracking-[0.36em] text-[#b59f70]/80">
                  Score
                </p>
                <p className="text-3xl font-semibold text-[#f4e8c2]">
                  {(r.score * 100).toFixed(1)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
