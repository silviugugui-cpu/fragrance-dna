import { StudioMasterDatabaseWorkspace } from "@/app/studio/_components/StudioMasterDatabaseWorkspace";
import { loadMasterDatabaseWorkspaceData } from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";
import { isMasterFragranceDatabaseReadOnly } from "@/lib/database/masterFragranceDatabase";

export const dynamic = "force-dynamic";

export default async function StudioMasterDatabasePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  try {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const selectedRecordParam = resolvedSearchParams.record;
    const selectedRecordId = Array.isArray(selectedRecordParam)
      ? selectedRecordParam[0]
      : selectedRecordParam;
    const data = await loadMasterDatabaseWorkspaceData(selectedRecordId);
    return <StudioMasterDatabaseWorkspace data={data} readOnly={isMasterFragranceDatabaseReadOnly()} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while loading master database workspace.";

    return <StudioMasterDatabaseWorkspace data={null} loadError={message} />;
  }
}
