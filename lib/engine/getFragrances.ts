import db from "@/data/FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json";

export function getFragrances() {
  return db.FragranceDNA_USER_ATTRIBUTE_LAYER_v3.layers;
}
