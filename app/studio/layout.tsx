import type { ReactNode } from "react";
import { StudioIntegrationClient } from "@/app/studio/_components/StudioIntegrationClient";
import { StudioShell } from "@/app/studio/_components/StudioShell";

export const dynamic = "force-dynamic";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <StudioIntegrationClient>
      <StudioShell>{children}</StudioShell>
    </StudioIntegrationClient>
  );
}
