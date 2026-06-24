'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import TerritoriesFullSection from '@/components/territories/TerritoriesFullSection';

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
      <section className="relative z-10 mx-auto w-[90vw] max-w-[1600px] pb-2">
        <article
          className="hero-first-card relative w-full overflow-hidden rounded-[30px] bg-black"
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

          <div className="hero-first-copy absolute left-1/2 top-5 z-10 w-[min(92%,70ch)] -translate-x-1/2 space-y-3 text-center sm:top-7">
            <h1 className="font-home-heading text-[clamp(1.05rem,1.65vw,1.7rem)] font-semibold uppercase leading-[1.02] text-[#c9ad82]">
              A SINGLE GATEWAY
              <br />
              TO YOUR SCENT DNA
            </h1>
            <p className="font-home-mission text-[1.24rem] leading-snug text-[#d5d0c0] sm:text-[1.38rem]">
              FragranceDNA transforms instinct into clarity by revealing the identity behind your fragrance preferences
            </p>
          </div>

          <p
            className="hero-first-quote absolute bottom-5 left-1/2 z-10 w-[min(92%,56ch)] -translate-x-1/2 text-center font-home-mission text-[1.26rem] italic leading-[1.28] text-[#f4e9ca] sm:bottom-7 sm:text-[1.54rem]"
            style={{
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none'
            }}
          >
            "The shortest path to your perfect fragrance
            <br />
            <span className="whitespace-nowrap">
              starts with understanding your <span style={{ fontSize: '118%' }}>Fragrance DNA</span>"
            </span>
          </p>

          <div className="hero-first-cta-row absolute bottom-[8.5rem] left-1/2 z-10 flex w-[min(96%,80ch)] -translate-x-1/2 justify-around gap-3 sm:bottom-[10rem]">
            <Link href="/grounding" className="hero-first-cta-link hero-first-cta-grounding inline-flex flex-1">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">START GROUNDING</span>
            </Link>
            <Link href="/test" className="hero-first-cta-link hero-first-cta-test inline-flex flex-1">
              <span className="luxury-cta luxury-cta-hero-secondary w-full justify-center !rounded-full">START TEST</span>
            </Link>
            <Link href="/dna" className="hero-first-cta-link hero-first-cta-dna inline-flex flex-1">
              <span className="luxury-cta luxury-cta-hero-primary w-full justify-center !rounded-full">ENTER YOUR DNA</span>
            </Link>
          </div>
        </article>
      </section>

      <TerritoriesFullSection />

      <section className="relative z-10 mx-auto mt-6 w-[90vw] max-w-[1600px] lg:mt-7">
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
            <div className="max-w-[calc(35ch+4cm)] space-y-3">
              <div className="hero-final-plaque mt-4 sm:mt-24 lg:mt-16 luxury-mission-plaque">
                <p className="font-home-mission text-[clamp(1.45rem,2.3vw,2rem)] italic leading-[1.12] text-[#f3e0b3]">
                  Never again buy a perfume
                  <br />
                  that does not blow your mind!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
