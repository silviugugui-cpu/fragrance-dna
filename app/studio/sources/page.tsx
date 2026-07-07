import { StudioSourcesWorkspace } from "@/app/studio/_components/StudioSourcesWorkspace";
import { loadSourcesWorkspaceData } from "@/lib/builder/connectors/sourcesWorkspace";

export const dynamic = "force-dynamic";

export default async function StudioSourcesPage() {
  try {
    const data = await loadSourcesWorkspaceData();
    return <StudioSourcesWorkspace data={data} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while loading sources workspace.";

    return <StudioSourcesWorkspace data={null} loadError={message} />;
  }
}
