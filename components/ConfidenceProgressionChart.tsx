'use client';

import React from 'react';
import { DriftSnapshot } from '@/lib/types';

type ConfidenceProgressionChartProps = {
  snapshots: DriftSnapshot[];
  title?: string;
};

/**
 * Displays confidence level progression over time and evolution stage
 */
export default function ConfidenceProgressionChart({
  snapshots = [],
  title = 'Confidence & Stability Progression',
}: ConfidenceProgressionChartProps) {
  if (snapshots.length === 0) {
    return (
      <div className="glass-card p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">
          {title}
        </p>
        <p className="mt-4 text-[rgba(190,170,140,0.65)]">
          No evolution data yet. Start by grounding your scent identity.
        </p>
      </div>
    );
  }

  const maxConfidence = Math.max(...snapshots.map((s) => s.confidenceLevel), 100);
  const chartHeight = 200;
  const chartWidth = Math.max(300, snapshots.length * 30);

  // Normalize snapshots to chart dimensions
  const points = snapshots.map((snapshot, idx) => {
    const x = (idx / Math.max(1, snapshots.length - 1)) * (chartWidth - 40) + 20;
    const y =
      chartHeight -
      ((snapshot.confidenceLevel / maxConfidence) * (chartHeight - 40) + 20);
    return {
      x,
      y,
      confidence: snapshot.confidenceLevel,
      timestamp: snapshot.timestamp,
    };
  });

  const pathData = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');

  const firstConfidence = points[0].confidence;
  const lastConfidence = points[points.length - 1].confidence;
  const trend = points.length < 2
    ? 'stable'
    : lastConfidence > firstConfidence
      ? 'up'
      : lastConfidence < firstConfidence
        ? 'down'
        : 'stable';

  return (
    <div className="glass-card p-8 space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">
          {title}
        </p>
        <p className="text-[rgba(190,170,140,0.65)] text-sm">
          {snapshots.length} interactions • Trend: <span className={trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-orange-400' : 'text-blue-400'}>{trend}</span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="text-[rgba(212,175,120,0.5)]">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={`grid-${ratio}`}
              x1={20}
              y1={chartHeight - ratio * (chartHeight - 40) - 20}
              x2={chartWidth - 20}
              y2={chartHeight - ratio * (chartHeight - 40) - 20}
              stroke="rgba(165,185,150,0.1)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}

          {/* Path */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={`point-${i}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="rgba(212,175,120,0.8)"
              opacity={i === points.length - 1 ? 1 : 0.6}
            />
          ))}

          <defs>
            <linearGradient id="progressGradient" x1="0" x2="1">
              <stop offset="0%" stopColor="rgba(165,185,150,0.6)" />
              <stop offset="100%" stopColor="rgba(212,175,120,0.95)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Starting</p>
          <p className="text-xl font-semibold text-[rgba(212,175,120,0.95)]">
            {points[0].confidence.toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Current</p>
          <p className="text-xl font-semibold text-[rgba(212,175,120,0.95)]">
            {points[points.length - 1].confidence.toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
