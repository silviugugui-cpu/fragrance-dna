export interface ArticlesMenuItem {
  href: string;
  label: string;
  hint: string;
}

// Shared "Passion Menu" rail items for all /articles pages.
export const articlesMenuItems: ArticlesMenuItem[] = [
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
