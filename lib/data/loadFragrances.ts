import raw from "@/data/FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json";

export function loadFragrances() {
  const db = raw as any;

  const layers =
    db?.FragranceDNA_UserAttributeLayer_v3?.layers ||
    db?.FragranceDNA_USER_ATTRIBUTE_LAYER_V3?.layers ||
    db?.layers;

  if (!layers) {
    console.log("INVALID DB:", db);
    return [];
  }

  return layers;
}
