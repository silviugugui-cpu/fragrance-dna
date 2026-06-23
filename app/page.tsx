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
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
});

export default function HomePage() {
  return (
    <main
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} relative pb-10 pt-5 lg:pt-8`}
    >
      <section className="relative z-10 mx-auto w-[90vw] max-w-[1600px]">
        <div className="luxury-hero-card relative overflow-hidden">
          <div className="luxury-image-shell relative w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Background/background carton front page.png"
              alt="Fragrance campaign visual"
              className="luxury-main-image block w-full h-auto"
            />
          </div>

          <div className="luxury-hero-overlay">
            <div className="space-y-4 sm:-mt-2 lg:-mt-3">
              <h1 className="font-home-heading text-[clamp(1.36rem,2.72vw,2.92rem)] font-semibold uppercase leading-[0.97] text-[#c9ad82]">
                A SINGLE GATEWAY
                <br />
                TO YOUR SCENT DNA
              </h1>

              <div className="max-w-[calc(35ch+4cm)] space-y-3">
                <div className="mt-20 sm:mt-24 lg:mt-16 luxury-mission-plaque">
                  <p className="font-home-mission text-[clamp(1.45rem,2.3vw,2rem)] italic leading-[1.12] text-[#f3e0b3]">
                    Never again buy a perfume
                    <br />
                    that does not blow your mind
                  </p>
                </div>
              </div>
            </div>

            <div
              className="absolute left-7 right-7 top-1/2 z-10 -translate-y-1/2 space-y-4 sm:left-9 sm:right-9 lg:left-12 lg:right-12"
              style={{ top: 'calc(50% + 4cm)' }}
            >
              <p
                className="-mt-20 max-w-[35ch] font-home-mission text-[1.08rem] leading-relaxed text-[#d5d0c0] sm:-mt-24 sm:text-[1.14rem] lg:-mt-28"
                style={{ transform: 'translateY(-1cm)' }}
              >
                FragranceDNA transforms instinct into clarity by revealing the identity behind your fragrance preferences
              </p>

              <div className="mt-16 flex flex-col gap-3 sm:mt-20">
                <Link href="/dna" className="inline-flex">
                  <span className="luxury-cta luxury-cta-primary">ENTER YOUR DNA</span>
                </Link>
                <Link href="/territories" className="inline-flex">
                  <span className="luxury-cta luxury-cta-secondary">ENTER TERRITORIES</span>
                </Link>
                <Link href="/grounding" className="inline-flex">
                  <span className="luxury-cta luxury-cta-secondary">START GROUNDING</span>
                </Link>
                <Link href="/test" className="inline-flex">
                  <span className="luxury-cta luxury-cta-secondary">START TEST</span>
                </Link>
              </div>
            </div>

            <p className="mt-auto max-w-[40ch] border-l border-[#d4af78]/55 pl-4 font-home-mission text-[1.35rem] italic leading-tight text-[#f4e9ca] sm:pb-2 sm:text-[1.5rem] lg:pb-3">
              The shortest path to your perfect fragrance
              <br />
              starts with understanding your fragrance DNA
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-6 w-[90vw] max-w-[1600px] pb-2 lg:mt-7">
        <article
          className="relative w-full overflow-hidden rounded-[30px] bg-black"
          style={{
            border: '1px solid rgba(197, 160, 94, 0.5)',
            boxShadow: '0 26px 54px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,226,162,0.2), inset 0 -1px 0 rgba(255,235,194,0.08)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Pictures/Pasi/Pasi.png?v=20260623b"
            alt="Pasi"
            className="block w-full h-auto"
          />
        </article>
      </section>
    </main>
  );
}
