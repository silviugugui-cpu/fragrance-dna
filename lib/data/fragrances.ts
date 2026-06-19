import raw from "@/data/FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json";

export const fragrances =
  (raw as any)?.FragranceDNA_USER_ATTRIBUTE_LAYER_v3?.layers ??
  (raw as any)?.FragranceDNA_USER_ATTRIBUTE_LAYER_v3?.layers ??
  (raw as any)?.layers ??
  [];
