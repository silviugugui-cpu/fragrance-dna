import type { FragranceIntelligenceService } from "@/lib/intelligence/fragranceIntelligence";
import type { BehaviorProjectionState } from "@/lib/intelligence/projections/models/behaviorProjection";
import type { AnswerRecord, OlfactoryVector } from "@/lib/types";
import {
  evaluateAdaptiveSelection,
  type AdaptiveSelectionDebugReport,
  type AdaptiveSelectionLeaderboardEntry,
} from "@/lib/intelligence/learning/adaptiveSelector";

export type GroundingCalibrationProfile = {
  love: string[];
  neutral: string[];
  redFlag: string[];
};

export type BehaviorCalibrationProfile = {
  answers: Record<string, AnswerRecord>;
  behaviorVectorOverride?: Partial<OlfactoryVector>;
};

export type CurrentConfidenceCalibrationState = {
  global: number;
  updates?: number;
};

export type LearningSimulatorInput = {
  groundingProfile: GroundingCalibrationProfile;
  behaviorProfile: BehaviorCalibrationProfile;
  currentConfidenceState: CurrentConfidenceCalibrationState;
  previousEvaluations: string[];
  fragranceService: FragranceIntelligenceService;
  legacySequentialEnabled?: boolean;
  leaderboardLimit?: number;
};

export type LearningSimulationResult = {
  selectedFragranceId: string;
  selectedDisplayName: string;
  candidateRanking: AdaptiveSelectionLeaderboardEntry[];
  explanation: string;
  debugReport: AdaptiveSelectionDebugReport;
  behaviorProjection: BehaviorProjectionState;
  reproducibilityKey: string;
};

export type CalibrationScenarioInput = LearningSimulatorInput & {
  scenarioId: string;
  label: string;
};

export type CalibrationConvergenceCase = {
  fragranceId: string;
  scenarios: Array<{
    scenarioId: string;
    label: string;
    reproducibilityKey: string;
  }>;
  explanation: string;
};

export type CalibrationReport = {
  scenarioCount: number;
  distinctSelections: number;
  convergenceCases: CalibrationConvergenceCase[];
  recommendations: string[];
  summary: string;
};

export type CalibrationComparisonResult = {
  scenarios: Array<{
    scenarioId: string;
    label: string;
    result: LearningSimulationResult;
  }>;
  report: CalibrationReport;
};

export function simulateLearningProfile(input: LearningSimulatorInput): LearningSimulationResult {
  const selection = evaluateAdaptiveSelection({
    answers: input.behaviorProfile.answers,
    groundingTokens: flattenGroundingProfile(input.groundingProfile),
    fragranceService: input.fragranceService,
    legacySequentialEnabled: input.legacySequentialEnabled,
    previousEvaluations: input.previousEvaluations,
    leaderboardLimit: input.leaderboardLimit,
    calibrationContext: {
      currentConfidenceState: input.currentConfidenceState,
      behaviorVectorOverride: input.behaviorProfile.behaviorVectorOverride,
    },
  });

  return {
    selectedFragranceId: selection.fragranceId,
    selectedDisplayName: selection.displayName,
    candidateRanking: selection.leaderboard,
    explanation: selection.explanation,
    debugReport: selection.debugReport,
    behaviorProjection: selection.behaviorProjection,
    reproducibilityKey: selection.debugReport.reproducibilityKey,
  };
}

export function runCalibrationMode(scenarios: CalibrationScenarioInput[]): CalibrationComparisonResult {
  const orderedScenarios = [...scenarios].sort(compareScenarioInputs);

  const results = orderedScenarios.map((scenario) => ({
    scenarioId: scenario.scenarioId,
    label: scenario.label,
    result: simulateLearningProfile(scenario),
  }));

  return {
    scenarios: results,
    report: buildCalibrationReport(results),
  };
}

export function buildCalibrationReport(
  scenarios: CalibrationComparisonResult["scenarios"]
): CalibrationReport {
  const selections = new Map<string, CalibrationComparisonResult["scenarios"]>();

  for (const scenario of scenarios) {
    const existing = selections.get(scenario.result.selectedFragranceId) ?? [];
    selections.set(scenario.result.selectedFragranceId, [...existing, scenario]);
  }

  const convergenceCases = Array.from(selections.entries())
    .filter(([, groupedScenarios]) => groupedScenarios.length > 1)
    .map(([fragranceId, groupedScenarios]) => ({
      fragranceId,
      scenarios: groupedScenarios.map((scenario) => ({
        scenarioId: scenario.scenarioId,
        label: scenario.label,
        reproducibilityKey: scenario.result.reproducibilityKey,
      })),
      explanation: explainConvergence(groupedScenarios),
    }));

  const recommendations = buildCalibrationRecommendations(scenarios, convergenceCases);

  return {
    scenarioCount: scenarios.length,
    distinctSelections: selections.size,
    convergenceCases,
    recommendations,
    summary: buildCalibrationSummary(scenarios, convergenceCases),
  };
}

function flattenGroundingProfile(profile: GroundingCalibrationProfile): string[] {
  return [...profile.love, ...profile.neutral, ...profile.redFlag];
}

function compareScenarioInputs(left: CalibrationScenarioInput, right: CalibrationScenarioInput): number {
  const scenarioCompare = left.scenarioId.localeCompare(right.scenarioId);
  if (scenarioCompare !== 0) {
    return scenarioCompare;
  }

  return left.label.localeCompare(right.label);
}

function explainConvergence(
  scenarios: CalibrationComparisonResult["scenarios"]
): string {
  const labels = scenarios.map((scenario) => scenario.label).join(", ");
  return `Multiple scenarios converged on ${scenarios[0]?.result.selectedDisplayName ?? "the same fragrance"} because their ranking signals remained close across ${labels}.`;
}

function buildCalibrationRecommendations(
  scenarios: CalibrationComparisonResult["scenarios"],
  convergenceCases: CalibrationConvergenceCase[]
): string[] {
  const recommendations: string[] = [];

  if (convergenceCases.length > 0) {
    recommendations.push("Increase behavior-vector separation in scoring when multiple candidates have near-identical final scores.");
    recommendations.push("Record more attribute-specific evidence before relying on high-confidence selections for similar users.");
  }

  const leaderboards = scenarios.map((scenario) => scenario.result.candidateRanking);
  if (leaderboards.some((leaderboard) => leaderboard.length > 0 && leaderboard[0].rank !== 1)) {
    recommendations.push("Review leaderboard ranking normalization because top-ranked entries should always carry rank 1.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Current selector calibration is stable across the compared scenarios.");
  }

  return recommendations;
}

function buildCalibrationSummary(
  scenarios: CalibrationComparisonResult["scenarios"],
  convergenceCases: CalibrationConvergenceCase[]
): string {
  if (scenarios.length === 0) {
    return "No calibration scenarios were provided.";
  }

  const converged = convergenceCases.length;
  return `${scenarios.length} scenarios evaluated; ${converged} convergence cases detected.`;
}