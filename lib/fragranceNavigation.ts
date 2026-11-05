export function getFragranceSearchHref(brand = "", perfume = ""): string {
  return `/fragrances?${new URLSearchParams({ q: [brand, perfume].filter(Boolean).join(" ").trim() })}`;
}

export function getFragranceHref(recordId?: string | null, brand = "", perfume = ""): string {
  const identity = recordId?.trim();
  if (!identity || /^https?:\/\//i.test(identity)) return getFragranceSearchHref(brand, perfume);
  return `/fragrances/${encodeURIComponent(identity)}`;
}

export function getPerfumerFragranceHref(recordId: string | null, brand: string, perfume: string, perfumerSlug: string): string {
  const href = getFragranceHref(recordId, brand, perfume);
  return `${href}${href.includes("?") ? "&" : "?"}${new URLSearchParams({ fromPerfumer: perfumerSlug })}`;
}
