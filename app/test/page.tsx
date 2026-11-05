'use client';

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getUserScopedStorageKey } from "@/lib/auth/userScope";
import { hydratePersistentUserProfile, persistUserProfilePatchStrict } from "@/lib/auth/persistentProfile";
import { PageShell } from "@/components/design-system";
import { PerfumeImageWithFallback } from "@/components/design-system/PerfumeImageWithFallback";
import { createFragranceIntelligenceService } from "@/lib/intelligence/fragranceIntelligence";
import type { UserDnaProfileRecord } from "@/lib/database/masterFragranceDatabase";
import type { DNASessionState } from "@/lib/types";
import { loadDnaSession, saveDnaSession, getDnaConfidenceBadge } from "@/lib/dnaSession";
import { getOrCreateUserProfile, updateUserVector } from "@/lib/engine/userProfileManager";
import { projectEvaluationSession, readGroundingPrior } from "@/lib/test/evaluationSession";
import { draftForCandidate, selectAdaptiveCandidate, submitEvaluation, validateEvaluation,
  type EvaluationDraft, type GroundingPrior, type Liking, type Perception } from "@/lib/test/preferenceLearning";
import { useLanguage } from "@/lib/i18n";
import { evaluationAttributeLabel, evaluationAttributeQuestions, evaluationReason, getEvaluationCopy } from "@/lib/i18n/evaluationCopy";
import { getEvidenceCopy } from "@/lib/i18n/evidenceCopy";

const likingValues: Liking[] = [-2, -1, 0, 1, 2];
const perceptionValues: Perception[] = [0, 1, 2, 3];
const choiceClass = "rounded-xl border px-3 py-3 text-sm transition hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";

