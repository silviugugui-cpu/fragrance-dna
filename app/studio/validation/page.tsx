import { StudioBuilderControlCenter } from "@/app/studio/_components/StudioBuilderControlCenter";
import { loadBuilderControlCenterData } from "@/lib/builder/controlCenter/builderControlCenter";

export const dynamic = "force-dynamic";

export default async function StudioValidationPage() {
  try {
    const data = await loadBuilderControlCenterData();
    return (
      <StudioBuilderControlCenter
        data={data}
        workspaceLabel="Validation"
        initialSection="logs"
      />
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while loading Builder control center.";

    return (
      <StudioBuilderControlCenter
        data={null}
        loadError={message}
        workspaceLabel="Validation"
        initialSection="logs"
      />
    );
  }
}
