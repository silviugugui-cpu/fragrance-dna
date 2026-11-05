import { territories, type Territory } from '../data/territories';
import type { DnaAxis, DnaAxisValues } from '../../components/dna/DnaRadar';

// Legacy territory descriptors are projected onto the existing canonical DNA axes.
const TERRITORY_AXES: Record<string, DnaAxis> = {
  Freshness: 'Freshness',
  Warmth: 'Warmth',
  Complexity: 'Complexity',
  Comfort: 'Comfort',
  Versatility: 'Versatility',
  Elegance: 'Elegance',
  Refinement: 'Elegance',
  Sensuality: 'Comfort',
};

export interface TerritoryAffinity {
  territory: Territory;
  score: number;
  contributions: Array<{ axis: DnaAxis; score: number }>;
}

export function calculateTerritoryAffinities(values: DnaAxisValues | null): TerritoryAffinity[] {
  if (!values) return [];
  return Object.values(territories).map((territory) => {
    // Presence currently represents confidence on the DNA dashboard, not a scent preference.
    const axes = [...new Set(territory.dnaAxes.filter((axis) => axis !== 'Presence').map((axis) => {
      const canonical = TERRITORY_AXES[axis];
      if (!canonical) throw new Error(`Unknown territory DNA axis: ${axis}`);
      return canonical;
    }))];
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
