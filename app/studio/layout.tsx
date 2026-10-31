import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { StudioIntegrationClient } from "@/app/studio/_components/StudioIntegrationClient";
import { StudioShell } from "@/app/studio/_components/StudioShell";
import { getCurrentSessionUser } from "@/lib/auth/serverSession";
import { ADMIN_USER_ID } from "@/lib/auth/adminIdentity";

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentSessionUser();
  if (!user || (!user.isAdmin && user.id !== ADMIN_USER_ID)) {
    redirect("/auth/sign-in?next=%2Fstudio");
  }

  return (
    <StudioIntegrationClient>
      <StudioShell>{children}</StudioShell>
    </StudioIntegrationClient>
  );
}
