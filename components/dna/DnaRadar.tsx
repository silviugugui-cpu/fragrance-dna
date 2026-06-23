'use client';

import { useMemo, useId } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export const DNA_AXES = [
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
] as const;

export type DnaAxis = (typeof DNA_AXES)[number];

type DnaValues = Partial<Record<DnaAxis, number>>;

type AxisDatum = {
  axis: DnaAxis;
  value: number;
};

type AxisTickProps = {
  x?: number | string;
  y?: number | string;
  payload?: {
    value?: string | number;
  };
  textAnchor?: string;
};

const PREVIEW_VALUES: Record<DnaAxis, number> = {
  Freshness: 78,
  Warmth: 86,
  Complexity: 72,
  Elegance: 69,
  Character: 81,
  Presence: 74,
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

  const inPercentage = value <= 1 ? value * 100 : value;
  return Math.max(MIN_DOMAIN, Math.min(MAX_DOMAIN, Math.round(inPercentage)));
}

function buildRadarData(values: DnaValues): {
  data: AxisDatum[];
  hasLiveData: boolean;
  warningText: string | null;
} {
  const providedKeys = DNA_AXES.filter((axis) => typeof values[axis] === 'number');
  const hasLiveData = providedKeys.length > 0;

  const data = DNA_AXES.map((axis) => ({
    axis,
    value: normalizeScore((values[axis] as number | undefined) ?? PREVIEW_VALUES[axis]),
  }));

  if (!hasLiveData) {
    return {
      data,
      hasLiveData,
      warningText: 'Preview DNA values are shown until live profile data is available.',
    };
  }

  if (providedKeys.length < DNA_AXES.length) {
    return {
      data,
      hasLiveData,
      warningText: 'Partial DNA data detected. Missing axes were completed with calibrated preview values.',
    };
  }

  return {
    data,
    hasLiveData,
    warningText: null,
  };
}

export default function DnaRadar({
  values,
}: {
  values: DnaValues;
}) {
  const chartId = useId().replace(/:/g, '');
  const gradientId = `${chartId}-dna-radar-gradient`;

  const { data, warningText } = useMemo(() => buildRadarData(values), [values]);
  const scoreByAxis = useMemo(
    () => Object.fromEntries(data.map((item) => [item.axis, item.value])) as Record<DnaAxis, number>,
    [data]
  );

  return (
    <article className="glass-card p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h2 className="text-sm uppercase tracking-[0.28em] text-[rgba(165,185,150,0.85)]">YOUR DNA SIGNATURE</h2>
          <p className="text-sm text-[rgba(210,196,170,0.85)]">Your unique olfactory profile across 11 signature dimensions.</p>
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[rgba(216,188,134,0.9)]">
          <span className="h-0.5 w-5 rounded bg-[rgba(220,182,110,0.95)]" aria-hidden />
          <div className="flex flex-col leading-tight text-right">
            <span>Your DNA</span>
            <span className="text-[rgba(190,170,140,0.78)]">11-D Axis Profile</span>
          </div>
        </div>
      </div>

      {warningText ? (
        <div className="mt-4 inline-flex items-center rounded-full border border-[rgba(225,170,95,0.4)] bg-[rgba(225,170,95,0.12)] px-3 py-1 text-xs text-[rgba(255,222,170,0.95)]">
          {warningText}
        </div>
      ) : null}

      <div className="mt-6 h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 24, right: 30, bottom: 24, left: 30 }}>
            <defs>
              <radialGradient id={gradientId} cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="rgba(237,195,121,0.56)" />
                <stop offset="65%" stopColor="rgba(215,173,99,0.32)" />
                <stop offset="100%" stopColor="rgba(176,133,67,0.14)" />
              </radialGradient>
            </defs>

            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="axis"
              tickLine={false}
              tick={(props) => {
                const tickProps = props as AxisTickProps;
                const axis = tickProps.payload?.value as DnaAxis | undefined;
                if (!axis) {
                  return null;
                }

                const score = scoreByAxis[axis];
                return (
                  <g transform={`translate(${Number(tickProps.x ?? 0)},${Number(tickProps.y ?? 0)})`}>
                    <text
                      textAnchor={(tickProps.textAnchor as 'start' | 'middle' | 'end' | undefined) ?? 'middle'}
                      fill="rgba(216,199,171,0.95)"
                      fontSize={12}
                      style={{ letterSpacing: '0.04em' }}
                    >
                      <tspan x="0" dy="0">{axis}</tspan>
                      <tspan x="0" dy="16" fill="rgba(228,186,112,0.95)">{score}</tspan>
                    </text>
                  </g>
                );
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[MIN_DOMAIN, MAX_DOMAIN]}
              tickCount={5}
              stroke="rgba(255,255,255,0.18)"
              tick={{ fill: 'rgba(201,183,149,0.58)', fontSize: 10 }}
            />
            <Radar
              name="Your DNA"
              dataKey="value"
              stroke="rgba(236,191,113,0.98)"
              fill={`url(#${gradientId})`}
              fillOpacity={1}
              strokeWidth={2.2}
              dot={{ r: 4, fill: 'rgba(244,204,134,0.95)', stroke: 'rgba(0,0,0,0.42)', strokeWidth: 1 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-xs text-[rgba(185,168,138,0.72)]">Scores range from 0 (low presence) to 100 (very high presence).</p>
    </article>
  );
}
