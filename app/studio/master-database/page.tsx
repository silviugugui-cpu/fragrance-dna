import { StudioMasterDatabaseWorkspace } from "@/app/studio/_components/StudioMasterDatabaseWorkspace";
import { loadMasterDatabaseWorkspaceData } from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";

export const dynamic = "force-dynamic";

export default function StudioMasterDatabasePage() {
  try {
    const data = loadMasterDatabaseWorkspaceData();
    return <StudioMasterDatabaseWorkspace data={data} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while loading master database workspace.";

    return <StudioMasterDatabaseWorkspace data={null} loadError={message} />;
  }
}
