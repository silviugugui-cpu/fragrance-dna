"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  BrandReviewStatus,
  BrandsWorkspaceResult,
  BrandWorkspaceListItem,
  BrandWorkspaceStatus,
} from "@/lib/builder/brandsWorkspace/brandsWorkspace";

interface StudioBrandsWorkspaceProps {
  data: BrandsWorkspaceResult | null;
  loadError?: string;
}

const formatNumber = (value: number): string => new Intl.NumberFormat("en-US").format(value);

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

const statusBadgeStyle: Record<BrandWorkspaceStatus, string> = {
  healthy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  "review-needed": "border-amber-400/35 bg-amber-400/10 text-amber-200",
  "not-observed": "border-zinc-700 bg-zinc-900 text-zinc-400",
};

const reviewBadgeStyle: Record<BrandReviewStatus, string> = {
  approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  "pending-review": "border-amber-400/35 bg-amber-400/10 text-amber-200",
};

const statusLabel: Record<BrandWorkspaceStatus, string> = {
  healthy: "Healthy",
  "review-needed": "Review Needed",
  "not-observed": "Not Observed",
};

export function StudioBrandsWorkspace({ data, loadError }: StudioBrandsWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BrandWorkspaceStatus>("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | BrandReviewStatus>("all");
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    data?.selectedBrand?.brandId ?? data?.displayedBrands[0]?.brandId ?? "",
  );

  const filteredBrands = useMemo(() => {
    const brands = data?.displayedBrands ?? [];
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return brands.filter((brand) => {
      const matchesSearch =
        normalizedSearch.length === 0 || brand.brandName.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || brand.status === statusFilter;
      const matchesReview = reviewFilter === "all" || brand.reviewStatus === reviewFilter;
      return matchesSearch && matchesStatus && matchesReview;
    });
  }, [data?.displayedBrands, reviewFilter, searchQuery, statusFilter]);

  const selected = useMemo(() => {
    if (!data?.selectedBrand) {
      return null;
    }

    if (!selectedBrandId || selectedBrandId === data.selectedBrand.brandId) {
      return data.selectedBrand;
    }

    const listHit = data.displayedBrands.find((item) => item.brandId === selectedBrandId);
    if (!listHit || listHit.brandId !== data.selectedBrand.brandId) {
      return data.selectedBrand;
    }

    return data.selectedBrand;
  }, [data?.displayedBrands, data?.selectedBrand, selectedBrandId]);

  const selectedContext = selected ? encodeURIComponent(selected.brandId) : "";

  return (
    <section className="overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <header className="border-b border-amber-200/10 bg-zinc-950/90 px-4 py-3 lg:px-5">
        <h1 className="text-xl font-semibold tracking-tight text-amber-100">Brands Workspace v1</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Canonical brand intelligence powered by real Builder datasets.
        </p>
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
            <TopMetric label="Total Brands" value={formatNumber(data.totalBrands)} />
            <TopMetric label="Total Perfumes" value={formatNumber(data.totalPerfumes)} />
            <TopMetric
              label="Average Perfumes / Brand"
              value={formatNumber(data.averagePerfumesPerBrand)}
            />
            <TopMetric label="Pending Review" value={formatNumber(data.pendingReview)} />
            <TopMetric label="Builder Coverage" value={formatPercent(data.builderCoveragePercent)} />
          </div>

          <div className="grid min-h-[780px] grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
            <aside className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-3 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                  Brands List
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
                    placeholder="Search brand"
                    className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-300/40"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as "all" | BrandWorkspaceStatus)}
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
                    onChange={(event) => setReviewFilter(event.target.value as "all" | BrandReviewStatus)}
                    className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-amber-300/40"
                  >
                    <option value="all">All</option>
                    <option value="approved">Approved</option>
                    <option value="pending-review">Pending Review</option>
                  </select>
                </div>
              </div>

              <div className="max-h-[560px] overflow-auto px-2 py-2">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => (
                    <BrandListRow
                      key={brand.brandId}
                      brand={brand}
                      selected={brand.brandId === selected?.brandId}
                      onSelect={() => setSelectedBrandId(brand.brandId)}
                    />
                  ))
                ) : (
                  <div className="rounded border border-zinc-800 bg-zinc-900/55 px-3 py-3 text-sm text-zinc-400">
                    No brands matched the current filters.
                  </div>
                )}
              </div>
            </aside>

            <main className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                  Selected Brand
                </h2>
              </div>

              {selected ? (
                <div className="space-y-3 px-4 py-3">
                  <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-semibold text-amber-100">{selected.brandName}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          Number of Perfumes: {formatNumber(selected.perfumeCount)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`rounded border px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] ${statusBadgeStyle[selected.builderStatus === "complete" ? "healthy" : "review-needed"]}`}
                        >
                          {selected.builderStatus}
                        </span>
                        <span
                          className={`rounded border px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] ${reviewBadgeStyle[selected.reviewStatus]}`}
                        >
                          {selected.reviewStatus}
                        </span>
                      </div>
                    </div>
                  </article>

                  <MetricListCard title="Launch Years Distribution" items={selected.launchYearDistribution} />

                  <MetricListCard
                    title="Top Perfumes"
                    items={selected.topPerfumes}
                    linkBuilder={(item) =>
                      `/studio/master-database?brand=${encodeURIComponent(selected.brandName)}&perfume=${encodeURIComponent(item.label)}&context=${selectedContext}`
                    }
                  />

                  <MetricListCard
                    title="Top Notes"
                    items={selected.topNotes}
                    linkBuilder={(item) =>
                      `/studio/notes?note=${encodeURIComponent(item.label)}&context=${selectedContext}`
                    }
                  />

                  <MetricListCard
                    title="Top Main Accords"
                    items={selected.topMainAccords}
                    linkBuilder={(item) =>
                      `/studio/accords?accord=${encodeURIComponent(item.label)}&context=${selectedContext}`
                    }
                  />

                  <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                      Builder Status & Knowledge Coverage
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-300">
                      <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">
                        Builder Status: <span className="text-zinc-100">{selected.builderStatus}</span>
                      </div>
                      <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">
                        Knowledge Coverage: <span className="text-zinc-100">{formatPercent(selected.knowledgeCoveragePercent)}</span>
                      </div>
                      <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">
                        Review Status: <span className="text-zinc-100">{selected.reviewStatus}</span>
                      </div>
                      <div className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5">
                        Perfume Count: <span className="text-zinc-100">{formatNumber(selected.perfumeCount)}</span>
                      </div>
                    </div>
                  </article>
                </div>
              ) : (
                <div className="p-4 text-sm text-zinc-400">No brand selected.</div>
              )}
            </main>

            <aside className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                  Workspace Intelligence
                </h2>
              </div>

              <div className="space-y-3 px-4 py-3">
                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Statistics</p>
                  <StatLine label="Healthy Brands" value={formatNumber(data.statistics.healthyBrands)} />
                  <StatLine
                    label="Review Needed Brands"
                    value={formatNumber(data.statistics.reviewNeededBrands)}
                  />
                  <StatLine label="Total Rows" value={formatNumber(data.statistics.totalRows)} />
                  <StatLine
                    label="Mapped Note Occurrences"
                    value={formatNumber(data.statistics.mappedNoteOccurrences)}
                  />
                  <StatLine
                    label="Total Note Occurrences"
                    value={formatNumber(data.statistics.totalNoteOccurrences)}
                  />
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Builder Metadata</p>
                  <p className="mt-2 break-all text-xs text-zinc-300">
                    Workbook: {data.builderMetadata.workbookPath}
                  </p>
                  <p className="mt-1 text-xs text-zinc-300">Import Version: {data.builderMetadata.importVersion}</p>
                  <p className="mt-1 text-xs text-zinc-300">Builder Version: {data.builderMetadata.builderVersion}</p>
                  <p className="mt-1 text-xs text-zinc-300">Generated: {data.builderMetadata.generatedAt}</p>
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Validation</p>
                  <StatLine
                    label="Raw Import Valid"
                    value={data.validation.rawImportValid ? "true" : "false"}
                  />
                  <StatLine
                    label="Raw Import Errors"
                    value={formatNumber(data.validation.rawImportErrors)}
                  />
                  <StatLine
                    label="Raw Import Warnings"
                    value={formatNumber(data.validation.rawImportWarnings)}
                  />
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                    Brand Intelligence Summary
                  </p>
                  <SimpleMetricList
                    label="Top Knowledge Dense Brands"
                    items={data.intelligenceSummary.topKnowledgeDenseBrands}
                    suffix="%"
                  />
                  <SimpleMetricList
                    label="Top Coverage Brands"
                    items={data.intelligenceSummary.topCoverageBrands}
                    suffix="%"
                  />
                </article>

                <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Read-only Actions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled
                      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-500"
                    >
                      Refresh Workspace
                    </button>
                    <button
                      type="button"
                      disabled
                      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-500"
                    >
                      Export Selection
                    </button>
                    <button
                      type="button"
                      disabled
                      className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-500"
                    >
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
      <div className="mt-2 max-h-[180px] space-y-1 overflow-auto">
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
      <div className="mt-2 max-h-[130px] space-y-1 overflow-auto">
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

function BrandListRow({
  brand,
  selected,
  onSelect,
}: {
  brand: BrandWorkspaceListItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`mb-2 w-full rounded border px-2 py-2 text-left transition-colors ${
        selected
          ? "border-amber-300/40 bg-amber-300/10"
          : "border-zinc-800 bg-zinc-900/50 hover:border-amber-200/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`truncate text-sm font-medium ${selected ? "text-amber-100" : "text-zinc-200"}`}>
          {brand.brandName}
        </p>
        <span className="text-xs text-zinc-400">{formatNumber(brand.perfumeCount)}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <span
          className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${statusBadgeStyle[brand.status]}`}
        >
          {statusLabel[brand.status]}
        </span>
        <span
          className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${reviewBadgeStyle[brand.reviewStatus]}`}
        >
          {brand.reviewStatus}
        </span>
        <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-zinc-300">
          {formatPercent(brand.coveragePercent)}
        </span>
      </div>
    </button>
  );
}
