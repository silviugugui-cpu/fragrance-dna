"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { saveMasterDatabaseRecordAction } from "@/app/studio/_actions/masterDatabaseActions";
import { resolvePerfumeImageSrc } from "@/lib/design/perfumeImage";
import type {
  BrandType,
  BuilderStatus,
  KnowledgeStatus,
  MasterDatabaseDetailPanel,
  MasterDatabaseWorkspaceResult,
  PerformanceStatus,
} from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";

interface StudioMasterDatabaseWorkspaceProps {
  data: MasterDatabaseWorkspaceResult | null;
  loadError?: string;
  readOnly?: boolean;
}

type SortKey =
  | "perfume"
  | "brand"
  | "brandType"
  | "launchYear"
  | "completion"
  | "confidence"
  | "missingFields"
  | "reviewRequired"
  | "performance";

type ColumnKey =
  | "brand"
  | "brandType"
  | "perfume"
  | "launchYear"
  | "completion"
  | "confidence"
  | "missingFields"
  | "reviewRequired"
  | "performance";

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);

const formatPercent = (value: number): string => `${value.toFixed(2)}%`;
const serializeScoreMap = (scores?: Record<string, number>): string =>
  Object.entries(scores ?? {}).map(([name, value]) => `${name}: ${value}`).join("\n");

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
const minViewportHeight = 360;
const overscan = 8;

const defaultColumnWidths: Record<ColumnKey, number> = {
  brand: 150,
  brandType: 145,
  perfume: 200,
  launchYear: 90,
  completion: 105,
  confidence: 95,
  missingFields: 100,
  reviewRequired: 105,
  performance: 105,
};

const minColumnWidths: Record<ColumnKey, number> = {
  brand: 110,
  brandType: 120,
  perfume: 140,
  launchYear: 75,
  completion: 80,
  confidence: 80,
  missingFields: 80,
  reviewRequired: 90,
  performance: 90,
};

