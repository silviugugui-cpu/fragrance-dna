import { territories, type Territory } from '../data/territories';
import { DNA_AXES, type DnaAxis, type DnaAxisValues } from './dnaAxes';

export interface TerritoryAffinity {
  territory: Territory;
  score: number;
  contributions: Array<{ axis: DnaAxis; score: number }>;
}

export function calculateTerritoryAffinities(values: DnaAxisValues | null): TerritoryAffinity[] {
  if (!values) return [];
  return Object.values(territories).map((territory) => {
    const axes = [...new Set(territory.dnaAxes)];
    if (!axes.length || axes.some((axis) => !DNA_AXES.includes(axis))) throw new Error(`Invalid territory DNA axes: ${territory.id}`);
    const contributions = axes.map((axis) => {
      const value = values[axis];
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
        throw new Error(`Invalid DNA score for territory affinity: ${axis}`);
      }
      return { axis, score: value };
    });
    const score = Math.round(contributions.reduce((sum, item) => sum + item.score, 0) / contributions.length);
    return { territory, score, contributions };
  }).sort((a, b) => b.score - a.score || a.territory.name.localeCompare(b.territory.name));
}
