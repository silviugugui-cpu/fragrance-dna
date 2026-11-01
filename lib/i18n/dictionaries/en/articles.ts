export type ArticleSectionId =
  | 'scent-fundamentals'
  | 'application-technique'
  | 'testing-selection'
  | 'performance-science'
  | 'formula-evolution'
  | 'market-reality';

export interface ArticleEntry {
  title: string;
  subtitle: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
}

export interface ArticleSectionEntry {
  title: string;
  description: string;
  intro: string;
  articles: ArticleEntry[];
}

const articles = {
  menu: {
    passionMenu: 'Passion Menu',
    items: {
      needToKnow: { label: 'Need to Know', hint: 'Essential fragrance knowledge' },
      perfumeCreators: { label: 'Perfume Creators', hint: 'Perfumer DNA and signature styles' },
      scentTerritories: { label: 'Olfactive Territories', hint: 'Explore the olfactive worlds' },
    },
  },
  needToKnow: {
    kicker: 'Need to Know',
    title: 'Articles in Need to Know',
    intro:
      'Explore structured fragrance knowledge by category. Select a section and the articles open below, on this same page.',
    sectionLabel: 'Section',
    nowReading: 'Now reading',
    articleCount: (count: number) => `${count} articles`,
    sections: {
      'scent-fundamentals': {
        title: 'Olfactive Fundamentals',
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
            callout:
              'Myth: Higher concentration always means stronger performance.\nReality: Formula architecture matters more than the label.',
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
      'application-technique': {
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
      'testing-selection': {
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
              'The goal is not highest-rated. The goal is best fit for your own Olfactive DNA.',
            ],
          },
        ],
      },
      'performance-science': {
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
            subtitle: 'Olfactive Fatigue Explained',
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
            title: 'Why Fragrances Smell Different on Everyone',
            subtitle: 'Skin Chemistry and Environment',
            paragraphs: [
              'Hydration, skin temperature, climate, and natural oils influence both scent perception and performance.',
              'Testing on your own skin is always more reliable than relying only on reviews.',
            ],
          },
        ],
      },
      'formula-evolution': {
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
      'market-reality': {
        title: 'Market Reality Check',
        description: 'Cut through marketing assumptions and evaluate quality with better criteria.',
        intro: 'Focus on composition quality and personal fit instead of labels, hype, and price tags.',
        articles: [
          {
            title: 'Price vs Quality',
            subtitle: 'Expensive Does Not Automatically Mean Better',
            paragraphs: [
              'Price can reflect branding, packaging, rarity, and positioning as much as olfactive quality.',
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
    } as Record<ArticleSectionId, ArticleSectionEntry>,
  },
  perfumers: {
    kicker: 'Perfume Creators',
    title: 'Perfumers and Creative DNA',
    intro: 'Explore signature creator styles, perfumery philosophies, and DNA profiles across key axes.',
    iconicFragrances: 'Iconic Fragrances',
    clusters: {
      'FRESH ARCHITECTS': 'FRESH ARCHITECTS',
      'ORIENTAL SCULPTORS': 'ORIENTAL SCULPTORS',
      'FLORAL ARTISTS': 'FLORAL ARTISTS',
      'MODERN MOLECULAR DESIGNERS': 'MODERN MOLECULAR DESIGNERS',
      'HERITAGE HOUSES': 'HERITAGE HOUSES',
    } as Record<string, string>,
    profiles: {
      'Jean-Claude Ellena': {
        style: 'Minimalist transparency, airy citrus compositions',
        philosophy: 'Less is more',
      },
      'Francis Kurkdjian': {
        style: 'Modern luxury, strong identity signatures',
        philosophy: 'Recognizability through contrast',
      },
      'Olivier Creed': {
        style: 'Fresh aristocratic luxury',
        philosophy: 'Nature plus heritage',
      },
      'Alberto Morillas': {
        style: 'Clean modern freshness',
        philosophy: 'Perfect simplicity',
      },
      'Dominique Ropion': {
        style: 'Dense sensual floral structures',
        philosophy: 'Strong backbone compositions',
      },
      'Thierry Wasser': {
        style: 'Guerlain warm elegance',
        philosophy: 'Timeless French perfumery',
      },
      'Pierre Montale': {
        style: 'Bold oriental-heavy compositions, intense projection',
        philosophy: 'More is more in raw material intensity',
      },
      'Roja Dove': {
        style: 'Ultra-luxury British perfumery, extremely opulent blends',
        philosophy: 'Absolute refinement and excess in harmony',
      },
      'Serge Lutens': {
        style: 'Artistic, dark, unconventional compositions',
        philosophy: 'Perfume as storytelling and emotion',
      },
      'Kilian Hennessy': {
        style: 'Sensual luxury, nightlife-inspired compositions',
        philosophy: "Don't be shy, be addictive",
      },
      'David Le Goff': {
        style: 'Modern aquatic-mineral freshness',
        philosophy: 'Clean modern elegance with airy transparency',
      },
      Houbigant: {
        style: 'Historic French perfumery with modern reinterpretations, elegant florals and refined woody structures',
        philosophy: 'Tradition refined through modern craftsmanship',
      },
    } as Record<string, { style: string; philosophy: string }>,
  },
};

export default articles;
