"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  BuilderStatus,
  KnowledgeStatus,
  MasterDatabaseDetailPanel,
  MasterDatabaseWorkspaceResult,
  PerformanceStatus,
  ReviewStatus,
  ValidationStatus,
} from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";

interface StudioMasterDatabaseWorkspaceProps {
  data: MasterDatabaseWorkspaceResult | null;
  loadError?: string;
}

type SortKey =
  | "perfume"
  | "brand"
  | "launchYear"
  | "completion"
  | "confidence"
  | "missingFields"
  | "reviewRequired"
  | "builder"
  | "validation"
  | "review"
  | "performance";

type ColumnKey =
  | "brand"
  | "perfume"
  | "launchYear"
  | "builder"
  | "validation"
  | "review"
  | "completion"
  | "confidence"
  | "missingFields"
  | "reviewRequired"
  | "performance";

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

const builderRank: Record<BuilderStatus, number> = {
  complete: 3,
  partial: 2,
  "missing-core": 1,
};

const validationRank: Record<ValidationStatus, number> = {
  passed: 3,
  warning: 2,
  failed: 1,
};

const reviewRank: Record<ReviewStatus, number> = {
  approved: 2,
  "pending-review": 1,
};

const knowledgeRank: Record<KnowledgeStatus, number> = {
  mapped: 3,
  partial: 2,
  unmapped: 1,
};

const performanceRank: Record<PerformanceStatus, number> = {
  available: 2,
  missing: 1,
};

const statusStyles = {
  builder: {
    complete: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
    partial: "border-amber-400/35 bg-amber-500/10 text-amber-200",
    "missing-core": "border-rose-400/35 bg-rose-500/10 text-rose-200",
  },
  validation: {
    passed: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
    warning: "border-amber-400/35 bg-amber-500/10 text-amber-200",
    failed: "border-rose-400/35 bg-rose-500/10 text-rose-200",
  },
  review: {
    approved: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
    "pending-review": "border-amber-400/35 bg-amber-500/10 text-amber-200",
  },
  knowledge: {
    mapped: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
    partial: "border-amber-400/35 bg-amber-500/10 text-amber-200",
    unmapped: "border-rose-400/35 bg-rose-500/10 text-rose-200",
  },
  performance: {
    available: "border-cyan-400/35 bg-cyan-500/10 text-cyan-200",
    missing: "border-zinc-700 bg-zinc-900 text-zinc-400",
  },
} as const;

const decisionStyles = {
  NEW_OBJECT: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
  UPDATE_EXISTING: "border-cyan-400/35 bg-cyan-500/10 text-cyan-200",
  DUPLICATE: "border-zinc-500/35 bg-zinc-800/80 text-zinc-200",
  ALIAS: "border-indigo-400/35 bg-indigo-500/10 text-indigo-200",
  MERGE: "border-amber-400/35 bg-amber-500/10 text-amber-200",
  IGNORE: "border-zinc-600/35 bg-zinc-900 text-zinc-400",
  REVIEW_REQUIRED: "border-rose-400/35 bg-rose-500/10 text-rose-200",
  INVALID: "border-rose-400/35 bg-rose-500/10 text-rose-200",
} as const;

const rowHeight = 48;
const viewportHeight = 560;
const overscan = 8;

const defaultColumnWidths: Record<ColumnKey, number> = {
  brand: 210,
  perfume: 260,
  launchYear: 110,
  builder: 150,
  validation: 150,
  review: 130,
  completion: 130,
  confidence: 120,
  missingFields: 130,
  reviewRequired: 150,
  performance: 140,
};

const minColumnWidths: Record<ColumnKey, number> = {
  brand: 150,
  perfume: 180,
  launchYear: 90,
  builder: 120,
  validation: 120,
  review: 110,
  completion: 95,
  confidence: 95,
  missingFields: 95,
  reviewRequired: 120,
  performance: 120,
};

