'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AnswerRecord } from '../../lib/types';
import {
  buildSessionFromAnswers,
  loadDnaSession,
  saveDnaSession,
} from '@/lib/dnaSession';
import { getOrCreateUserProfile, updateUserVector } from '@/lib/engine/userProfileManager';
import { getPhase1Flags } from '@/lib/intelligence/flags/phase1Flags';
import { createFragranceIntelligenceService } from '@/lib/intelligence/fragranceIntelligence';
import { selectNextBestFragrance } from '@/lib/intelligence/learning';
import { runTestDualWrite } from '@/lib/intelligence/test/testDualWrite';
import { buildDefaultAnswers, getEvaluationQuestionsForFragrance } from '@/lib/test/adaptiveQuestions';
import { PageShell, StatCard, PremiumButton } from '@/components/design-system';

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
const FRAGRANCE_INTELLIGENCE = createFragranceIntelligenceService();
const EVALUATION_FRAGRANCES = FRAGRANCE_INTELLIGENCE.listEvaluationFragrances();

export default function TestPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [groundingSelectionCount, setGroundingSelectionCount] = useState(0);
  const [groundingTokens, setGroundingTokens] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const session = loadDnaSession();
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAnswers(JSON.parse(stored));
      } catch {
        setAnswers({});
      }
    } else if (session.answers && Object.keys(session.answers).length > 0) {
      setAnswers(session.answers);
    }
    if (typeof session.currentIndex === 'number') {
      setCurrentIndex(Math.min(session.currentIndex, EVALUATION_FRAGRANCES.length - 1));
    }

    try {
      const rawGrounding = window.localStorage.getItem('fragrance_grounding');
      if (rawGrounding) {
        const parsedGrounding = JSON.parse(rawGrounding) as {
          love?: string[];
          neutral?: string[];
          red_flag?: string[];
        };
        const selectedCount = (parsedGrounding.love?.length ?? 0) + (parsedGrounding.red_flag?.length ?? 0);
        setGroundingSelectionCount(selectedCount);
        setGroundingTokens([
          ...(parsedGrounding.love ?? []),
          ...(parsedGrounding.neutral ?? []),
          ...(parsedGrounding.red_flag ?? []),
        ]);
      } else {
        setGroundingSelectionCount(0);
        setGroundingTokens([]);
      }
    } catch {
      setGroundingSelectionCount(0);
      setGroundingTokens([]);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const nextSession = buildSessionFromAnswers(answers, currentIndex, loadDnaSession());
    saveDnaSession(nextSession);
  }, [answers, currentIndex, isHydrated]);

  const phase1Flags = isHydrated ? getPhase1Flags() : PHASE1_FLAGS_SSR_SAFE;
  const adaptiveSelection = useMemo(
    () =>
      selectNextBestFragrance({
        answers,
        groundingTokens,
        fragranceService: FRAGRANCE_INTELLIGENCE,
        legacySequentialEnabled: !phase1Flags.adaptiveNextFragranceEnabled,
        previousEvaluations: Object.keys(answers),
      }),
    [answers, groundingTokens, phase1Flags.adaptiveNextFragranceEnabled]
  );
  const currentRef = useMemo(
    () =>
      FRAGRANCE_INTELLIGENCE.listEvaluationFragrances().find(
        (fragrance) => fragrance.fragranceId === adaptiveSelection.fragranceId
      ) ?? EVALUATION_FRAGRANCES[0],
    [adaptiveSelection.fragranceId]
  );
  if (!currentRef) {
    return null;
  }

  const canonicalFragrance = useMemo(
    () => FRAGRANCE_INTELLIGENCE.getCanonicalFragrance(currentRef.fragranceId),
    [currentRef.fragranceId]
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

  const answeredIds = useMemo(() => Object.keys(answers), [answers]);
  const isComplete = answeredIds.length >= EVALUATION_FRAGRANCES.length;
  const liveSession = useMemo(
    () => buildSessionFromAnswers(answers, currentIndex, loadDnaSession()),
    [answers, currentIndex]
  );

  const handleSliderChange = (key: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentRef.fragranceId]: {
        ...(prev[currentRef.fragranceId] ?? defaultAnswers),
        [key]: value
      }
    }));
  };

  const handleNext = async () => {
    const nextAnswers = {
      ...answers,
      [currentRef.fragranceId]: currentAnswers,
    };

    setAnswers(nextAnswers);

    const nextSession = buildSessionFromAnswers(nextAnswers, currentIndex, liveSession);
    saveDnaSession(nextSession);
    const profile = getOrCreateUserProfile();
    const confidence = nextSession.summary?.confidenceScore ?? nextSession.snapshots.at(-1)?.confidenceScore ?? 0;
    const updatedProfile = updateUserVector(profile, nextSession.currentVector, confidence);
    const isCompleteNext = Object.keys(nextAnswers).length >= EVALUATION_FRAGRANCES.length;

    if (phase1Flags.eventsWriteEnabled || phase1Flags.testDualWriteEnabled) {
      try {
        const dualWriteResult = await runTestDualWrite({
          userId: updatedProfile.userId,
          fragranceId: currentRef.fragranceId,
          answerDimensions: currentAnswers,
          currentIndex,
          answeredCount: Object.keys(nextAnswers).length,
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
              eventsEmitted: 0,
              eventsPersisted: 0,
              eventsPublished: 0,
              eventsFailed: 0,
              eventsRetried: 0,
              parityPassed: 0,
              parityFailed: 0,
              averageWriteTime: 0,
              averageReplayTime: 0,
              averageParityTime: 0,
            },
            errors: [error instanceof Error ? error.message : 'test_dual_write_failed'],
          })
        );
      }
    }

    setCurrentIndex(Object.keys(nextAnswers).length);

    if (isCompleteNext) {
      router.push('/dna');
      return;
    }
  };

  const currentAnswers = answers[currentRef.fragranceId] ?? defaultAnswers;
  const remaining = Math.max(0, EVALUATION_FRAGRANCES.length - answeredIds.length);
  const progress = Math.round((answeredIds.length / EVALUATION_FRAGRANCES.length) * 100);
  const needsGrounding = groundingSelectionCount < 2;

  return (
    <PageShell>
      {needsGrounding && (
        <section className="py-12 md:py-16">
          <div className="main-container">
            <div className="premium-card-dark p-8 md:p-10 border border-gold/20">
              <p className="text-xs uppercase tracking-wider text-gold mb-3">GROUNDING REQUIRED</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Before the test, complete Grounding
              </h2>
              <p className="text-gray-300 max-w-2xl leading-relaxed mb-6">
                We need at least 2 scent qualities selected in Grounding before starting the test flow. Go back and choose the qualities that represent you most, or the ones that do not represent you at all, then return here to continue.
              </p>
              <PremiumButton
                variant="primary"
                size="lg"
                className="min-w-[220px]"
                type="button"
                onClick={() => router.push('/grounding')}
              >
                Go to Grounding
              </PremiumButton>
            </div>
          </div>
        </section>
      )}

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

      {/* Progress Section */}
      <section className="py-8 md:py-12">
        <div className="main-container">
          <div className="premium-card-dark p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">YOUR PROGRESS</p>
                <div className="flex items-baseline gap-3 mb-4">
                  <h2 className="text-4xl font-bold text-white">{progress}%</h2>
                  <span className="text-lg text-gray-400">through discovery</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {answeredIds.length} of {EVALUATION_FRAGRANCES.length} fragrances evaluated • {remaining} moments remain
                </p>
              </div>
              <div className="lg:flex-1">
                <div className="h-3 bg-black-700 rounded-full overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-gold to-warm-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="mt-6 pt-6 border-t border-black-600 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Live Confidence Score</p>
                <p className="text-2xl font-bold text-gold mt-1">
                  {liveSession.summary?.confidenceScore ?? liveSession.snapshots.at(-1)?.confidenceScore ?? 0}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-gray-400">Stage</p>
                <p className="text-3xl font-bold text-white mt-1">{currentIndex + 1}/{EVALUATION_FRAGRANCES.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fragrance Moment Section */}
      <section className="py-12 md:py-16">
        <div className="main-container">
          <div className="premium-card-dark p-8 md:p-12 border-l-4 border-l-gold mb-12">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">CURRENT FRAGRANCE</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{currentRef.displayName}</h2>
            <p className="text-base text-gray-300 max-w-2xl leading-relaxed">
              Rate this fragrance across its canonical attributes. Your evaluations blend with your grounding preferences to continuously refine your olfactory identity.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gold/90">
              {adaptiveSelection.explanation}
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

          {/* Stats Section */}
          <section className="py-8 md:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Evaluated"
                value={`${answeredIds.length}/${EVALUATION_FRAGRANCES.length}`}
                subtitle="fragrances rated"
              />
              <StatCard
                label="Remaining"
                value={remaining.toString()}
                subtitle="moments to explore"
              />
              <StatCard
                label="Confidence"
                value={`${liveSession.summary?.confidenceScore ?? liveSession.snapshots.at(-1)?.confidenceScore ?? 0}%`}
                subtitle="profile certainty"
              />
            </div>
          </section>

          {/* Action Section */}
          <section className="py-12">
            <div className="premium-card-dark p-8 md:p-12">
              <h3 className="text-2xl font-bold text-white mb-6">
                {isComplete ? "Your DNA Profile is Complete" : "Continue Your Journey"}
              </h3>
              <p className="text-gray-300 mb-8 max-w-2xl">
                {isComplete 
                  ? "You've completed the guided discovery. View your comprehensive DNA profile and explore your olfactory identity."
                  : "Move to the next fragrance to continue refining your olfactory identity. Your profile evolves with each evaluation."
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <PremiumButton
                  variant="secondary"
                  size="lg"
                  className="flex-1 w-full"
                  type="button"
                  onClick={() => router.push('/dna')}
                >
                  View Current DNA
                </PremiumButton>
                <PremiumButton
                  onClick={handleNext}
                  variant="secondary"
                  size="lg"
                  className="flex-1 w-full"
                  type="button"
                >
                  {isComplete ? 'View Final DNA' : 'Continue Ritual'}
                </PremiumButton>
              </div>
            </div>
          </section>
        </div>
      </section>
    </PageShell>
  );
}
