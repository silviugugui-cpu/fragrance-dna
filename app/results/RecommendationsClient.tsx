'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageShell, PremiumButton } from '@/components/design-system';
import { PerfumeImageWithFallback } from '@/components/design-system/PerfumeImageWithFallback';
import { useAuth } from '@/lib/auth';
import { getUserScopedStorageKey } from '@/lib/auth/userScope';
import { loadCollection, addCollectionFragrance } from '@/lib/collection/storage';
import { buildSummary, loadDnaSession, loadGroundingVector } from '@/lib/dnaSession';
import { useLanguage } from '@/lib/i18n';
import type { DNASummary } from '@/lib/types';
import FragranceBadges from '@/components/FragranceBadges';
import FragranceBadgeFilters from '@/components/FragranceBadgeFilters';
import type { BadgeFilters, FragranceBadges as Badges } from '@/lib/fragranceBadges';
import { readGroundingPrior } from '@/lib/test/evaluationSession';

type Recommendation = {
  fragranceId: string;
  perfume: string;
  brand: string;
  imageUrl: string;
  localImagePath: string;
  score: number;
  matchedAttributes: string[];
  explanation: string;
  badges?: Badges;
};

type RecommendationState = 'loading' | 'ready' | 'incomplete' | 'error';

interface RecommendationsClientProps {
  embedded?: boolean;
}

