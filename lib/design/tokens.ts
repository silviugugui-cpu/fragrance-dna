/**
 * FragranceDNA Design Tokens
 * Visual System Based on Premium Luxury Benchmark
 *
 * Color Palette:
 * - Black: Premium background, text
 * - Gold: Primary accent, luxury, hierarchy
 * - Warm Neutrals: Secondary hierarchy, borders
 * - Subtle Colors: Data visualization, territories
 */

export const colors = {
  // Primary palette: premium black + gold
  black: {
    50: '#F5F5F5',
    100: '#E8E8E8',
    200: '#D1D1D1',
    300: '#B8B8B8',
    400: '#808080',
    500: '#404040',
    600: '#2B2B2B',
    700: '#1A1A1A',
    800: '#0B0D0F', // Platform black
    900: '#000000',
  },

  // Gold: luxury accent, primary hierarchy
  gold: {
    50: '#FEFBF3',
    100: '#FEF5E0',
    200: '#FDE8C0',
    300: '#FDD9A0',
    400: '#FCC860',
    500: '#F4B860', // Primary gold
    600: '#D4AF78', // Benchmark gold
    700: '#B8944D',
    800: '#8B6F47',
    900: '#6B5436',
  },

  // Warm neutrals: subtle hierarchy, borders, dividers
  warm: {
    50: '#FBF8F5',
    100: '#F5F0EB',
    200: '#EBE4DB',
    300: '#DDD3C8',
    400: '#C9B8A8',
    500: '#B8A894',
    600: '#9D8876',
    700: '#8B7759',
    800: '#6B5C4D',
    900: '#4D433A',
  },

  // Territory colors: fragrance territories & DNA axes
  territories: {
    freshCitrus: '#E8D966',
    greenFresh: '#9ACD32',
    luxuryFresh: '#87CEEB',
    honeyTobacco: '#CD853F',
    richGourmand: '#D2691E',
    leather: '#8B4513',
    woodyElegant: '#556B2F',
    amber: '#D4A574',
    musk: '#A0826D',
    floral: '#DB7093',
  },

  // Functional colors
  accent: {
    success: '#6B9E4A',
    warning: '#E8A840',
    error: '#C85A54',
    info: '#5BA3D0',
  },

  // Semantic aliases
  background: {
    primary: '#0B0D0F', // Platform black
    secondary: '#1A1A1A',
    tertiary: '#2B2B2B',
    overlay: 'rgba(0, 0, 0, 0.85)',
    light: '#F5F5F5',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#D4AF78', // Gold
    tertiary: '#999999',
    muted: '#666666',
    inverse: '#0B0D0F',
  },

  border: {
    primary: '#D4AF78', // Gold
    secondary: '#2B2B2B',
    tertiary: '#1A1A1A',
    light: '#4D433A',
  },
} as const;

export const typography = {
  // Font families - Google Fonts only
  fontFamily: {
    display: 'var(--font-display, Georgia, serif)',
    body: 'var(--font-body, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
    mono: '"Monaco", "Courier New", monospace',
  },

  // Font sizes - premium hierarchy
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
  },

  // Font weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line heights - premium typography
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing - premium refinement
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0em',
    wide: '0.02em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

export const spacing = {
  // Premium spacing scale
  px: '1px',
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
} as const;

export const shadows = {
  // Premium shadow system - subtle to dramatic
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.75), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',

  // Premium glow effects - gold accents
  glow: {
    sm: '0 0 12px rgba(212, 175, 120, 0.2)',
    base: '0 0 24px rgba(212, 175, 120, 0.3)',
    md: '0 0 32px rgba(212, 175, 120, 0.4)',
    lg: '0 0 48px rgba(212, 175, 120, 0.5)',
  },

  // Cinematic depth layers
  depth: {
    surface: '0 0 0 1px rgba(212, 175, 120, 0.1)',
    layer: '0 8px 16px rgba(0, 0, 0, 0.8)',
    card: '0 12px 24px rgba(0, 0, 0, 0.9)',
    modal: '0 25px 50px rgba(0, 0, 0, 0.95)',
  },
} as const;

export const borders = {
  radius: {
    none: '0px',
    sm: '0.25rem', // 4px - subtle
    base: '0.5rem', // 8px - standard
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    full: '9999px',
  },

  width: {
    none: '0px',
    px: '1px',
    thin: '1px',
    base: '2px',
    thick: '3px',
  },
} as const;

export const effects = {
  // Transition timing - premium feel
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Backdrop effects
  backdrop: {
    blur: 'backdrop-filter: blur(12px)',
    frosted: 'backdrop-filter: blur(12px); background: rgba(11, 13, 15, 0.7)',
  },

  // Hover state transforms
  hover: {
    scale: 'transform: scale(1.02)',
    lift: 'transform: translateY(-4px)',
    glow: 'box-shadow: 0 0 32px rgba(212, 175, 120, 0.4)',
  },
} as const;

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
