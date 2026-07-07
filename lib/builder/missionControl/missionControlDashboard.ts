import "server-only";
import { loadBuilderControlCenterData } from "@/lib/builder/controlCenter/builderControlCenter";
import { loadKnowledgeWorkspaceData } from "@/lib/builder/knowledgeWorkspace/knowledgeWorkspace";
import { loadMasterDatabaseWorkspaceData } from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";

export interface MissionControlCard {
  title:
    | "Builder Health"
    | "Master Database"
    | "Knowledge Coverage"
    | "Translation Coverage"
    | "Validation Status"
    | "Review Queue"
    | "Latest Builder Run"
    | "Automation %"
    | "Recent Activity"
    | "Quick Actions";
  href: string;
  primary: string;
  secondary: string;
  details: string[];
}

export interface MissionControlDashboardData {
  generatedAt: string;
  cards: MissionControlCard[];
  quickActions: Array<{ label: string; href: string }>;
}

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

export const loadMissionControlDashboardData =
  async (): Promise<MissionControlDashboardData> => {
    const [controlCenter, notesWorkspace, masterDatabase] = await Promise.all([
      loadBuilderControlCenterData(),
      Promise.resolve(loadKnowledgeWorkspaceData("note")),
      Promise.resolve(loadMasterDatabaseWorkspaceData()),
    ]);

    const latestRun = controlCenter.recentRuns[0] ?? null;

    const translationEntries = Object.values(masterDatabase.detailsById);
    const translationReady = translationEntries.filter(
      (item) => item.translation.status === "ready",
    ).length;
    const translationCoverage =
      translationEntries.length > 0
        ? (translationReady / translationEntries.length) * 100
        : 0;

    const automationPercent =
      masterDatabase.automationPercentage;

    const cards: MissionControlCard[] = [
      {
        title: "Builder Health",
        href: "/studio/pipeline",
        primary: controlCenter.builderStatus.state,
        secondary: `Latest run: ${controlCenter.builderStatus.latestRunStatus}`,
        details: [
          `Pipeline version ${controlCenter.builderStatus.pipelineVersion}`,
          `Warnings ${controlCenter.warnings.total}`,
          `Errors ${controlCenter.errors.total}`,
        ],
      },
      {
        title: "Master Database",
        href: "/studio/master-database",
        primary: `${masterDatabase.canonicalObjectsGenerated}/${masterDatabase.totalPerfumes}`,
        secondary: "Canonical Objects / Total perfumes",
        details: [
          `Pending review ${masterDatabase.pendingReview}`,
          `Validation issues ${masterDatabase.validationIssueCount}`,
          `Builder completion ${formatPercent(masterDatabase.builderCompletionPercent)}`,
        ],
      },
      {
        title: "Knowledge Coverage",
        href: "/studio/notes",
        primary: formatPercent(masterDatabase.coveragePercent),
        secondary: "Canonical field coverage",
        details: [
          `Observed entities ${notesWorkspace.statistics.observedEntities}`,
          `Unresolved unique ${notesWorkspace.statistics.unresolvedUnique}`,
          `Unresolved occurrences ${notesWorkspace.statistics.unresolvedOccurrences}`,
        ],
      },
      {
        title: "Translation Coverage",
        href: "/studio/translation",
        primary: formatPercent(translationCoverage),
        secondary: "Ready translation status",
        details: [
          `Ready ${translationReady}`,
          `Total ${translationEntries.length}`,
          `Needs review ${translationEntries.length - translationReady}`,
        ],
      },
      {
        title: "Validation Status",
        href: "/studio/validation",
        primary: controlCenter.validationSummary.errorCount > 0 ? "failing" : "passing",
        secondary: `${controlCenter.validationSummary.executedRules} rule executions`,
        details: [
          `Warnings ${controlCenter.validationSummary.warningCount}`,
          `Errors ${controlCenter.validationSummary.errorCount}`,
          `Affected perfumes ${controlCenter.validationSummary.affectedPerfumes}`,
        ],
      },
      {
        title: "Review Queue",
        href: "/studio/review",
        primary: `${controlCenter.reviewQueue.pendingReviews}`,
        secondary: "Pending review items",
        details: [
          `Health ${controlCenter.reviewQueue.knowledgeHealth}`,
          `Top unresolved ${controlCenter.reviewQueue.unresolvedItemsPreview[0]?.rawNote ?? "none"}`,
          `Preview size ${controlCenter.reviewQueue.unresolvedItemsPreview.length}`,
        ],
      },
      {
        title: "Latest Builder Run",
        href: "/studio/pipeline",
        primary: latestRun ? latestRun.status : "not-run",
        secondary: latestRun ? latestRun.runId : "No executed run",
        details: [
          `From stage ${latestRun?.fromStage ?? "n/a"}`,
          `Duration ${latestRun ? `${latestRun.durationMs}ms` : "n/a"}`,
          `Completed ${latestRun ? `${latestRun.completedStages}/${latestRun.totalStages}` : "0/0"}`,
        ],
      },
      {
        title: "Automation %",
        href: "/studio/pipeline",
        primary: formatPercent(automationPercent),
        secondary: "Deterministic automatic resolutions",
        details: [
          `Automatic resolutions ${masterDatabase.automaticResolutions}`,
          `Canonical objects ${masterDatabase.canonicalObjectsGenerated}`,
          `Average confidence ${masterDatabase.averageBuilderConfidence.toFixed(2)}`,
        ],
      },
      {
        title: "Recent Activity",
        href: "/studio/pipeline",
        primary: `${controlCenter.recentRuns.length}`,
        secondary: "Recorded recent runs",
        details:
          controlCenter.recentRuns.slice(0, 3).map((run) => `${run.runId} - ${run.status}`) || [],
      },
      {
        title: "Quick Actions",
        href: "/studio/pipeline",
        primary: "Open control workflows",
        secondary: "Jump to operational workspaces",
        details: ["Pipeline", "Validation", "Review"],
      },
    ];

    return {
      generatedAt: new Date().toISOString(),
      cards,
      quickActions: [
        { label: "Open Pipeline", href: "/studio/pipeline" },
        { label: "Open Validation", href: "/studio/validation" },
        { label: "Open Review Queue", href: "/studio/review" },
        { label: "Open Master Database", href: "/studio/master-database" },
      ],
    };
  };
