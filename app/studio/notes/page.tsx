import { StudioNotesWorkspace } from "@/app/studio/_components/StudioNotesWorkspace";
import { loadNotesWorkspaceData } from "@/lib/builder/notesWorkspace/notesWorkspace";

export default function StudioNotesPage() {
  try {
    const data = loadNotesWorkspaceData();
    return <StudioNotesWorkspace data={data} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while loading notes workspace.";

    return <StudioNotesWorkspace data={null} loadError={message} />;
  }
}
