'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-home-body', display: 'swap' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-home-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-home-mission',
  display: 'swap',
  style: ['italic'],
  weight: ['400', '500', '600'],
});

type IconProps = { className?: string };

function FingerprintIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 4a6 6 0 0 0-6 6" />
      <path d="M18 10a6 6 0 0 0-6-6" />
      <path d="M8 12a4 4 0 0 1 8 0" />
      <path d="M12 10v10" />
      <path d="M6 14c0 4 2 6 6 6" />
      <path d="M18 14c0 4-2 6-6 6" />
    </svg>
  );
}

function TargetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.6" />
    </svg>
  );
}

function ChartColumnIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M4 20h16" />
      <path d="M7 20v-7" />
      <path d="M12 20V8" />
      <path d="M17 20v-4" />
    </svg>
  );
}

function CompassIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M10 10l4-2-2 4-4 2z" />
    </svg>
  );
}

const featureItems = [
  {
    icon: FingerprintIcon,
    title: 'OLFACTORY ATTRIBUTES',
    subtitle: '68 identity markers',
  },
  {
    icon: TargetIcon,
    title: 'DIAGNOSTIC BENCHMARKS',
    subtitle: '28 precision signals',
  },
  {
    icon: ChartColumnIcon,
    title: 'DNA AXES',
    subtitle: '11 scent dimensions',
  },
  {
    icon: CompassIcon,
    title: 'TERRITORY ORIENTATION',
    subtitle: 'Your next direction',
  },
];

export default function HomePage() {
  return (
    <main
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} relative pb-10 pt-5 lg:pt-8`}
    >
      <div className="homepage-fixed-background" aria-hidden="true" />

      <section className="relative z-10 mx-auto w-[90vw] max-w-[1600px]">
        <div className="luxury-hero-card grid min-h-[75vh] lg:h-[80vh] lg:max-h-[85vh] grid-cols-1 overflow-hidden lg:grid-cols-[38fr_62fr]">
          <div className="luxury-left-panel flex flex-col justify-between p-7 sm:p-10 lg:p-12">
            <div className="space-y-7">
              <div className="luxury-logo-block">
                <Image
                  src="/Logo/Logo Fragrance DNA no text.png"
                  alt="Fragrance DNA logo"
                  width={104}
                  height={104}
                  priority
                  className="h-[88px] w-[88px] object-contain sm:h-[96px] sm:w-[96px]"
                />
              </div>

              <p className="text-[0.72rem] uppercase tracking-[0.42em] text-[#d4af78]/92 sm:text-xs">
                OLFACTORY IDENTITY
              </p>

              <h1 className="font-home-heading text-[2.3rem] font-semibold uppercase leading-[0.98] text-[#f3ead6] sm:text-[2.9rem] lg:text-[4.1rem]">
                A SINGLE GATEWAY
                <br />
                TO YOUR SCENT DNA.
              </h1>

              <div className="max-w-[35ch] space-y-5">
                <div className="luxury-mission-plaque">
                  <p className="font-home-mission text-[1.65rem] italic leading-[1.15] text-[#f3e0b3] sm:text-[1.95rem]">
                    Never again buy a perfume
                    <br />
                    that does not blow your mind.
                  </p>
                </div>

                <p className="font-home-body text-[0.99rem] leading-relaxed text-[#d5d0c0] sm:text-[1.05rem]">
                  FragranceDNA transforms instinct into precision by mapping your olfactory profile,
                  decoding attraction patterns, and guiding every fragrance decision through data-backed
                  identity insights.
                </p>
              </div>
            </div>

            <div className="space-y-6 pt-7">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/profiles" className="inline-flex">
                  <span className="luxury-cta luxury-cta-primary">ENTER PROFILES</span>
                </Link>
                <Link href="/grounding" className="inline-flex">
                  <span className="luxury-cta luxury-cta-secondary">START GROUNDING</span>
                </Link>
              </div>

              <p className="font-home-mission text-[1.45rem] italic leading-tight text-[#f4e9ca] sm:text-[1.6rem]">
                Understand people first.
                <br />
                Fragrances second.
              </p>
            </div>
          </div>

          <div className="luxury-right-panel relative min-h-[340px] lg:min-h-0">
            <div className="luxury-image-shell relative h-full w-full">
              <Image
                src="/Background/background carton front page.png"
                alt="Fragrance campaign visual"
                fill
                priority
                className="object-contain object-center p-0"
                sizes="(min-width: 1024px) 56vw, 90vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-6 w-[90vw] max-w-[1600px] pb-2 lg:mt-7">
        <div className="luxury-feature-strip grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featureItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="luxury-feature-item">
                <Icon className="luxury-feature-icon h-6 w-6" />
                <p className="mt-3 text-[0.76rem] uppercase tracking-[0.28em] text-[#efe1bc]">
                  {item.title}
                </p>
                <p className="mt-2 text-[0.95rem] text-[#d9d1be]">{item.subtitle}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
