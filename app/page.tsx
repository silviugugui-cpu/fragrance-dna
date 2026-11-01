'use client';

import Link from 'next/link';
import { ChevronRightGlyphIcon } from '@/components/design-system/FragranceIcons';
import { useLanguage } from '@/lib/i18n';

const JOURNEY_STEPS = [
  { key: 'discover', href: '/grounding' },
  { key: 'understand', href: '/test' },
  { key: 'build', href: '/dna' },
  { key: 'reveal', href: '/dna' },
  { key: 'explore', href: '/dna#olfactory-territories' },
  { key: 'matches', href: '/dna#your-recommendations' },
] as const;

export default function HomePage() {
  const { t } = useLanguage();

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
              alt={t.home.heroImageAlt}
              className="block w-full h-auto"
            />
          </div>

          <div className="hero-first-copy">
            <h1>
              {t.home.heroTitleLine1}
              <br />
              {t.home.heroTitleLine2}
            </h1>
            <p>
              {t.home.heroSubtitle}
            </p>
          </div>

          <div className="hero-first-cta-row z-10">
            <Link href="/grounding" className="hero-first-cta-link hero-first-cta-grounding inline-flex">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">{t.home.ctaStartGrounding}</span>
            </Link>
            <Link href="/test" className="hero-first-cta-link hero-first-cta-test inline-flex">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">{t.home.ctaStartTest}</span>
            </Link>
            <Link href="/dna" className="hero-first-cta-link hero-first-cta-dna inline-flex">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">{t.home.ctaEnterDna}</span>
            </Link>
            <Link href="/dna#olfactory-territories" className="hero-first-cta-link hero-first-cta-territories inline-flex">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">{t.home.ctaTerritories}</span>
            </Link>
            <Link href="/dna#your-recommendations" className="hero-first-cta-link hero-first-cta-recommendations inline-flex">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">{t.home.ctaRecommendations}</span>
            </Link>
          </div>
        </article>
        <nav className="homepage-mobile-journey" aria-label={t.home.journeyNavAria}>
          <ol>
            {JOURNEY_STEPS.map((step, index) => (
              <li key={step.key}>
                <Link href={step.href}>
                  <span className="homepage-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h2>{t.home.journeySteps[step.key].title}</h2>
                    <p>{t.home.journeySteps[step.key].description}</p>
                    <span className="homepage-step-action">{t.home.journeySteps[step.key].action}<ChevronRightGlyphIcon className="h-4 w-4" /></span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </section>
    </main>
  );
}
