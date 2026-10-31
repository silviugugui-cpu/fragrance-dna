"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { readStudioHistoryState } from "@/app/studio/_components/StudioIntegrationClient";
import { studioNavItems } from "@/app/studio/_components/studioNav";

interface StudioShellProps {
  children: ReactNode;
}

const segmentToLabel = (segment: string): string =>
  segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export function StudioShell({ children }: StudioShellProps) {
  const pathname = usePathname() ?? "/studio";
  const [backCount, setBackCount] = useState(0);
  const [forwardCount, setForwardCount] = useState(0);

  useEffect(() => {
    const state = readStudioHistoryState();
    setBackCount(state.back.length);
    setForwardCount(state.forward.length);
  }, [pathname]);

  const currentSection = useMemo(() => {
    const match = studioNavItems
      .slice()
      .sort((left, right) => right.href.length - left.href.length)
      .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    return match?.label ?? "Studio";
  }, [pathname]);

  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .slice(0)
    .map(segmentToLabel);

  useEffect(() => {
    document.body.classList.add("studio-plain-workspace");
    return () => {
      document.body.classList.remove("studio-plain-workspace");
    };
  }, []);

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-transparent"
      style={{ backgroundColor: '#090b0d', backgroundImage: 'none' }}
    >
      <div className="grid h-screen grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]" style={{ backgroundColor: '#090b0d' }}>
        <aside className="hidden border-r border-zinc-800/70 bg-zinc-950/85 lg:flex lg:flex-col">
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {studioNavItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md border px-3 py-2.5 transition-colors ${
                    active
                      ? "border-amber-300/40 bg-amber-300/10"
                      : "border-transparent bg-transparent hover:border-amber-200/20 hover:bg-zinc-900/55"
                  }`}
                >
                  <p className={`text-sm font-medium ${active ? "text-amber-100" : "text-zinc-200"}`}>
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.description}</p>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex shrink-0 items-center justify-between border-b border-zinc-800/70 bg-zinc-950/90 px-3 py-2 lg:px-4">
            <span className="text-sm font-medium text-zinc-300">Studio</span>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-md border border-amber-300/30 px-4 py-2 text-sm font-medium text-amber-100 transition-colors hover:border-amber-200/60 hover:bg-amber-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
            >
              Back to homepage
            </Link>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto px-3 pb-0 pt-3 [scrollbar-gutter:stable] lg:px-4 lg:pb-0 lg:pt-4">
            <div className="mx-auto w-full">{children}</div>
          </main>

          <footer className="border-t border-zinc-800/70 bg-zinc-950/90 px-4 py-2 text-xs text-zinc-500 lg:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Section: {currentSection}</span>
              <span>
                History: {backCount} back / {forwardCount} forward
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
