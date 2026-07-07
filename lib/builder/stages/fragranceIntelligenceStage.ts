import { createPlaceholderStage } from "@/lib/builder/stages/createPlaceholderStage";

export const fragranceIntelligenceStage = createPlaceholderStage({
  name: "fragrance-intelligence",
  inputArtifactType: "TranslationArtifact",
  outputArtifactType: "FragranceIntelligenceArtifact",
  description: "Fragrance Intelligence stage infrastructure skeleton",
});