export default function TestPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { locale, t } = useLanguage();
  const copy = getEvaluationCopy(locale);
  const evidenceCopy = getEvidenceCopy(locale);
  const [profiles, setProfiles] = useState<UserDnaProfileRecord[] | null>(null);
  const [session, setSession] = useState<DNASessionState | null>(null);
  const [grounding, setGrounding] = useState<GroundingPrior>({ love: [], neutral: [], redFlag: [] });
  const [fatal, setFatal] = useState<"pool" | "load" | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [validationError, setValidationError] = useState(false);
  const [notice, setNotice] = useState<"updated" | "noSignal" | null>(null);
  const writeQueue = useRef(Promise.resolve());
  const generation = useRef(0);
  const revision = useRef(0);
  const latest = useRef<DNASessionState | null>(null);
  const service = useMemo(() => createFragranceIntelligenceService(profiles ?? []), [profiles]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/test/user-dna-pool", { signal: controller.signal }).then(async (response) => {
      const payload = await response.json() as { profiles?: UserDnaProfileRecord[] };
      if (!response.ok || !Array.isArray(payload.profiles) || !payload.profiles.length) throw new Error("Eligible SQLite pool unavailable.");
      setProfiles(payload.profiles);
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.error("[test] Cannot load canonical pool.", error);
      setFatal("pool");
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    generation.current++;
    setSession(null);
    latest.current = null;
    const restore = () => {
      try {
        const raw = localStorage.getItem(getUserScopedStorageKey("fragrance_grounding", user?.id));
        const prior = readGroundingPrior(raw ? JSON.parse(raw) : null);
        const loaded = loadDnaSession(user?.id);
        setGrounding(prior);
        setSession(loaded);
        latest.current = loaded;
        setFatal((current) => current === "pool" ? current : null);
      } catch (error) {
        console.error("[test] Cannot restore progress.", error);
        setFatal("load");
      }
    };
    restore();
    window.addEventListener("fragrancedna-user-profile-loaded", restore);
    return () => { generation.current++; window.removeEventListener("fragrancedna-user-profile-loaded", restore); };
  }, [authLoading, user?.id]);

  const persist = (next: DNASessionState) => {
    next = { ...next, lastUpdatedAt: Date.now() };
    latest.current = next;
    setSession(next);
    const currentRevision = ++revision.current;
    const currentGeneration = generation.current;
    try { saveDnaSession(next, user?.id, true); } catch (error) {
      console.error("[test] Cannot save local progress.", error);
      setSaveStatus("error");
      return false;
    }
    setSaveStatus("saving");
    const snapshot = next;
    writeQueue.current = writeQueue.current.then(async () => {
      if (currentGeneration !== generation.current) return;
      await persistUserProfilePatchStrict({ dnaSession: snapshot });
    }).then(() => {
      if (currentGeneration === generation.current && currentRevision === revision.current) setSaveStatus("saved");
    }).catch((error: unknown) => {
      console.error("[test] Persistent progress synchronization failed.", error);
      if (currentGeneration === generation.current && currentRevision === revision.current) setSaveStatus("error");
    });
    return true;
  };

  const chooseNext = (current: DNASessionState): DNASessionState => {
    if (!current.evaluationState) throw new Error("Missing evaluation state.");
    const candidate = selectAdaptiveCandidate(service, current.evaluationState.records, grounding,
      current.evaluationState.legacyPerception.answeredOrder);
    return { ...current, evaluationState: { ...current.evaluationState,
      draft: candidate ? draftForCandidate(candidate, crypto.randomUUID()) : null } };
  };

  useEffect(() => {
    if (!session?.evaluationState || !profiles || session.evaluationState.draft || grounding.love.length + grounding.redFlag.length < 2) return;
    const next = chooseNext(session);
    if (next.evaluationState?.draft) persist(next);
    // Selection only initializes a missing draft. Submitted evidence drives subsequent choices.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, profiles, grounding]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (saveStatus !== "saved") { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveStatus]);

  const draft = session?.evaluationState?.draft ?? null;
  const reference = draft ? service.listEvaluationFragrances().find((item) => item.fragranceId === draft.fragranceId) : null;
  const changeDraft = (value: EvaluationDraft) => {
    if (!session?.evaluationState) return;
    setValidationError(false);
    persist({ ...session, evaluationState: { ...session.evaluationState, draft: value } });
  };
  const submit = () => {
    if (!draft || !session?.evaluationState) return;
    try {
      const record = submitEvaluation(draft);
      const committed = projectEvaluationSession({
        ...session,
        evaluationState: { ...session.evaluationState, records: [...session.evaluationState.records, record], draft: null },
      }, grounding);
      if (!persist(chooseNext(committed))) { setNotice(null); return; }
      if (record.status === "completed") {
        const profile = getOrCreateUserProfile(user?.id);
        updateUserVector(profile, committed.currentVector, committed.preferenceProjection?.confidence ?? 0, committed.answeredOrder.length);
      }
      setNotice(record.status === "unable" ? "noSignal" : "updated");
      setValidationError(false);
    } catch (error) {
      console.error("[test] Cannot submit evaluation.", error);
      setSaveStatus("error");
    }
  };
  let canSubmit = false;
  if (draft) { try { validateEvaluation(draft); canSubmit = true; } catch { /* Incomplete drafts are expected. */ } }

  if (fatal) return <PageShell><div role="alert" className="main-container py-16">{fatal === "pool" ? t.test.poolUnavailable : copy.loadError}
    <button type="button" className="ml-3 underline" onClick={() => {
      if (fatal === "load" && user?.id) void hydratePersistentUserProfile();
      else window.location.reload();
    }}>{copy.retry}</button>
  </div></PageShell>;
  if (authLoading || !session || !profiles) return <PageShell><p className="main-container py-16">{t.test.loadingProfile}</p></PageShell>;
  if (grounding.love.length + grounding.redFlag.length < 2) return <PageShell><section className="main-container py-16"><h1 className="text-2xl">{t.test.groundingRequiredTitle}</h1><p className="my-4">{t.test.groundingRequiredDescription}</p><Link className="text-gold underline" href="/grounding">{t.test.beginGrounding}</Link></section></PageShell>;
  const projection = session.preferenceProjection;
  return <PageShell><main className="main-container py-10 md:py-14">
    <h1 className="max-w-3xl text-3xl font-semibold md:text-4xl">{copy.title}</h1>
    <p className="my-5 max-w-3xl text-gray-300">{copy.intro}</p>
    <p className="text-sm">{copy.complete}: <strong data-completed-count>{session.answeredOrder.length}</strong> · {t.test.dnaConfidenceLevel}: {projection?.confidence ?? 0}% · {getDnaConfidenceBadge(projection?.confidence ?? 0).label}</p>
    {session.evaluationState && Object.keys(session.evaluationState.legacyPerception.answers).length > 0 && <p className="mt-4 text-sm text-gray-400">{copy.legacy}</p>}
    {notice && <p role="status" className="my-5 rounded-xl border border-gold/30 p-4">{copy[notice]}</p>}
    {saveStatus === "error" ? <div role="alert" className="my-4 text-rose-300">{copy.saveError} <button type="button" className="underline" onClick={() => latest.current && persist(latest.current)}>{copy.retry}</button></div>
      : <p role="status" className="my-4 text-xs text-gray-400">{saveStatus === "saving" ? copy.pending : copy.saved}</p>}
    {draft && !reference ? <p role="alert" className="my-8">{t.test.poolUnavailable}</p> : draft && reference ? <section key={draft.id} className="premium-card-dark my-6 p-5 md:p-8">
      <div className="flex flex-col gap-5 sm:flex-row">
        <PerfumeImageWithFallback candidates={[reference.blobImageUrl, reference.localImagePath, reference.imageUrl]} alt={draft.displayName} className="h-36 w-36 shrink-0 object-contain" />
        <div><p className="text-sm text-gold">{reference.brand}</p><h2 className="mt-2 text-2xl font-bold">{draft.displayName}</h2>
          <p data-selection-reason className="mt-4 max-w-2xl text-sm text-gray-300">{evaluationReason(draft.reason, draft.reasonAttributeId, locale)}</p></div>
      </div>
      <fieldset className="mt-8"><legend className="text-xl">{copy.overall}</legend>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">{likingValues.map((value, index) => <label key={value} className={`${choiceClass} ${draft.overall === value && !draft.unable ? "border-gold bg-gold/15" : "border-white/20"}`}>
          <input type="radio" name="overall" className="mr-2 accent-gold" checked={!draft.unable && draft.overall === value} onChange={() => changeDraft({ ...draft, unable: false, overall: value })} />{copy.overallOptions[index]}
        </label>)}</div>
        <label className={`${choiceClass} mt-3 block ${draft.unable ? "border-gold bg-gold/15" : "border-white/20"}`}>
          <input type="radio" name="overall" className="mr-2 accent-gold" checked={draft.unable} onChange={() => changeDraft({ ...draft, unable: true, overall: null,
            questions: draft.questions.map((question) => ({ ...question, perception: null, preference: null })) })} />{copy.unable}
        </label>
      </fieldset>
      {!draft.unable && draft.questions.map((answer) => {
        const questions = evaluationAttributeQuestions(answer.attributeId, locale);
        return <div key={answer.attributeId} data-attribute-question={answer.attributeId} className="mt-8 border-t border-white/10 pt-6">
          <p className="mb-3 text-sm text-gold">{evaluationReason(projection?.attributes[answer.attributeId]?.explicitCount ? "clarify" : projection?.attributes[answer.attributeId]?.groundingPrior ? "confirm" : "explore", answer.attributeId, locale)}</p>
          <fieldset><legend className="text-lg">{questions.perception}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">{perceptionValues.map((value, index) => <label key={value} className={`${choiceClass} ${answer.perception === value ? "border-gold bg-gold/15" : "border-white/20"}`}>
              <input type="radio" name={`perception-${answer.attributeId}`} className="mr-2 accent-gold" checked={answer.perception === value} onChange={() => changeDraft({ ...draft,
                questions: draft.questions.map((item) => item.attributeId === answer.attributeId ? { ...item, perception: value, preference: value === 0 ? null : item.preference } : item) })} />{questions.perceptionOptions[index]}
            </label>)}</div>
          </fieldset>
          {answer.perception === 0 && <p className="mt-3 text-sm text-gray-400">{copy.perceptionOnly}</p>}
          {answer.perception !== null && answer.perception > 0 && <fieldset className="mt-5"><legend className="text-lg">{questions.preference}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-5">{likingValues.map((value, index) => <label key={value} className={`${choiceClass} ${answer.preference === value ? "border-gold bg-gold/15" : "border-white/20"}`}>
              <input type="radio" name={`preference-${answer.attributeId}`} className="mr-2 accent-gold" checked={answer.preference === value} onChange={() => changeDraft({ ...draft,
                questions: draft.questions.map((item) => item.attributeId === answer.attributeId ? { ...item, preference: value } : item) })} />{copy.preferenceOptions[index]}
            </label>)}</div>
          </fieldset>}
        </div>;
      })}
      {validationError && <p role="alert" className="mt-5 text-rose-300">{copy.required}</p>}
      <button type="button" disabled={!canSubmit} onClick={submit} className="mt-8 rounded-xl border border-gold bg-gold/15 px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40">{draft.unable ? copy.next : copy.submit}</button>
    </section> : <p className="my-8">{copy.exhausted}</p>}
    {Object.entries(projection?.attributes ?? {}).filter(([, evidence]) => evidence.groundingConflictResolved || evidence.groundingConflictPending).map(([id, evidence]) =>
      <p key={id} data-preference-conflict={evidence.groundingConflictPending ? "provisional" : "resolved"} className="mb-3 text-sm text-gold">
        {evaluationAttributeLabel(id, locale)}: {evidence.groundingConflictPending ? evidenceCopy.provisional : copy.conflicts}
      </p>)}
    <Link href="/dna" className="mr-6 inline-block py-4 text-gold underline">{t.test.stopForNow}</Link>
    <Link href="/results" className="inline-block py-4 text-gold underline">{t.test.stopAndViewRecommendations}</Link>
  </main></PageShell>;
}
