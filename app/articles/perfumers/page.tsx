'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inter, Playfair_Display } from 'next/font/google';
import { perfumers, type PerfumerDnaKey } from '@/lib/data/perfumers';

const inter = Inter({ subsets: ['latin'], variable: '--font-articles-body', display: 'swap' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-articles-heading',
  display: 'swap',
  weight: ['500', '600', '700'],
});


const menuItems = [
  {
    href: '/articles',
    label: 'Need to Know',
    hint: 'Essential fragrance knowledge',
  },
  {
    href: '/articles/perfumers',
    label: 'Perfume Creators',
    hint: 'Perfumer DNA and signature styles',
  },
];

export default function PerfumersPage() {
  const pathname = usePathname();

  return (
    <main className={`${inter.variable} ${playfair.variable} relative pb-16 pt-8 lg:pt-10`}>
      <section className="articles-intro-wrap relative z-10 mx-auto w-[92vw] max-w-[1540px]">
        <div
          className="rounded-[28px] border border-[#9f7b44]/45 p-6 sm:p-8 lg:p-10"
          style={{
            background:
              'radial-gradient(circle at 12% 12%, rgba(250,223,164,0.17), transparent 40%), radial-gradient(circle at 84% 30%, rgba(176,118,48,0.22), transparent 42%), linear-gradient(135deg, rgba(11,11,11,0.93), rgba(22,16,11,0.9))',
            boxShadow: '0 30px 58px rgba(0,0,0,0.55), inset 0 1px 0 rgba(248,221,163,0.2)',
          }}
        >
          <p className="font-articles-body text-xs uppercase tracking-[0.28em] text-[#d8bc83]/85">Perfume Creators</p>
          <h1 className="mt-3 font-articles-heading text-[clamp(1.75rem,3.1vw,3.2rem)] leading-[1.08] text-[#f4deb2]">
            Perfumers and Creative DNA
          </h1>
          <p className="mt-4 max-w-[70ch] font-articles-body text-[1.01rem] leading-relaxed text-[#e4d8bf]">
            Explore signature creator styles, perfumery philosophies, and DNA profiles across key axes.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-4 grid w-[92vw] max-w-[1540px] gap-4 lg:grid-cols-3">
        <div className="w-full lg:col-span-3">
          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
            <aside className="articles-brand-rail-shell">
              <div className="articles-brand-rail relative overflow-hidden p-4 sm:p-5 lg:min-h-[66vh]">
                <div className="articles-rail-static-link" aria-hidden="true" />
                <div className="articles-rail-dynamic-mist" aria-hidden="true" />

                <div className="mt-[1cm]">
                  <p className="font-articles-body text-center text-[10px] uppercase tracking-[0.28em] text-[#d5b97f]">Passion Menu</p>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-active={isActive ? 'true' : 'false'}
                        className="articles-rail-button w-full rounded-2xl border px-4 py-4 text-left transition-all duration-300"
                      >
                        <p className="font-articles-heading text-[1.12rem] leading-tight text-[#f4ddb2]">{item.label}</p>
                        <p className="mt-2 font-articles-body text-[10px] uppercase tracking-[0.2em] text-[#bb9660]">{item.hint}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>

            <section className="articles-content-column relative z-10 grid w-full gap-4 xl:grid-cols-2">
              {perfumers.map((perfumer) => (
                <article
                  key={perfumer.name}
                  className="rounded-3xl border border-[#9c7841]/35 bg-[rgba(10,10,10,0.45)] p-5 sm:p-6"
                  style={{ boxShadow: '0 14px 26px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,228,177,0.14)' }}
                >
                  <h2 className="font-articles-heading text-[1.4rem] leading-tight text-[#f2ddb1]">{perfumer.name}</h2>
                  <p className="mt-2 inline-flex rounded-full border border-[#b08a53]/45 bg-black/25 px-2.5 py-1 font-articles-body text-[10px] uppercase tracking-[0.18em] text-[#d8be8a]">
                    {perfumer.cluster}
                  </p>
                  <p className="mt-2 font-articles-body text-sm text-[#d9c7a2]">{perfumer.style}</p>
                  <p className="mt-2 font-articles-body text-sm leading-relaxed text-[#e4d7bc]">{perfumer.philosophy}</p>

                  <div className="mt-4">
                    <p className="font-articles-body text-[11px] uppercase tracking-[0.22em] text-[#caa46b]">Iconic Fragrances</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {perfumer.fragrances.map((fragrance) => (
                        <button
                          key={fragrance}
                          type="button"
                          className="rounded-full border border-[#b08a53]/45 bg-black/25 px-3 py-1 text-xs text-[#e4d7bc] transition-colors hover:border-[#e2c185] hover:text-[#f5e2bd]"
                        >
                          {fragrance}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {(Object.entries(perfumer.dna) as Array<[PerfumerDnaKey, number]>).map(([label, value]) => (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em]">
                          <span className="font-articles-body text-[#d6be91]">{label}</span>
                          <span className="font-articles-body text-[#f0ddb8]">{value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#2a1f12]">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#a7772f] via-[#c99a52] to-[#f2ce92]"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
