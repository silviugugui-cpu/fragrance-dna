"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { SiteHeader } from "@/components/design-system/SiteHeader";
import LuxuryAmbientParticles from "@/components/design-system/LuxuryAmbientParticles";

interface RootAppFrameProps {
  children: ReactNode;
}

export function RootAppFrame({ children }: RootAppFrameProps) {
  const pathname = usePathname() ?? "/";
  const isStudioRoute = pathname.startsWith("/studio");

  useEffect(() => {
    if (isStudioRoute) {
      document.body.classList.add("studio-plain-workspace");
      document.documentElement.classList.add("studio-full-viewport");
    } else {
      document.body.classList.remove("studio-plain-workspace");
      document.documentElement.classList.remove("studio-full-viewport");
    }

    return () => {
      document.body.classList.remove("studio-plain-workspace");
      document.documentElement.classList.remove("studio-full-viewport");
    };
  }, [isStudioRoute]);

  return (
    <>
      {pathname === "/" ? <LuxuryAmbientParticles /> : null}
      <div
        className={`page-shell content-layer ${isStudioRoute ? "studio-plain-workspace" : ""}`}
        style={
          isStudioRoute
            ? {
                backgroundColor: "#090b0d",
                backgroundImage: "none",
                minHeight: "100vh",
              }
            : undefined
        }
      >
        {!isStudioRoute ? <SiteHeader /> : null}
        {children}
      </div>
    </>
  );
}

export default RootAppFrame;