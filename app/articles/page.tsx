'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';

type Article = {
  title: string;
  subtitle: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
};

type SectionId =
  | 'scent-fundamentals'
  | 'application-technique'
  | 'testing-selection'
  | 'performance-science'
  | 'formula-evolution'
  | 'market-reality';

type ArticleSection = {
  id: SectionId;
  title: string;
  description: string;
  intro: string;
  articles: Article[];
};

type SubmenuId = 'need-to-know';

const inter = Inter({ subsets: ['latin'], variable: '--font-articles-body', display: 'swap' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-articles-heading',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const articleSections: ArticleSection[] = [
  {
    id: 'scent-fundamentals',
    title: 'Scent Fundamentals',
    description: 'Core principles that explain how fragrances are structured and interpreted.',
    intro: 'Build a strong foundation before evaluating performance, value, or brand category.',
    articles: [
      {
        title: 'Top, Heart, and Base Notes',
        subtitle: 'A Fragrance Is a Journey',
        paragraphs: [
          'Most fragrances evolve in stages instead of smelling the same from start to finish.',
          'Top notes are the first impression and are usually bright and short-lived.',
          'Heart notes define the central character once the opening fades.',
          'Base notes provide depth and often shape the long-term skin scent.',
        ],
      },
      {
        title: 'Understanding Concentration Levels',
        subtitle: 'EDT, EDP, and Parfum in Context',
        paragraphs: [
          'Concentration indicates the approximate amount of aromatic material dissolved in alcohol, but it is not a standalone performance guarantee.',
          'Formula design, ingredient quality, skin chemistry, and climate can change performance more than concentration labels alone.',
          'Some EDTs outperform many Parfums depending on composition.',
        ],
        bullets: [
          'Eau Fraiche: 1-3%',
          'Eau de Cologne (EDC): 2-5%',
          'Eau de Toilette (EDT): 5-15%',
          'Eau de Parfum (EDP): 15-20%',
          'Parfum / Extrait: 20-40%',
        ],
        callout: 'Myth: Higher concentration always means stronger performance.\nReality: Formula architecture matters more than the label.',
      },
      {
        title: 'What Is an Accord?',
        subtitle: 'The Building Blocks of Composition',
        paragraphs: [
          'An accord is a blend of materials that creates a recognizable scent impression, like leather, amber, tobacco, or marine air.',
          'Many accords are compositional illusions and do not exist as single natural materials.',
          'Understanding accords helps explain why note pyramids and smell perception do not always match literally.',
        ],
      },
      {
        title: 'Natural vs Synthetic Ingredients',
        subtitle: 'Both Are Essential in Modern Perfumery',
        paragraphs: [
          'Natural materials can contribute richness and texture, while synthetics improve consistency, stability, and creative range.',
          'Most high-quality fragrances combine both approaches.',
          'Quality is determined by formula creativity and balance, not by a simple natural-versus-synthetic ratio.',
        ],
      },
    ],
  },
  {
    id: 'application-technique',
    title: 'Application Technique',
    description: 'How to apply fragrance correctly for elegant projection and better wear consistency.',
    intro: 'Use these practices to improve scent behavior without overspraying.',
    articles: [
      {
        title: 'How to Apply Fragrance Properly',
        subtitle: 'Less Is Often More',
        paragraphs: [
          'Apply to pulse points like neck, chest, and wrists so body warmth helps diffusion through the day.',
          'Aim for a discoverable scent trail, not room saturation.',
        ],
        bullets: [
          'Fresh fragrances: 4-6 sprays',
          'Versatile fragrances: 3-5 sprays',
          'Powerful fragrances: 2-4 sprays',
        ],
      },
      {
        title: 'Do Not Rub After Spraying',
        subtitle: 'Let the Opening Develop Naturally',
        paragraphs: [
          'Rubbing wrists increases friction and can disturb top-note perception.',
          'The best workflow is simple: spray and let the fragrance dry naturally.',
        ],
      },
      {
        title: 'Placement Beats Quantity',
        subtitle: 'Spray Strategy Before More Sprays',
        paragraphs: [
          'Doubling sprays rarely doubles longevity and often only increases intensity.',
          'Strategic placement usually delivers cleaner projection and better comfort than overspraying.',
        ],
      },
    ],
  },
  {
    id: 'testing-selection',
    title: 'Testing and Selection',
    description: 'A practical framework for testing fragrances and buying with confidence.',
    intro: 'Use process-based evaluation to avoid impulse purchases and collector regret.',
    articles: [
      {
        title: 'How to Test a Fragrance',
        subtitle: 'Evaluate the Full Evolution',
        paragraphs: [
          'Do not judge a fragrance in the first minutes only; many formulas transform significantly across wear stages.',
          'Whenever possible, test for a full day before buying.',
        ],
        bullets: [
          'Opening: 0-15 minutes',
          'Heart: 30-120 minutes',
          'Drydown: 3-8 hours',
        ],
      },
      {
        title: 'Paper Strip vs Skin',
        subtitle: 'Two Tools, Two Purposes',
        paragraphs: [
          'Use test strips for fast comparison and initial direction.',
          'Use skin testing for longevity, projection, and chemistry interaction.',
          'Never make a final purchase decision from strip testing alone.',
        ],
      },
      {
        title: 'Sample Before Full Bottle',
        subtitle: 'Reduce Risk and Improve Hit Rate',
        paragraphs: [
          'Decants and samples reveal real-world wear behavior better than store impressions.',
          'A structured sample-first process reduces expensive blind-buy mistakes.',
        ],
      },
      {
        title: 'No Universal Best Perfume',
        subtitle: 'The Best Fragrance Is Personal',
        paragraphs: [
          'Personal preference, climate, lifestyle, and emotional associations shape fragrance success more than hype or rankings.',
          'The goal is not highest-rated. The goal is best fit for your own Fragrance DNA.',
        ],
      },
    ],
  },
  {
    id: 'performance-science',
    title: 'Performance Science',
    description: 'Understand projection, longevity, perception limits, and seasonal behavior.',
    intro: 'Separate myths from measurable behavior when judging how a fragrance performs.',
    articles: [
      {
        title: 'Projection vs Longevity',
        subtitle: 'Different Metrics, Different Meanings',
        paragraphs: [
          'Projection describes radiance distance from skin, while longevity tracks total detectable duration.',
          'A fragrance can project strongly and fade fast, last long with low projection, or perform strongly in both dimensions.',
        ],
      },
      {
        title: 'Why You Stop Smelling Your Own Fragrance',
        subtitle: 'Olfactory Fatigue Explained',
        paragraphs: [
          'Continuous exposure makes the brain filter familiar scent signals.',
          'Not noticing a fragrance does not prove it is gone. Others may still perceive it clearly.',
        ],
      },
      {
        title: 'Seasonal Performance Shifts',
        subtitle: 'Temperature Changes Everything',
        paragraphs: [
          'Heat often amplifies projection and brightness, while cold can soften projection and emphasize dense notes.',
          'The same fragrance may feel completely different in summer versus winter.',
        ],
      },
      {
        title: 'Why Fragrances Smell Different on Different People',
        subtitle: 'Skin Chemistry and Environment',
        paragraphs: [
          'Hydration, skin temperature, climate, and natural oils influence both scent perception and performance.',
          'Testing on your own skin is always more reliable than relying only on reviews.',
        ],
      },
    ],
  },
  {
    id: 'formula-evolution',
    title: 'Formula Evolution',
    description: 'How fragrances change over time through aging, reformulation, and production variables.',
    intro: 'Understand why two bottles may differ and how to protect long-term quality.',
    articles: [
      {
        title: 'Why Fragrances Get Reformulated',
        subtitle: 'Why Favorites Sometimes Change',
        paragraphs: [
          'Reformulations happen for regulatory, safety, sourcing, cost, and strategic reasons.',
          'Some changes are subtle, while others can alter identity significantly.',
        ],
        bullets: [
          'Ingredient restrictions',
          'Safety regulations',
          'Supply shortages',
          'Material cost changes',
          'Brand strategy updates',
        ],
      },
      {
        title: 'Batch Variation',
        subtitle: 'Why Bottles Can Differ Slightly',
        paragraphs: [
          'Minor batch differences can come from material variance, supplier changes, and production adjustments.',
          'Most differences are small and become obvious mainly in direct side-by-side comparison.',
        ],
      },
      {
        title: 'Maceration and Bottle Aging',
        subtitle: 'Subtle Changes Over Time',
        paragraphs: [
          'After opening, oxygen and time may smooth some compositions, though dramatic changes are uncommon.',
          'Proper storage practices generally matter more than intentional maceration attempts.',
        ],
      },
      {
        title: 'How to Store Perfumes Correctly',
        subtitle: 'Protect Your Collection',
        paragraphs: [
          'Heat, light, humidity, and excessive air exposure accelerate degradation.',
          'Store bottles in cool, dry, dark places with stable temperatures.',
          'Drawers, closets, and cabinets are usually safer than bathrooms.',
        ],
      },
      {
        title: 'Why Vintage Bottles Smell Different',
        subtitle: 'A Snapshot of Another Era',
        paragraphs: [
          'Vintage bottles can differ due to historical formulas, ingredient restrictions, and material evolution.',
          'They often reveal styles that are less common in modern market releases.',
        ],
      },
    ],
  },
  {
    id: 'market-reality',
    title: 'Market Reality Check',
    description: 'Cut through marketing assumptions and evaluate quality with better criteria.',
    intro: 'Focus on composition quality and personal fit instead of labels, hype, and price tags.',
    articles: [
      {
        title: 'Price vs Quality',
        subtitle: 'Expensive Does Not Automatically Mean Better',
        paragraphs: [
          'Price can reflect branding, packaging, rarity, and positioning as much as olfactory quality.',
          'Many affordable fragrances outperform expensive ones in versatility, enjoyment, and personal fit.',
        ],
      },
      {
        title: 'Niche vs Designer',
        subtitle: 'Quality Exists in Both Worlds',
        paragraphs: [
          'Niche and designer are business categories, not guaranteed quality rankings.',
          'Some fragrances in each category are excellent, while others are forgettable.',
          'Judge the fragrance itself, not the label family.',
        ],
      },
      {
        title: 'Loudness Is Not Quality',
        subtitle: 'Strong Projection Is Only One Metric',
        paragraphs: [
          'High projection can be useful, but quality also depends on balance, creativity, structure, and evolution.',
          'Some of the most respected fragrances are intimate rather than loud.',
        ],
      },
      {
        title: 'Complexity Is Not Note Count',
        subtitle: 'Structure Matters More Than Long Lists',
        paragraphs: [
          'A long note list does not guarantee depth.',
          'Real complexity comes from layered accords, contrast, transitions, and development over time.',
        ],
      },
      {
        title: 'Gender Labels Are Marketing',
        subtitle: 'Wear What You Enjoy',
        paragraphs: [
          'Most core notes appear in both so-called masculine and feminine releases.',
          'Personal taste is more useful than audience labels on the box.',
        ],
      },
    ],
  },
];

export default function ArticlesPage() {
  const [selectedSubmenu, setSelectedSubmenu] = useState<SubmenuId>('need-to-know');
  const [selectedSection, setSelectedSection] = useState<SectionId>('scent-fundamentals');
  const [railScrollOffset, setRailScrollOffset] = useState(0);

  const submenuItems: { id: SubmenuId; label: string; hint: string }[] = [
    {
      id: 'need-to-know',
      label: 'Need to Know',
      hint: 'Essential fragrance knowledge',
    },
  ];

  const activeSection = useMemo(
    () => articleSections.find((section) => section.id === selectedSection) ?? articleSections[0],
    [selectedSection],
  );

  useEffect(() => {
    const root = document.documentElement;

    const toPx = (value: string): number => {
      const trimmed = value.trim();
      if (!trimmed) {
        return 0;
      }
      if (trimmed.endsWith('px')) {
        return Number.parseFloat(trimmed) || 0;
      }
      if (trimmed.endsWith('rem')) {
        const rem = Number.parseFloat(trimmed) || 0;
        const rootFont = Number.parseFloat(getComputedStyle(root).fontSize || '16') || 16;
        return rem * rootFont;
      }
      return Number.parseFloat(trimmed) || 0;
    };

    const pageShellTopPx = toPx(getComputedStyle(root).getPropertyValue('--page-shell-top'));

    const updateRailOffset = () => {
      const scrollY = window.scrollY || 0;
      setRailScrollOffset(Math.max(0, pageShellTopPx - scrollY));
    };

    updateRailOffset();
    window.addEventListener('scroll', updateRailOffset, { passive: true });
    window.addEventListener('resize', updateRailOffset);

    return () => {
      window.removeEventListener('scroll', updateRailOffset);
      window.removeEventListener('resize', updateRailOffset);
    };
  }, []);

  const railStyle: CSSProperties & { '--articles-rail-scroll-offset': string } = {
    '--articles-rail-scroll-offset': `${railScrollOffset}px`,
  };

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
          <p className="font-articles-body text-xs uppercase tracking-[0.28em] text-[#d8bc83]/85">Need to Know</p>
          <h1 className="mt-3 font-articles-heading text-[clamp(1.75rem,3.1vw,3.2rem)] leading-[1.08] text-[#f4deb2]">
            Articles in Need to Know
          </h1>
          <p className="mt-4 max-w-[70ch] font-articles-body text-[1.01rem] leading-relaxed text-[#e4d8bf]">
            Explore structured fragrance knowledge by category. Select a section and the articles open below,
            on this same page.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-4 grid w-[92vw] max-w-[1540px] gap-4 lg:grid-cols-3">
        <div className="w-full lg:col-span-3">
          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
            <aside className="articles-brand-rail-shell">
              <div
                className="articles-brand-rail relative overflow-hidden p-4 sm:p-5 lg:min-h-[66vh]"
                style={railStyle}
              >
                <div className="articles-rail-static-link" aria-hidden="true" />
                <div className="articles-rail-dynamic-mist" aria-hidden="true" />

                <div className="mt-[1cm]">
                  <p className="font-articles-body text-center text-[10px] uppercase tracking-[0.28em] text-[#d5b97f]">Passion Menu</p>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  {submenuItems.map((item) => {
                    const isActive = selectedSubmenu === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedSubmenu(item.id)}
                        data-active={isActive ? 'true' : 'false'}
                        className="articles-rail-button w-full rounded-2xl border px-4 py-4 text-left transition-all duration-300"
                      >
                        <p className="font-articles-heading text-[1.12rem] leading-tight text-[#f4ddb2]">{item.label}</p>
                        <p className="mt-2 font-articles-body text-[10px] uppercase tracking-[0.2em] text-[#bb9660]">{item.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="articles-content-column space-y-6">
              {selectedSubmenu === 'need-to-know' && (
                <>
                  <section className="relative z-10 grid w-full gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                    {articleSections.map((section) => {
                      const isActive = activeSection.id === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => setSelectedSection(section.id)}
                          className="rounded-3xl border p-5 text-left transition-all duration-300"
                          style={{
                            borderColor: isActive ? 'rgba(243, 210, 147, 0.9)' : 'rgba(168, 129, 70, 0.45)',
                            background: isActive
                              ? 'linear-gradient(160deg, rgba(35,25,13,0.96), rgba(16,13,10,0.98))'
                              : 'linear-gradient(160deg, rgba(19,16,14,0.88), rgba(12,12,12,0.92))',
                            boxShadow: isActive
                              ? '0 16px 34px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,228,173,0.24)'
                              : '0 10px 20px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,228,173,0.1)',
                            transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                          }}
                        >
                          <p className="font-articles-body text-[11px] uppercase tracking-[0.24em] text-[#d4b67a]">Section</p>
                          <h2 className="mt-2 font-articles-heading text-[1.55rem] text-[#f5dfb4]">{section.title}</h2>
                          <p className="mt-3 font-articles-body text-sm leading-relaxed text-[#dacfb7]">{section.description}</p>
                          <p className="mt-4 font-articles-body text-xs uppercase tracking-[0.2em] text-[#b7955f]">
                            {section.articles.length} articles
                          </p>
                        </button>
                      );
                    })}
                  </section>

                  <section className="relative z-10 w-full">
                    <div
                      className="rounded-[30px] border border-[#9f7b44]/45 p-6 sm:p-8 lg:p-10"
                      style={{
                        background:
                          'linear-gradient(170deg, rgba(18,14,11,0.96) 0%, rgba(12,10,9,0.98) 60%), radial-gradient(circle at 85% 8%, rgba(164,118,64,0.25), transparent 36%)',
                        boxShadow: '0 30px 58px rgba(0,0,0,0.52), inset 0 1px 0 rgba(244,220,165,0.18)',
                      }}
                    >
                      <div className="border-b border-[#aa8447]/35 pb-5">
                        <p className="font-articles-body text-xs uppercase tracking-[0.28em] text-[#d1b57d]">Now reading</p>
                        <h2 className="mt-2 font-articles-heading text-[clamp(1.5rem,2.5vw,2.5rem)] text-[#f1dcaf]">
                          {activeSection.title}
                        </h2>
                        <p className="mt-3 max-w-[75ch] font-articles-body text-[1rem] leading-relaxed text-[#dfd3ba]">
                          {activeSection.intro}
                        </p>
                      </div>

                      <div className="mt-6 space-y-5">
                        {activeSection.articles.map((article) => (
                          <article
                            key={article.title}
                            className="rounded-2xl border border-[#9c7841]/35 bg-[rgba(10,10,10,0.45)] p-5 sm:p-6"
                            style={{ boxShadow: 'inset 0 1px 0 rgba(255,228,177,0.14)' }}
                          >
                            <h3 className="font-articles-heading text-[1.45rem] leading-tight text-[#f2ddb1]">{article.title}</h3>
                            <p className="mt-2 font-articles-body text-[1.05rem] font-semibold text-[#caa46b]">{article.subtitle}</p>

                            {article.callout && (
                              <blockquote className="mt-4 whitespace-pre-line rounded-xl border border-[#b08a53]/45 bg-black/25 px-4 py-3 font-articles-body text-sm text-[#e4d7bc]">
                                {article.callout}
                              </blockquote>
                            )}

                            <div className="mt-4 space-y-3 font-articles-body text-[0.98rem] leading-relaxed text-[#e3d7be]">
                              {article.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                              ))}
                            </div>

                            {article.bullets && article.bullets.length > 0 && (
                              <ul className="mt-4 list-disc space-y-2 pl-5 font-articles-body text-[0.97rem] leading-relaxed text-[#dfd2b6] marker:text-[#c49a5e]">
                                {article.bullets.map((bullet) => (
                                  <li key={bullet}>{bullet}</li>
                                ))}
                              </ul>
                            )}
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
