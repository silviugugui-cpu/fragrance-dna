export type ArticlesMenuKey = 'needToKnow' | 'perfumeCreators';

export interface ArticlesMenuItem {
  href: string;
  key: ArticlesMenuKey;
}

// Shared "Passion Menu" rail items for all /articles pages.
// Labels/hints are dictionary keys resolved at render time via t.articles.menu.items[item.key].
export const articlesMenuItems: ArticlesMenuItem[] = [
  { href: '/articles', key: 'needToKnow' },
  { href: '/articles/perfumers', key: 'perfumeCreators' },
];
