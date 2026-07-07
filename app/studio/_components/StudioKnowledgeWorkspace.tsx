"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  KnowledgeEntityType,
  KnowledgeReviewStatus,
  KnowledgeWorkspaceListItem,
  KnowledgeWorkspaceResult,
  KnowledgeWorkspaceStatus,
} from "@/lib/builder/knowledgeWorkspace/knowledgeWorkspace";

interface StudioKnowledgeWorkspaceProps {
  data: KnowledgeWorkspaceResult | null;
  loadError?: string;
}

const ENTITY_SWITCH: Array<{ type: KnowledgeEntityType; label: string; href: string }> = [
  { type: "note", label: "Notes", href: "/studio/notes" },
  { type: "accord", label: "Accords", href: "/studio/accords" },
  { type: "brand", label: "Brands", href: "/studio/brands" },
  { type: "family", label: "Families", href: "/studio/families" },
  { type: "perfumer", label: "Perfumers", href: "/studio/perfumers" },
];

const formatNumber = (value: number): string => new Intl.NumberFormat("en-US").format(value);
const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

const statusBadgeStyle: Record<KnowledgeWorkspaceStatus, string> = {
  healthy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  "review-needed": "border-amber-400/35 bg-amber-400/10 text-amber-200",
  "not-observed": "border-zinc-700 bg-zinc-900 text-zinc-400",
};

const reviewBadgeStyle: Record<KnowledgeReviewStatus, string> = {
  approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  "pending-review": "border-amber-400/35 bg-amber-400/10 text-amber-200",
  "not-observed": "border-zinc-700 bg-zinc-900 text-zinc-400",
};

const statusLabel: Record<KnowledgeWorkspaceStatus, string> = {
  healthy: "Healthy",
  "review-needed": "Review Needed",
  "not-observed": "Not Observed",
};

