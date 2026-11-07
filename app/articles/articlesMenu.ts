export type ArticlesMenuKey = 'fragrances' | 'needToKnow' | 'perfumeCreators' | 'perfumeHouses' | 'occasions';

export interface ArticlesMenuItem {
  href: string;
  key: ArticlesMenuKey;
}

// Shared "Passion Menu" rail items for all /articles pages.
// Labels/hints are dictionary keys resolved at render time via t.articles.menu.items[item.key].
export const articlesMenuItems: ArticlesMenuItem[] = [
  { href: '/fragrances', key: 'fragrances' },
  { href: '/articles/perfumers', key: 'perfumeCreators' },
  { href: '/articles/houses', key: 'perfumeHouses' },
  { href: '/articles/occasions', key: 'occasions' },
  { href: '/articles', key: 'needToKnow' },
];
