import Image from 'next/image';
import Link from 'next/link';
import { PageShell, PremiumButton } from '@/components/design-system';
import { DNA_CONFIDENCE_BADGES } from '@/lib/dnaSession';

const faqs = [
  {
    question: 'What does DNA confidence measure?',
    answer: 'Confidence reflects how much of your fragrance profile is supported by relevant evidence, how consistent repeated signals are, and how much useful evidence has accumulated. It is not a score for how much you like perfume, and it is not simply a count of completed tests.',
  },
  {
    question: 'How does my profile begin?',
    answer: 'Grounding records the scent families you love, feel neutral about, or avoid, and creates your initial DNA profile. You can see recommendations right away. At least two Love or Avoid preferences are needed before starting a diagnostic batch.',
  },
  {
    question: 'How do fragrance evaluations work?',
    answer: 'Each adaptive batch offers up to six fragrances, with a recommended option and a backup where available. Choose the fragrance you can evaluate and rate every displayed characteristic. Your answers affect the profile only after you commit the evaluation.',
  },
  {
    question: 'Do draft slider changes affect my badge?',
    answer: 'No. Slider changes are a draft until you commit. Uncommitted answers do not change your DNA confidence, current badge, or recommendations.',
  },
  {
    question: 'Can I stop and continue later?',
    answer: 'Yes. Your selected fragrance, batch position, completed evaluations, and profile are saved for your account. You can stop after any committed evaluation and resume later.',
  },
  {
    question: 'What do the badge levels mean?',
    answer: 'The badge next to your account name reflects your current DNA confidence range. As committed evidence strengthens and broadens the profile, the badge changes at the thresholds shown below.',
  },
];

export default function FaqPage() {
  return (
    <PageShell>
      <section className="border-b border-white/10 py-12 md:py-16">
        <div className="main-container">
          <p className="mb-3 text-xs font-semibold uppercase tracking-normal text-gold">FRAGRANCEDNA GUIDE</p>
          <h1 className="max-w-3xl text-3xl font-semibold text-white md:text-5xl">Your profile, confidence and badges</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300">
            A clear guide to how Grounding starts your DNA, how committed fragrance feedback refines it, and what each confidence badge represents.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/grounding"><PremiumButton variant="primary" size="md">Start with Grounding</PremiumButton></Link>
            <Link href="/test"><PremiumButton variant="secondary" size="md">Continue evaluations</PremiumButton></Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-10 md:py-14">
        <div className="main-container">
          <h2 className="mb-6 text-xl font-semibold text-white md:text-2xl">Confidence badge levels</h2>
          <Image
            src="/Badges/Olfactory%20Progress%20Badge%20Collection%20-%20black.png"
            alt="Hobby 0 to 34 percent; Explorer 35 to 49 percent; Enthusiast 50 to 64 percent; Connoisseur 65 to 79 percent; Expert 80 to 89 percent; Olfactory Master 90 to 100 percent."
            width={1792}
            height={896}
            sizes="(min-width: 1200px) 1120px, (min-width: 768px) 92vw, 100vw"
            className="h-auto w-full"
          />
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DNA_CONFIDENCE_BADGES.map((badge) => (
              <article key={badge.id} className="flex items-center gap-3 border-t border-white/10 py-3">
                <Image src={badge.imageSrc} alt="" width={52} height={52} className="h-[52px] w-[52px] shrink-0 object-contain" />
                <div>
                  <h3 className="font-semibold text-white">{badge.label}</h3>
                  <p className="text-sm text-gray-400">{badge.minimum}%–{badge.maximum}% confidence</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="main-container max-w-4xl">
          <h2 className="mb-5 text-xl font-semibold text-white md:text-2xl">Frequently asked questions</h2>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {faqs.map((faq) => (
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