export function getFragranceSearchHref(brand = "", perfume = ""): string {
  return `/fragrances?${new URLSearchParams({ q: [brand, perfume].filter(Boolean).join(" ").trim() })}`;
}

export function getFragranceHref(recordId?: string | null, brand = "", perfume = ""): string {
  const identity = recordId?.trim();
  if (!identity || /^https?:\/\//i.test(identity)) return getFragranceSearchHref(brand, perfume);
  return `/fragrances/${encodeURIComponent(identity)}`;
}
