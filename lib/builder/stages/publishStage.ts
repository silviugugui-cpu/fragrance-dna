import { createPlaceholderStage } from "@/lib/builder/stages/createPlaceholderStage";

export const publishStage = createPlaceholderStage({
  name: "publish",
  inputArtifactType: "ValidationArtifact",
  outputArtifactType: "MasterPerfumeArtifact",
  description: "Publish stage infrastructure skeleton",
});