export function StudioKnowledgeWorkspace({ data, loadError }: StudioKnowledgeWorkspaceProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? "";
  const queryParams = useMemo(() => new URLSearchParams(searchParamsString), [searchParamsString]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | KnowledgeWorkspaceStatus>("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | KnowledgeReviewStatus>("all");
  const [minOccurrences, setMinOccurrences] = useState<number>(0);
  const [selectedEntityId, setSelectedEntityId] = useState<string>(
    data?.selectedEntity?.entityId ?? data?.displayedEntities[0]?.entityId ?? "",
  );

  useEffect(() => {
    const q = queryParams.get("q");
    const selected =
      queryParams.get("entity") ??
      queryParams.get("note") ??
      queryParams.get("accord") ??
      queryParams.get("brand") ??
      queryParams.get("family") ??
      queryParams.get("perfumer");
    const status = queryParams.get("status");
    const review = queryParams.get("review");
    const min = queryParams.get("min");

    if (q && q.length > 0) {
      setSearchQuery(q);
    } else if (selected && selected.length > 0) {
      setSearchQuery(selected);
    }

    if (status === "healthy" || status === "review-needed" || status === "not-observed") {
      setStatusFilter(status);
    }

    if (review === "approved" || review === "pending-review" || review === "not-observed") {
      setReviewFilter(review);
    }

    if (min) {
      const parsed = Number(min);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        setMinOccurrences(parsed);
      }
    }

    if (selected && selected.length > 0) {
      setSelectedEntityId(selected);
    }
  }, [queryParams]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const params = new URLSearchParams(searchParamsString);
    if (searchQuery.length > 0) {
      params.set("q", searchQuery);
    } else {
      params.delete("q");
    }

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    } else {
      params.delete("status");
    }

    if (reviewFilter !== "all") {
      params.set("review", reviewFilter);
    } else {
      params.delete("review");
    }

    if (minOccurrences > 0) {
      params.set("min", String(minOccurrences));
    } else {
      params.delete("min");
    }

    if (selectedEntityId.length > 0) {
      params.set("entity", selectedEntityId);
    }

    const nextQuery = params.toString();
    const currentQuery = searchParamsString;
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname);
    }
  }, [
    minOccurrences,
    pathname,
    reviewFilter,
    router,
    searchParamsString,
    searchQuery,
    selectedEntityId,
    statusFilter,
  ]);

  const filteredEntities = useMemo(() => {
    const entities = data?.displayedEntities ?? [];
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return entities.filter((entity) => {
      const matchesSearch =
        normalizedSearch.length === 0 || entity.displayName.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || entity.status === statusFilter;
      const matchesReview = reviewFilter === "all" || entity.reviewStatus === reviewFilter;
      const matchesOccurrences = entity.occurrences >= minOccurrences;
      return matchesSearch && matchesStatus && matchesReview && matchesOccurrences;
    });
  }, [data?.displayedEntities, minOccurrences, reviewFilter, searchQuery, statusFilter]);

  const selected = useMemo(() => {
    if (!data) {
      return null;
    }

    if (!selectedEntityId) {
      return data.selectedEntity;
    }

    const selectedFromMap = data.detailsById[selectedEntityId];
    if (!selectedFromMap) {
      return data.selectedEntity;
    }

    return selectedFromMap;
  }, [data, selectedEntityId]);

  const selectedContext = selected ? encodeURIComponent(selected.entityId) : "";

  return (
    <section className="overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <header className="border-b border-amber-200/10 bg-zinc-950/90 px-4 py-3 lg:px-5">
        <h1 className="text-xl font-semibold tracking-tight text-amber-100">
          Knowledge Workspace v2
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Shared workspace for Notes, Accords, Brands, Families and Perfumers using Builder real data.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ENTITY_SWITCH.map((entry) => {
            const active = entry.type === data?.entityType;
            return (
              <Link
                key={entry.type}
                href={entry.href}
                className={`rounded border px-2.5 py-1 text-xs uppercase tracking-[0.12em] ${
                  active
                    ? "border-amber-300/50 bg-amber-300/10 text-amber-100"
                    : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-amber-300/30"
                }`}
              >
                {entry.label}
              </Link>
            );
          })}
        </div>
      </header>

      {loadError ? (
        <div className="p-4">
          <article className="rounded-lg border border-rose-300/25 bg-rose-950/20 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-rose-200">Load Error</p>
            <p className="mt-1 text-sm text-rose-100">{loadError}</p>
          </article>
        </div>
      ) : null}

      {!loadError && data ? (
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
            <TopMetric label={`Total ${data.entityLabelPlural}`} value={formatNumber(data.totalEntities)} />
            <TopMetric label="Total Occurrences" value={formatNumber(data.totalOccurrences)} />
            <TopMetric label="Average Occurrences" value={formatNumber(data.averageOccurrences)} />
            <TopMetric label="Pending Review" value={formatNumber(data.pendingReview)} />
            <TopMetric label="Coverage" value={formatPercent(data.coveragePercent)} />
          </div>

          <div className="grid min-h-[780px] grid-cols-1 gap-4 xl:grid-cols-[350px_minmax(0,1fr)_360px]">
            <aside className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-3 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                  {data.entityLabelPlural} Table
                </h2>
              </div>

              <div className="space-y-3 border-b border-zinc-800 px-3 py-3">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                    Search
                  </label>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={`Search ${data.entityLabelSingular.toLowerCase()}`}
                    className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-300/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as "all" | KnowledgeWorkspaceStatus)}
                      className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-amber-300/40"
                    >
                      <option value="all">All</option>
                      <option value="healthy">Healthy</option>
                      <option value="review-needed">Review Needed</option>
                      <option value="not-observed">Not Observed</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                      Review
                    </label>
                    <select
                      value={reviewFilter}
                      onChange={(event) => setReviewFilter(event.target.value as "all" | KnowledgeReviewStatus)}
                      className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-amber-300/40"
                    >
                      <option value="all">All</option>
                      <option value="approved">Approved</option>
                      <option value="pending-review">Pending Review</option>
                      <option value="not-observed">Not Observed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                    Min Occurrences
                  </label>
                  <select
                    value={String(minOccurrences)}
                    onChange={(event) => setMinOccurrences(Number(event.target.value))}
                    className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-amber-300/40"
                  >
                    <option value="0">0+</option>
                    <option value="5">5+</option>
                    <option value="25">25+</option>
                    <option value="100">100+</option>
                  </select>
                </div>
              </div>

              <div className="max-h-[560px] overflow-auto px-2 py-2">
                <table className="w-full border-collapse text-xs">
                  <thead className="sticky top-0 z-10 bg-zinc-950/95 text-zinc-400">
                    <tr>
                      <th className="border-b border-zinc-800 px-2 py-2 text-left">Entity</th>
                      <th className="border-b border-zinc-800 px-2 py-2 text-left">Occ</th>
                      <th className="border-b border-zinc-800 px-2 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntities.length > 0 ? (
                      filteredEntities.map((entity) => (
                        <KnowledgeRow
                          key={entity.entityId}
                          entity={entity}
                          selected={entity.entityId === selected?.entityId}
                          onSelect={() => setSelectedEntityId(entity.entityId)}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-2 py-3 text-zinc-500">
                          No entities matched the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </aside>

            <main className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                  Detail Panel
                </h2>
              </div>

              {selected ? (
                <div className="space-y-3 px-4 py-3">
                  <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-semibold text-amber-100">{selected.displayName}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          Occurrences: {formatNumber(selected.occurrences)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className={`rounded border px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] ${statusBadgeStyle[selected.status]}`}>
                          {statusLabel[selected.status]}
                        </span>
                        <span className={`rounded border px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] ${reviewBadgeStyle[selected.reviewStatus]}`}>
                          {selected.reviewStatus}
                        </span>
                      </div>
                    </div>
                  </article>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <MetricListCard title="Top Perfumes" items={selected.topPerfumes} linkBuilder={(item) => `/studio/master-database?perfume=${encodeURIComponent(item.label)}&context=${selectedContext}`} />
                    <MetricListCard title="Top Brands" items={selected.topBrands} linkBuilder={(item) => `/studio/brands?brand=${encodeURIComponent(item.label)}&context=${selectedContext}`} />
                    <MetricListCard title="Top Notes" items={selected.topNotes} linkBuilder={(item) => `/studio/notes?note=${encodeURIComponent(item.label)}&context=${selectedContext}`} />
                    <MetricListCard title="Top Main Accords" items={selected.topMainAccords} linkBuilder={(item) => `/studio/accords?accord=${encodeURIComponent(item.label)}&context=${selectedContext}`} />
                    <MetricListCard title="Top Families" items={selected.topFamilies} linkBuilder={(item) => `/studio/families?family=${encodeURIComponent(item.label)}&context=${selectedContext}`} />
                    <MetricListCard title="Top Perfumers" items={selected.topPerfumers} linkBuilder={(item) => `/studio/perfumers?perfumer=${encodeURIComponent(item.label)}&context=${selectedContext}`} />
                  </div>

                  <MetricListCard title="Launch Years" items={selected.launchYearDistribution} />
                  <MetricListCard title="Raw Variants" items={selected.rawVariants} />
                  <MetricListCard title="Aliases" items={selected.aliases} />
                </div>
              ) : (
                <div className="p-4 text-sm text-zinc-400">No selected entity.</div>
              )}
            </main>

            <aside className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">Inspector</h2>
              </div>

              <div className="space-y-3 px-4 py-3">
                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Statistics</p>
                  <StatLine label="Observed Entities" value={formatNumber(data.statistics.observedEntities)} />
                  <StatLine label="Healthy Entities" value={formatNumber(data.statistics.healthyEntities)} />
                  <StatLine label="Review Needed" value={formatNumber(data.statistics.reviewNeededEntities)} />
                  <StatLine label="Unresolved Unique" value={formatNumber(data.statistics.unresolvedUnique)} />
                  <StatLine label="Unresolved Occurrences" value={formatNumber(data.statistics.unresolvedOccurrences)} />
                  <StatLine label="Total Rows" value={formatNumber(data.statistics.totalRows)} />
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Validation</p>
                  <StatLine label="Raw Import Valid" value={data.validation.rawImportValid ? "true" : "false"} />
                  <StatLine label="Raw Import Errors" value={formatNumber(data.validation.rawImportErrors)} />
                  <StatLine label="Raw Import Warnings" value={formatNumber(data.validation.rawImportWarnings)} />
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Reusable Intelligence</p>
                  <SimpleMetricList label="Top Coverage Entities" items={data.intelligenceSummary.topCoverageEntities} suffix="%" />
                  <SimpleMetricList label="Top Observed Entities" items={data.intelligenceSummary.topObservedEntities} />
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Builder Metadata</p>
                  <p className="mt-2 break-all text-xs text-zinc-300">Workbook: {data.builderMetadata.workbookPath}</p>
                  <p className="mt-1 text-xs text-zinc-300">Import Version: {data.builderMetadata.importVersion}</p>
                  <p className="mt-1 text-xs text-zinc-300">Builder Version: {data.builderMetadata.builderVersion}</p>
                  <p className="mt-1 text-xs text-zinc-300">Generated: {data.builderMetadata.generatedAt}</p>
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Reusable Actions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" disabled className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-500">
                      Refresh Workspace
                    </button>
                    <button type="button" disabled className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-500">
                      Export Selection
                    </button>
                    <button type="button" disabled className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-500">
                      Open Review Queue
                    </button>
                  </div>
                </article>
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function TopMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/55 p-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-300">
      <span className="pr-2 text-zinc-400">{label}</span>
      <span className="text-zinc-100">{value}</span>
    </div>
  );
}

