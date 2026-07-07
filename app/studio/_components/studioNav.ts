export type StudioNavItem = {
  label: string;
  href: string;
  description: string;
};

export const studioNavItems: StudioNavItem[] = [
  {
    label: "Dashboard",
    href: "/studio/dashboard",
    description: "Operational overview and Builder surface status.",
  },
  {
    label: "Review Workspace",
    href: "/studio/review",
    description: "Knowledge review queue for extracted unknown entities.",
  },
  {
    label: "Grounding",
    href: "/studio/grounding",
    description: "Canonical grounding workspace for source-to-entity validation.",
  },
  {
    label: "Raw Import",
    href: "/studio/raw-import",
    description: "Source workbook intake and import contracts.",
  },
  {
    label: "Sources",
    href: "/studio/sources",
    description: "Connector operations, synchronization and enrichment job control.",
  },
  {
    label: "Master Database",
    href: "/studio/master-database",
    description: "Canonical fragrance object publication surface.",
  },
  {
    label: "Notes",
    href: "/studio/notes",
    description: "Canonical note entity management workspace.",
  },
  {
    label: "Accords",
    href: "/studio/accords",
    description: "Accord vocabulary and structure workspace.",
  },
  {
    label: "Brands",
    href: "/studio/brands",
    description: "Brand contract and inheritance workspace.",
  },
  {
    label: "Perfumers",
    href: "/studio/perfumers",
    description: "Perfumer factual metadata workspace.",
  },
  {
    label: "Families",
    href: "/studio/families",
    description: "Olfactory family knowledge workspace.",
  },
  {
    label: "Translation Rules",
    href: "/studio/translation-rules",
    description: "Translation contract governance workspace.",
  },
  {
    label: "Translation",
    href: "/studio/translation",
    description: "Translation execution workspace and operational status.",
  },
  {
    label: "Knowledge Base",
    href: "/studio/knowledge-base",
    description: "Knowledge graph contracts and entities.",
  },
  {
    label: "Validation",
    href: "/studio/validation",
    description: "Contract validation and quality gates.",
  },
  {
    label: "Pipeline",
    href: "/studio/pipeline",
    description: "Builder stage flow monitoring workspace.",
  },
  {
    label: "Settings",
    href: "/studio/settings",
    description: "Studio-level configuration surface.",
  },
];
