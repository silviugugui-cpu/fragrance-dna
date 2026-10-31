'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageShell, PremiumButton } from '@/components/design-system';
import { resolvePerfumeImageSrc } from '@/lib/design/perfumeImage';
import { useAuth } from '@/lib/auth';
import { getUserScopedStorageKey } from '@/lib/auth/userScope';
import { loadCollection, addCollectionFragrance } from '@/lib/collection/storage';
import { buildSummary, loadDnaSession, loadGroundingVector } from '@/lib/dnaSession';
import type { DNASummary } from '@/lib/types';

type Recommendation = {
  fragranceId: string;
  perfume: string;
  brand: string;
  imageUrl: string;
  localImagePath: string;
  score: number;
  matchedAttributes: string[];
  explanation: string;
};

type RecommendationState = 'loading' | 'ready' | 'incomplete' | 'error';

interface RecommendationsClientProps {
  embedded?: boolean;
}

export function RecommendationsClient({ embedded = false }: RecommendationsClientProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [status, setStatus] = useState<RecommendationState>('loading');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState<DNASummary | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

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
        const parsed = JSON.parse(rawGrounding) as { love?: string[]; neutral?: string[]; red_flag?: string[] };
        groundingProfile = {
          love: parsed.love ?? [],
          neutral: parsed.neutral ?? [],
          redFlag: parsed.red_flag ?? [],
        };
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

    void fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userVector: currentSummary.finalVector,
        groundingProfile,
        ownedFragranceIds: collection.filter((item) => item.owned).map((item) => item.fragranceId),
        limit: 30,
      }),
    })
      .then(async (response) => {
        const payload = await response.json() as { recommendations?: Recommendation[]; error?: string };
        if (!response.ok || !Array.isArray(payload.recommendations)) {
          throw new Error(payload.error ?? 'Unable to load fragrance recommendations.');
        }
        if (active) {
          setRecommendations(payload.recommendations);
          setStatus('ready');
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load fragrance recommendations.');
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthLoading, user?.id]);

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
            {embedded ? 'YOUR RECOMMENDATIONS' : 'DNA MATCHES'}
          </p>
          {embedded ? (
            <h2 id="your-recommendations-title" className="mt-3 text-3xl font-semibold text-white">Your Recommendations</h2>
          ) : (
            <h1 className="mt-3 text-3xl font-semibold text-white">Fragrances to explore</h1>
          )}
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            Recommendations use your current DNA profile, starting with Grounding and refining after each committed evaluation, against mapped notes and accords in the master fragrance database.
          </p>
          {summary ? (
            <div className="mt-6 flex flex-wrap gap-6 border-y border-white/10 py-4 text-sm">
              <span><strong className="text-white">{summary.answeredCount}</strong><span className="ml-2 text-gray-400">evaluations</span></span>
              <span><strong className="text-white">{summary.confidenceScore}%</strong><span className="ml-2 text-gray-400">profile confidence</span></span>
              <span><strong className="text-white">{summary.dominantAxes.join(', ') || 'Emerging'}</strong><span className="ml-2 text-gray-400">dominant signals</span></span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="pb-16">
        <div className="main-container">
          {status === 'loading' ? <p className="py-10 text-sm text-gray-400">Finding matches in the Fragrance Database...</p> : null}
          {status === 'incomplete' ? (
            <div className="max-w-xl border border-gold/20 bg-black/30 p-6">
              <h2 className="text-lg font-semibold text-white">Start with your scent preferences</h2>
              <p className="mt-2 text-sm text-gray-400">Grounding creates your initial DNA profile. Recommendations are available as soon as that profile exists.</p>
              <Link href="/grounding" className="mt-5 inline-flex">
                <PremiumButton variant="primary" size="md">Begin Grounding</PremiumButton>
              </Link>
            </div>
          ) : null}
          {status === 'error' ? (
            <div role="alert" className="border border-rose-300/25 bg-rose-950/20 p-5 text-sm text-rose-200">{errorMessage}</div>
          ) : null}
          {status === 'ready' && recommendations.length === 0 ? (
            <div className="border border-white/10 bg-black/25 p-5 text-sm text-gray-300">
              The master database does not yet have enough mapped notes or accords for a reliable match.
            </div>
          ) : null}
          <div className="divide-y divide-white/10 border-y border-white/10">
            {recommendations.map((recommendation, index) => {
              const isWishlisted = wishlistIds.has(recommendation.fragranceId);
              const image = resolvePerfumeImageSrc(recommendation.localImagePath, recommendation.imageUrl);
              return (
                <article key={recommendation.fragranceId} className="grid gap-4 py-5 md:grid-cols-[36px_72px_minmax(0,1fr)_160px] md:items-center">
                  <p className="text-sm font-semibold text-gold">{String(index + 1).padStart(2, '0')}</p>
                  <img src={image.src} alt={`${recommendation.perfume || 'Fragrance'} bottle`} className="h-[72px] w-[72px] rounded border border-white/10 bg-black/30 object-contain" />
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-gray-500">{recommendation.brand || 'Fragrance Database'}</p>
                    <h2 className="mt-1 truncate text-lg font-semibold text-white">{recommendation.perfume || 'Unnamed fragrance'}</h2>
                    <p className="mt-1 text-sm text-gray-400">{recommendation.explanation}</p>
                    {recommendation.matchedAttributes.length > 0 ? (
                      <p className="mt-2 text-xs text-gray-500">Mapped characteristics: {recommendation.matchedAttributes.join(', ')}</p>
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
                      {isWishlisted ? 'In wishlist' : 'Save to wishlist'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {status === 'ready' && recommendations.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dna"><PremiumButton variant="secondary" size="md">View your DNA</PremiumButton></Link>
              <Link href="/collection"><PremiumButton variant="primary" size="md">Open collection</PremiumButton></Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );

  return embedded ? content : <PageShell>{content}</PageShell>;
}
