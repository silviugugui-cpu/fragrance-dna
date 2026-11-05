'use client';

import { useId, useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { useLanguage } from '@/lib/i18n';
import { DNA_AXES, type DnaAxis, type DnaAxisValues } from '@/lib/engine/dnaAxes';
export { DNA_AXES, type DnaAxis, type DnaAxisValues } from '@/lib/engine/dnaAxes';

const PREVIEW_BASELINE: Record<DnaAxis, number> = {
  Freshness: 70,
  Warmth: 62,
  Complexity: 58,
  Elegance: 60,
  Character: 56,
  Comfort: 61,
  Uniqueness: 54,
  Versatility: 64,
  Luxury: 57,
  Formality: 59,
};

const PREVIEW_FINAL: Record<DnaAxis, number> = {
  Freshness: 78,
  Warmth: 86,
  Complexity: 72,
  Elegance: 69,
  Character: 81,
  Comfort: 85,
  Uniqueness: 76,
  Versatility: 68,
  Luxury: 82,
  Formality: 65,
};

const MIN_DOMAIN = 0;
const MAX_DOMAIN = 100;

function normalizeScore(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 50;
  }

  const asPercentage = value <= 1 ? value * 100 : value;
  return Math.max(MIN_DOMAIN, Math.min(MAX_DOMAIN, Math.round(asPercentage)));
}

type ChartDatum = {
  axis: DnaAxis;
  baseline: number;
  final: number;
};

type AxisTickProps = {
  x?: number | string;
  y?: number | string;
  payload?: {
    value?: string | number;
  };
  textAnchor?: string;
};

function resolveAxisValue(
  values: DnaAxisValues | null,
  axis: DnaAxis,
  preview: Record<DnaAxis, number>
): number {
  const source = values?.[axis];
  return normalizeScore(typeof source === 'number' ? source : preview[axis]);
}

export default function DnaRadar({
  baselineValues,
  finalValues,
}: {
  baselineValues: DnaAxisValues | null;
  finalValues: DnaAxisValues | null;
}) {
  const chartId = useId().replace(/:/g, '');
  const finalGradientId = `${chartId}-final-gradient`;
  const { t } = useLanguage();

  const baselineProvidedCount = useMemo(
    () => DNA_AXES.filter((axis) => typeof baselineValues?.[axis] === 'number').length,
    [baselineValues]
  );

  const finalProvidedCount = useMemo(
    () => DNA_AXES.filter((axis) => typeof finalValues?.[axis] === 'number').length,
    [finalValues]
  );

  const data = useMemo<ChartDatum[]>(
    () =>
      DNA_AXES.map((axis) => ({
        axis,
        baseline: resolveAxisValue(baselineValues, axis, PREVIEW_BASELINE),
        final: resolveAxisValue(finalValues, axis, PREVIEW_FINAL),
      })),
    [baselineValues, finalValues]
  );

  const finalByAxis = useMemo(
    () => Object.fromEntries(data.map((item) => [item.axis, item.final])) as Record<DnaAxis, number>,
    [data]
  );

  const showWarning = baselineProvidedCount < DNA_AXES.length || finalProvidedCount < DNA_AXES.length;

  return (
    <article className="glass-card p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h2 className="text-sm uppercase tracking-[0.28em] text-[color:var(--public-readable-text,rgba(165,185,150,0.85))]">{t.dna.radar.signatureTitle}</h2>
          <p className="text-sm text-[color:var(--public-readable-text,rgba(210,196,170,0.85))]">
            {t.dna.radar.signatureDescription}
          </p>
        </div>
        <div className="space-y-2 text-xs uppercase tracking-[0.2em] text-[color:var(--public-readable-text,rgba(216,188,134,0.9))]">
          <div className="flex items-center justify-end gap-2">
            <span className="h-0.5 w-5 rounded bg-[rgba(108,196,219,0.96)]" aria-hidden />
            <span className="text-[color:var(--public-readable-text,rgba(188,219,232,0.92))]">{t.dna.radar.groundingBaseline}</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="h-0.5 w-5 rounded bg-[rgba(220,182,110,0.95)]" aria-hidden />
            <span>{t.dna.radar.finalDna}</span>
          </div>
        </div>
      </div>

      {showWarning ? (
        <div className="mt-4 inline-flex items-center rounded-full border border-[rgba(225,170,95,0.4)] bg-[rgba(225,170,95,0.12)] px-3 py-1 text-xs text-[color:var(--public-readable-text,rgba(255,222,170,0.95))]">
          {t.dna.radar.missingDataWarning}
        </div>
      ) : null}

      <div className="mt-6 h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 24, right: 30, bottom: 24, left: 30 }}>
            <defs>
              <radialGradient id={finalGradientId} cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="rgba(237,195,121,0.56)" />
                <stop offset="65%" stopColor="rgba(215,173,99,0.32)" />
                <stop offset="100%" stopColor="rgba(176,133,67,0.14)" />
              </radialGradient>
            </defs>

            <PolarGrid stroke="var(--public-chart-grid,rgba(255,255,255,0.08))" />
            <PolarAngleAxis
              dataKey="axis"
              tickLine={false}
              tick={(props) => {
                const tickProps = props as AxisTickProps;
                const axis = tickProps.payload?.value as DnaAxis | undefined;
                if (!axis) {
                  return null;
                }

                const score = finalByAxis[axis];
                return (
                  <g transform={`translate(${Number(tickProps.x ?? 0)},${Number(tickProps.y ?? 0)})`}>
                    <text
                      textAnchor={(tickProps.textAnchor as 'start' | 'middle' | 'end' | undefined) ?? 'middle'}
                      fill="var(--public-chart-label,rgba(216,199,171,0.95))"
                      fontSize={12}
                      style={{ letterSpacing: '0.04em' }}
                    >
                      <tspan x="0" dy="0">{t.common.axes[axis] ?? axis}</tspan>
                      <tspan x="0" dy="16" fill="var(--public-chart-final,rgba(228,186,112,0.95))">{score}</tspan>
                    </text>
                  </g>
                );
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[MIN_DOMAIN, MAX_DOMAIN]}
              tickCount={5}
              stroke="var(--public-chart-grid,rgba(255,255,255,0.18))"
              tick={{ fill: 'var(--public-chart-label,rgba(201,183,149,0.58))', fontSize: 10 }}
            />

            <Radar
              name={t.dna.radar.groundingBaseline}
              dataKey="baseline"
              stroke="var(--public-chart-baseline,rgba(108,196,219,0.95))"
              fill="rgba(108,196,219,0.08)"
              fillOpacity={0.12}
              strokeWidth={1.3}
              dot={{ r: 2.6, fill: 'rgba(136,212,232,0.96)', stroke: 'rgba(3,18,24,0.8)', strokeWidth: 1 }}
            />
            <Radar
              name={t.dna.radar.finalDna}
              dataKey="final"
              stroke="var(--public-chart-final,rgba(236,191,113,0.98))"
              fill={`url(#${finalGradientId})`}
              fillOpacity={1}
              strokeWidth={2.3}
              dot={{ r: 4, fill: 'rgba(244,204,134,0.95)', stroke: 'rgba(0,0,0,0.42)', strokeWidth: 1 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-xs text-[color:var(--public-readable-text,rgba(185,168,138,0.72))]">{t.dna.radar.scoresRange}</p>
    </article>
  );
}
