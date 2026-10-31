'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import TerritoriesFullSection from '@/components/territories/TerritoriesFullSection';
import { ChevronRightGlyphIcon } from '@/components/design-system/FragranceIcons';
import { useAuth } from '@/lib/auth';
import { loadDnaSession, loadGroundingVector } from '@/lib/dnaSession';

const JOURNEY_STEPS = [
  { title: 'Discover what you love', description: 'Start with smells, ingredients, and experiences that move you.', href: '/grounding', action: 'Start Grounding' },
  { title: 'Understand your preferences', description: 'Evaluate fragrances to uncover your personal scent signals.', href: '/test', action: 'Start Test' },
  { title: 'Build your profile', description: 'See your preferences come together in a living scent profile.', href: '/dna', action: 'View your profile' },
  { title: 'Reveal your DNA', description: 'Explore the dimensions that make your scent identity unique.', href: '/dna', action: 'Enter your DNA' },
  { title: 'Explore scent territories', description: 'Find the olfactory worlds that resonate with your DNA.', href: '/dna#olfactory-territories', action: 'Your Olfactory Territories' },
  { title: 'Find your matches', description: 'Discover fragrances to consider next, guided by your scent DNA.', href: '/dna#your-recommendations', action: 'Your Recommendations' },
] as const;

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [journeyHref, setJourneyHref] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      setJourneyHref(null);
      return;
    }

    const syncJourney = () => {
      const session = loadDnaSession(user?.id);
      setJourneyHref(
        session.answeredOrder.length > 0 ? '/dna'
          : loadGroundingVector(user?.id) ? '/test' : '/grounding',
      );
    };

    syncJourney();
    const events = ['storage', 'fragrance-dna-session-updated', 'fragrancedna-user-profile-loaded'];
    events.forEach((event) => window.addEventListener(event, syncJourney));
    return () => events.forEach((event) => window.removeEventListener(event, syncJourney));
  }, [isLoading, user?.id]);

  return (
    <main className="homepage-shell relative pb-10 pt-5 lg:pt-8">
      <section className="relative z-10 mx-auto w-[90vw] max-w-[1600px] pb-2">
        <article
          className="hero-first-card relative w-full overflow-hidden rounded-[30px] bg-black"
          style={{
            border: '1px solid rgba(197, 160, 94, 0.5)',
            boxShadow: '0 26px 54px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,226,162,0.2), inset 0 -1px 0 rgba(255,235,194,0.08)',
          }}
        >
          <div className="hero-first-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Pictures/Pasi/Pasi.png?v=20260623b"
              alt="Golden scent ingredients flowing into a fragrance DNA helix"
              className="block w-full h-auto"
            />
          </div>

          <div className="hero-first-copy">
            <h1>
              DISCOVER YOUR SCENT DNA.
              <br />
              FIND FRAGRANCES THAT MOVE YOU.
            </h1>
            <p>
              Decode your scent identity. Discover perfumes you truly love.
            </p>
          </div>

          <div className="hero-first-cta-row z-10">
            <Link href="/grounding" className="hero-first-cta-link hero-first-cta-grounding inline-flex">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">START GROUNDING</span>
            </Link>
            <Link href="/test" className="hero-first-cta-link hero-first-cta-test inline-flex">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">START TEST</span>
            </Link>
            <Link href="/dna" className="hero-first-cta-link hero-first-cta-dna inline-flex">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">ENTER YOUR DNA</span>
            </Link>
            <Link href="/dna#olfactory-territories" className="hero-first-cta-link hero-first-cta-territories inline-flex">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">Your Olfactory Territories</span>
            </Link>
            <Link href="/dna#your-recommendations" className="hero-first-cta-link hero-first-cta-recommendations inline-flex">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">Your Recommendations</span>
            </Link>
          </div>
        </article>
        <div className="homepage-journey-guide">
          {journeyHref ? (
            <Link href={journeyHref} className="homepage-journey-entry">
              <span>{journeyHref === '/grounding' ? 'Start here' : 'Continue your journey'}</span>
              <ChevronRightGlyphIcon className="h-4 w-4" />
            </Link>
          ) : <span className="text-sm text-gray-400">Loading your journey...</span>}
          <p>From the scents you love to the fragrances that feel like you.</p>
        </div>
        <nav className="homepage-mobile-journey" aria-label="Your scent journey">
          <ol>
            {JOURNEY_STEPS.map((step, index) => (
              <li key={step.title}>
                <Link href={step.href}>
                  <span className="homepage-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h2>{step.title}</h2>
                    <p>{step.description}</p>
                    <span className="homepage-step-action">{step.action}<ChevronRightGlyphIcon className="h-4 w-4" /></span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <TerritoriesFullSection />
    </main>
  );
}
