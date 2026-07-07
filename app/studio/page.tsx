import { StudioBuilderControlCenter } from "@/app/studio/_components/StudioBuilderControlCenter";
import { loadBuilderControlCenterData } from "@/lib/builder/controlCenter/builderControlCenter";

export const dynamic = "force-dynamic";

export default async function StudioHomePage() {
  try {
    const data = await loadBuilderControlCenterData();
    return (
      <StudioBuilderControlCenter
        data={data}
        workspaceLabel="Home"
        initialSection="mission-control"
      />
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while loading Builder operations workspace.";

    return (
      <StudioBuilderControlCenter
        data={null}
        loadError={message}
        workspaceLabel="Home"
        initialSection="mission-control"
      />
    );
  }
}
