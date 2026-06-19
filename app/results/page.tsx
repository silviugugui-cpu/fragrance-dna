"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildSeed } from "@/lib/engine/seedBuilder";
import { buildUserVector } from "@/lib/engine/userVectorBuilder";
import { scoreFragrances } from "@/lib/engine/scoringEngine";
import db from "@/data/FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const grounding = JSON.parse(
      localStorage.getItem("fragrance_grounding") || "{}"
    );

    const seed = buildSeed(grounding);
    const vector = buildUserVector(seed);
    const ranked = scoreFragrances(vector, db);

    setResults(ranked);
  }, []);

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

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-[#b59f70]/80">
                Alignments found
              </p>
              <p className="text-2xl font-semibold text-white">{results.length}</p>
            </div>

            <Link
              href="/test"
              className="inline-flex items-center justify-center rounded-full border border-[#c7a86b]/30 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#e7dfd1] transition duration-300 hover:border-[#c7a86b] hover:bg-white/10"
            >
              Continue mapping
            </Link>
          </div>
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
