export type PublicTheme = 'dark' | 'normal';

interface PublicThemeAssets {
  logo: string;
  homeHero: string;
}

export const PUBLIC_THEME_ASSETS = {
  dark: {
    logo: BRAND_ASSETS.dark.logo,
    homeHero: '/Pictures/Pasi/front-page-black-minimal.png',
  },
  // Normal mode remains unavailable until its assets and public-page styles are ready.
  normal: null,
} as const satisfies Readonly<Record<PublicTheme, Readonly<PublicThemeAssets> | null>>;

export const ACTIVE_PUBLIC_THEME = 'dark' satisfies PublicTheme;
export const ACTIVE_PUBLIC_THEME_ASSETS = PUBLIC_THEME_ASSETS[ACTIVE_PUBLIC_THEME];
import { BRAND_ASSETS } from '../branding';
