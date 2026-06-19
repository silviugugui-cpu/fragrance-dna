"use client";

import React, { useMemo } from 'react';

type Series = {
  id: string;
  label?: string;
  values: Record<string, number>;
  color?: string;
};

const DEFAULT_AXES = [
  'Freshness',
  'Warmth',
  'Complexity',
  'Elegance',
  'Character',
  'Presence',
  'Comfort',
  'Uniqueness',
  'Versatility',
  'Luxury',
  'Formality',
];

function normalizeValue(v: unknown) {
  const n = Number(v) || 0;
  if (n > 1) return Math.min(1, n / 100);
  return Math.max(0, Math.min(1, n));
}

function polygonPoints(centerX: number, centerY: number, radius: number, values: number[]) {
  const points: string[] = [];
  const n = values.length;
  for (let i = 0; i < n; i++) {
    const angle = ((Math.PI * 2) / n) * i - Math.PI / 2; // start at top
    const r = radius * values[i];
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

export default function DNAVisualizer({
  series,
  axes = DEFAULT_AXES,
  size = 420,
}: {
  series: Series[];
  axes?: string[];
  size?: number;
}) {
  const computed = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.38;

    const rings = [0.25, 0.5, 0.75, 1].map((r) => ({ r: radius * r }));

    const axisCount = axes.length;

    const axesGeom = axes.map((a, i) => {
      const angle = ((Math.PI * 2) / axisCount) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const lx = cx + Math.cos(angle) * (radius + 18);
      const ly = cy + Math.sin(angle) * (radius + 18);
      const textAnchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
      return { name: a, x, y, lx, ly, textAnchor };
    });

    const seriesGeom = series.map((s, idx) => {
      const vals = axes.map((ax) => normalizeValue((s.values as any)[ax] ?? (s.values as any)[ax.toLowerCase()] ?? 50));
      const nodes = vals.map((v, i) => {
        const angle = ((Math.PI * 2) / axisCount) * i - Math.PI / 2;
        const r = radius * v;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return { x, y };
      });
      const pointsStr = nodes.map((p) => `${p.x},${p.y}`).join(' ');
      const color = s.color ?? (idx === 0 ? 'url(#lineGrad)' : `rgba(${(60 + idx * 40) % 255},${120},${180},0.75)`);
      return { id: s.id, label: s.label, color, pointsStr, nodes };
    });

    return { cx, cy, radius, rings, axesGeom, seriesGeom };
  }, [series, axes, size]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Fragrance DNA visualization">
      <defs>
        <linearGradient id="lineGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="#c7a86b" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d0b478" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* rings */}
      {computed.rings.map((r, i) => (
        <circle key={i} cx={computed.cx} cy={computed.cy} r={r.r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
      ))}

      {/* axes lines & labels */}
      {computed.axesGeom.map((g) => (
        <g key={g.name}>
          <line x1={computed.cx} y1={computed.cy} x2={g.x} y2={g.y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          <text x={g.lx} y={g.ly} fill="#d9d1c3" fontSize={11} textAnchor={g.textAnchor as any} dominantBaseline="middle">
            {g.name}
          </text>
        </g>
      ))}

      {/* series polygons */}
      {computed.seriesGeom.map((s) => (
        <g key={s.id}>
          <polygon points={s.pointsStr} fill={s.color} fillOpacity={0.12} stroke={s.color} strokeWidth={2} strokeOpacity={0.9} />
          {s.nodes.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill={s.color} />
          ))}
        </g>
      ))}
    </svg>
  );
}
