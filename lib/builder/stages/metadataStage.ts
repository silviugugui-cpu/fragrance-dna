import { createPlaceholderStage } from "@/lib/builder/stages/createPlaceholderStage";

export const metadataStage = createPlaceholderStage({
  name: "metadata",
  inputArtifactType: "FragranceIntelligenceArtifact",
  outputArtifactType: "MetadataArtifact",
  description: "Metadata stage infrastructure skeleton",
});
