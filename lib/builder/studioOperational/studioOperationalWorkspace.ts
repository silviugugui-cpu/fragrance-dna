import "server-only";
import { loadBuilderControlCenterData } from "@/lib/builder/controlCenter/builderControlCenter";
import { loadKnowledgeWorkspaceData } from "@/lib/builder/knowledgeWorkspace/knowledgeWorkspace";
import { loadMasterDatabaseWorkspaceData } from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";
import { createBuilderConfig } from "@/lib/builder/config";

export type StudioOperationalModule =
  | "grounding"
  | "raw-import"
  | "translation-rules"
  | "translation"
  | "knowledge-base"
  | "settings";

export interface StudioOperationalWorkspaceData {
  module: StudioOperationalModule;
  title: string;
  summary: string;
  primary: Array<{ label: string; value: string; href: string }>;
  links: Array<{ label: string; href: string }>;
  details: Array<{ label: string; value: string }>;
}

const MODULE_META: Record<
  StudioOperationalModule,
  { title: string; summary: string }
> = {
  grounding: {
    title: "Grounding Workspace",
    summary: "Source-to-entity grounding coverage and unresolved extraction signals.",
  },
  "raw-import": {
    title: "Raw Import Workspace",
    summary: "Workbook intake contracts, headers and dataset readiness.",
  },
  "translation-rules": {
    title: "Translation Rules Workspace",
    summary: "Rule governance and unresolved token pressure over canonical entities.",
  },
  translation: {
    title: "Translation Workspace",
    summary: "Operational translation readiness from Master Database signals.",
  },
  "knowledge-base": {
    title: "Knowledge Base Workspace",
    summary: "Canonical knowledge coverage and unresolved entities across Builder.",
  },
  settings: {
    title: "Settings Workspace",
    summary: "Builder operational configuration and active pipeline versioning.",
  },
};

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

