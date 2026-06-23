'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import { Fingerprint, Target, ChartColumn, Compass } from 'lucide-react';

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

const featureItems = [
  {
    icon: Fingerprint,
    title: 'OLFACTORY ATTRIBUTES',
    subtitle: '68 identity markers',
  },
  {
    icon: Target,
    title: 'DIAGNOSTIC BENCHMARKS',
    subtitle: '28 precision signals',
  },
  {
    icon: ChartColumn,
    title: 'DNA AXES',
    subtitle: '11 scent dimensions',
  },
  {
    icon: Compass,
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
              <Image
                src="/Logo/Logo Fragrance DNA no text.png"
                alt="Fragrance DNA logo"
                width={74}
                height={74}
                priority
                className="h-[74px] w-[74px] object-contain"
              />

              <p className="text-[0.72rem] uppercase tracking-[0.42em] text-[#d4af78]/92 sm:text-xs">
                OLFACTORY IDENTITY
              </p>

              <h1 className="font-home-heading text-[2rem] font-semibold uppercase leading-[1.02] text-[#f3ead6] sm:text-[2.45rem] lg:text-[3.15rem]">
                A SINGLE GATEWAY
                <br />
                TO YOUR SCENT DNA.
              </h1>

              <div className="max-w-[34ch] space-y-4">
                <p className="font-home-mission text-[1.45rem] italic leading-[1.2] text-[#efe2bf] sm:text-[1.65rem]">
                  Never again buy a perfume
                  <br />
                  that does not blow your mind.
                </p>

                <p className="font-home-body text-sm leading-relaxed text-[#d5d0c0] sm:text-base">
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

              <p className="font-home-mission text-[1.35rem] italic leading-tight text-[#f4e9ca]">
                Understand people first.
                <br />
                Fragrances second.
              </p>
            </div>
          </div>

          <div className="luxury-right-panel relative min-h-[340px] lg:min-h-0">
            <Image
              src="/Background/background carton front page.png"
              alt="Fragrance campaign visual"
              fill
              priority
              className="object-contain object-center p-2 sm:p-3 lg:p-4"
              sizes="(min-width: 1024px) 56vw, 90vw"
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-6 w-[90vw] max-w-[1600px] pb-2 lg:mt-7">
        <div className="luxury-feature-strip grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featureItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="luxury-feature-item">
                <Icon size={20} className="text-[#d4af78]" strokeWidth={1.8} />
                <p className="mt-3 text-[0.72rem] uppercase tracking-[0.28em] text-[#efe1bc]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-[#cec8b6]">{item.subtitle}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
