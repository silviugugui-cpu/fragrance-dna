import { StudioBrandsWorkspace } from "@/app/studio/_components/StudioBrandsWorkspace";
import { loadBrandsWorkspaceData } from "@/lib/builder/brandsWorkspace/brandsWorkspace";

export const dynamic = "force-dynamic";

export default function StudioBrandsPage() {
  try {
    const data = loadBrandsWorkspaceData();
    return <StudioBrandsWorkspace data={data} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while loading brands workspace.";

    return <StudioBrandsWorkspace data={null} loadError={message} />;
  }
}
