'use client';

import React from 'react';
import type { Fragrance } from '@/lib/types';

export default function FragranceCard({ f }: { f: Fragrance }) {
  const topAxes = (f.dna_axes || []).slice().sort((a, b) => (b.value ?? 0) - (a.value ?? 0)).slice(0, 3).map((x) => x.name);
  const topSemantic = f.semantic_v1 ? Object.entries(f.semantic_v1).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3).map(([k]) => k) : [];

  return (
    <div className="glass-card p-4 w-full max-w-sm">
      <h3 className="text-lg font-semibold text-white">{f.name}</h3>
      <p className="text-sm text-gray-300">{f.brand ?? ''} — {f.year ?? ''}</p>
      <div className="mt-3 text-sm text-gray-200">
        <strong><span className="dna-script-font">Top</span> DNA:</strong> {topAxes.join(', ')}
      </div>
      <div className="mt-1 text-sm text-gray-200">
        <strong>Top Semantic:</strong> {topSemantic.join(', ')}
      </div>
    </div>
  );
}
