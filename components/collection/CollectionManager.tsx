'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ChangeEvent } from 'react';
import { PerfumeImageWithFallback } from '@/components/design-system/PerfumeImageWithFallback';
import {
  addCollectionFragrance,
  buildCollectionSummary,
  loadCollection,
  removeCollectionFragrance,
  subscribeToCollection,
  updateCollectionFragrance,
} from '@/lib/collection';
import { EMPTY_COLLECTION } from '@/lib/collection/storage';
import { useResolvedCollection } from '@/lib/collection/useResolvedCollection';
import type { CollectionFilter, CollectionFragrance, CollectionFragranceView, CollectionSortKey } from '@/lib/collection';
import type { MasterFragranceRecord } from '@/lib/database/masterFragranceDatabase';

type CollectionCatalogResult = {
  fragrance: {
    id: string;
    name: string;
    brand: string;
    year?: string;
    notes: string[];
    image?: string;
    canonicalRecord: MasterFragranceRecord;
  };
  existing: boolean;
};

type CollectionImportResponse = {
  totalRows: number;
  matched: Array<{
    sourceFile: string;
    rowNumber: number;
    fragranceId: string;
    owned: boolean;
    wishlist: boolean;
    personalRating?: number;
    purchaseDate?: string;
    personalNotes?: string;
    alreadyInCollection: boolean;
    canonicalRecord: MasterFragranceRecord;
  }>;
  unmatched: Array<{ sourceFile: string; rowNumber: number; brand: string; perfume: string; reason: string }>;
  duplicateRows: number;
};

const toCollectionCatalogResult = (
  record: MasterFragranceRecord,
  collection: CollectionFragrance[],
): CollectionCatalogResult => {
  const id = String(record.id ?? record.canonicalKey ?? '').trim();
  return {
    fragrance: {
      id,
      name: String(record.perfume ?? record.name ?? ''),
      brand: String(record.brand ?? 'Independent'),
      year: String(record.launchYear ?? '') || undefined,
      notes: [...(record.notes ?? []), ...(record.mainAccords ?? [])],
      image: String(record.localImagePath ?? record.imageUrl ?? '') || undefined,
      canonicalRecord: record,
    },
    existing: collection.some((item) => item.fragranceId === id),
  };
};

type ModalState =
  | { mode: 'add' }
  | { mode: 'edit'; itemId: string }
  | { mode: 'remove'; itemId: string }
  | null;

const FILTERS: Array<{ label: string; value: CollectionFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Owned', value: 'owned' },
  { label: 'Wishlist', value: 'wishlist' },
];

const SORTS: Array<{ label: string; value: CollectionSortKey }> = [
  { label: 'Name', value: 'name' },
  { label: 'Brand', value: 'brand' },
  { label: 'Rating', value: 'rating' },
];

