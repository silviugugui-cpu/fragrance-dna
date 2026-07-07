import { brandIntelligenceStage } from "@/lib/builder/stages/brandIntelligenceStage";
import { fragranceIntelligenceStage } from "@/lib/builder/stages/fragranceIntelligenceStage";
import { importStage } from "@/lib/builder/stages/importStage";
import { knowledgeStage } from "@/lib/builder/stages/knowledgeStage";
import { metadataStage } from "@/lib/builder/stages/metadataStage";
import { normalizeStage } from "@/lib/builder/stages/normalizeStage";
import { publishStage } from "@/lib/builder/stages/publishStage";
import { translationStage } from "@/lib/builder/stages/translationStage";
import { validationStage } from "@/lib/builder/stages/validationStage";

export const builderStages = {
  import: importStage,
  normalize: normalizeStage,
  "brand-intelligence": brandIntelligenceStage,
  knowledge: knowledgeStage,
  translation: translationStage,
  "fragrance-intelligence": fragranceIntelligenceStage,
  metadata: metadataStage,
  validation: validationStage,
  publish: publishStage,
};
