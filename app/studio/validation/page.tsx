import { StudioValidationWorkspace } from "@/app/studio/_components/StudioValidationWorkspace";
import { runSprint1ValidationPack } from "@/lib/builder/validationPack/sprint1ValidationPack";

export default async function StudioValidationPage() {
  try {
    const result = await runSprint1ValidationPack();
    return <StudioValidationWorkspace result={result} />;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while loading validation pack results.";

    return <StudioValidationWorkspace result={null} loadError={message} />;
  }
}