export function StudioMasterDatabaseWorkspace({
  data,
  loadError,
}: StudioMasterDatabaseWorkspaceProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? "";
  const queryParams = useMemo(() => new URLSearchParams(searchParamsString), [searchParamsString]);
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [launchYearFilter, setLaunchYearFilter] = useState("all");
  const [builderFilter, setBuilderFilter] = useState<"all" | BuilderStatus>("all");
  const [validationFilter, setValidationFilter] = useState<"all" | ValidationStatus>("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | ReviewStatus>("all");
  const [performanceFilter, setPerformanceFilter] = useState<"all" | PerformanceStatus>("all");
  const [hasNotesFilter, setHasNotesFilter] = useState<"all" | "yes" | "no">("all");
  const [hasAccordsFilter, setHasAccordsFilter] = useState<"all" | "yes" | "no">("all");
  const [sortKey, setSortKey] = useState<SortKey>("perfume");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedId, setSelectedId] = useState<string>(data?.rows[0]?.id ?? "");
  const [scrollTop, setScrollTop] = useState(0);
  const [columnWidths, setColumnWidths] = useState<Record<ColumnKey, number>>(defaultColumnWidths);
  const resizeRef = useRef<{ key: ColumnKey; startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const q = queryParams.get("q");
    const perfume = queryParams.get("perfume");
    const record = queryParams.get("record");
    if (q && q.length > 0) {
      setSearchQuery(q);
    } else if (perfume && perfume.length > 0) {
      setSearchQuery(perfume);
    }

    if (record && record.length > 0) {
      setSelectedId(record);
    }
  }, [queryParams]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const state = resizeRef.current;
      if (!state) {
        return;
      }

      const delta = event.clientX - state.startX;
      const nextWidth = Math.max(minColumnWidths[state.key], state.startWidth + delta);
      setColumnWidths((prev) => ({ ...prev, [state.key]: nextWidth }));
    };

    const onMouseUp = () => {
      if (!resizeRef.current) {
        return;
      }

      resizeRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const startResize = (key: ColumnKey, clientX: number) => {
    resizeRef.current = {
      key,
      startX: clientX,
      startWidth: columnWidths[key],
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const availableBrands = useMemo(() => {
    if (!data) {
      return [];
    }

    return Array.from(new Set(data.rows.map((row) => row.brand))).sort((left, right) =>
      left.localeCompare(right),
    );
  }, [data]);

  const availableLaunchYears = useMemo(() => {
    if (!data) {
      return [];
    }

    return Array.from(
      new Set(
        data.rows
          .map((row) => row.launchYear.trim())
          .filter((year) => year.length > 0),
      ),
    ).sort((left, right) => Number.parseInt(right, 10) - Number.parseInt(left, 10));
  }, [data]);

  const filteredRows = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const rows = data.rows.filter((row) => {
      if (builderFilter !== "all" && row.builderStatus !== builderFilter) {
        return false;
      }
      if (validationFilter !== "all" && row.validationStatus !== validationFilter) {
        return false;
      }
      if (reviewFilter !== "all" && row.reviewStatus !== reviewFilter) {
        return false;
      }
      if (brandFilter !== "all" && row.brand !== brandFilter) {
        return false;
      }
      if (launchYearFilter !== "all" && row.launchYear !== launchYearFilter) {
        return false;
      }
      if (performanceFilter !== "all" && row.performanceStatus !== performanceFilter) {
        return false;
      }
      if (hasNotesFilter === "yes" && row.notesCount === 0) {
        return false;
      }
      if (hasNotesFilter === "no" && row.notesCount > 0) {
        return false;
      }
      if (hasAccordsFilter === "yes" && row.accordsCount === 0) {
        return false;
      }
      if (hasAccordsFilter === "no" && row.accordsCount > 0) {
        return false;
      }

      if (normalizedSearch.length === 0) {
        return true;
      }

      return row.searchText.includes(normalizedSearch);
    });

    rows.sort((left, right) => {
      let compare = 0;
      if (sortKey === "perfume") {
        compare = left.perfume.localeCompare(right.perfume);
      } else if (sortKey === "brand") {
        compare = left.brand.localeCompare(right.brand);
      } else if (sortKey === "launchYear") {
        compare = Number.parseInt(left.launchYear || "0", 10) - Number.parseInt(right.launchYear || "0", 10);
      } else if (sortKey === "completion") {
        compare = left.completionPercent - right.completionPercent;
      } else if (sortKey === "confidence") {
        compare = left.confidence - right.confidence;
      } else if (sortKey === "missingFields") {
        compare = left.missingFieldsCount - right.missingFieldsCount;
      } else if (sortKey === "reviewRequired") {
        compare = Number(left.reviewRequired) - Number(right.reviewRequired);
      } else if (sortKey === "builder") {
        compare = builderRank[left.builderStatus] - builderRank[right.builderStatus];
      } else if (sortKey === "validation") {
        compare = validationRank[left.validationStatus] - validationRank[right.validationStatus];
      } else if (sortKey === "review") {
        compare = reviewRank[left.reviewStatus] - reviewRank[right.reviewStatus];
      } else if (sortKey === "performance") {
        compare = performanceRank[left.performanceStatus] - performanceRank[right.performanceStatus];
      }

      if (compare === 0) {
        compare = left.perfume.localeCompare(right.perfume);
      }

      return sortDirection === "asc" ? compare : -compare;
    });

    return rows;
  }, [
    brandFilter,
    builderFilter,
    data,
    hasAccordsFilter,
    hasNotesFilter,
    launchYearFilter,
    performanceFilter,
    reviewFilter,
    searchQuery,
    sortDirection,
    sortKey,
    validationFilter,
  ]);

  useEffect(() => {
    if (filteredRows.length === 0) {
      setSelectedId("");
      return;
    }

    if (!filteredRows.some((row) => row.id === selectedId)) {
      setSelectedId(filteredRows[0].id);
    }
  }, [filteredRows, selectedId]);

  const selectedRow = filteredRows.find((row) => row.id === selectedId) ?? filteredRows[0];
  const selectedDetail = selectedRow && data ? data.detailsById[selectedRow.id] : undefined;
  const selectedContext = selectedRow ? encodeURIComponent(selectedRow.id) : "";

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

    if (selectedId.length > 0) {
      params.set("record", selectedId);
    }

    const nextQuery = params.toString();
    const currentQuery = searchParamsString;
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname);
    }
  }, [pathname, router, searchParamsString, searchQuery, selectedId]);

  const totalRows = filteredRows.length;
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - Math.floor(overscan / 2));
  const endIndex = Math.min(totalRows, startIndex + visibleCount);
  const visibleRows = filteredRows.slice(startIndex, endIndex);
  const topSpacerHeight = startIndex * rowHeight;
  const bottomSpacerHeight = Math.max(0, (totalRows - endIndex) * rowHeight);

  return (
    <section className="overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <header className="border-b border-amber-200/10 bg-zinc-950/90 px-4 py-3 lg:px-5">
        <h1 className="text-xl font-semibold tracking-tight text-amber-100">
          Master Perfume Database Workspace v1
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Read-only Builder surface for canonical perfume records and operational status.
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
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            <TopMetric label="Total Perfumes" value={formatNumber(data.totalPerfumes)} />
            <TopMetric label="Total Brands" value={formatNumber(data.totalBrands)} />
            <TopMetric label="Overall Completion" value={formatPercent(data.overallCompletionPercent)} />
            <TopMetric label="Average Confidence" value={data.averageBuilderConfidence.toFixed(2)} />
            <TopMetric label="Pending Enrichment Jobs" value={formatNumber(data.pendingEnrichmentJobs)} />
            <TopMetric label="Pending Review" value={formatNumber(data.decisionMetrics.reviewRequired)} />
            <TopMetric label="Decision Accuracy" value={formatPercent(data.decisionMetrics.decisionAccuracy)} />
            <TopMetric label="Automation %" value={formatPercent(data.decisionMetrics.automationPercent)} />
            <TopMetric label="Review Reduction" value={formatPercent(data.decisionMetrics.reviewReduction)} />
            <TopMetric label="Missing Images" value={formatNumber(data.missingImages)} />
            <TopMetric label="Missing Perfumers" value={formatNumber(data.missingPerfumers)} />
            <TopMetric label="Missing Launch Years" value={formatNumber(data.missingLaunchYears)} />
            <TopMetric label="Validation Issues" value={formatNumber(data.validationIssueCount)} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <article className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="space-y-3 border-b border-zinc-800 px-3 py-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Global search: perfume, brand, notes, accords"
                    className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300/40 focus:outline-none"
                  />

                  <select
                    value={brandFilter}
                    onChange={(event) => setBrandFilter(event.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                  >
                    <option value="all">Brand: All</option>
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>

                  <select
                    value={launchYearFilter}
                    onChange={(event) => setLaunchYearFilter(event.target.value)}
                    className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                  >
                    <option value="all">Launch Year: All</option>
                    {availableLaunchYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <select
                    value={builderFilter}
                    onChange={(event) => setBuilderFilter(event.target.value as "all" | BuilderStatus)}
                    className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                  >
                    <option value="all">Builder: All</option>
                    <option value="complete">Builder: Complete</option>
                    <option value="partial">Builder: Partial</option>
                    <option value="missing-core">Builder: Missing Core</option>
                  </select>

                  <select
                    value={validationFilter}
                    onChange={(event) =>
                      setValidationFilter(event.target.value as "all" | ValidationStatus)
                    }
                    className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                  >
                    <option value="all">Validation: All</option>
                    <option value="passed">Validation: Passed</option>
                    <option value="warning">Validation: Warning</option>
                    <option value="failed">Validation: Failed</option>
                  </select>

                  <select
                    value={reviewFilter}
                    onChange={(event) => setReviewFilter(event.target.value as "all" | ReviewStatus)}
                    className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                  >
                    <option value="all">Review: All</option>
                    <option value="approved">Review: Approved</option>
                    <option value="pending-review">Review: Pending Review</option>
                  </select>

                  <select
                    value={performanceFilter}
                    onChange={(event) =>
                      setPerformanceFilter(event.target.value as "all" | PerformanceStatus)
                    }
                    className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                  >
                    <option value="all">Performance: All</option>
                    <option value="available">Performance: Available</option>
                    <option value="missing">Performance: Missing</option>
                  </select>

                  <select
                    value={hasNotesFilter}
                    onChange={(event) =>
                      setHasNotesFilter(event.target.value as "all" | "yes" | "no")
                    }
                    className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                  >
                    <option value="all">Has Notes: All</option>
                    <option value="yes">Has Notes: Yes</option>
                    <option value="no">Has Notes: No</option>
                  </select>

                  <select
                    value={hasAccordsFilter}
                    onChange={(event) =>
                      setHasAccordsFilter(event.target.value as "all" | "yes" | "no")
                    }
                    className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                  >
                    <option value="all">Has Accords: All</option>
                    <option value="yes">Has Accords: Yes</option>
                    <option value="no">Has Accords: No</option>
                  </select>

                  <div className="col-span-1 grid grid-cols-2 gap-2 xl:col-span-2">
                    <select
                      value={sortKey}
                      onChange={(event) => setSortKey(event.target.value as SortKey)}
                      className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                    >
                      <option value="perfume">Sort: Perfume</option>
                      <option value="brand">Sort: Brand</option>
                      <option value="launchYear">Sort: Launch Year</option>
                      <option value="completion">Sort: Completion %</option>
                      <option value="confidence">Sort: Confidence</option>
                      <option value="missingFields">Sort: Missing Fields</option>
                      <option value="reviewRequired">Sort: Review Required</option>
                      <option value="builder">Sort: Builder</option>
                      <option value="validation">Sort: Validation</option>
                      <option value="review">Sort: Review</option>
                      <option value="performance">Sort: Performance</option>
                    </select>

                    <select
                      value={sortDirection}
                      onChange={(event) =>
                        setSortDirection(event.target.value as "asc" | "desc")
                      }
                      className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-zinc-500">
                  Displayed records: {formatNumber(totalRows)} / {formatNumber(data.totalPerfumes)}
                </p>
              </div>

              <div
                className="overflow-y-auto"
                style={{ height: `${viewportHeight}px` }}
                onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
              >
                <table className="w-full border-collapse text-xs table-fixed">
                  <colgroup>
                    <col style={{ width: `${columnWidths.brand}px` }} />
                    <col style={{ width: `${columnWidths.perfume}px` }} />
                    <col style={{ width: `${columnWidths.launchYear}px` }} />
                    <col style={{ width: `${columnWidths.builder}px` }} />
                    <col style={{ width: `${columnWidths.validation}px` }} />
                    <col style={{ width: `${columnWidths.review}px` }} />
                    <col style={{ width: `${columnWidths.completion}px` }} />
                    <col style={{ width: `${columnWidths.confidence}px` }} />
                    <col style={{ width: `${columnWidths.missingFields}px` }} />
                    <col style={{ width: `${columnWidths.reviewRequired}px` }} />
                    <col style={{ width: `${columnWidths.performance}px` }} />
                  </colgroup>
                  <thead className="sticky top-0 z-10 bg-zinc-950/95 text-zinc-400">
                    <tr>
                      {[
                        ["brand", "Brand"],
                        ["perfume", "Perfume"],
                        ["launchYear", "Launch Year"],
                        ["builder", "Builder Status"],
                        ["validation", "Validation"],
                        ["review", "Review"],
                        ["completion", "Completion %"],
                        ["confidence", "Confidence"],
                        ["missingFields", "Missing Fields"],
                        ["reviewRequired", "Review Required"],
                        ["performance", "Performance"],
                      ].map(([key, label]) => (
                        <th key={key} className="relative border-b border-zinc-800 px-2 py-2 text-left">
                          <span>{label}</span>
                          <button
                            type="button"
                            aria-label={`Resize ${label} column`}
                            onMouseDown={(event) => startResize(key as ColumnKey, event.clientX)}
                            className="absolute right-0 top-0 h-full w-2 cursor-col-resize bg-transparent"
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topSpacerHeight > 0 ? (
                      <tr>
                        <td colSpan={11} style={{ height: `${topSpacerHeight}px` }} />
                      </tr>
                    ) : null}

                    {visibleRows.map((row) => {
                      const selected = row.id === selectedRow?.id;
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedId(row.id)}
                          className={`cursor-pointer border-b border-zinc-900 transition-colors ${
                            selected
                              ? "bg-amber-300/10"
                              : "hover:bg-zinc-800/35"
                          }`}
                          style={{ height: `${rowHeight}px` }}
                        >
                          <td className="px-2 py-2 text-zinc-300">{row.brand}</td>
                          <td className="px-2 py-2 text-zinc-100">{row.perfume}</td>
                          <td className="px-2 py-2 text-zinc-300">{row.launchYear || "n/a"}</td>
                          <td className="px-2 py-2">
                            <StatusBadge
                              styleClass={statusStyles.builder[row.builderStatus]}
                              label={row.builderStatus}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <StatusBadge
                              styleClass={statusStyles.validation[row.validationStatus]}
                              label={row.validationStatus}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <StatusBadge
                              styleClass={statusStyles.review[row.reviewStatus]}
                              label={row.reviewStatus}
                            />
                          </td>
                          <td className="px-2 py-2">
                            {formatPercent(row.completionPercent)}
                          </td>
                          <td className="px-2 py-2">{row.confidence.toFixed(2)}</td>
                          <td className="px-2 py-2">{formatNumber(row.missingFieldsCount)}</td>
                          <td className="px-2 py-2">
                            <StatusBadge
                              styleClass={
                                row.reviewRequired
                                  ? "border-amber-400/35 bg-amber-500/10 text-amber-200"
                                  : "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                              }
                              label={row.reviewRequired ? "yes" : "no"}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <StatusBadge
                              styleClass={statusStyles.performance[row.performanceStatus]}
                              label={row.performanceStatus}
                            />
                          </td>
                        </tr>
                      );
                    })}

                    {bottomSpacerHeight > 0 ? (
                      <tr>
                        <td colSpan={11} style={{ height: `${bottomSpacerHeight}px` }} />
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </article>

            <aside className="rounded-lg border border-zinc-800 bg-zinc-900/45">
              <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
                  Detail Panel
                </h2>
              </div>

              {selectedDetail ? (
                <div className="space-y-3 px-4 py-3">
                  <SectionCard title="Selected Perfume">
                    <p className="text-sm font-semibold text-amber-100">{selectedDetail.perfume}</p>
                    <p className="mt-1 text-xs text-zinc-400">Worksheet row ID: {selectedDetail.id}</p>
                  </SectionCard>

                  <SectionCard title="Identity">
                    <PairLine label="Perfume" value={selectedDetail.perfume} />
                    <PairLine label="Brand" value={selectedDetail.brand} />
                    <PairLine label="Launch Year" value={selectedDetail.launchYear || "n/a"} />
                  </SectionCard>

                  <SectionCard title="Brand">
                    <Link
                      href={`/studio/brands?brand=${encodeURIComponent(selectedDetail.brand)}&context=${selectedContext}`}
                      className="text-sm text-amber-200 hover:text-amber-100"
                    >
                      {selectedDetail.brand}
                    </Link>
                    <p className="mt-1 text-xs text-zinc-400">Launch Year: {selectedDetail.launchYear || "n/a"}</p>
                  </SectionCard>

                  <SectionCard title="Notes">
                    <TokenGrid
                      tokens={selectedDetail.notes}
                      linkBuilder={(token) =>
                        `/studio/notes?note=${encodeURIComponent(token)}&context=${selectedContext}`
                      }
                    />
                  </SectionCard>

                  <SectionCard title="Main Accords">
                    <TokenGrid
                      tokens={selectedDetail.mainAccords}
                      linkBuilder={(token) =>
                        `/studio/accords?accord=${encodeURIComponent(token)}&context=${selectedContext}`
                      }
                    />
                  </SectionCard>

                  <SectionCard title="Performance">
                    <PairLine
                      label="Longevity Votes"
                      value={formatNumber(Object.values(selectedDetail.longevityVotes).reduce((sum, value) => sum + value, 0))}
                    />
                    <PairLine
                      label="Sillage Votes"
                      value={formatNumber(Object.values(selectedDetail.sillageVotes).reduce((sum, value) => sum + value, 0))}
                    />
                    <PairLine
                      label="Status"
                      value={selectedRow?.performanceStatus ?? "missing"}
                    />
                  </SectionCard>

                  <SectionCard title="Validation">
                    <StatusBadge
                      styleClass={statusStyles.validation[selectedDetail.validation.status]}
                      label={selectedDetail.validation.status}
                    />
                    <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                      {selectedDetail.validation.issues.length > 0 ? (
                        selectedDetail.validation.issues.map((issue) => <li key={issue}>- {issue}</li>)
                      ) : (
                        <li>- No validation issues</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Builder">
                    <PairLine label="Status" value={selectedDetail.builder.status} />
                    <PairLine
                      label="Coverage"
                      value={formatPercent(selectedDetail.builder.coveragePercent)}
                    />
                    <PairLine
                      label="Confidence"
                      value={selectedDetail.builder.confidence.toFixed(2)}
                    />
                  </SectionCard>

                  <SectionCard title="Decision Engine">
                    <StatusBadge
                      styleClass={decisionStyles[selectedDetail.decision.current]}
                      label={selectedDetail.decision.current}
                    />
                    <PairLine label="Confidence" value={selectedDetail.decision.confidence.toFixed(2)} />
                    <PairLine label="Source Connector" value={selectedDetail.decision.sourceConnector} />
                    <PairLine label="Suggested Action" value={selectedDetail.decision.suggestedNextAction} />
                    <PairLine label="Timestamp" value={selectedDetail.decision.timestamp} />
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">Triggered Rules</p>
                    <TokenGrid tokens={selectedDetail.decision.triggeredRules} />
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">Explanation</p>
                    <p className="text-xs text-zinc-300">{selectedDetail.decision.explanation}</p>
                  </SectionCard>

                  <SectionCard title="Master Intelligence">
                    <PairLine
                      label="Completion"
                      value={formatPercent(selectedDetail.intelligence.completionPercentage)}
                    />
                    <PairLine
                      label="Missing Fields"
                      value={formatNumber(selectedDetail.intelligence.missingFields.length)}
                    />
                    <PairLine
                      label="Data Quality"
                      value={selectedDetail.intelligence.dataQualityScore.toFixed(2)}
                    />
                    <PairLine
                      label="Builder Confidence"
                      value={selectedDetail.intelligence.builderConfidence.toFixed(2)}
                    />
                    <PairLine
                      label="Review Required"
                      value={selectedDetail.intelligence.reviewRequired ? "yes" : "no"}
                    />
                    <PairLine
                      label="Automatic Resolution Possible"
                      value={selectedDetail.intelligence.automaticResolutionPossible ? "yes" : "no"}
                    />
                    <PairLine
                      label="Suggested Connector"
                      value={selectedDetail.intelligence.suggestedConnector}
                    />
                    <PairLine
                      label="Provenance Completeness"
                      value={formatPercent(selectedDetail.intelligence.provenanceCompleteness)}
                    />
                    <PairLine
                      label="Validation Completeness"
                      value={formatPercent(selectedDetail.intelligence.validationCompleteness)}
                    />
                    <PairLine
                      label="Knowledge Completeness"
                      value={formatPercent(selectedDetail.intelligence.knowledgeCompleteness)}
                    />
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">Missing Fields</p>
                    <TokenGrid tokens={selectedDetail.intelligence.missingFields} />
                  </SectionCard>

                  <SectionCard title="Decision Provenance">
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {selectedDetail.decision.provenance.length > 0 ? (
                        selectedDetail.decision.provenance.map((entry) => (
                          <li key={`${entry.key}-${entry.source}`}>
                            - {entry.key}: {entry.source} / {entry.method} / {entry.confidence.toFixed(2)}
                          </li>
                        ))
                      ) : (
                        <li>- No provenance entries</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Decision History">
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {selectedDetail.decision.history.length > 0 ? (
                        selectedDetail.decision.history.map((entry) => (
                          <li key={`${entry.ruleId}-${entry.at}`}>
                            - {entry.at}: {entry.ruleId} / {entry.decision} / {entry.reason}
                          </li>
                        ))
                      ) : (
                        <li>- No decision history available</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Alternative Candidates">
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {selectedDetail.decision.alternativeCandidates.length > 0 ? (
                        selectedDetail.decision.alternativeCandidates.map((candidate) => (
                          <li key={candidate.id}>
                            - {candidate.perfume}: {candidate.brand} / {candidate.launchYear} / {candidate.decision} / {candidate.reason}
                          </li>
                        ))
                      ) : (
                        <li>- No alternative candidates</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Enrichment Tasks">
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {selectedDetail.intelligence.enrichmentTasks.length > 0 ? (
                        selectedDetail.intelligence.enrichmentTasks.map((task) => (
                          <li key={task.id}>
                            - {task.field}: {task.reason} ({task.suggestedConnector}, {task.resolutionType})
                          </li>
                        ))
                      ) : (
                        <li>- No enrichment tasks</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Connector Requirements">
                    <PairLine
                      label="Discovery Source"
                      value={selectedDetail.connectors.discoverySource}
                    />
                    <PairLine
                      label="Pending Enrichment"
                      value={formatNumber(selectedDetail.connectors.pendingEnrichment)}
                    />
                    <PairLine
                      label="Pending Jobs"
                      value={formatNumber(selectedDetail.connectors.pendingJobs)}
                    />
                    <PairLine
                      label="Completed Jobs"
                      value={formatNumber(selectedDetail.connectors.completedJobs)}
                    />
                    <PairLine
                      label="Connector Confidence"
                      value={selectedDetail.connectors.confidence.toFixed(2)}
                    />
                    <PairLine
                      label="Last Synchronized"
                      value={selectedDetail.connectors.lastSynchronized}
                    />
                    <PairLine
                      label="Conflict Status"
                      value={selectedDetail.connectors.conflictStatus}
                    />
                    <PairLine
                      label="Pending Synchronizations"
                      value={formatNumber(selectedDetail.connectors.pendingSynchronizations)}
                    />
                    <PairLine
                      label="Completed Synchronizations"
                      value={formatNumber(selectedDetail.connectors.completedSynchronizations)}
                    />
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">Missing Fields</p>
                    <TokenGrid tokens={selectedDetail.connectors.missingFields} />
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">Required Connectors</p>
                    <TokenGrid tokens={selectedDetail.connectors.requiredConnectors} />
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">Imported Sources</p>
                    <TokenGrid tokens={selectedDetail.connectors.importedSources} />
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">Connector Status</p>
                    <ul className="mt-1 space-y-1 text-xs text-zinc-300">
                      {selectedDetail.connectors.connectorStatus.length > 0 ? (
                        selectedDetail.connectors.connectorStatus.map((connector) => (
                          <li key={`${connector.connector}-${connector.lastRun}`}>
                            - {connector.connector}: {connector.status} (pending {formatNumber(connector.pendingJobs)}, failed {formatNumber(connector.failedJobs)})
                          </li>
                        ))
                      ) : (
                        <li>- No connector requirements</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Connector History">
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {selectedDetail.connectors.connectorHistory.length > 0 ? (
                        selectedDetail.connectors.connectorHistory.map((entry) => (
                          <li key={`${entry.at}-${entry.connector}-${entry.workflow}`}>
                            - {entry.at}: {entry.connector} / {entry.workflow} / {entry.status} / {entry.result ?? "none"} / {entry.confidence.toFixed(2)}
                          </li>
                        ))
                      ) : (
                        <li>- No connector history for this perfume</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Enrichment History">
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {selectedDetail.connectors.enrichmentHistory.length > 0 ? (
                        selectedDetail.connectors.enrichmentHistory.map((entry) => (
                          <li key={entry.jobId}>
                            - {entry.at}: {entry.connector} / {entry.field} / {entry.status}
                          </li>
                        ))
                      ) : (
                        <li>- No connector history for this perfume</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Synchronization History">
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {selectedDetail.connectors.synchronizationHistory.length > 0 ? (
                        selectedDetail.connectors.synchronizationHistory.map((entry) => (
                          <li key={`${entry.at}-${entry.connector}-${entry.source}`}>
                            - {entry.at}: {entry.connector} / {entry.source} / {entry.confidence.toFixed(2)} / fields {formatNumber(entry.fields.length)}
                          </li>
                        ))
                      ) : (
                        <li>- No synchronization history for this perfume</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Review Information">
                    <StatusBadge
                      styleClass={statusStyles.review[selectedDetail.review.status]}
                      label={selectedDetail.review.status}
                    />
                    <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                      {selectedDetail.review.reasons.length > 0 ? (
                        selectedDetail.review.reasons.map((reason) => <li key={reason}>- {reason}</li>)
                      ) : (
                        <li>- No review blockers</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Knowledge Coverage">
                    <PairLine label="Status" value={selectedDetail.knowledge.status} />
                    <PairLine
                      label="Mapped Notes"
                      value={formatNumber(selectedDetail.knowledge.mappedCount)}
                    />
                    <PairLine
                      label="Unresolved Notes"
                      value={formatNumber(selectedDetail.knowledge.unresolvedCount)}
                    />
                  </SectionCard>

                  <SectionCard title="Relationships">
                    <p className="text-xs uppercase tracking-[0.1em] text-zinc-500">Same Brand</p>
                    <ul className="mt-1 space-y-1 text-xs text-zinc-300">
                      {selectedDetail.relationships.sameBrandPerfumes.length > 0 ? (
                        selectedDetail.relationships.sameBrandPerfumes.map((name) => (
                          <li key={name}>- {name}</li>
                        ))
                      ) : (
                        <li>- No same-brand relationships</li>
                      )}
                    </ul>
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">Common Notes</p>
                    <ul className="mt-1 space-y-1 text-xs text-zinc-300">
                      {selectedDetail.relationships.commonNotes.length > 0 ? (
                        selectedDetail.relationships.commonNotes.map((item) => (
                          <li key={item.note}>- {item.note}: {formatNumber(item.count)}</li>
                        ))
                      ) : (
                        <li>- No common-note relationships</li>
                      )}
                    </ul>
                  </SectionCard>

                  <SectionCard title="Translation">
                    <PairLine label="Status" value={selectedDetail.translation.status} />
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-zinc-500">
                      Unresolved Tokens
                    </p>
                    <ul className="mt-1 space-y-1 text-xs text-zinc-300">
                      {selectedDetail.translation.unresolvedTokens.length > 0 ? (
                        selectedDetail.translation.unresolvedTokens.map((token) => (
                          <li key={token}>- {token}</li>
                        ))
                      ) : (
                        <li>- None</li>
                      )}
                    </ul>
                  </SectionCard>
                </div>
              ) : (
                <div className="p-4 text-sm text-zinc-400">No selected perfume.</div>
              )}
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

function StatusBadge({ styleClass, label }: { styleClass: string; label: string }) {
  return (
    <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${styleClass}`}>
      {label}
    </span>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{title}</p>
      <div className="mt-2">{children}</div>
    </article>
  );
}

function PairLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1 flex items-center justify-between gap-2 text-xs">
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-100">{value}</span>
    </div>
  );
}

function TokenGrid({
  tokens,
  linkBuilder,
}: {
  tokens: string[];
  linkBuilder?: (token: string) => string;
}) {
  if (tokens.length === 0) {
    return <p className="text-xs text-zinc-500">No values.</p>;
  }

  return (
    <div className="flex max-h-[140px] flex-wrap gap-1 overflow-auto">
      {tokens.map((token) =>
        linkBuilder ? (
          <Link
            key={token}
            href={linkBuilder(token)}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-200 hover:border-amber-300/40"
          >
            {token}
          </Link>
        ) : (
          <span
            key={token}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-200"
          >
            {token}
          </span>
        ),
      )}
    </div>
  );
}
