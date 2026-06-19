'use client';

import React, { useState, useMemo } from 'react';
import DNAVisualizer from '../../components/DNAVisualizer';
import FragranceCard from '../../components/FragranceCard';
import { getAllFragrances } from '../../engine/dataLoader';

export default function DNAPage() {
  const all = useMemo(() => getAllFragrances(), []);
  const [selected, setSelected] = useState<string[]>(all.slice(0, 3).map((f: any) => f.id ?? f.name ?? String(Math.random())));

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
      </section>
    </main>
  );
}
