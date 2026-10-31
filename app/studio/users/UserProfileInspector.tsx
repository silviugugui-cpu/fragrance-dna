"use client";

import { useEffect, useState } from "react";
import type { PersistentUserProfile } from "@/lib/database/neonDatabase";

type UserOption = { id: string; name: string; email: string };
type LoadState = "idle" | "loading" | "ready" | "error";
type ProfilePayload = {
  dnaProfile?: Record<string, unknown>;
  dnaSession?: Record<string, unknown>;
  grounding?: Record<string, unknown>;
  collection?: unknown[];
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

export function UserProfileInspector({ users }: { users: UserOption[] }) {
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [profile, setProfile] = useState<PersistentUserProfile | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setState("idle");
      return;
    }

    let active = true;
    setState("loading");
    setMessage("");
    void fetch(`/api/studio/users/profile?userId=${encodeURIComponent(userId)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { profile?: PersistentUserProfile | null; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Unable to load user profile.");
        if (active) {
          setProfile(payload.profile ?? null);
          setState("ready");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Unable to load user profile.");
          setState("error");
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const clearProfile = async () => {
    if (!userId || !window.confirm("Reset this user's saved DNA, test, Grounding, and Collection profile? The account will remain.")) return;
    setState("loading");
    try {
      const response = await fetch(`/api/studio/users/profile?userId=${encodeURIComponent(userId)}`, { method: "DELETE" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to reset profile.");
      setProfile(null);
      setMessage("User profile data reset. The account remains active.");
      setState("ready");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reset profile.");
      setState("error");
    }
  };

  const data = (profile ?? {}) as ProfilePayload;
  const dnaProfile = asRecord(data.dnaProfile);
  const dnaSession = asRecord(data.dnaSession);
  const grounding = asRecord(data.grounding);
  const dnaVector = asRecord(dnaProfile.dnaVector);
  const answeredOrder = Array.isArray(dnaSession.answeredOrder) ? dnaSession.answeredOrder : [];
  const love = Array.isArray(grounding.love) ? grounding.love : [];
  const avoid = Array.isArray(grounding.red_flag) ? grounding.red_flag : [];
  const collection = Array.isArray(data.collection) ? data.collection : [];
  const confidence = Number(dnaProfile.confidenceLevel ?? asRecord(dnaSession.summary).confidenceScore ?? 0);
  const hasData = Boolean(profile && [
    profile.dnaProfile,
    profile.dnaSession,
    profile.grounding,
    profile.groundingVector,
    profile.seed,
    profile.collection,
    profile.ratedAttributes,
    profile.testPlanSelections,
  ].some((value) => value !== undefined && value !== null));

  return (
    <article className="rounded border border-zinc-800 bg-zinc-900/55 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-300">Persistent User Profile</h2>
          <p className="mt-1 text-xs text-zinc-500">Inspect or reset the selected user's Neon profile. Account deletion is separate.</p>
        </div>
        <label className="min-w-[260px] space-y-1 text-xs uppercase tracking-[0.1em] text-zinc-500">
          <span>User</span>
          <select value={userId} onChange={(event) => setUserId(event.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-zinc-100">
            {users.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
          </select>
        </label>
      </div>

      {state === "loading" ? <p className="mt-4 text-sm text-zinc-400">Loading persisted profile...</p> : null}
      {state === "error" ? <p role="alert" className="mt-4 text-sm text-rose-300">{message}</p> : null}
      {state === "ready" && !hasData ? <p className="mt-4 text-sm text-zinc-400">No Neon profile data is saved for this user yet.</p> : null}

      {state === "ready" && hasData ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Test evaluations" value={String(answeredOrder.length)} />
          <Metric label="DNA confidence" value={`${Number.isFinite(confidence) ? confidence : 0}%`} />
          <Metric label="Grounding" value={`${love.length} love · ${avoid.length} avoid`} />
          <Metric label="Collection records" value={String(collection.length)} />
          <div className="sm:col-span-2 lg:col-span-4 rounded border border-zinc-800 bg-zinc-950/50 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">DNA Vector</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-300">
              {Object.entries(dnaVector).map(([axis, value]) => <span key={axis}>{axis}: {String(value)}</span>)}
              {Object.keys(dnaVector).length === 0 ? <span>No vector saved.</span> : null}
            </div>
          </div>
        </div>
      ) : null}

      {message && state !== "error" ? <p role="status" className="mt-3 text-sm text-emerald-300">{message}</p> : null}
      <button type="button" onClick={() => void clearProfile()} disabled={!userId || state === "loading" || !hasData} className="mt-4 rounded border border-rose-400/35 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-rose-200 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40">
        Reset profile data
      </button>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-800 bg-zinc-950/50 p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}