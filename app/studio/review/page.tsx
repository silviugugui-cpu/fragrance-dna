import { StudioDecisionReviewWorkspace } from "@/app/studio/_components/StudioDecisionReviewWorkspace";
import { loadBuilderDecisionWorkspaceData } from "@/lib/builder/decisionEngine/decisionEngine";

export const dynamic = "force-dynamic";

export default async function StudioReviewPage() {
  try {
    const data = loadBuilderDecisionWorkspaceData();
    return <StudioDecisionReviewWorkspace data={data} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error while loading review items.";

    return <StudioDecisionReviewWorkspace data={null} loadError={message} />;
  }
}
