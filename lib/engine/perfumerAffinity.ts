import type { PerfumerDnaKey } from "../data/perfumers";

export function computePerfumerMatchScore(userDna: Record<PerfumerDnaKey, number>, perfumerDna: Record<PerfumerDnaKey, number>) {
  const axes: PerfumerDnaKey[] = ["Freshness", "Complexity", "Elegance", "Luxury"];
  const axisDiffs = axes.map((axis) => {
    if (![userDna[axis], perfumerDna[axis]].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) {
      throw new Error(`Invalid perfumer affinity axis: ${axis}`);
    }
    return { axis, diff: Math.abs(userDna[axis] - perfumerDna[axis]) };
  }).sort((a, b) => a.diff - b.diff);
  return { score: Math.round(100 - axisDiffs.reduce((sum, item) => sum + item.diff, 0) / axes.length), axisDiffs };
}
