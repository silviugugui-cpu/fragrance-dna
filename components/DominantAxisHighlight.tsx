'use client';

import React from 'react';
import { OlfactoryVector } from '@/lib/types';

const AXIS_DESCRIPTIONS: Record<string, string> = {
  freshness: 'Bright, airy, and energizing notes that spark joy',
  warmth: 'Cozy, embracing scents that feel like home',
  sweetness: 'Indulgent, gourmand accords that comfort and delight',
  darkness: 'Deep, mysterious notes with intrigue and depth',
  cleanliness: 'Pure, pristine textures that feel fresh and virtuous',
  elegance: 'Refined, sophisticated qualities with understated luxury',
};

type DominantAxisHighlightProps = {
  vector: OlfactoryVector;
  title?: string;
};

/**
 * Highlights the dominant olfactory axis from user vector
 */
export default function DominantAxisHighlight({
  vector,
  title = 'Your Dominant Olfactory Axis',
}: DominantAxisHighlightProps) {
  const axes: (keyof OlfactoryVector)[] = [
    'freshness',
    'warmth',
    'sweetness',
    'darkness',
    'cleanliness',
    'elegance',
  ];

  const axisScores = axes.map((axis) => ({
    axis,
    value: vector[axis] ?? 0.5,
    distance: Math.abs((vector[axis] ?? 0.5) - 0.5),
  }));

  const dominant = axisScores.reduce((max, curr) => 
    curr.distance > max.distance ? curr : max
  );

  const secondary = axisScores
    .filter((a) => a.axis !== dominant.axis)
    .sort((a, b) => b.distance - a.distance)[0];

  const dominantName = dominant.axis.charAt(0).toUpperCase() + dominant.axis.slice(1);
  const secondaryName = secondary?.axis.charAt(0).toUpperCase() + secondary?.axis.slice(1);

  // Determine if primary is high or low
  const isHighPrimary = dominant.value > 0.5;
  const isHighSecondary = secondary && secondary.value > 0.5;

  const primaryIntensity = (dominant.distance * 100).toFixed(0);
  const secondaryIntensity = secondary ? (secondary.distance * 100).toFixed(0) : '0';

  return (
    <div className="glass-card p-8 space-y-6">
      <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">
        {title}
      </p>

      {/* Primary axis */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-light text-[rgba(212,175,120,0.95)]">
            {dominantName}
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-[rgba(190,170,140,0.65)]">
            {isHighPrimary ? 'High affinity' : 'Low preference'}
          </span>
        </div>

        <p className="text-sm text-[rgba(190,170,140,0.7)] leading-6">
          {AXIS_DESCRIPTIONS[dominant.axis]}
        </p>

        {/* Intensity bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[rgba(165,185,150,0.6)]">Intensity</span>
            <span className="text-xs font-semibold text-[rgba(212,175,120,0.8)]">
              {primaryIntensity}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-[rgba(0,0,0,0.3)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[rgba(212,175,120,0.6)] to-[rgba(212,175,120,0.95)]"
              style={{ width: `${dominant.distance * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary axis */}
      {secondary && (
        <div className="border-t border-[rgba(212,175,120,0.15)] pt-4">
          <div className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-light text-[rgba(212,175,120,0.75)]">
                {secondaryName}
              </span>
              <span className="text-xs text-[rgba(190,170,140,0.55)]">
                {isHighSecondary ? 'Secondary high' : 'Secondary low'}
              </span>
            </div>

            <p className="text-xs text-[rgba(190,170,140,0.65)]">
              {AXIS_DESCRIPTIONS[secondary.axis]}
            </p>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[rgba(165,185,150,0.6)]">Influence</span>
                <span className="text-xs text-[rgba(212,175,120,0.7)]">
                  {secondaryIntensity}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-[rgba(0,0,0,0.2)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[rgba(212,175,120,0.5)]"
                  style={{ width: `${secondary.distance * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile hint */}
      <div className="rounded-lg bg-[rgba(212,175,120,0.08)] p-4 border border-[rgba(212,175,120,0.1)]">
        <p className="text-xs text-[rgba(190,170,140,0.7)] leading-5">
          💡 This axis shows your strongest olfactory signature. Perfect fragrances will 
          either amplify this or introduce meaningful contrasts.
        </p>
      </div>
    </div>
  );
}
