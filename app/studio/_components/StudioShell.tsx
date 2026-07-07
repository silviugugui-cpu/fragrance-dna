"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { readStudioHistoryState, writeStudioHistoryState } from "@/app/studio/_components/StudioIntegrationClient";
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
  const router = useRouter();
  const pathname = usePathname() ?? "/studio";
  const [backCount, setBackCount] = useState(0);
  const [forwardCount, setForwardCount] = useState(0);

  useEffect(() => {
    const state = readStudioHistoryState();
    setBackCount(state.back.length);
    setForwardCount(state.forward.length);
  }, [pathname]);

  const currentSection = useMemo(() => {
    const match = studioNavItems.find((item) => pathname.startsWith(item.href));
    return match?.label ?? "Studio";
  }, [pathname]);

  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .slice(0)
    .map(segmentToLabel);

  const onBack = () => {
    const state = readStudioHistoryState();
    if (state.back.length === 0) {
      return;
    }

    const target = state.back[state.back.length - 1];
    const next = {
      back: state.back.slice(0, -1),
      forward: [state.current, ...state.forward].slice(0, 50),
      current: target,
    };

    writeStudioHistoryState(next);
    setBackCount(next.back.length);
    setForwardCount(next.forward.length);
    router.push(target);
  };

  const onForward = () => {
    const state = readStudioHistoryState();
    if (state.forward.length === 0) {
      return;
    }

    const target = state.forward[0];
    const next = {
      back: [...state.back, state.current].slice(-50),
      forward: state.forward.slice(1),
      current: target,
    };

    writeStudioHistoryState(next);
    setBackCount(next.back.length);
    setForwardCount(next.forward.length);
    router.push(target);
  };

  return (
    <div className="relative mx-auto min-h-[calc(100vh-120px)] w-full max-w-[1700px] rounded-2xl border border-amber-200/10 bg-zinc-950/75 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-sm">
      <div className="grid min-h-[calc(100vh-120px)] grid-cols-1 lg:grid-cols-[300px_1fr]">
        <aside className="hidden border-r border-amber-200/10 bg-zinc-950/90 lg:flex lg:flex-col">
          <div className="border-b border-amber-200/10 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Internal Application</p>
            <h1 className="mt-2 text-lg font-semibold text-amber-100">FragranceDNA Studio</h1>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {studioNavItems.map((item) => {
              const active = pathname === item.href || (pathname === "/studio" && item.href === "/studio/dashboard");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg border px-3 py-3 transition-colors ${
                    active
                      ? "border-amber-300/40 bg-amber-300/10"
                      : "border-transparent bg-transparent hover:border-amber-200/20 hover:bg-zinc-900/70"
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
          <header className="border-b border-amber-200/10 bg-zinc-950/80 px-5 py-4 lg:px-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Studio Workspace</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  {crumbs.map((crumb, index) => (
                    <span key={`${crumb}-${index}`} className="flex items-center gap-2">
                      {index > 0 ? <span className="text-zinc-600">/</span> : null}
                      <span className={index === crumbs.length - 1 ? "text-amber-100" : "text-zinc-400"}>
                        {crumb}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={backCount === 0}
                  className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onForward}
                  disabled={forwardCount === 0}
                  className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Forward
                </button>
                <div className="rounded-full border border-amber-200/20 bg-zinc-900/75 px-3 py-1.5 text-xs font-medium text-zinc-300">
                  Studio Shell v1
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-scroll px-4 py-4 [scrollbar-gutter:stable] lg:px-7 lg:py-6">
            <div className="mx-auto w-full">{children}</div>
          </main>

          <footer className="border-t border-amber-200/10 bg-zinc-950/90 px-5 py-3 text-xs text-zinc-500 lg:px-7">
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
