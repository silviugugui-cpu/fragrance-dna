import { createPlaceholderStage } from "@/lib/builder/stages/createPlaceholderStage";

export const normalizeStage = createPlaceholderStage({
  name: "normalize",
  inputArtifactType: "RawImportArtifact",
  outputArtifactType: "NormalizedArtifact",
  description: "Normalize stage infrastructure skeleton",
});
