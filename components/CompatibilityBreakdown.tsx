'use client';

import React from 'react';
import { ExtendedFragrance } from '@/lib/types';
import { CompatibilityRingIcon } from '@/components/design-system/FragranceIcons';

type CompatibilityBreakdownProps = {
  fragrances: ExtendedFragrance[];
  compatibilityScores: Record<string, number>;
  title?: string;
};

/**
 * Displays compatibility breakdown with current fragrances
 */
export default function CompatibilityBreakdown({
  fragrances = [],
  compatibilityScores = {},
  title = 'Compatibility with Your Collection',
}: CompatibilityBreakdownProps) {
  const scored = fragrances
    .map((f) => ({
      fragrance: f,
      score: compatibilityScores[f.id || f.name || ''] || 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  if (scored.length === 0) {
    return (
      <div className="glass-card p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">
          {title}
        </p>
        <p className="mt-4 text-[rgba(190,170,140,0.65)]">
          No fragrances analyzed yet.
        </p>
      </div>
    );
  }

  const maxScore = Math.max(...scored.map((s) => s.score), 1);

  return (
    <div className="glass-card p-8 space-y-6">
      <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">
        {title}
      </p>

      <div className="space-y-3">
        {scored.map((item, idx) => {
          const barWidth = (item.score / maxScore) * 100;
          const isHighCompat = item.score > 0.7;
          const isMediumCompat = item.score > 0.4;

          return (
            <div key={item.fragrance.id || item.fragrance.name || idx}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-[rgba(212,175,120,0.85)]">
                  {item.fragrance.name || 'Unknown'}
                </p>
                <span className="text-xs text-[rgba(190,170,140,0.65)]">
                  {(item.score * 100).toFixed(0)}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-[rgba(0,0,0,0.3)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isHighCompat
                      ? 'bg-green-500/70'
                      : isMediumCompat
                        ? 'bg-yellow-500/70'
                        : 'bg-orange-500/70'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[rgba(212,175,120,0.15)] pt-4 mt-4">
        <p className="text-xs text-[rgba(190,170,140,0.55)]">
          <span className="inline-flex items-center gap-1.5 mr-2">
            <CompatibilityRingIcon className="h-3.5 w-3.5 text-[rgba(212,175,120,0.9)]" />
            {scored.filter((s) => s.score > 0.7).length} highly compatible
          </span>
          {' · '}
          <span className="inline-flex items-center gap-1.5 mr-2">
            <CompatibilityRingIcon className="h-3.5 w-3.5 text-[rgba(212,175,120,0.68)]" />
            {scored.filter((s) => s.score > 0.4 && s.score <= 0.7).length} compatible
          </span>
          {' · '}
          <span className="inline-flex items-center gap-1.5">
            <CompatibilityRingIcon className="h-3.5 w-3.5 text-[rgba(212,175,120,0.4)]" />
            {scored.filter((s) => s.score <= 0.4).length} explore further
          </span>
        </p>
      </div>
    </div>
  );
}
