export type ArticlesMenuKey = 'fragrances' | 'needToKnow' | 'perfumeCreators' | 'scentTerritories' | 'perfumeHouses' | 'occasions';

export interface ArticlesMenuItem {
  href: string;
  key: ArticlesMenuKey;
}

// Shared "Passion Menu" rail items for all /articles pages.
// Labels/hints are dictionary keys resolved at render time via t.articles.menu.items[item.key].
export const articlesMenuItems: ArticlesMenuItem[] = [
  { href: '/fragrances', key: 'fragrances' },
  { href: '/articles', key: 'needToKnow' },
  { href: '/articles/perfumers', key: 'perfumeCreators' },
  { href: '/articles/territories', key: 'scentTerritories' },
  { href: '/articles/houses', key: 'perfumeHouses' },
  { href: '/articles/occasions', key: 'occasions' },
];
