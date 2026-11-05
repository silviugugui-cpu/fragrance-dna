import assert from "node:assert/strict";
import { test } from "node:test";
import { hydratePersistentUserProfile, persistUserProfilePatchStrict } from "../lib/auth/persistentProfile";
import { getUserScopedStorageKey } from "../lib/auth/userScope";
import { loadDnaSession, loadGroundingVector, saveDnaSession } from "../lib/dnaSession";
import { getOrCreateUserProfile } from "../lib/engine/userProfileManager";
import { NEUTRAL_VECTOR } from "../lib/test/preferenceLearning";
import type { PersistentUserProfile } from "../lib/database/neonDatabase";

test("authenticated JSON profile preserves legacy data and partial drafts; writes serialize and errors remain explicit", async (t) => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const originalFetch = globalThis.fetch;
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  const events = new EventTarget();
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage, dispatchEvent: events.dispatchEvent.bind(events) } });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  storage.setItem("fragrancedna_user", JSON.stringify({ id: "evaluation-fixture-user" }));
  const key = getUserScopedStorageKey("fragrance_dna_session", "evaluation-fixture-user");
  const legacySession = {
    answers: { legacy: { citrus: 100, oud: 0 } }, answeredOrder: ["legacy"], currentIndex: 1,
    currentVector: { ...NEUTRAL_VECTOR, freshness: 1 }, snapshots: [], lastUpdatedAt: 1,
  };
  let server: PersistentUserProfile = { dnaSession: legacySession };
  const writes: PersistentUserProfile[] = [];
  let fail = false;
  let failHydration = false;
  let pause: (() => Promise<void>) | null = null;
  globalThis.fetch = async (_url, init) => {
    if (init?.method !== "PUT") return failHydration ? Response.json({ error: "Fixture offline" }, { status: 503 }) : Response.json({ profile: structuredClone(server) });
    const body = JSON.parse(String(init.body)) as PersistentUserProfile;
    writes.push(body);
    if (pause) { const wait = pause; pause = null; await wait(); }
    if (fail) return Response.json({ error: "Fixture failure" }, { status: 503 });
    server = { ...server, ...body };
    return Response.json({ profile: structuredClone(server) });
  };
  try {
    await t.test("remote legacy session migrates without losing raw history or turning it into liking", async () => {
      await hydratePersistentUserProfile();
      const session = loadDnaSession("evaluation-fixture-user");
      await persistUserProfilePatchStrict({});
      assert.deepEqual(session.evaluationState?.legacyPerception.answers, legacySession.answers);
      assert.deepEqual(session.currentVector, NEUTRAL_VECTOR);
      assert.equal(session.summary?.confidenceScore, 0);
      assert.deepEqual((server.dnaSession as typeof session).evaluationState?.legacyPerception.answers, legacySession.answers);
    });
    await t.test("partial conditional answers survive local reload and authenticated JSON round-trip", async () => {
      const session = loadDnaSession("evaluation-fixture-user");
      session.evaluationState!.draft = {
        schemaVersion: 2, id: "draft", fragranceId: "next", canonicalFragranceId: "house::next", displayName: "Next",
        attributeIds: ["citrus", "oud"], questions: [
          { attributeId: "citrus", perception: 3, preference: -1 }, { attributeId: "oud", perception: null, preference: null },
        ], overall: 2, unable: false, reason: "confirm", reasonAttributeId: "citrus", startedAt: 10,
      };
      session.lastUpdatedAt = 100;
      saveDnaSession(session, "evaluation-fixture-user", true);
      await persistUserProfilePatchStrict({ dnaSession: session });
      storage.removeItem(key);
      await hydratePersistentUserProfile();
      assert.deepEqual(loadDnaSession("evaluation-fixture-user").evaluationState?.draft, session.evaluationState?.draft);
    });
    await t.test("older hydration never overwrites a newer locally edited draft", async () => {
      const local = loadDnaSession("evaluation-fixture-user");
      local.lastUpdatedAt = 200;
      local.evaluationState!.draft!.overall = -2;
      saveDnaSession(local, "evaluation-fixture-user", true);
      await hydratePersistentUserProfile();
      assert.equal(loadDnaSession("evaluation-fixture-user").evaluationState?.draft?.overall, -2);
      assert.equal((server.dnaSession as typeof local).evaluationState?.draft?.overall, -2);
    });
    await t.test("stale legacy profile confidence/vector/history is archived, not used as preference", async () => {
      const profile = getOrCreateUserProfile("evaluation-fixture-user");
      const { preferenceSchemaVersion: _, ...old } = profile;
      const drift = [{ timestamp: 1, vector: legacySession.currentVector, confidenceLevel: 90 }];
      storage.setItem(getUserScopedStorageKey("fragrance_user_profile", profile.userId), JSON.stringify({
        ...old, dnaVector: legacySession.currentVector, totalInteractions: 20, confidenceLevel: 90, identityDriftHistory: drift,
      }));
      const migrated = getOrCreateUserProfile("evaluation-fixture-user");
      await persistUserProfilePatchStrict({});
      assert.equal(migrated.confidenceLevel, 0);
      assert.equal(migrated.totalInteractions, 0);
      assert.deepEqual(migrated.dnaVector, NEUTRAL_VECTOR);
      assert.deepEqual(migrated.identityDriftHistory, []);
      assert.deepEqual(migrated.legacyPreferenceProjection?.identityDriftHistory, drift);
    });
    await t.test("queued draft and commit writes cannot arrive out of order", async () => {
      let release!: () => void;
      pause = () => new Promise<void>((resolve) => { release = resolve; });
      const first = persistUserProfilePatchStrict({ seed: { revision: 1 } });
      const second = persistUserProfilePatchStrict({ seed: { revision: 2 } });
      await new Promise((resolve) => setTimeout(resolve, 0));
      assert.deepEqual(writes.at(-1)?.seed, { revision: 1 });
      release();
      await Promise.all([first, second]);
      assert.deepEqual(server.seed, { revision: 2 });
    });
    await t.test("failed remote saves reject and retry succeeds without deleting local progress", async () => {
      const before = storage.getItem(key);
      fail = true;
      await assert.rejects(persistUserProfilePatchStrict({ dnaSession: {} }), /503/);
      assert.equal(storage.getItem(key), before);
      fail = false;
      await persistUserProfilePatchStrict({ dnaSession: JSON.parse(before!) });
      assert.deepEqual(server.dnaSession, JSON.parse(before!));
    });
    await t.test("failed hydration cannot replace remote history with a fresh empty session; retry restores access", async () => {
      const before = storage.getItem(key);
      const writeCount = writes.length;
      failHydration = true;
      await hydratePersistentUserProfile();
      assert.throws(() => loadDnaSession("evaluation-fixture-user"), /Persistent progress/);
      assert.equal(storage.getItem(key), before);
      assert.equal(writes.length, writeCount);
      failHydration = false;
      await hydratePersistentUserProfile();
      assert.ok(loadDnaSession("evaluation-fixture-user").evaluationState?.draft);
    });
    await t.test("Grounding baseline is replayed from explicit choices, not a stale neutral-weighted vector", () => {
      storage.setItem(getUserScopedStorageKey("fragrance_vector", "evaluation-fixture-user"), JSON.stringify(legacySession.currentVector));
      storage.setItem(getUserScopedStorageKey("fragrance_grounding", "evaluation-fixture-user"), JSON.stringify({ neutral: ["Woody & Dry"] }));
      assert.equal(loadGroundingVector("evaluation-fixture-user"), null);
      storage.setItem(getUserScopedStorageKey("fragrance_grounding", "evaluation-fixture-user"), JSON.stringify({ schemaVersion: 2, neutral: ["Woody & Dry"] }));
      assert.deepEqual(loadGroundingVector("evaluation-fixture-user"), NEUTRAL_VECTOR);
    });
    await t.test("invalid saved profiles fail before migration writes and keep the raw data intact", () => {
      const profileKey = getUserScopedStorageKey("fragrance_user_profile", "evaluation-fixture-user");
      const invalid = JSON.stringify({ userId: "evaluation-fixture-user", dnaVector: {} });
      storage.setItem(profileKey, invalid);
      assert.throws(() => getOrCreateUserProfile("evaluation-fixture-user"), /Invalid saved DNA profile/);
      assert.equal(storage.getItem(profileKey), invalid);
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
