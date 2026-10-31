import { StudioMasterDatabaseWorkspace } from "@/app/studio/_components/StudioMasterDatabaseWorkspace";
import { loadMasterDatabaseWorkspaceData } from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";
import { isMasterFragranceDatabaseReadOnly } from "@/lib/database/masterFragranceDatabase";

export const dynamic = "force-dynamic";

export default async function StudioHomePage({
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
    const masterData = await loadMasterDatabaseWorkspaceData(selectedRecordId);

    return <StudioMasterDatabaseWorkspace data={masterData} readOnly={isMasterFragranceDatabaseReadOnly()} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while loading Studio master database.";

    return (
      <section className="space-y-4 overflow-hidden rounded-xl border border-amber-200/15 bg-zinc-950/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <article className="rounded-lg border border-rose-300/25 bg-rose-950/20 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-rose-200">Load Error</p>
          <p className="mt-1 text-sm text-rose-100">{message}</p>
        </article>
      </section>
    );
  }
}
