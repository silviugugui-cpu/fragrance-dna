'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getUserScopedStorageKey } from '@/lib/auth/userScope';
import { persistUserProfilePatch } from '@/lib/auth/persistentProfile';
import type { AnswerRecord } from '../../lib/types';
import {
  buildSessionFromAnswers,
  loadDnaSession,
  loadGroundingVector,
  TEST_BATCH_SIZE,
  DNA_CONFIDENCE_BADGES,
  getDnaConfidenceBadge,
  saveDnaSession,
} from '@/lib/dnaSession';
import { getOrCreateUserProfile, updateUserVector } from '@/lib/engine/userProfileManager';
import { getPhase1Flags } from '@/lib/intelligence/flags/phase1Flags';
import { createFragranceIntelligenceService } from '@/lib/intelligence/fragranceIntelligence';
import { buildBehaviorProjectionFromAnswers } from '@/lib/intelligence/learning/adaptiveSelector';
import { buildFragranceEvaluationPlan, type FragranceEvaluationPlanItem, type PersistedFragrancePlanState } from '@/lib/intelligence/learning/evaluationPlan';
import type { BehaviorProjectionState } from '@/lib/intelligence/projections/models/behaviorProjection';
import { runTestDualWrite } from '@/lib/intelligence/test/testDualWrite';
import { buildDefaultAnswers, getEvaluationQuestionsForFragrance } from '@/lib/test/adaptiveQuestions';
import { PageShell, PremiumButton } from '@/components/design-system';
import type { UserDnaProfileRecord } from '@/lib/database/masterFragranceDatabase';

const PHASE1_FLAGS_SSR_SAFE = {
  eventsWriteEnabled: false,
  eventsWriteRequired: false,
  projectionsReadUserDna: false,
  projectionsReadSession: false,
  dualWriteLegacyProfile: true,
  dualWriteLegacySession: true,
  phase1ShadowValidation: false,
  adaptiveTestQuestionsEnabled: true,
  adaptiveNextFragranceEnabled: true,
  testDualWriteEnabled: false,
  testShadowValidationEnabled: false,
};

const STORAGE_KEY = 'fragranceDNA-answers';
const RATED_ATTRIBUTES_STORAGE_KEY = 'fragranceDNA-rated-attributes';
const PLAN_SELECTIONS_STORAGE_KEY = 'fragranceDNA-plan-selections';

