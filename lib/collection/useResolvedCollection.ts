"use client";

import { useEffect, useMemo, useState } from "react";
import type { MasterFragranceRecord } from "@/lib/database/masterFragranceDatabase";
import type { CollectionFragrance, CollectionFragranceView } from "@/lib/collection/types";

const detailsCache = new Map<string, MasterFragranceRecord>();

export function useResolvedCollection(collection: CollectionFragrance[]): CollectionFragranceView[] {
  const ids = useMemo(
    () => [...new Set(collection.map((item) => item.fragranceId).filter(Boolean))],
    [collection],
  );
  const idsKey = ids.join("\n");
  const [detailsById, setDetailsById] = useState<Record<string, MasterFragranceRecord>>({});

  useEffect(() => {
    if (!idsKey) {
      setDetailsById({});
      return;
    }

    const requestedIds = idsKey.split("\n");
    const cached = requestedIds.filter((id) => detailsCache.has(id));
    if (cached.length === requestedIds.length) {
      setDetailsById(Object.fromEntries(cached.map((id) => [id, detailsCache.get(id)])) as Record<string, MasterFragranceRecord>);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({ ids: requestedIds.join(",") });
    fetch(`/api/collection/catalog?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load collection fragrance details.");
        return response.json() as Promise<{ records?: MasterFragranceRecord[] }>;
      })
      .then((payload) => {
        const next: Record<string, MasterFragranceRecord> = {};
        for (const record of payload.records ?? []) {
          const id = String(record.id ?? record.canonicalKey ?? "").trim();
          if (!id) continue;
          detailsCache.set(id, record);
          next[id] = record;
        }
        for (const id of requestedIds) {
          const record = detailsCache.get(id);
          if (record) next[id] = record;
        }
        setDetailsById(next);
      })
      .catch(() => {
        if (!controller.signal.aborted) setDetailsById({});
      });

    return () => controller.abort();
  }, [idsKey]);

  return useMemo(() => collection.map((item) => {
    const record = detailsById[item.fragranceId];
    return {
      ...item,
      name: String(record?.perfume ?? record?.name ?? item.name ?? "Unknown fragrance"),
      brand: String(record?.brand ?? item.brand ?? "Independent"),
      image: String(record?.localImagePath ?? record?.imageUrl ?? item.image ?? "") || undefined,
      launchYear: String(record?.launchYear ?? "") || undefined,
      brandType: String(record?.brandType ?? "") || undefined,
      canonicalNotes: Array.isArray(record?.notes) ? record.notes.map(String) : [],
      mainAccords: Array.isArray(record?.mainAccords) ? record.mainAccords.map(String) : [],
      perfumer: String(record?.perfumer ?? "") || undefined,
      description: String(record?.description ?? "") || undefined,
      confidence: typeof record?.confidence === "number" ? record.confidence : undefined,
    };
  }), [collection, detailsById]);
}