export function RecommendationsClient({ embedded = false }: RecommendationsClientProps) {
  const { locale, t } = useLanguage();
  const tr = t.recommendations;
  const { user, isLoading: isAuthLoading } = useAuth();
  const [status, setStatus] = useState<RecommendationState>('loading');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState<DNASummary | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [badgeFilters, setBadgeFilters] = useState<BadgeFilters>({});

  useEffect(() => {
    if (isAuthLoading) return;
    let active = true;
    const collection = loadCollection();
    setWishlistIds(new Set(collection.filter((item) => item.wishlist).map((item) => item.fragranceId)));
    const session = loadDnaSession(user?.id);
    const rawGrounding = window.localStorage.getItem(getUserScopedStorageKey('fragrance_grounding', user?.id));
    let groundingProfile = { love: [] as string[], neutral: [] as string[], redFlag: [] as string[] };
    if (rawGrounding) {
      try {
        groundingProfile = readGroundingPrior(JSON.parse(rawGrounding));
      } catch {
        groundingProfile = { love: [], neutral: [], redFlag: [] };
      }
    }
    const groundingVector = loadGroundingVector(user?.id);
    const currentSummary = session.summary
      ?? (groundingVector ? buildSummary(groundingVector, session.answers, undefined, groundingProfile, undefined, session.answeredOrder) : null);
    setSummary(currentSummary);

    if (!currentSummary || (!groundingProfile.love.length && !groundingProfile.neutral.length && !groundingProfile.redFlag.length)) {
      setStatus('incomplete');
      return () => {
        active = false;
      };
    }

    setStatus('loading');
    setRecommendations([]);
    void fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userVector: currentSummary.finalVector,
        groundingProfile,
        ownedFragranceIds: collection.filter((item) => item.owned).map((item) => item.fragranceId),
        limit: 30,
        locale,
        badgeFilters,
        evaluations: session.evaluationState?.records ?? [],
      }),
    })
      .then(async (response) => {
        const payload = await response.json() as { recommendations?: Recommendation[]; error?: string };
        if (!response.ok || !Array.isArray(payload.recommendations)) {
          throw new Error(payload.error ?? tr.loadError);
        }
        if (active) {
          setRecommendations(payload.recommendations);
          setStatus('ready');
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : tr.loadError);
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, user?.id, locale, badgeFilters]);

  useEffect(() => {
    if (!embedded || window.location.hash !== '#your-recommendations') return;
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById('your-recommendations')?.scrollIntoView({ block: 'start' });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [embedded]);

  const saveToWishlist = (recommendation: Recommendation) => {
    addCollectionFragrance({
      fragranceId: recommendation.fragranceId,
      owned: false,
      wishlist: true,
    });
    setWishlistIds((previous) => new Set(previous).add(recommendation.fragranceId));
  };

  const content = (
    <div id={embedded ? 'your-recommendations' : undefined} className={embedded ? 'scroll-mt-32' : undefined}>
      <section className="py-12 md:py-16">
        <div className="main-container">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">
            {embedded ? tr.eyebrowEmbedded : tr.eyebrow}
          </p>
          {embedded ? (
            <h2 id="your-recommendations-title" className="mt-3 text-3xl font-semibold text-white">{tr.titleEmbedded}</h2>
          ) : (
            <h1 className="mt-3 text-3xl font-semibold text-white">{tr.title}</h1>
          )}
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300">
            {tr.intro}
          </p>
          <div className="mt-5">
            <FragranceBadgeFilters filters={badgeFilters} onChange={setBadgeFilters} />
            <p className="mt-3 text-xs text-gray-400">{t.fragrances.badges.note}</p>
          </div>
          {summary ? (
            <div className="mt-6 flex flex-wrap gap-6 border-y border-white/10 py-4 text-sm">
              <span><strong className="text-white">{summary.answeredCount}</strong><span className="ml-2 text-gray-400">{tr.evaluations}</span></span>
              <span><strong className="text-white">{summary.confidenceScore}%</strong><span className="ml-2 text-gray-400">{tr.profileConfidence}</span></span>
              <span><strong className="text-white">{summary.dominantAxes.join(', ') || tr.emerging}</strong><span className="ml-2 text-gray-400">{tr.dominantSignals}</span></span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="pb-16">
        <div className="main-container">
          {status === 'loading' ? <p className="py-10 text-sm text-gray-400">{tr.loading}</p> : null}
          {status === 'incomplete' ? (
            <div className="max-w-xl border border-gold/20 bg-black/30 p-6">
              <h2 className="text-lg font-semibold text-white">{tr.incompleteTitle}</h2>
              <p className="mt-2 text-sm text-gray-400">{tr.incompleteDescription}</p>
              <Link href="/grounding" className="mt-5 inline-flex">
                <PremiumButton variant="primary" size="md">{tr.beginGrounding}</PremiumButton>
              </Link>
            </div>
          ) : null}
          {status === 'error' ? (
            <div role="alert" className="border border-rose-300/25 bg-rose-950/20 p-5 text-sm text-rose-200">{errorMessage}</div>
          ) : null}
          {status === 'ready' && recommendations.length === 0 ? (
            <div className="border border-white/10 bg-black/25 p-5 text-sm text-gray-300">
              {tr.emptyReady}
            </div>
          ) : null}
          <div className="divide-y divide-white/10 border-y border-white/10">
            {recommendations.map((recommendation, index) => {
              const isWishlisted = wishlistIds.has(recommendation.fragranceId);
              return (
                <article key={recommendation.fragranceId} className="grid gap-4 py-5 md:grid-cols-[36px_72px_minmax(0,1fr)_160px] md:items-center">
                  <p className="text-sm font-semibold text-gold">{String(index + 1).padStart(2, '0')}</p>
                  <PerfumeImageWithFallback
                    candidates={[recommendation.localImagePath, recommendation.imageUrl]}
                    alt={tr.bottleAlt(recommendation.perfume || tr.fallbackName)}
                    className="h-[72px] w-[72px] rounded border border-white/10 bg-black/30 object-contain"
                  />
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-gray-500">{recommendation.brand || tr.fallbackBrand}</p>
                    <h2 className="mt-1 truncate text-lg font-semibold text-white">{recommendation.perfume || tr.unnamedFragrance}</h2>
                    <FragranceBadges badges={recommendation.badges} />
                    <p className="mt-1 text-base leading-relaxed text-gray-400">{recommendation.explanation}</p>
                    {recommendation.matchedAttributes.length > 0 ? (
                      <p className="mt-2 text-xs text-gray-500">{tr.mappedCharacteristics} {recommendation.matchedAttributes.join(', ')}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                    <span className="text-xl font-semibold text-white">{Math.round(recommendation.score * 100)}%</span>
                    <button
                      type="button"
                      disabled={isWishlisted}
                      onClick={() => saveToWishlist(recommendation)}
                      className="rounded border border-gold/30 px-3 py-2 text-xs font-semibold text-gold transition hover:bg-gold/10 disabled:cursor-default disabled:opacity-50"
                    >
                      {isWishlisted ? tr.inWishlist : tr.saveToWishlist}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {status === 'ready' && recommendations.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dna"><PremiumButton variant="secondary" size="md">{tr.viewDna}</PremiumButton></Link>
              <Link href="/collection"><PremiumButton variant="primary" size="md">{tr.openCollection}</PremiumButton></Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );

  return embedded ? content : <PageShell>{content}</PageShell>;
}