export const loadStudioOperationalWorkspaceData = async (
  module: StudioOperationalModule,
): Promise<StudioOperationalWorkspaceData> => {
  const [control, notes, master] = await Promise.all([
    loadBuilderControlCenterData(),
    Promise.resolve(loadKnowledgeWorkspaceData("note")),
    Promise.resolve(loadMasterDatabaseWorkspaceData()),
  ]);

  const config = createBuilderConfig();
  const translationTotal = Object.keys(master.detailsById).length;
  const translationReady = Object.values(master.detailsById).filter(
    (item) => item.translation.status === "ready",
  ).length;

  const commonPrimary = [
    { label: "Builder Status", value: control.builderStatus.state, href: "/studio/pipeline" },
    {
      label: "Validation Errors",
      value: String(control.validationSummary.errorCount),
      href: "/studio/validation",
    },
    {
      label: "Review Queue",
      value: String(control.reviewQueue.pendingReviews),
      href: "/studio/review",
    },
  ];

  if (module === "grounding") {
    return {
      module,
      title: MODULE_META[module].title,
      summary: MODULE_META[module].summary,
      primary: [
        {
          label: "Unresolved Unique Notes",
          value: String(notes.statistics.unresolvedUnique),
          href: "/studio/review",
        },
        {
          label: "Unresolved Occurrences",
          value: String(notes.statistics.unresolvedOccurrences),
          href: "/studio/review",
        },
        ...commonPrimary,
      ],
      links: [
        { label: "Open Review Workspace", href: "/studio/review" },
        { label: "Open Notes Workspace", href: "/studio/notes" },
        { label: "Open Validation", href: "/studio/validation" },
      ],
      details: [
        { label: "Knowledge Coverage", value: formatPercent(notes.coveragePercent) },
        { label: "Knowledge Health", value: control.reviewQueue.knowledgeHealth },
        { label: "Dataset", value: control.currentDataset.importVersion },
      ],
    };
  }

  if (module === "raw-import") {
    return {
      module,
      title: MODULE_META[module].title,
      summary: MODULE_META[module].summary,
      primary: [
        {
          label: "Workbook Rows",
          value: String(control.currentDataset.totalRows),
          href: "/studio/master-database",
        },
        {
          label: "Worksheets",
          value: String(control.currentDataset.worksheetCount),
          href: "/studio/master-database",
        },
        ...commonPrimary,
      ],
      links: [
        { label: "Open Pipeline", href: "/studio/pipeline" },
        { label: "Open Validation", href: "/studio/validation" },
        { label: "Open Master Database", href: "/studio/master-database" },
      ],
      details: [
        { label: "Workbook Path", value: control.currentDataset.workbookPath },
        {
          label: "Identifier Column",
          value: control.currentDataset.identifierColumn,
        },
        {
          label: "Required Headers",
          value: control.currentDataset.requiredHeaders.join(", "),
        },
      ],
    };
  }

  if (module === "translation-rules") {
    return {
      module,
      title: MODULE_META[module].title,
      summary: MODULE_META[module].summary,
      primary: [
        {
          label: "Translation Ready",
          value: String(translationReady),
          href: "/studio/translation",
        },
        {
          label: "Needs Review",
          value: String(Math.max(0, translationTotal - translationReady)),
          href: "/studio/translation",
        },
        ...commonPrimary,
      ],
      links: [
        { label: "Open Translation", href: "/studio/translation" },
        { label: "Open Notes", href: "/studio/notes" },
        { label: "Open Review", href: "/studio/review" },
      ],
      details: [
        { label: "Total Translation Targets", value: String(translationTotal) },
        {
          label: "Validation Errors",
          value: String(control.validationSummary.errorCount),
        },
        { label: "Builder Version", value: control.builderStatus.pipelineVersion },
      ],
    };
  }

  if (module === "translation") {
    return {
      module,
      title: MODULE_META[module].title,
      summary: MODULE_META[module].summary,
      primary: [
        {
          label: "Coverage",
          value: formatPercent(
            translationTotal > 0 ? (translationReady / translationTotal) * 100 : 0,
          ),
          href: "/studio/master-database",
        },
        { label: "Ready", value: String(translationReady), href: "/studio/master-database" },
        ...commonPrimary,
      ],
      links: [
        { label: "Open Master Database", href: "/studio/master-database" },
        { label: "Open Validation", href: "/studio/validation" },
        { label: "Open Pipeline", href: "/studio/pipeline" },
      ],
      details: [
        { label: "Total Entries", value: String(translationTotal) },
        {
          label: "Needs Review",
          value: String(Math.max(0, translationTotal - translationReady)),
        },
        {
          label: "Current Run State",
          value: control.builderStatus.latestRunStatus,
        },
      ],
    };
  }

  if (module === "knowledge-base") {
    return {
      module,
      title: MODULE_META[module].title,
      summary: MODULE_META[module].summary,
      primary: [
        {
          label: "Knowledge Coverage",
          value: formatPercent(notes.coveragePercent),
          href: "/studio/notes",
        },
        {
          label: "Observed Entities",
          value: String(notes.statistics.observedEntities),
          href: "/studio/notes",
        },
        ...commonPrimary,
      ],
      links: [
        { label: "Open Notes", href: "/studio/notes" },
        { label: "Open Accords", href: "/studio/accords" },
        { label: "Open Families", href: "/studio/families" },
        { label: "Open Perfumers", href: "/studio/perfumers" },
      ],
      details: [
        {
          label: "Unresolved Unique",
          value: String(notes.statistics.unresolvedUnique),
        },
        {
          label: "Unresolved Occurrences",
          value: String(notes.statistics.unresolvedOccurrences),
        },
        { label: "Import Version", value: notes.builderMetadata.importVersion },
      ],
    };
  }

  return {
    module,
    title: MODULE_META[module].title,
    summary: MODULE_META[module].summary,
    primary: [
      {
        label: "Pipeline Version",
        value: config.pipelineVersion,
        href: "/studio/pipeline",
      },
      {
        label: "Generated By",
        value: config.generatedBy,
        href: "/studio/pipeline",
      },
      ...commonPrimary,
    ],
    links: [
      { label: "Open Dashboard", href: "/studio/dashboard" },
      { label: "Open Pipeline", href: "/studio/pipeline" },
      { label: "Open Validation", href: "/studio/validation" },
    ],
    details: [
      { label: "Builder Root", value: config.paths.builderRoot },
      { label: "Logs Root", value: config.paths.logsRoot },
      { label: "Artifacts Root", value: config.paths.artifactsRoot },
    ],
  };
};
