import { createPlaceholderStage } from "@/lib/builder/stages/createPlaceholderStage";

export const validationStage = createPlaceholderStage({
  name: "validation",
  inputArtifactType: "MetadataArtifact",
  outputArtifactType: "ValidationArtifact",
  description: "Validation stage infrastructure skeleton",
});