export default function CollectionManager() {
  const collection = useSyncExternalStore(subscribeToCollection, loadCollection, () => EMPTY_COLLECTION);
  const resolvedCollection = useResolvedCollection(collection);
  const [query, setQuery] = useState('');
  const [databaseQuery, setDatabaseQuery] = useState('');
  const [databaseRecords, setDatabaseRecords] = useState<MasterFragranceRecord[]>([]);
  const [addRecords, setAddRecords] = useState<MasterFragranceRecord[]>([]);
  const [filter, setFilter] = useState<CollectionFilter>('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sortBy, setSortBy] = useState<CollectionSortKey>('rating');
  const [modal, setModal] = useState<ModalState>(null);
  const [addQuery, setAddQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const summary = useMemo(() => buildCollectionSummary(resolvedCollection), [resolvedCollection]);

  useEffect(() => {
    const normalizedQuery = databaseQuery.trim();
    if (!normalizedQuery) {
      setDatabaseRecords([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: normalizedQuery, limit: '20' });
        const response = await fetch(`/api/collection/catalog?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Unable to search the Fragrance DB.');
        const payload = await response.json() as { results?: MasterFragranceRecord[] };
        setDatabaseRecords(payload.results ?? []);
      } catch (error) {
        if (!controller.signal.aborted) showMessage(error instanceof Error ? error.message : 'Collection search failed.');
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [databaseQuery]);

  useEffect(() => {
    if (modal?.mode !== 'add' || !addQuery.trim()) {
      setAddRecords([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: addQuery.trim(), limit: '20' });
        const response = await fetch(`/api/collection/catalog?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Unable to search the Fragrance DB.');
        const payload = await response.json() as { results?: MasterFragranceRecord[] };
        setAddRecords(payload.results ?? []);
      } catch (error) {
        if (!controller.signal.aborted) showMessage(error instanceof Error ? error.message : 'Collection search failed.');
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [addQuery, modal?.mode]);

  const databaseSearchResults = useMemo(
    () => databaseRecords.map((record) => toCollectionCatalogResult(record, collection)),
    [collection, databaseRecords],
  );

  const brands = useMemo(() => {
    const items = Array.from(new Set(resolvedCollection.map((item) => item.brand).filter(Boolean)));
    return items.sort((left, right) => left.localeCompare(right));
  }, [resolvedCollection]);

  const filteredCollection = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    return [...resolvedCollection]
      .filter((item) => {
        if (filter === 'owned' && !item.owned) return false;
        if (filter === 'wishlist' && !item.wishlist) return false;
        if (brandFilter !== 'all' && item.brand !== brandFilter) return false;
        if (!normalizedQuery) return true;

        const searchable = [item.name, item.brand, item.notes ?? ''].join(' ').toLowerCase();
        return searchable.includes(normalizedQuery);
      })
      .sort((left, right) => {
        if (sortBy === 'name') return left.name.localeCompare(right.name);
        if (sortBy === 'brand') return left.brand.localeCompare(right.brand) || left.name.localeCompare(right.name);

        const leftRating = left.personalRating ?? -1;
        const rightRating = right.personalRating ?? -1;
        return rightRating - leftRating || left.name.localeCompare(right.name);
      });
  }, [resolvedCollection, filter, brandFilter, query, sortBy]);

  const addSearchResults = useMemo(() => {
    return addRecords.map((record) => toCollectionCatalogResult(record, collection));
  }, [addRecords, collection]);

  const activeEditItem = modal?.mode === 'edit' ? resolvedCollection.find((item) => item.id === modal.itemId) ?? null : null;
  const activeRemoveItem = modal?.mode === 'remove' ? resolvedCollection.find((item) => item.id === modal.itemId) ?? null : null;

  function showMessage(message: string): void {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 2400);
  }

  function openAddModal(): void {
    setAddQuery('');
    setModal({ mode: 'add' });
  }

  function handleAddFragrance(
    fragrance: CollectionCatalogResult['fragrance'],
    options: { owned: boolean; wishlist: boolean } = { owned: true, wishlist: false },
  ): void {
    const result = addCollectionFragrance({
      fragranceId: fragrance.id,
      owned: options.owned,
      wishlist: options.wishlist,
    });
    if (!result.added) {
      showMessage('This fragrance is already in your collection.');
      return;
    }

    showMessage(options.wishlist ? 'Fragrance saved to your wishlist.' : 'Fragrance added to your collection.');
    setModal(null);
  }

  function handleAddFromSearch(fragrance: CollectionCatalogResult['fragrance'], wishlist = false): void {
    handleAddFragrance(fragrance, { owned: !wishlist, wishlist });
  }

  async function handleImportFiles(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    setIsImporting(true);
    setImportSummary(null);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.set('existingIds', JSON.stringify(collection.map((item) => item.fragranceId)));

    try {
      const response = await fetch('/api/collection/import', { method: 'POST', body: formData });
      const payload = await response.json() as CollectionImportResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Unable to import collection workbook.');

      let added = 0;
      let existing = 0;
      for (const match of payload.matched) {
        if (match.alreadyInCollection) {
          existing += 1;
          continue;
        }
        const result = addCollectionFragrance({
          fragranceId: match.fragranceId,
          owned: match.owned,
          wishlist: match.wishlist,
          personalRating: match.personalRating,
          purchaseDate: match.purchaseDate,
          notes: match.personalNotes,
        });
        if (result.added) added += 1;
        else if (result.duplicate) existing += 1;
      }

      setImportSummary(
        `Added ${added}; already in collection ${existing}; unmatched ${payload.unmatched.length}; duplicate rows ${payload.duplicateRows}.`,
      );
      if (payload.unmatched.length > 0) {
        setNotification(`${payload.unmatched.length} row(s) did not match the Fragrance DB. See import summary.`);
        window.setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      setImportSummary(error instanceof Error ? error.message : 'Collection import failed.');
    } finally {
      setIsImporting(false);
      input.value = '';
    }
  }

  function handleSaveEdit(formData: FormData): void {
    if (!activeEditItem) {
      return;
    }

    const ownedValue = String(formData.get('owned') ?? 'owned');
    const ratingValue = String(formData.get('personalRating') ?? '').trim();
    const notes = String(formData.get('notes') ?? '').trim();

    updateCollectionFragrance(activeEditItem.id, {
      owned: ownedValue === 'owned',
      wishlist: ownedValue === 'wishlist',
      personalRating: ratingValue ? Number(ratingValue) : undefined,
      notes,
    });
    showMessage('Collection entry updated.');
    setModal(null);
  }

  function handleRemoveConfirmed(): void {
    if (!activeRemoveItem) {
      return;
    }

    removeCollectionFragrance(activeRemoveItem.id);
    showMessage('Fragrance removed from your collection.');
    setModal(null);
  }

  return (
    <section className="glass p-10 space-y-10">
      <div className="space-y-6 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.48em] text-[rgba(165,185,150,0.85)]">Collection</p>
        <h1 className="text-5xl font-light tracking-[0.04em] text-[rgba(212,175,120,0.95)]">My Collection</h1>
        <p className="text-lg leading-9 text-[rgba(190,170,140,0.65)]">
          The fragrances that define your personal olfactory library.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="glass-card p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[rgba(165,185,150,0.7)]">Total Fragrances</p>
          <p className="mt-3 text-5xl font-light text-[rgba(242,229,199,0.95)]">{summary.size} Fragrances</p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[rgba(190,170,140,0.65)]">
            Manage the scents in your library now so future Collection DNA, coverage analysis, and recommendation systems have a stable foundation.
          </p>
        </article>

        <article className="glass-card p-8 space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[rgba(165,185,150,0.7)]">Collection Summary</p>
          <div className="grid grid-cols-2 gap-4">
            <SummaryTile label="Owned" value={`${collection.filter((item) => item.owned).length}`} />
            <SummaryTile label="Wishlist" value={`${collection.filter((item) => item.wishlist).length}`} />
            <SummaryTile label="Top Brand" value={summary.topBrand ?? '—'} />
            <SummaryTile label="Coverage" value={summary.dnaCoverage != null ? `${summary.dnaCoverage}%` : '—'} />
          </div>
        </article>
      </div>

      <section className="glass-card p-8 space-y-6">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.24em] text-[rgba(165,185,150,0.7)]">Database Search</p>
          <h2 className="text-3xl font-light text-[rgba(242,229,199,0.95)]">Search the fragrance database</h2>
          <p className="text-sm leading-7 text-[rgba(190,170,140,0.65)]">
            Find fragrances from the catalog and save them directly into your collection or wishlist.
          </p>
        </div>

        <label className="glass-card flex items-center gap-4 px-5 py-4">
          <span className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Search</span>
          <input
            value={databaseQuery}
            onChange={(event) => setDatabaseQuery(event.target.value)}
            placeholder="Search by fragrance, brand, or note..."
            className="w-full bg-transparent text-sm text-[rgba(242,229,199,0.95)] outline-none placeholder:text-[rgba(190,170,140,0.38)]"
          />
        </label>

        {databaseQuery.trim().length === 0 ? (
          <div className="rounded-[28px] border border-[rgba(212,175,120,0.12)] bg-black/20 p-8 text-sm text-[rgba(190,170,140,0.65)]">
            Start typing to search the fragrance database and add results to your collection.
          </div>
        ) : databaseSearchResults.length === 0 ? (
          <div className="rounded-[28px] border border-[rgba(212,175,120,0.12)] bg-black/20 p-8 text-sm text-[rgba(190,170,140,0.65)]">
            No fragrances matched your search.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {databaseSearchResults.map(({ fragrance, existing }) => (
              <article
                key={fragrance.id}
                className={`rounded-[26px] border p-5 transition duration-200 ${
                  existing
                    ? 'border-[rgba(212,175,120,0.08)] bg-white/5'
                    : 'border-[rgba(212,175,120,0.12)] bg-black/20 hover:-translate-y-0.5 hover:border-[rgba(212,175,120,0.24)] hover:bg-white/5'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(165,185,150,0.68)]">
                  {fragrance.brand ?? 'Independent'}
                </p>
                <h3 className="mt-2 text-xl font-light text-[rgba(242,229,199,0.95)]">{fragrance.name}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[rgba(212,175,120,0.75)]">
                  {fragrance.year ?? 'Year n/a'}
                </p>
                {fragrance.notes?.length ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-[rgba(190,170,140,0.65)]">
                    {fragrance.notes.join(' · ')}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={existing}
                    onClick={() => handleAddFromSearch(fragrance, false)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition duration-200 ${
                      existing
                        ? 'cursor-not-allowed border border-[rgba(212,175,120,0.08)] bg-white/5 text-[rgba(190,170,140,0.42)]'
                        : 'border border-[rgba(212,175,120,0.14)] bg-[rgba(212,175,120,0.92)] text-[#111111] hover:brightness-110'
                    }`}
                  >
                    {existing ? 'Already added' : 'Add to collection'}
                  </button>
                  <button
                    type="button"
                    disabled={existing}
                    onClick={() => handleAddFromSearch(fragrance, true)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition duration-200 ${
                      existing
                        ? 'cursor-not-allowed border border-[rgba(212,175,120,0.08)] bg-white/5 text-[rgba(190,170,140,0.42)]'
                        : 'border border-[rgba(212,175,120,0.14)] bg-white/5 text-[rgba(212,175,120,0.88)] hover:bg-white/10'
                    }`}
                  >
                    {existing ? 'In collection' : 'Save to wishlist'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={importInputRef}
          type="file"
          accept=".xlsx,.xls"
          multiple
          onChange={(event) => void handleImportFiles(event)}
          className="sr-only"
          aria-label="Select collection Excel files"
        />
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(212,175,120,0.94),rgba(186,153,110,0.9))] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#121212] shadow-[0_20px_70px_rgba(212,175,120,0.18)] transition duration-300 hover:brightness-110"
        >
          Add Fragrance
        </button>
        <button
          type="button"
          disabled={isImporting}
          onClick={() => importInputRef.current?.click()}
          className="inline-flex items-center justify-center rounded-full border border-[rgba(212,175,120,0.18)] bg-white/5 px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[rgba(212,175,120,0.9)] transition duration-200 hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
        >
          {isImporting ? 'Importing...' : 'Import Collection'}
        </button>
        {notification ? <p className="text-sm text-[rgba(212,175,120,0.9)]">{notification}</p> : null}
        {importSummary ? <p role="status" className="w-full text-sm text-[rgba(165,185,150,0.9)]">{importSummary}</p> : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.6fr]">
        <label className="glass-card flex items-center gap-4 px-5 py-4">
          <span className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search fragrances..."
            className="w-full bg-transparent text-sm text-[rgba(242,229,199,0.95)] outline-none placeholder:text-[rgba(190,170,140,0.38)]"
          />
        </label>

        <label className="glass-card flex items-center gap-4 px-5 py-4">
          <span className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Brand</span>
          <select
            value={brandFilter}
            onChange={(event) => setBrandFilter(event.target.value)}
            className="w-full bg-transparent text-sm text-[rgba(242,229,199,0.95)] outline-none"
          >
            <option value="all">All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </label>

        <label className="glass-card flex items-center gap-4 px-5 py-4">
          <span className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Sort by</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as CollectionSortKey)}
            className="w-full bg-transparent text-sm text-[rgba(242,229,199,0.95)] outline-none"
          >
            {SORTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-full px-5 py-2 text-sm uppercase tracking-[0.16em] transition duration-200 ${
              filter === item.value
                ? 'bg-[rgba(212,175,120,0.95)] text-[#111111]'
                : 'border border-[rgba(212,175,120,0.18)] bg-white/5 text-[rgba(212,175,120,0.86)] hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredCollection.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <p className="text-3xl font-light text-[rgba(242,229,199,0.95)]">
            {summary.size === 0 ? 'Your collection starts here.' : 'No fragrances match your current filters.'}
          </p>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-[rgba(190,170,140,0.65)]">
            {summary.size === 0
              ? 'Add the fragrances you already own to unlock collection-level insights and future recommendation features.'
              : 'Adjust search, brand, or sort settings to reveal the fragrances already in your library.'}
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(212,175,120,0.94),rgba(186,153,110,0.9))] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#121212] shadow-[0_20px_70px_rgba(212,175,120,0.18)] transition duration-300 hover:brightness-110"
          >
            Add First Fragrance
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCollection.map((item) => (
            <CollectionCard
              key={item.id}
              item={item}
              onEdit={() => setModal({ mode: 'edit', itemId: item.id })}
              onRemove={() => setModal({ mode: 'remove', itemId: item.id })}
            />
          ))}
        </div>
      )}

      {modal?.mode === 'add' ? (
        <ModalShell title="Add Fragrance" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <label className="glass-card flex items-center gap-4 px-5 py-4">
              <span className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Search</span>
              <input
                value={addQuery}
                onChange={(event) => setAddQuery(event.target.value)}
                placeholder="Search fragrance..."
                className="w-full bg-transparent text-sm text-[rgba(242,229,199,0.95)] outline-none placeholder:text-[rgba(190,170,140,0.38)]"
                autoFocus
              />
            </label>

            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {addSearchResults.length === 0 ? (
                <p className="rounded-[22px] border border-[rgba(212,175,120,0.12)] bg-black/20 p-6 text-sm text-[rgba(190,170,140,0.65)]">
                  Search the fragrance database to add an item to your collection.
                </p>
              ) : (
                addSearchResults.map(({ fragrance, existing }) => (
                  <button
                    key={fragrance.id}
                    type="button"
                    disabled={existing}
                    onClick={() => handleAddFragrance(fragrance)}
                    className={`flex w-full items-center justify-between rounded-[22px] border px-5 py-4 text-left transition duration-200 ${
                      existing
                        ? 'cursor-not-allowed border-[rgba(212,175,120,0.08)] bg-white/5 text-[rgba(190,170,140,0.45)]'
                        : 'border-[rgba(212,175,120,0.12)] bg-black/20 hover:-translate-y-0.5 hover:border-[rgba(212,175,120,0.24)] hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[rgba(165,185,150,0.68)]">
                        {fragrance.brand ?? 'Independent'}
                      </p>
                      <p className="mt-1 text-lg text-[rgba(242,229,199,0.95)]">{fragrance.name}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.18em] text-[rgba(212,175,120,0.85)]">
                      {existing ? 'Already added' : 'Add'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </ModalShell>
      ) : null}

      {modal?.mode === 'edit' && activeEditItem ? (
        <ModalShell title="Edit Collection Entry" onClose={() => setModal(null)}>
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              handleSaveEdit(new FormData(event.currentTarget));
            }}
          >
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em] text-[rgba(165,185,150,0.68)]">
                {activeEditItem.brand}
              </p>
              <h3 className="text-3xl font-light text-[rgba(242,229,199,0.95)]">{activeEditItem.name}</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="glass-card flex flex-col gap-3 p-5">
                <span className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Status</span>
                <select
                  name="owned"
                  defaultValue={activeEditItem.wishlist ? 'wishlist' : 'owned'}
                  className="bg-transparent text-sm text-[rgba(242,229,199,0.95)] outline-none"
                >
                  <option value="owned">Owned</option>
                  <option value="wishlist">Wishlist</option>
                </select>
              </label>

              <label className="glass-card flex flex-col gap-3 p-5">
                <span className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Personal Rating</span>
                <input
                  name="personalRating"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  defaultValue={activeEditItem.personalRating ?? ''}
                  placeholder="0.0 - 10.0"
                  className="bg-transparent text-sm text-[rgba(242,229,199,0.95)] outline-none placeholder:text-[rgba(190,170,140,0.38)]"
                />
              </label>
            </div>

            <label className="glass-card flex flex-col gap-3 p-5">
              <span className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">Notes</span>
              <textarea
                name="notes"
                defaultValue={activeEditItem.notes ?? ''}
                rows={5}
                placeholder="Add personal notes, wear impressions, or reference moments."
                className="resize-none bg-transparent text-sm text-[rgba(242,229,199,0.95)] outline-none placeholder:text-[rgba(190,170,140,0.38)]"
              />
            </label>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-full border border-[rgba(212,175,120,0.12)] bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[rgba(212,175,120,0.86)] transition duration-200 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[linear-gradient(135deg,rgba(212,175,120,0.94),rgba(186,153,110,0.9))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#121212] transition duration-200 hover:brightness-110"
              >
                Save Changes
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {modal?.mode === 'remove' && activeRemoveItem ? (
        <ModalShell title="Remove Fragrance" onClose={() => setModal(null)}>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.22em] text-[rgba(165,185,150,0.68)]">Confirm deletion</p>
              <h3 className="text-3xl font-light text-[rgba(242,229,199,0.95)]">{activeRemoveItem.name}</h3>
              <p className="text-sm text-[rgba(190,170,140,0.65)]">
                This will remove the fragrance from your collection. This action can be reversed later by adding it again.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-full border border-[rgba(212,175,120,0.12)] bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[rgba(212,175,120,0.86)] transition duration-200 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveConfirmed}
                className="rounded-full bg-[linear-gradient(135deg,rgba(212,175,120,0.94),rgba(186,153,110,0.9))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#121212] transition duration-200 hover:brightness-110"
              >
                Remove
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}

function CollectionCard({
  item,
  onEdit,
  onRemove,
}: {
  item: CollectionFragrance;
  onEdit: () => void;
  onRemove: () => void;
}): JSX.Element {
  return (
    <article className="glass-card overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_90px_rgba(199,168,107,0.20)]">
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[26px] border border-[rgba(212,175,120,0.12)] bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,120,0.18),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(165,185,150,0.14),transparent_20%),linear-gradient(135deg,rgba(24,26,28,0.95),rgba(12,14,16,0.95))]">
          <div className="flex aspect-[1.55] items-center justify-center p-6">
            <PerfumeImageWithFallback
              candidates={[item.image]}
              alt={item.name ?? item.fragranceId}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[rgba(165,185,150,0.7)]">{item.brand}</p>
          <h3 className="text-2xl font-light text-[rgba(242,229,199,0.95)]">{item.name}</h3>
          <p className="text-sm uppercase tracking-[0.16em] text-[rgba(212,175,120,0.8)]">
            Rating {typeof item.personalRating === 'number' ? item.personalRating.toFixed(1) : '—'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-[rgba(212,175,120,0.12)]">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-[rgba(212,175,120,0.14)] bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(212,175,120,0.88)] transition duration-200 hover:bg-white/10"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full border border-[rgba(212,175,120,0.14)] bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(212,175,120,0.88)] transition duration-200 hover:bg-white/10"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-[22px] border border-[rgba(212,175,120,0.12)] bg-[rgba(7,8,12,0.78)] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[rgba(165,185,150,0.7)]">{label}</p>
      <p className="mt-2 text-lg font-light text-[rgba(242,229,199,0.95)]">{value}</p>
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-xl">
      <div className="glass w-full max-w-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[rgba(165,185,150,0.7)]">Collection</p>
            <h2 className="mt-2 text-3xl font-light text-[rgba(242,229,199,0.95)]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[rgba(212,175,120,0.12)] bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[rgba(212,175,120,0.85)] transition duration-200 hover:bg-white/10"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