export function StudioMasterDatabaseWorkspace({
  data,
  loadError,
  readOnly = false,
}: StudioMasterDatabaseWorkspaceProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? "";
  const queryParams = useMemo(() => new URLSearchParams(searchParamsString), [searchParamsString]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDnaPoolOnly, setUserDnaPoolOnly] = useState(queryParams.get("pool") === "user-dna");
  const [requestedUserDnaProfileId, setRequestedUserDnaProfileId] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [brandTypeFilter, setBrandTypeFilter] = useState<"all" | BrandType>("all");
  const [launchYearFilter, setLaunchYearFilter] = useState("all");
  const [builderFilter, setBuilderFilter] = useState<"all" | BuilderStatus>("all");
  const [performanceFilter, setPerformanceFilter] = useState<"all" | PerformanceStatus>("all");
  const [missingFieldsFilter, setMissingFieldsFilter] = useState("all");
  const [hasNotesFilter, setHasNotesFilter] = useState<"all" | "yes" | "no">("all");
  const [sortKey, setSortKey] = useState<SortKey>("perfume");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedId, setSelectedId] = useState<string>(() => {
    const requestedRecord = queryParams.get("record");
    if (requestedRecord) return requestedRecord;
    if (queryParams.get("pool") === "user-dna") {
      return data?.rows.find((row) => row.userDnaTestEnabled)?.id ?? "";
    }
    return data?.rows[0]?.id ?? "";
  });
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(minViewportHeight);
  const [columnWidths, setColumnWidths] = useState<Record<ColumnKey, number>>(defaultColumnWidths);
  const resizeRef = useRef<{ key: ColumnKey; startX: number; startWidth: number } | null>(null);
  const tableViewportRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const recalcViewportHeight = () => {
      const container = tableViewportRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const available = window.innerHeight - rect.top - 20;
      const targetByScreen = Math.floor(window.innerHeight * 0.62);
      setViewportHeight(Math.max(minViewportHeight, Math.max(Math.floor(available), targetByScreen)));
    };

    recalcViewportHeight();
    window.addEventListener("resize", recalcViewportHeight);
    return () => {
      window.removeEventListener("resize", recalcViewportHeight);
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

  const rows = data?.rows ?? [];

  const availableBrands = useMemo(() => {
    if (rows.length === 0) {
      return [];
    }

    return Array.from(new Set(rows.map((row) => row.brand))).sort((left, right) =>
      left.localeCompare(right),
    );
  }, [rows]);

  const brandTypeCounts = useMemo(
    () =>
      rows.reduce(
        (counts, row) => {
          counts[row.brandType] += 1;
          return counts;
        },
        { "N/A": 0, Designer: 0, Niche: 0, "Dupe/Middle Eastern": 0 },
      ),
    [rows],
  );

  const availableLaunchYears = useMemo(() => {
    if (rows.length === 0) {
      return [];
    }

    return Array.from(
      new Set(
        rows
          .map((row) => row.launchYear.trim())
          .filter((year) => year.length > 0),
      ),
    ).sort((left, right) => Number.parseInt(right, 10) - Number.parseInt(left, 10));
  }, [rows]);

  const availableMissingFieldCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const row of rows) {
      counts.set(row.missingFieldsCount, (counts.get(row.missingFieldsCount) ?? 0) + 1);
    }

    return Array.from(counts.entries()).sort(([left], [right]) => left - right);
  }, [rows]);

  const photoCounts = useMemo(
    () =>
      rows.reduce(
        (counts, row) => {
          counts[row.performanceStatus] += 1;
          return counts;
        },
        { available: 0, missing: 0 },
      ),
    [rows],
  );

  const filteredRows = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const hyphenatedSearch = normalizedSearch.replace(/\s+/g, "-");
    const rows = data.rows.filter((row) => {
      if (userDnaPoolOnly && !row.userDnaTestEnabled) {
        return false;
      }
      if (builderFilter !== "all" && row.builderStatus !== builderFilter) {
        return false;
      }
      if (brandFilter !== "all" && row.brand !== brandFilter) {
        return false;
      }
      if (brandTypeFilter !== "all" && row.brandType !== brandTypeFilter) {
        return false;
      }
      if (launchYearFilter !== "all" && row.launchYear !== launchYearFilter) {
        return false;
      }
      if (performanceFilter !== "all" && row.performanceStatus !== performanceFilter) {
        return false;
      }
      if (missingFieldsFilter !== "all" && row.missingFieldsCount !== Number(missingFieldsFilter)) {
        return false;
      }
      if (hasNotesFilter === "yes" && row.notesCount === 0) {
        return false;
      }
      if (hasNotesFilter === "no" && row.notesCount > 0) {
        return false;
      }
      if (normalizedSearch.length === 0) {
        return true;
      }

      return row.searchText.includes(normalizedSearch) || row.searchText.includes(hyphenatedSearch);
    });

    rows.sort((left, right) => {
      let compare = 0;
      if (sortKey === "perfume") {
        compare = left.perfume.localeCompare(right.perfume);
      } else if (sortKey === "brand") {
        compare = left.brand.localeCompare(right.brand);
      } else if (sortKey === "brandType") {
        compare = left.brandType.localeCompare(right.brandType);
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
    brandTypeFilter,
    builderFilter,
    data,
    hasNotesFilter,
    launchYearFilter,
    missingFieldsFilter,
    performanceFilter,
    searchQuery,
    sortDirection,
    sortKey,
    userDnaPoolOnly,
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
  const findDetailForRow = (row: MasterDatabaseWorkspaceResult["rows"][number]): MasterDatabaseDetailPanel | null => {
    if (!data) {
      return null;
    }

    const exact = data.detailsById[row.id];
    if (exact) {
      return exact;
    }

    const normalizedMatch = Object.values(data.detailsById).find(
      (detail) =>
        detail.perfume === row.perfume &&
        detail.brand === row.brand &&
        detail.launchYear === row.launchYear,
    );

    return normalizedMatch ?? null;
  };

  const selectedDetail = selectedRow ? findDetailForRow(selectedRow) : null;
  const selectedUserDnaProfiles = selectedDetail?.userDnaProfiles ?? [];
  const selectedUserDnaProfileId = requestedUserDnaProfileId === "new"
    ? "new"
    : selectedUserDnaProfiles.some((profile) => profile.testProfileId === requestedUserDnaProfileId)
      ? requestedUserDnaProfileId
      : selectedUserDnaProfiles[0]?.testProfileId ?? "new";
  const selectedUserDnaProfile = selectedUserDnaProfiles.find(
    (profile) => profile.testProfileId === selectedUserDnaProfileId,
  );

  const selectedImage = resolvePerfumeImageSrc(
    selectedDetail?.localImagePath,
    selectedDetail?.imageUrl,
    selectedRow?.localImagePath,
    selectedRow?.imageUrl,
  );
  const selectedContext = selectedRow ? encodeURIComponent(selectedRow.id) : "";
  const editingFormRecord = selectedRow
    ? {
        id: selectedRow.id,
        perfume: selectedRow.perfume,
        brand: selectedRow.brand,
        launchYear: selectedRow.launchYear,
        source: selectedRow.worksheet,
        status: selectedRow.validationStatus,
        perfumer: selectedDetail?.perfumer ?? "",
        gender: selectedDetail?.gender ?? "",
        description: selectedDetail?.description ?? "",
        imageUrl: selectedDetail?.imageUrl ?? selectedRow?.imageUrl ?? "",
        localImagePath: selectedDetail?.localImagePath ?? selectedRow?.localImagePath ?? "",
        notes: selectedDetail?.notes ?? [],
        mainAccords: selectedDetail?.mainAccords ?? [],
      }
    : null;

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

    if (userDnaPoolOnly) {
      params.set("pool", "user-dna");
    } else {
      params.delete("pool");
    }

    const edit = queryParams.get("edit");
    if (edit && edit.length > 0) {
      params.set("edit", edit);
    } else {
      params.delete("edit");
    }

    const nextQuery = params.toString();
    const currentQuery = searchParamsString;
    if (nextQuery !== currentQuery) {
      window.history.replaceState(null, "", nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname);
    }
  }, [pathname, searchParamsString, searchQuery, selectedId, userDnaPoolOnly]);

  const totalRows = filteredRows.length;
  const completeRows = rows.filter((row) => row.builderStatus === "complete").length;
  const partialRows = rows.filter((row) => row.builderStatus === "partial").length;
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - Math.floor(overscan / 2));
  const endIndex = Math.min(totalRows, startIndex + visibleCount);
  const visibleRows = filteredRows.slice(startIndex, endIndex);
  const topSpacerHeight = startIndex * rowHeight;
  const bottomSpacerHeight = Math.max(0, (totalRows - endIndex) * rowHeight);

  return (
    <section className="min-h-[calc(100vh-150px)] overflow-hidden border border-zinc-800/70 bg-zinc-950/60">
      <header className="border-b border-zinc-800/70 px-3 py-3 lg:px-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-amber-100">
              Master Perfume Database Manager
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Search, filter, inspect, and edit canonical perfume records directly in the database.
            </p>
            {readOnly ? (
              <p className="mt-2 text-xs text-amber-200/80">
                Production database is read-only. Edit the local SQLite database and redeploy to publish changes.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-stretch gap-2 xl:max-w-[760px] xl:justify-end">
            <SummaryButton
              label="DB Total"
              value={formatNumber(data?.totalPerfumes ?? 0)}
              onClick={() => {
                setUserDnaPoolOnly(false);
                setBrandFilter("all");
                setBrandTypeFilter("all");
                setLaunchYearFilter("all");
                setBuilderFilter("all");
                setPerformanceFilter("all");
                setMissingFieldsFilter("all");
                setHasNotesFilter("all");
                setSearchQuery("");
              }}
            />
            <SummaryButton
              label="DB User DNA"
              value={formatNumber(data?.userDnaProfileCount ?? 0)}
              onClick={() => {
                setUserDnaPoolOnly(true);
                setBrandFilter("all");
                setBrandTypeFilter("all");
                setLaunchYearFilter("all");
                setBuilderFilter("all");
                setPerformanceFilter("all");
                setMissingFieldsFilter("all");
                setHasNotesFilter("all");
                setSearchQuery("");
              }}
              active={userDnaPoolOnly}
            />
            <SummaryButton
              label="Complete"
              value={formatNumber(completeRows)}
              onClick={() => setBuilderFilter("complete")}
              active={builderFilter === "complete"}
            />
            <SummaryButton
              label="Partial"
              value={formatNumber(partialRows)}
              onClick={() => setBuilderFilter("partial")}
              active={builderFilter === "partial"}
            />
            <button
              type="button"
              onClick={() => setIsCreatingNew((value) => !value)}
              disabled={readOnly}
              className={`min-w-[150px] flex-1 rounded border p-2 text-left transition-colors ${
                isCreatingNew
                  ? "border-emerald-300/50 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900/55 hover:border-emerald-300/35"
              }`}
            >
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Add / New</p>
              <p className="mt-1 text-sm font-semibold text-emerald-100">Create Record</p>
            </button>
          </div>
        </div>
      </header>

      {loadError ? (
        <div className="p-3">
          <article className="border border-rose-300/25 bg-rose-950/20 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-rose-200">Load Error</p>
            <p className="mt-1 text-sm text-rose-100">{loadError}</p>
          </article>
        </div>
      ) : null}

      {!loadError && data ? (
        <div className="grid min-h-[calc(100vh-190px)] grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0 border-r-0 border-zinc-800/70 bg-transparent xl:border-r">
            <div className="space-y-2 border-b border-zinc-800/70 px-3 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Global search: perfume, brand, notes, accords"
                  className="min-w-[260px] flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300/40 focus:outline-none"
                />

                <select
                  value={brandFilter}
                  onChange={(event) => setBrandFilter(event.target.value)}
                  className="min-w-[150px] flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                >
                  <option value="all">Brand: All</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>

                <select
                  value={brandTypeFilter}
                  onChange={(event) => setBrandTypeFilter(event.target.value as "all" | BrandType)}
                  className="min-w-[170px] flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                >
                  <option value="all">Brand Type: All</option>
                  <option value="N/A">N/A ({formatNumber(brandTypeCounts["N/A"])})</option>
                  <option value="Designer">Designer ({formatNumber(brandTypeCounts.Designer)})</option>
                  <option value="Niche">Niche ({formatNumber(brandTypeCounts.Niche)})</option>
                  <option value="Dupe/Middle Eastern">
                    Dupe/Middle Eastern ({formatNumber(brandTypeCounts["Dupe/Middle Eastern"])})
                  </option>
                </select>

                <select
                  value={launchYearFilter}
                  onChange={(event) => setLaunchYearFilter(event.target.value)}
                  className="min-w-[150px] flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                >
                  <option value="all">Launch Year: All</option>
                  {availableLaunchYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <select
                  value={hasNotesFilter}
                  onChange={(event) =>
                    setHasNotesFilter(event.target.value as "all" | "yes" | "no")
                  }
                  className="min-w-[150px] flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                >
                  <option value="all">Has Notes: All</option>
                  <option value="yes">Has Notes: Yes</option>
                  <option value="no">Has Notes: No</option>
                </select>

                <select
                  value={missingFieldsFilter}
                  onChange={(event) => setMissingFieldsFilter(event.target.value)}
                  className="min-w-[180px] flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                >
                  <option value="all">Missing Fields: All</option>
                  {availableMissingFieldCounts.map(([count, recordCount]) => (
                    <option key={count} value={count}>
                      {count} missing ({formatNumber(recordCount)})
                    </option>
                  ))}
                </select>

                <select
                  value={performanceFilter}
                  onChange={(event) =>
                    setPerformanceFilter(event.target.value as "all" | PerformanceStatus)
                  }
                  className="min-w-[150px] flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                >
                  <option value="all">Photo: All</option>
                  <option value="available">With Photo ({formatNumber(photoCounts.available)})</option>
                  <option value="missing">Without Photo ({formatNumber(photoCounts.missing)})</option>
                </select>
              </div>
            </div>

            <div
              ref={tableViewportRef}
              className="overflow-y-auto"
              style={{ height: `${viewportHeight}px` }}
              onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
            >
              <table className="w-full border-collapse table-fixed text-xs">
                <colgroup>
                  <col style={{ width: `${columnWidths.brand}px` }} />
                  <col style={{ width: `${columnWidths.brandType}px` }} />
                  <col style={{ width: `${columnWidths.perfume}px` }} />
                  <col style={{ width: `${columnWidths.launchYear}px` }} />
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
                        ["brandType", "Brand Type"],
                        ["perfume", "Perfume"],
                        ["launchYear", "Launch Year"],
                        ["completion", "Completion %"],
                        ["confidence", "Confidence"],
                        ["missingFields", "Missing Fields"],
                        ["reviewRequired", "Review Required"],
                        ["performance", "Performance"],
                      ].map(([key, label]) => {
                        const columnKey = key as SortKey;
                        const isActive = sortKey === columnKey;
                        const arrow = isActive ? (sortDirection === "asc" ? "↑" : "↓") : "↕";

                        return (
                          <th key={key} className="relative border-b border-zinc-800 px-2 py-2 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                if (sortKey === columnKey) {
                                  setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
                                  return;
                                }
                                setSortKey(columnKey);
                                setSortDirection("asc");
                              }}
                              className={`flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left transition-colors ${
                                isActive ? "bg-amber-500/10 text-amber-100" : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200"
                              }`}
                            >
                              <span>{label}</span>
                              <span className="text-[10px] font-semibold">{arrow}</span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Resize ${label} column`}
                              onMouseDown={(event) => startResize(key as ColumnKey, event.clientX)}
                              className="absolute right-0 top-0 h-full w-2 cursor-col-resize bg-transparent"
                            />
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {topSpacerHeight > 0 ? (
                      <tr>
                        <td colSpan={9} style={{ height: `${topSpacerHeight}px` }} />
                      </tr>
                    ) : null}

                  {visibleRows.map((row) => {
                      const selected = row.id === selectedRow?.id;
                      return (
                        <tr
                          key={`${row.id}:${row.rowIndex}`}
                          onClick={() => {
                            setSelectedId(row.id);
                          }}
                          className={`cursor-pointer border-b border-zinc-900 transition-colors ${
                            selected
                              ? "bg-amber-300/10"
                              : "hover:bg-zinc-800/35"
                          }`}
                          style={{ height: `${rowHeight}px` }}
                        >
                          <td className="px-2 py-2 text-zinc-300">{row.brand}</td>
                          <td className="px-2 py-2 text-zinc-300">{row.brandType}</td>
                          <td className="px-2 py-2 text-zinc-100">{row.perfume}</td>
                          <td className="px-2 py-2 text-zinc-300">{row.launchYear || "n/a"}</td>
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
                        <td colSpan={9} style={{ height: `${bottomSpacerHeight}px` }} />
                      </tr>
                    ) : null}
                  </tbody>
                </table>
            </div>
          </article>

          <aside className="min-w-0 border-t border-zinc-800/70 bg-zinc-950/40 xl:border-l xl:border-t-0">
            <div className="border-b border-zinc-800/70 px-3 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">Selected Record</h2>
              <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-zinc-500">
                Edit the selected perfume directly and save back to the combined DB.
              </p>
            </div>

            {selectedRow && editingFormRecord ? (
              <div className="max-h-[calc(100vh-240px)] space-y-3 overflow-y-auto p-3">
                <SectionCard title="Image">
                  <div className="overflow-hidden rounded border border-zinc-800 bg-zinc-900/70">
                    <img
                      src={selectedImage.src}
                      alt={`${selectedRow.perfume} image`}
                      className="h-44 w-full object-contain p-3"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-amber-100">{selectedRow.perfume}</p>
                  <p className="mt-1 text-xs text-zinc-400">{selectedRow.brand} · {selectedRow.launchYear || "n/a"}</p>
                  <p className="mt-1 text-xs text-zinc-500">Worksheet: {selectedRow.worksheet} · Status: {selectedRow.validationStatus}</p>
                </SectionCard>

                <SectionCard title="Editor">
                  <form key={selectedRow.id} id="studio-master-record-form" action={saveMasterDatabaseRecordAction} className="space-y-3">
                    <input type="hidden" name="recordId" value={editingFormRecord.id} />

                    <fieldset disabled={readOnly} className="space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        <FieldInput name="perfume" label="Perfume" defaultValue={editingFormRecord.perfume} />
                        <FieldInput name="brand" label="Brand" defaultValue={editingFormRecord.brand} />
                        <FieldInput name="launchYear" label="Launch Year" defaultValue={editingFormRecord.launchYear} />
                        <FieldInput name="source" label="Source" defaultValue={editingFormRecord.source} />
                        <FieldInput name="status" label="Status" defaultValue={editingFormRecord.status} />
                        <FieldInput name="perfumer" label="Perfumer" defaultValue={editingFormRecord.perfumer} />
                        <FieldInput name="gender" label="Gender" defaultValue={editingFormRecord.gender} />
                        <FieldInput name="imageUrl" label="Image URL" defaultValue={editingFormRecord.imageUrl} />
                        <FieldInput name="localImagePath" label="Local Image Path" defaultValue={editingFormRecord.localImagePath} />
                      </div>

                      <FieldTextArea
                        name="description"
                        label="Description"
                        defaultValue={editingFormRecord.description}
                        rows={3}
                      />
                      <FieldTextArea
                        name="notes"
                        label="Notes"
                        defaultValue={editingFormRecord.notes.join("\n")}
                        rows={3}
                      />
                      <FieldTextArea
                        name="mainAccords"
                        label="Main Accords"
                        defaultValue={editingFormRecord.mainAccords.join("\n")}
                        rows={3}
                      />

                      <label className="flex items-center gap-2 rounded border border-amber-300/20 bg-amber-300/5 px-2 py-2 text-xs text-amber-100">
                        <input
                          type="checkbox"
                          name="userDnaTestEnabled"
                          defaultChecked={selectedDetail?.userDnaTestEnabled ?? false}
                          className="accent-amber-300"
                        />
                        Include in User DNA Test DB
                      </label>

                      <div key={selectedUserDnaProfileId} className="space-y-2 rounded border border-zinc-800 bg-zinc-950/50 p-2">
                        <label className="block space-y-1 text-xs uppercase tracking-[0.1em] text-zinc-500">
                          <span>User DNA Profile</span>
                          <select
                            name="userDnaProfileId"
                            value={selectedUserDnaProfileId}
                            onChange={(event) => setRequestedUserDnaProfileId(event.target.value)}
                            className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm normal-case tracking-normal text-zinc-100 focus:border-amber-300/40 focus:outline-none"
                          >
                            <option value="new">New DNA profile</option>
                            {selectedUserDnaProfiles.map((profile) => (
                              <option key={profile.testProfileId} value={profile.testProfileId}>
                                {profile.name ?? profile.testProfileId}
                              </option>
                            ))}
                          </select>
                        </label>
                        <FieldInput
                          name="userDnaProfileName"
                          label="Profile Name"
                          defaultValue={selectedUserDnaProfile?.name ?? selectedRow.perfume}
                        />
                        <FieldInput
                          name="userDnaProfileType"
                          label="Profile Type"
                          defaultValue={selectedUserDnaProfile?.type ?? "unknown"}
                        />
                        <FieldTextArea
                          name="userDnaAxes"
                          label="DNA Axes (name: score)"
                          defaultValue={serializeScoreMap(selectedUserDnaProfile?.dna_axes)}
                          rows={5}
                        />
                        <FieldTextArea
                          name="userDnaSemantic"
                          label="Semantic V1 (name: score)"
                          defaultValue={serializeScoreMap(selectedUserDnaProfile?.semantic_v1)}
                          rows={5}
                        />
                        <FieldTextArea
                          name="userDnaAbstractAttributes"
                          label="User Attributes Abstract"
                          defaultValue={selectedUserDnaProfile?.user_attributes_v3?.abstract?.join("\n") ?? ""}
                          rows={3}
                        />
                        <FieldTextArea
                          name="userDnaConcreteAttributes"
                          label="User Attributes Concrete"
                          defaultValue={selectedUserDnaProfile?.user_attributes_v3?.concrete?.join("\n") ?? ""}
                          rows={3}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="rounded border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-emerald-100 hover:bg-emerald-500/20"
                        >
                          Save Changes
                        </button>
                      </div>
                    </fieldset>
                  </form>
                </SectionCard>

                <SectionCard title="Fields">
                  <PairLine label="Brand Type" value={selectedRow.brandType} />
                  <PairLine label="Perfumer" value={selectedDetail?.perfumer || "n/a"} />
                  <PairLine label="Gender" value={selectedDetail?.gender || "n/a"} />
                  <PairLine label="Confidence" value={selectedRow.confidence.toFixed(2)} />
                  <PairLine label="Completion" value={formatPercent(selectedRow.completionPercent)} />
                  <PairLine label="Validation" value={selectedRow.validationStatus} />
                  <PairLine label="Review" value={selectedRow.reviewStatus} />
                </SectionCard>

                <SectionCard title="Description">
                  <p className="text-xs leading-6 text-zinc-300">{selectedDetail?.description || "No description available."}</p>
                </SectionCard>

                <SectionCard title="Notes">
                  <TokenGrid tokens={selectedDetail?.notes ?? []} />
                </SectionCard>

                <SectionCard title="Accords">
                  <TokenGrid tokens={selectedDetail?.mainAccords ?? []} />
                </SectionCard>
              </div>
            ) : (
              <div className="p-3 text-sm text-zinc-400">No selected perfume.</div>
            )}
          </aside>
        </div>
      ) : null}
    </section>
  );
}

function SummaryButton({
  label,
  value,
  onClick,
  active = false,
}: {
  label: string;
  value: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[150px] flex-1 rounded border p-2 text-left transition-colors ${
        active
          ? "border-amber-300/50 bg-amber-500/10"
          : "border-zinc-800 bg-zinc-900/55 hover:border-amber-300/35"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </button>
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

function FieldInput({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="space-y-1 text-xs uppercase tracking-[0.1em] text-zinc-500">
      <span>{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300/40 focus:outline-none"
      />
    </label>
  );
}

function FieldTextArea({
  name,
  label,
  defaultValue,
  rows,
}: {
  name: string;
  label: string;
  defaultValue: string;
  rows: number;
}) {
  return (
    <label className="space-y-1 text-xs uppercase tracking-[0.1em] text-zinc-500">
      <span>{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm leading-6 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-300/40 focus:outline-none"
      />
    </label>
  );
}
