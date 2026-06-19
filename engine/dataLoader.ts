import raw from '@/data/FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json';

export function getLayers() {
  // Support either top-level `layers` or nested under known root key
  const asAny = raw as any;
  if (Array.isArray(asAny.layers)) return asAny.layers;
  if (asAny.FragranceDNA_USER_ATTRIBUTE_LAYER_v3 && Array.isArray(asAny.FragranceDNA_USER_ATTRIBUTE_LAYER_v3.layers)) {
    return asAny.FragranceDNA_USER_ATTRIBUTE_LAYER_v3.layers;
  }
  return [];
}

export function getAllFragrances() {
  const layers = getLayers();
  return layers.flatMap((l: any) => l.fragrances ?? (l.items ?? []) );
}
