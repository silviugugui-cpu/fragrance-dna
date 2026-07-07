"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface StudioIntegrationClientProps {
  children: React.ReactNode;
}

type HistoryState = {
  back: string[];
  forward: string[];
  current: string;
};

const HISTORY_KEY = "studio.nav.history.v1";
const STATE_KEY = "studio.workspace.state.v1";

const buildRouteFromPath = (path: string | null, params: URLSearchParams): string => {
  const search = params.toString();
  if (!path) {
    return "/studio";
  }

  return search.length > 0 ? `${path}?${search}` : path;
};

const safeParse = <T,>(value: string | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const saveWorkspaceState = (route: string, queryString: string): void => {
  const existing = safeParse<Record<string, string>>(window.localStorage.getItem(STATE_KEY)) ?? {};
  existing[route] = queryString;
  window.localStorage.setItem(STATE_KEY, JSON.stringify(existing));
};

export function StudioIntegrationClient({ children }: StudioIntegrationClientProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const initialized = useRef(false);
  const paramsString = params?.toString() ?? "";
  const currentRoute = useMemo(
    () => buildRouteFromPath(pathname, new URLSearchParams(paramsString)),
    [paramsString, pathname],
  );

  useEffect(() => {
    const query = paramsString;
    saveWorkspaceState(pathname ?? "/studio", query);
  }, [paramsString, pathname]);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    const history = safeParse<HistoryState>(window.localStorage.getItem(HISTORY_KEY));
    if (!history) {
      window.localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify({ back: [], forward: [], current: currentRoute } satisfies HistoryState),
      );
      return;
    }

    const storedState = safeParse<Record<string, string>>(window.localStorage.getItem(STATE_KEY)) ?? {};
    const query = storedState[pathname ?? "/studio"];
    if (query && query.length > 0 && paramsString.length === 0) {
      router.replace(`${pathname}?${query}`);
    }
  }, [currentRoute, paramsString, pathname, router]);

  useEffect(() => {
    const history =
      safeParse<HistoryState>(window.localStorage.getItem(HISTORY_KEY)) ??
      ({ back: [], forward: [], current: currentRoute } satisfies HistoryState);

    if (history.current === currentRoute) {
      return;
    }

    const nextBack = history.current ? [...history.back, history.current].slice(-50) : history.back;
    const next = {
      back: nextBack,
      forward: [],
      current: currentRoute,
    } satisfies HistoryState;

    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }, [currentRoute]);

  return <>{children}</>;
}

export const readStudioHistoryState = (): HistoryState => {
  if (typeof window === "undefined") {
    return { back: [], forward: [], current: "/studio" };
  }

  return (
    safeParse<HistoryState>(window.localStorage.getItem(HISTORY_KEY)) ?? {
      back: [],
      forward: [],
      current: "/studio",
    }
  );
};

export const writeStudioHistoryState = (state: HistoryState): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(state));
};
