'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PageShell, PremiumButton } from '@/components/design-system';
import { DNA_CONFIDENCE_BADGES } from '@/lib/dnaSession';
import { useLanguage } from '@/lib/i18n';

export default function FaqPage() {
  const { t } = useLanguage();

  return (
    <PageShell>
      <section className="border-b border-white/10 py-12 md:py-16">
        <div className="main-container">
          <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-gold">{t.faq.kicker}</p>
          <h1 className="max-w-3xl text-3xl font-semibold text-white md:text-5xl">{t.faq.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300">
            {t.faq.intro}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/grounding"><PremiumButton variant="primary" size="md">{t.faq.startWithGrounding}</PremiumButton></Link>
            <Link href="/test"><PremiumButton variant="secondary" size="md">{t.faq.continueEvaluations}</PremiumButton></Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-10 md:py-14">
        <div className="main-container">
          <h2 className="mb-6 text-xl font-semibold text-white md:text-2xl">{t.faq.badgeLevelsTitle}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DNA_CONFIDENCE_BADGES.map((badge) => (
              <article key={badge.id} className="flex items-center gap-3 border-t border-white/10 py-3">
                <Image src={badge.imageSrc} alt="" width={112} height={112} className="h-28 w-28 shrink-0 object-contain" />
                <div>
                  <h3 className="font-semibold text-white">{t.common.badges[badge.id] ?? badge.label}</h3>
                  <p className="text-sm text-gray-400">{t.faq.badgeRange(badge.minimum, badge.maximum)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="main-container max-w-4xl">
          <h2 className="mb-5 text-xl font-semibold text-white md:text-2xl">{t.faq.faqTitle}</h2>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {t.faq.items.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-white marker:hidden">
                  {faq.question}
                  <span className="text-gold transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="max-w-3xl pt-4 text-base leading-7 text-gray-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}