export default function TestPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [batchNumber, setBatchNumber] = useState(1);
  const [batchPlan, setBatchPlan] = useState<FragranceEvaluationPlanItem[]>([]);
  const [completedBatchSteps, setCompletedBatchSteps] = useState<number[]>([]);
  const [excludedPlanFragranceIds, setExcludedPlanFragranceIds] = useState<string[]>([]);
  const [batchPlanInitialized, setBatchPlanInitialized] = useState(false);
  const [showPostEvaluation, setShowPostEvaluation] = useState(false);
  const [badgeMilestoneMessage, setBadgeMilestoneMessage] = useState('');
  const [noMoreDiagnostics, setNoMoreDiagnostics] = useState(false);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [completedFragranceIds, setCompletedFragranceIds] = useState<string[]>([]);
  const [behaviorProjection, setBehaviorProjection] = useState<BehaviorProjectionState | undefined>();
  const [ratedAttributes, setRatedAttributes] = useState<Record<string, string[]>>({});
  const [ratingError, setRatingError] = useState('');
  const [selectedPlanOptions, setSelectedPlanOptions] = useState<Record<number, string>>({});
  const [planNotice, setPlanNotice] = useState('');
  const [groundingSelectionCount, setGroundingSelectionCount] = useState(0);
  const [groundingProfile, setGroundingProfile] = useState({ love: [] as string[], neutral: [] as string[], redFlag: [] as string[] });
  const [isHydrated, setIsHydrated] = useState(false);
  const [fragranceIntelligence, setFragranceIntelligence] = useState(() => createFragranceIntelligenceService([]));
  const [poolStatus, setPoolStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [poolError, setPoolError] = useState('');

  const saveBatchState = (state: PersistedFragrancePlanState): void => {
    window.localStorage.setItem(getUserScopedStorageKey(PLAN_SELECTIONS_STORAGE_KEY, user?.id), JSON.stringify(state));
    persistUserProfilePatch({ testPlanSelections: state });
  };

  useEffect(() => {
    let active = true;
    void fetch('/api/test/user-dna-pool')
      .then(async (response) => {
        const payload = await response.json() as { profiles?: UserDnaProfileRecord[]; error?: string };
        if (!response.ok || !Array.isArray(payload.profiles) || payload.profiles.length === 0) {
          throw new Error(payload.error ?? 'The User DNA fragrance pool is unavailable.');
        }
        if (active) {
          setFragranceIntelligence(createFragranceIntelligenceService(payload.profiles));
          setPoolStatus('ready');
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setPoolError(error instanceof Error ? error.message : 'The User DNA fragrance pool is unavailable.');
          setPoolStatus('error');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const evaluationFragrances = useMemo(
    () => fragranceIntelligence.listEvaluationFragrances(),
    [fragranceIntelligence],
  );
  const sessionFragrances = useMemo(
    () => fragranceIntelligence.listSessionFragrances().map((fragrance) => ({
      id: fragrance.fragranceId,
      name: fragrance.displayName,
      notes: [...fragrance.notes],
    })),
    [fragranceIntelligence],
  );
  const confidenceContext = useMemo(
    () => ({
      groundingEvidence: groundingProfile,
      groundingVector: loadGroundingVector(user?.id) ?? undefined,
    }),
    [groundingProfile, user?.id],
  );

  useEffect(() => {
    if (isAuthLoading) return;
    setCurrentIndex(0);
    setAnswers({});
    setCompletedFragranceIds([]);
    setBehaviorProjection(undefined);
    setRatedAttributes({});
    setSelectedPlanOptions({});
    setBatchPlan([]);
    setBatchNumber(1);
    setCompletedBatchSteps([]);
    setExcludedPlanFragranceIds([]);
    setBatchPlanInitialized(false);
    setShowPostEvaluation(false);
    setBadgeMilestoneMessage('');
    setNoMoreDiagnostics(false);
    setRatingError('');
    const session = loadDnaSession(user?.id);
    setCompletedFragranceIds(session.answeredOrder);
    setBehaviorProjection(session.behaviorProjection);
    const stored = window.localStorage.getItem(getUserScopedStorageKey(STORAGE_KEY, user?.id));
    const storedRatings = window.localStorage.getItem(getUserScopedStorageKey(RATED_ATTRIBUTES_STORAGE_KEY, user?.id));
    const storedPlanSelections = window.localStorage.getItem(getUserScopedStorageKey(PLAN_SELECTIONS_STORAGE_KEY, user?.id));
    if (storedPlanSelections) {
      try {
        const parsed = JSON.parse(storedPlanSelections) as Partial<PersistedFragrancePlanState> & Record<number, string>;
        if (parsed.version === 1 && Array.isArray(parsed.items)) {
          const savedPlan = parsed as PersistedFragrancePlanState;
          setBatchPlan(savedPlan.items);
          setBatchNumber(savedPlan.batchNumber);
          setCurrentIndex(savedPlan.currentStep);
          setSelectedPlanOptions(savedPlan.selectedByStep);
          setCompletedBatchSteps(savedPlan.completedSteps);
          setExcludedPlanFragranceIds(savedPlan.excludedFragranceIds);
          setBatchPlanInitialized(true);
          setNoMoreDiagnostics(savedPlan.items.length === 0);
          setShowPostEvaluation(savedPlan.items.length === 0 || savedPlan.completedSteps.includes(savedPlan.currentStep + 1));
        } else {
          const legacySelections = Object.values(parsed).filter((value): value is string => typeof value === 'string');
          setSelectedPlanOptions(parsed as Record<number, string>);
          setExcludedPlanFragranceIds((previous) => [...new Set([...previous, ...legacySelections])]);
        }
      } catch {
        setSelectedPlanOptions({});
      }
    }
    if (storedRatings) {
      try {
        setRatedAttributes(JSON.parse(storedRatings) as Record<string, string[]>);
      } catch {
        setRatedAttributes({});
      }
    }
    if (stored) {
      try {
        setAnswers(JSON.parse(stored));
      } catch {
        setAnswers({});
      }
    } else if (session.answers && Object.keys(session.answers).length > 0) {
      setAnswers(session.answers);
    }

    try {
      const rawGrounding = window.localStorage.getItem(getUserScopedStorageKey('fragrance_grounding', user?.id));
      if (rawGrounding) {
        const parsedGrounding = JSON.parse(rawGrounding) as {
          love?: string[];
          neutral?: string[];
          red_flag?: string[];
        };
        const selectedCount = (parsedGrounding.love?.length ?? 0) + (parsedGrounding.red_flag?.length ?? 0);
        setGroundingSelectionCount(selectedCount);
        setGroundingProfile({
          love: parsedGrounding.love ?? [],
          neutral: parsedGrounding.neutral ?? [],
          redFlag: parsedGrounding.red_flag ?? [],
        });
      } else {
        setGroundingSelectionCount(0);
        setGroundingProfile({ love: [], neutral: [], redFlag: [] });
      }
    } catch {
      setGroundingSelectionCount(0);
      setGroundingProfile({ love: [], neutral: [], redFlag: [] });
    }

    setIsHydrated(true);
  }, [isAuthLoading, user?.id]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    window.localStorage.setItem(getUserScopedStorageKey(STORAGE_KEY, user?.id), JSON.stringify(answers));
  }, [answers, isHydrated, user?.id]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(getUserScopedStorageKey(RATED_ATTRIBUTES_STORAGE_KEY, user?.id), JSON.stringify(ratedAttributes));
    const timer = window.setTimeout(() => persistUserProfilePatch({ ratedAttributes }), 500);
    return () => window.clearTimeout(timer);
  }, [isHydrated, ratedAttributes, user?.id]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!batchPlanInitialized) return;
    const planState: PersistedFragrancePlanState = {
      version: 1,
      batchNumber,
      currentStep: currentIndex,
      items: batchPlan,
      selectedByStep: selectedPlanOptions,
      completedSteps: completedBatchSteps,
      excludedFragranceIds: excludedPlanFragranceIds,
    };
    const timer = window.setTimeout(() => saveBatchState(planState), 350);
    return () => window.clearTimeout(timer);
  }, [batchNumber, batchPlan, batchPlanInitialized, completedBatchSteps, currentIndex, excludedPlanFragranceIds, isHydrated, selectedPlanOptions, user?.id]);

  useEffect(() => {
    if (!isHydrated || poolStatus !== 'ready') {
      return;
    }
    const timer = window.setTimeout(() => {
      const nextSession = buildSessionFromAnswers(answers, currentIndex, loadDnaSession(user?.id), sessionFragrances, completedFragranceIds, confidenceContext);
      saveDnaSession(nextSession, user?.id);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [answers, completedFragranceIds, confidenceContext, currentIndex, isAuthLoading, isHydrated, poolStatus, sessionFragrances, user?.id]);

  const phase1Flags = isHydrated ? getPhase1Flags() : PHASE1_FLAGS_SSR_SAFE;
  const committedAnswers = useMemo(
    () => Object.fromEntries(completedFragranceIds.flatMap((id) => answers[id] ? [[id, answers[id]]] : [])),
    [answers, completedFragranceIds],
  );
  const proposedBatchPlan = useMemo(
    () => buildFragranceEvaluationPlan({
      fragranceService: fragranceIntelligence,
      groundingProfile,
      answers: committedAnswers,
      behaviorProjection,
      previousEvaluations: completedFragranceIds,
      excludedFragranceIds: excludedPlanFragranceIds,
      count: TEST_BATCH_SIZE,
    }),
    [answers, behaviorProjection, completedFragranceIds, committedAnswers, excludedPlanFragranceIds, fragranceIntelligence, groundingProfile],
  );

  useEffect(() => {
    if (!isHydrated || isAuthLoading || poolStatus !== 'ready' || batchPlanInitialized || groundingSelectionCount < 2) return;
    const compatibleSelections = Object.fromEntries(proposedBatchPlan.flatMap((item) => {
      const savedSelection = selectedPlanOptions[item.step];
      const availableIds = [item.primary.fragranceId, item.backup?.fragranceId].filter((id): id is string => Boolean(id));
      return savedSelection && availableIds.includes(savedSelection) ? [[item.step, savedSelection]] : [];
    }));
    setBatchPlan(proposedBatchPlan);
    setSelectedPlanOptions(compatibleSelections);
    setBatchNumber(Math.floor(completedFragranceIds.length / TEST_BATCH_SIZE) + 1);
    setCurrentIndex(0);
    setCompletedBatchSteps([]);
    setExcludedPlanFragranceIds(completedFragranceIds);
    setNoMoreDiagnostics(proposedBatchPlan.length === 0);
    setShowPostEvaluation(proposedBatchPlan.length === 0);
    setBatchPlanInitialized(true);
  }, [batchPlanInitialized, completedFragranceIds, groundingSelectionCount, isAuthLoading, isHydrated, poolStatus, proposedBatchPlan, selectedPlanOptions]);

  const evaluationPlan = batchPlanInitialized ? batchPlan : proposedBatchPlan;
  const activePlan = evaluationPlan.find((item) => item.step === currentIndex + 1) ?? null;
  const requestedOptionId = activePlan ? selectedPlanOptions[activePlan.step] : undefined;
  const currentPlanOption = activePlan
    ? [activePlan.primary, activePlan.backup].find((option) => option?.fragranceId === requestedOptionId) ?? activePlan.primary
    : null;
  const currentRef = useMemo(
    () => currentPlanOption ?? activePlan?.primary,
    [activePlan, currentPlanOption],
  );

  const canonicalFragrance = useMemo(
    () => currentRef ? fragranceIntelligence.getCanonicalFragrance(currentRef.fragranceId) : null,
    [currentRef, fragranceIntelligence]
  );
  const evaluationQuestions = useMemo(
    () => {
      if (!canonicalFragrance) {
        return [];
      }

      return getEvaluationQuestionsForFragrance(canonicalFragrance, {
        adaptiveEnabled: phase1Flags.adaptiveTestQuestionsEnabled,
        allowLegacyFallback: false,
      });
    },
    [canonicalFragrance, phase1Flags.adaptiveTestQuestionsEnabled]
  );

  const defaultAnswers = useMemo(
    () => buildDefaultAnswers(evaluationQuestions),
    [evaluationQuestions]
  );

  const liveSession = useMemo(
    () => buildSessionFromAnswers(answers, completedFragranceIds.length, loadDnaSession(user?.id), sessionFragrances, completedFragranceIds, confidenceContext),
    [answers, completedFragranceIds, confidenceContext, currentIndex, sessionFragrances, user?.id]
  );
  const currentConfidence = liveSession.summary?.confidenceScore ?? liveSession.snapshots.at(-1)?.confidenceScore ?? 0;
  const currentBadge = getDnaConfidenceBadge(currentConfidence);
  const currentBadgeIndex = DNA_CONFIDENCE_BADGES.findIndex((badge) => badge.id === currentBadge.id);
  const nextBadge = DNA_CONFIDENCE_BADGES[currentBadgeIndex + 1] ?? null;
  const badgeProgress = nextBadge
    ? Math.max(0, Math.min(100, ((currentConfidence - currentBadge.minimum) / (nextBadge.minimum - currentBadge.minimum)) * 100))
    : 100;
  const needsGrounding = groundingSelectionCount < 2;

  if (isAuthLoading || !isHydrated) {
    return <PageShell><div className="main-container py-16 text-sm text-gray-300">Loading your test profile...</div></PageShell>;
  }
  if (poolStatus === 'loading') {
    return <PageShell><div className="main-container py-16 text-sm text-gray-300">Loading the User DNA fragrance pool...</div></PageShell>;
  }
  if (poolStatus === 'error') {
    return <PageShell><div role="alert" className="main-container py-16 text-sm text-rose-300">{poolError}</div></PageShell>;
  }
  if (needsGrounding) {
    return (
      <PageShell>
        <section className="py-16"><div className="main-container"><div className="premium-card-dark mx-auto max-w-2xl border border-gold/20 p-8 md:p-10">
          <p className="mb-3 text-xs uppercase tracking-wider text-gold">GROUNDING REQUIRED</p>
          <h1 className="mb-4 text-2xl font-bold text-white">Start with your scent preferences</h1>
          <p className="mb-6 leading-relaxed text-gray-300">Place at least two characteristics in Love or Avoid before requesting a diagnostic batch.</p>
          <PremiumButton variant="primary" size="lg" type="button" onClick={() => router.push('/grounding')}>Begin Grounding</PremiumButton>
        </div></div></section>
      </PageShell>
    );
  }
  if (!batchPlanInitialized) {
    return <PageShell><div className="main-container py-16 text-sm text-gray-300">Preparing your diagnostic batch...</div></PageShell>;
  }
  if (!currentRef && !noMoreDiagnostics) {
    return <PageShell><div role="alert" className="main-container py-16 text-sm text-rose-300">The User DNA fragrance pool contains no evaluable fragrances.</div></PageShell>;
  }

  const handleSliderChange = (key: string, value: number) => {
    if (!currentRef) {
      return;
    }
    setRatingError('');
    setAnswers((prev) => ({
      ...prev,
      [currentRef.fragranceId]: {
        ...(prev[currentRef.fragranceId] ?? defaultAnswers),
        [key]: value
      }
    }));
    setRatedAttributes((previous) => ({
      ...previous,
      [currentRef.fragranceId]: [...new Set([...(previous[currentRef.fragranceId] ?? []), key])],
    }));
  };

  const handleNext = async () => {
    if (evaluationQuestions.length === 0 || !canContinueCurrentFragrance || !activePlan || !currentRef) {
      setRatingError('Rate every displayed characteristic before continuing.');
      return;
    }

    const nextAnswers = { ...answers, [currentRef.fragranceId]: currentAnswers };
    const nextCompletedFragranceIds = [...new Set([...completedFragranceIds, currentRef.fragranceId])];
    const profile = getOrCreateUserProfile(user?.id);
    const previousConfidence = loadDnaSession(user?.id).summary?.confidenceScore ?? profile.confidenceLevel;
    const previousBadge = getDnaConfidenceBadge(previousConfidence);
    const nextCompletedSteps = [...new Set([...completedBatchSteps, activePlan.step])];
    const nextSession = buildSessionFromAnswers(nextAnswers, nextCompletedFragranceIds.length, liveSession, sessionFragrances, nextCompletedFragranceIds, confidenceContext);
    const nextCommittedAnswers = Object.fromEntries(
      nextCompletedFragranceIds.flatMap((id) => nextAnswers[id] ? [[id, nextAnswers[id]]] : []),
    );
    const nextBehaviorProjection = buildBehaviorProjectionFromAnswers(nextCommittedAnswers, fragranceIntelligence);
    nextSession.behaviorProjection = nextBehaviorProjection;

    saveBatchState({
      version: 1,
      batchNumber,
      currentStep: currentIndex,
      items: batchPlan,
      selectedByStep: selectedPlanOptions,
      completedSteps: nextCompletedSteps,
      excludedFragranceIds: excludedPlanFragranceIds,
    });
    setAnswers(nextAnswers);
    setCompletedFragranceIds(nextCompletedFragranceIds);
    setBehaviorProjection(nextBehaviorProjection);
    setCompletedBatchSteps(nextCompletedSteps);
    saveDnaSession(nextSession, user?.id);
    const confidence = nextSession.summary?.confidenceScore ?? nextSession.snapshots.at(-1)?.confidenceScore ?? 0;
    const updatedProfile = updateUserVector(profile, nextSession.currentVector, confidence);
    setShowPostEvaluation(true);
    setNoMoreDiagnostics(false);
    const nextBadge = getDnaConfidenceBadge(confidence);
    setBadgeMilestoneMessage(
      nextBadge.id !== previousBadge.id && nextBadge.minimum > previousBadge.minimum
        ? `Your Fragrance DNA has reached ${nextBadge.label}! Your profile and recommendations now reflect your latest evidence.`
        : 'Your DNA profile and recommendations now reflect your latest evidence.',
    );

    if (phase1Flags.eventsWriteEnabled || phase1Flags.testDualWriteEnabled) {
      try {
        const dualWriteResult = await runTestDualWrite({
          userId: updatedProfile.userId,
          fragranceId: currentRef.fragranceId,
          answerDimensions: currentAnswers,
          currentIndex: nextSession.answeredOrder.length - 1,
          answeredCount: nextSession.answeredOrder.length,
          answeredOrder: [...nextSession.answeredOrder],
          currentVector: nextSession.currentVector as unknown as Record<string, number>,
          confidenceEstimate: confidence,
          flags: phase1Flags,
        });
        window.localStorage.setItem('phase1_test_dual_write_status', JSON.stringify(dualWriteResult));
      } catch (error) {
        window.localStorage.setItem(
          'phase1_test_dual_write_status',
          JSON.stringify({
            attempted: true,
            persisted: false,
            published: false,
            parityValidated: false,
            parityMatches: false,
            eventIds: [],
            differences: [],
            metrics: {
              eventsEmitted: 0, eventsPersisted: 0, eventsPublished: 0, eventsFailed: 0,
              eventsRetried: 0, parityPassed: 0, parityFailed: 0, averageWriteTime: 0,
              averageReplayTime: 0, averageParityTime: 0,
            },
            errors: [error instanceof Error ? error.message : 'test_dual_write_failed'],
          }),
        );
      }
    }
  };

  const handleAnotherInBatch = () => {
    const nextPlanItem = batchPlan.find((item) => !completedBatchSteps.includes(item.step));
    if (!nextPlanItem) return;
    const nextStep = nextPlanItem.step - 1;
    setCurrentIndex(nextStep);
    saveBatchState({
      version: 1,
      batchNumber,
      currentStep: nextStep,
      items: batchPlan,
      selectedByStep: selectedPlanOptions,
      completedSteps: completedBatchSteps,
      excludedFragranceIds: excludedPlanFragranceIds,
    });
    setShowPostEvaluation(false);
    setBadgeMilestoneMessage('');
    setRatingError('');
  };

  // Replaces a single step's primary + backup with two fresh alternatives,
  // excluding everything already shown in this batch.
  const handleRerollStep = (step: number) => {
    const item = batchPlan.find((planItem) => planItem.step === step);
    if (!item || completedBatchSteps.includes(step)) return;

    const occupiedIds = batchPlan.flatMap((planItem) => [
      planItem.primary.fragranceId,
      ...(planItem.backup ? [planItem.backup.fragranceId] : []),
    ]);
    const newlyExcluded = [...new Set([...excludedPlanFragranceIds, ...occupiedIds])];
    const replacement = buildFragranceEvaluationPlan({
      fragranceService: fragranceIntelligence,
      groundingProfile,
      answers: committedAnswers,
      behaviorProjection,
      previousEvaluations: completedFragranceIds,
      excludedFragranceIds: newlyExcluded,
      count: 1,
    })[0];

    if (!replacement) {
      setPlanNotice('No fresh alternatives remain in the pool for this step. Keep one of the current options.');
      return;
    }

    const nextPlan = batchPlan.map((planItem) =>
      planItem.step === step ? { step, primary: replacement.primary, backup: replacement.backup } : planItem,
    );
    const nextSelected = { ...selectedPlanOptions };
    delete nextSelected[step];
    setPlanNotice('');
    setBatchPlan(nextPlan);
    setSelectedPlanOptions(nextSelected);
    setExcludedPlanFragranceIds(newlyExcluded);
    saveBatchState({
      version: 1,
      batchNumber,
      currentStep: currentIndex,
      items: nextPlan,
      selectedByStep: nextSelected,
      completedSteps: completedBatchSteps,
      excludedFragranceIds: newlyExcluded,
    });
  };

  const handleExploreNextBatch = () => {
    const newlyExcluded = [...new Set([
      ...excludedPlanFragranceIds,
      ...batchPlan.flatMap((item) => [item.primary.fragranceId, ...(item.backup ? [item.backup.fragranceId] : [])]),
    ])];
    const nextPlan = buildFragranceEvaluationPlan({
      fragranceService: fragranceIntelligence,
      groundingProfile,
      answers: committedAnswers,
      behaviorProjection,
      previousEvaluations: completedFragranceIds,
      excludedFragranceIds: newlyExcluded,
      count: TEST_BATCH_SIZE,
    });
    const nextBatchNumber = batchNumber + 1;
    saveBatchState({
      version: 1,
      batchNumber: nextBatchNumber,
      currentStep: 0,
      items: nextPlan,
      selectedByStep: {},
      completedSteps: [],
      excludedFragranceIds: newlyExcluded,
    });
    setExcludedPlanFragranceIds(newlyExcluded);
    setBatchNumber(nextBatchNumber);
    setBatchPlan(nextPlan);
    setSelectedPlanOptions({});
    setCompletedBatchSteps([]);
    setCurrentIndex(0);
    setBatchPlanInitialized(true);
    setNoMoreDiagnostics(nextPlan.length === 0);
    setShowPostEvaluation(nextPlan.length === 0);
    setBadgeMilestoneMessage('');
    setRatingError('');
  };

  const handleStopTesting = () => {
    saveDnaSession(liveSession, user?.id);
    saveBatchState({
      version: 1,
      batchNumber,
      currentStep: currentIndex,
      items: batchPlan,
      selectedByStep: selectedPlanOptions,
      completedSteps: completedBatchSteps,
      excludedFragranceIds: excludedPlanFragranceIds,
    });
    router.push('/results');
  };

  const currentAnswers = currentRef ? answers[currentRef.fragranceId] ?? defaultAnswers : {};
  const currentRatedAttributes = new Set(currentRef ? ratedAttributes[currentRef.fragranceId] ?? Object.keys(answers[currentRef.fragranceId] ?? {}) : []);
  const currentRatedCount = evaluationQuestions.filter((question) => currentRatedAttributes.has(question.canonicalAttributeId)).length;
  const canContinueCurrentFragrance = Boolean(currentRef) && evaluationQuestions.length > 0 && currentRatedCount === evaluationQuestions.length;
  const hasMoreCurrentBatch = batchPlan.some((item) => !completedBatchSteps.includes(item.step));

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="py-12 md:py-20 mb-4">
        <div className="main-container">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-wider text-gold mb-4">DISCOVER</p>
            <h1 className="text-4xl md:text-5xl font-light mb-6 text-white">Guided Fragrance Discovery</h1>
            <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
              Evaluate each fragrance through its own canonical attributes. Your preferences shape a refined DNA profile with each selection. Move at your own pace and trust your instinct.
            </p>
          </div>
        </div>
      </section>

      <section className="py-4 md:py-8">
        <div className="main-container">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-gold">DIAGNOSTIC BATCH {batchNumber}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{evaluationPlan.length} selected fragrances, each with a backup</h2>
            </div>
            <p className="max-w-xl text-base text-gray-400">Your profile is already active. Pick the primary or backup you can smell right now — the evaluation below switches to the fragrance you select.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {evaluationPlan.map((item) => {
              const selectedId = selectedPlanOptions[item.step] ?? item.primary.fragranceId;
              const options = [item.primary, item.backup].filter((option): option is NonNullable<typeof option> => Boolean(option));
              const isCompletedStep = completedBatchSteps.includes(item.step);
              const isCurrentStep = item.step === currentIndex + 1;
              return (
                <article
                  key={item.step}
                  className="relative overflow-hidden rounded-[26px] border p-5 transition-all duration-300"
                  style={{
                    borderColor: isCurrentStep ? 'rgba(243, 210, 147, 0.75)' : 'rgba(168, 129, 70, 0.32)',
                    background: isCurrentStep
                      ? 'radial-gradient(circle at 12% 0%, rgba(250,223,164,0.12), transparent 42%), linear-gradient(160deg, rgba(32,24,14,0.95), rgba(14,12,10,0.97))'
                      : 'linear-gradient(160deg, rgba(19,16,14,0.9), rgba(11,11,12,0.94))',
                    boxShadow: isCurrentStep
                      ? '0 18px 38px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,228,173,0.22)'
                      : '0 10px 22px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,228,173,0.08)',
                  }}
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c5a05e]">Step {item.step}</p>
                    {isCompletedStep ? (
                      <span className="rounded-full border border-emerald-300/35 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">Completed</span>
                    ) : isCurrentStep ? (
                      <span className="rounded-full border border-gold/50 bg-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Now testing</span>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {options.map((option, optionIndex) => {
                      const isSelected = selectedId === option.fragranceId;
                      return (
                        <button
                          key={option.fragranceId}
                          type="button"
                          aria-pressed={isSelected}
                          disabled={isCompletedStep}
                          onClick={() => {
                            // Selecting an option also makes its step the active evaluation,
                            // so the fragrance being tested always matches the user's choice.
                            const selectedByStep = { ...selectedPlanOptions, [item.step]: option.fragranceId };
                            const nextStep = item.step - 1;
                            setSelectedPlanOptions(selectedByStep);
                            setCurrentIndex(nextStep);
                            setShowPostEvaluation(false);
                            setBadgeMilestoneMessage('');
                            setRatingError('');
                            saveBatchState({
                              version: 1,
                              batchNumber,
                              currentStep: nextStep,
                              items: batchPlan,
                              selectedByStep,
                              completedSteps: completedBatchSteps,
                              excludedFragranceIds: excludedPlanFragranceIds,
                            });
                          }}
                          className={`min-w-0 rounded-2xl border p-4 text-left transition-all duration-300 ${
                            isSelected
                              ? 'border-gold/60 bg-gold/10 shadow-[inset_0_1px_0_rgba(255,228,173,0.2)]'
                              : 'border-white/10 bg-black/25 hover:-translate-y-0.5 hover:border-gold/40'
                          } ${isCompletedStep ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          <span className="block text-[10px] uppercase tracking-[0.22em] text-[#b7955f]">{optionIndex === 0 ? 'Recommended' : 'Backup'}</span>
                          <span className="mt-2 block truncate font-display text-[1.05rem] leading-snug text-[#f2e3c2]">{option.displayName}</span>
                          <span className="mt-1 block truncate text-xs uppercase tracking-[0.14em] text-gray-500">{option.brand || 'Brand unavailable'}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!isCompletedStep && (
                    <button
                      type="button"
                      onClick={() => handleRerollStep(item.step)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs uppercase tracking-[0.16em] text-gray-400 transition-colors hover:border-gold/45 hover:text-gold"
                    >
                      <span aria-hidden="true">↻</span> Show me two other options
                    </button>
                  )}
                </article>
              );
            })}
          </div>
          {planNotice ? <p className="mt-4 text-sm text-gold/85" role="status">{planNotice}</p> : null}
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-8 md:py-12">
        <div className="main-container">
          <div className="premium-card-dark p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">DNA CONFIDENCE LEVEL</p>
                <div className="flex items-baseline gap-3 mb-4">
                  <h2 className="text-4xl font-bold text-white">{currentConfidence}%</h2>
                  <span className="text-lg text-gray-400">current evidence</span>
                </div>
              </div>
              <div className="lg:flex-1 rounded-2xl border border-white/10 bg-black/25 p-4 text-right">
                <p className="text-xs uppercase tracking-wider text-gray-400">Diagnostic Batch</p>
                <p className="mt-1 text-xl font-semibold text-white">Batch {batchNumber}</p>
                <p className="mt-1 text-sm text-gray-400">Position {currentIndex + 1} of {evaluationPlan.length}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-black-600 pt-5">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${currentBadge.colorClass}`} aria-hidden="true" />
                <span className="text-xs uppercase tracking-wider text-gray-400">Current DNA Badge</span>
                <span className="font-semibold text-white">{currentBadge.label}</span>
              </div>
              {nextBadge ? (
                <div className="mt-3 max-w-md">
                  <p className="text-xs text-gray-400">Progress toward {nextBadge.label}</p>
                  <div role="progressbar" aria-label={`Progress toward ${nextBadge.label}`} aria-valuemin={currentBadge.minimum} aria-valuemax={nextBadge.minimum} aria-valuenow={currentConfidence} className="mt-2 h-2 overflow-hidden rounded-full bg-black-700">
                    <div className={`h-full ${nextBadge.colorClass}`} style={{ width: `${badgeProgress}%` }} />
                  </div>
                </div>
              ) : <p className="mt-3 text-xs text-gray-400">Highest confidence badge reached.</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Fragrance Moment Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          {!showPostEvaluation && activePlan && currentRef && (
            <>
          <div className="premium-card-dark p-8 md:p-12 border-l-4 border-l-gold mb-12">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">CURRENT FRAGRANCE</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{currentRef.displayName}</h2>
            <p className="mb-4 text-sm text-gold/80">{currentRef.brand || 'Brand unavailable'}{currentPlanOption?.fragranceId === activePlan?.backup?.fragranceId ? ' · Backup selected' : ''}</p>
            <p className="text-base text-gray-300 max-w-2xl leading-relaxed">
              Rate this fragrance across its canonical attributes. Your evaluations blend with your grounding preferences to continuously refine your olfactory identity.
            </p>
          </div>

          {/* Sensory Evaluation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {evaluationQuestions.map((attribute) => (
              <div key={attribute.canonicalAttributeId} className="premium-card-dark p-8">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{attribute.displayName}</p>
                      <p className="text-lg font-medium text-white mt-2">{attribute.metadata.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Slider */}
                  <div>
                    <div className="relative h-3 bg-black-700 rounded-full overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-gold to-warm-400 transition-all"
                        style={{ width: `${currentAnswers[attribute.canonicalAttributeId]}%` }}
                      />
                    </div>
                  </div>

                  {/* Slider Input */}
                  <div className="flex items-center justify-between">
                    <input
                      type="range"
                      min={attribute.scale.min}
                      max={attribute.scale.max}
                      step={attribute.scale.step}
                      value={currentAnswers[attribute.canonicalAttributeId]}
                      onChange={(event) =>
                        handleSliderChange(attribute.canonicalAttributeId, Number(event.target.value))
                      }
                      className="flex-1 h-2 bg-black-700 rounded-full appearance-none cursor-pointer accent-gold"
                    />
                    <span className="ml-4 text-lg font-semibold text-gold w-12 text-right">
                      {currentAnswers[attribute.canonicalAttributeId]}
                    </span>
                  </div>

                  {/* Value Labels */}
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{attribute.scale.minLabel}</span>
                    <span>{attribute.scale.maxLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
            </>
          )}

          {showPostEvaluation ? (
            <section className="py-12">
              <div className="premium-card-dark space-y-5 p-8 md:p-10">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold">PROFILE UPDATED</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">{badgeMilestoneMessage || 'Your DNA profile has been updated.'}</h3>
                </div>
                {noMoreDiagnostics ? (
                  <p className="text-sm leading-6 text-gray-300">No materially useful diagnostic candidates remain in the current pool. Your profile and recommendations remain available.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {hasMoreCurrentBatch ? (
                      <button type="button" onClick={handleAnotherInBatch} className="rounded-2xl border border-gold/35 bg-gold/10 p-4 text-left hover:bg-gold/15">
                        <span className="block text-xs uppercase tracking-wider text-gold">Continue</span>
                        <span className="mt-2 block font-semibold text-white">Test another selected fragrance</span>
                        <span className="mt-1 block text-sm text-gray-400">Continue with an unevaluated position from Batch {batchNumber}.</span>
                      </button>
                    ) : (
                      <button type="button" onClick={handleExploreNextBatch} className="rounded-2xl border border-gold/35 bg-gold/10 p-4 text-left hover:bg-gold/15">
                        <span className="block text-xs uppercase tracking-wider text-gold">Batch complete</span>
                        <span className="mt-2 block font-semibold text-white">Explore the next adaptive batch</span>
                        <span className="mt-1 block text-sm text-gray-400">Builder will use your latest evidence and avoid already-presented candidates.</span>
                      </button>
                    )}
                  </div>
                )}
                <button type="button" onClick={handleStopTesting} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-white/5">
                  Stop for now and view recommendations
                </button>
              </div>
            </section>
          ) : activePlan ? (
            <section className="py-12">
              <div className="premium-card-dark p-8 md:p-10">
                <h3 className="text-2xl font-bold text-white">Evaluate this fragrance</h3>
                <p className="mt-2 max-w-2xl text-base text-gray-300">Only committed evaluations update your DNA and confidence. You can stop after any evaluation and return later.</p>
                <p className="mt-4 text-sm text-gray-400" role="status">{currentRatedCount} of {evaluationQuestions.length} characteristics rated</p>
                {ratingError ? <p className="mt-3 text-sm text-rose-300" role="alert">{ratingError}</p> : null}
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => router.push('/results')} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-white/5">Stop for now</button>
                  <button type="button" disabled={!canContinueCurrentFragrance} onClick={() => void handleNext()} className="rounded-xl border border-gold/35 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold hover:bg-gold/15 disabled:cursor-not-allowed disabled:opacity-40">
                    {canContinueCurrentFragrance ? 'Commit evaluation' : `Rate ${evaluationQuestions.length - currentRatedCount} more characteristics`}
                  </button>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