function KnowledgeRow({
  entity,
  selected,
  onSelect,
}: {
  entity: KnowledgeWorkspaceListItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <tr
      onClick={onSelect}
      className={`cursor-pointer border-b border-zinc-900 ${selected ? "bg-amber-300/10" : "hover:bg-zinc-800/35"}`}
    >
      <td className="px-2 py-2 text-zinc-200">{entity.displayName}</td>
      <td className="px-2 py-2 text-zinc-300">{formatNumber(entity.occurrences)}</td>
      <td className="px-2 py-2">
        <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] ${statusBadgeStyle[entity.status]}`}>
          {statusLabel[entity.status]}
        </span>
      </td>
    </tr>
  );
}

function MetricListCard({
  title,
  items,
  linkBuilder,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
  linkBuilder?: (item: { label: string; count: number }) => string;
}) {
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{title}</p>
      <div className="mt-2 max-h-[160px] space-y-1 overflow-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs text-zinc-300">
              {linkBuilder ? (
                <Link href={linkBuilder(item)} className="truncate pr-2 text-amber-200 hover:text-amber-100">
                  {item.label}
                </Link>
              ) : (
                <span className="truncate pr-2">{item.label}</span>
              )}
              <span>{formatNumber(item.count)}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-zinc-500">No data.</p>
        )}
      </div>
    </article>
  );
}

function SimpleMetricList({
  label,
  items,
  suffix,
}: {
  label: string;
  items: Array<{ label: string; count: number }>;
  suffix?: string;
}) {
  return (
    <div className="mt-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <div className="mt-2 max-h-[120px] space-y-1 overflow-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs text-zinc-300">
              <span className="truncate pr-2">{item.label}</span>
              <span>
                {formatNumber(item.count)}
                {suffix ?? ""}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-zinc-500">No data.</p>
        )}
      </div>
    </div>
  );
}
