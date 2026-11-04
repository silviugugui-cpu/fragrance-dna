import { BRAND_ASSETS } from '../branding';

export type PublicTheme = 'dark' | 'normal';
export const PUBLIC_THEME_COOKIE = 'olfactive-public-theme';
export const DEFAULT_PUBLIC_THEME: PublicTheme = 'dark';

export function isPublicTheme(value: string | undefined): value is PublicTheme {
  return value === 'dark' || value === 'normal';
}

interface PublicThemeAssets {
  logo: string;
  homeHero: string;
  territoryHero: string;
  groundingNeutral: string;
  groundingLove: string;
  groundingAvoid: string;
}

export const PUBLIC_THEME_ASSETS = {
  dark: {
    logo: BRAND_ASSETS.dark.logo,
    homeHero: '/Pictures/Pasi/front-page-black-minimal.png',
    territoryHero: '/Territory/Territory.png',
    groundingNeutral: '/Pictures/Grounding/Neutral Affinitie Balance.png',
    groundingLove: '/Pictures/Grounding/Attraction Patterns Love.png',
    groundingAvoid: '/Pictures/Grounding/Avoidance Patterns Avoid.png',
  },
  normal: {
    logo: BRAND_ASSETS.normal.logo,
    homeHero: '/Pictures/Pasi/front-page-white-minimal.png',
    territoryHero: '/Territory/Territory-white.jpg',
    groundingNeutral: '/Pictures/Grounding/neutral-balance-white-mode-2x.jpg',
    groundingLove: '/Pictures/Grounding/attraction-love-white-mode-2x.jpg',
    groundingAvoid: '/Pictures/Grounding/avoidance-avoid-white-mode-2x.jpg',
  },
} as const satisfies Readonly<Record<PublicTheme, Readonly<PublicThemeAssets>>>;
