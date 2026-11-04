import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm grays tuned for text on the dark gold theme (cool Tailwind
        // defaults read muddy on near-black and clash with the gold palette).
        gray: {
          300: '#DFD6C5',
          400: '#BFB4A2',
          500: '#9A907E',
          600: '#776E5F',
        },
        black: {
          // DEFAULT restores the core `black` color (and opacity modifiers like bg-black/75).
          DEFAULT: 'rgb(var(--public-black-rgb, 0 0 0) / <alpha-value>)',
          50: '#F5F5F5',
          100: '#E8E8E8',
          200: '#D1D1D1',
          300: '#B8B8B8',
          400: 'rgb(var(--public-black-400-rgb, 128 128 128) / <alpha-value>)',
          500: 'rgb(var(--public-black-500-rgb, 64 64 64) / <alpha-value>)',
          600: 'rgb(var(--public-black-600-rgb, 43 43 43) / <alpha-value>)',
          700: 'rgb(var(--public-black-700-rgb, 26 26 26) / <alpha-value>)',
          800: 'rgb(var(--public-black-800-rgb, 11 13 15) / <alpha-value>)',
          900: 'rgb(var(--public-black-rgb, 0 0 0) / <alpha-value>)',
        },
        gold: {
          // DEFAULT makes `gold` usable with opacity modifiers (e.g. border-gold/35).
          DEFAULT: 'rgb(var(--public-champagne-rgb, 212 175 120) / <alpha-value>)',
          50: 'rgb(var(--public-champagne-rgb, 254 251 243) / <alpha-value>)',
          100: 'rgb(var(--public-champagne-rgb, 254 245 224) / <alpha-value>)',
          200: 'rgb(var(--public-champagne-rgb, 253 232 192) / <alpha-value>)',
          300: 'rgb(var(--public-champagne-rgb, 253 217 160) / <alpha-value>)',
          400: 'rgb(var(--public-champagne-rgb, 252 200 96) / <alpha-value>)',
          500: 'rgb(var(--public-champagne-rgb, 244 184 96) / <alpha-value>)',
          600: 'rgb(var(--public-champagne-rgb, 212 175 120) / <alpha-value>)',
          700: 'rgb(var(--public-champagne-rgb, 184 148 77) / <alpha-value>)',
          800: 'rgb(var(--public-champagne-rgb, 139 111 71) / <alpha-value>)',
          900: 'rgb(var(--public-champagne-rgb, 107 84 54) / <alpha-value>)',
        },
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
      },
      fontFamily: {
        display: 'var(--font-display, Georgia, serif)',
        body: 'var(--font-body, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
      },
    }
  },
  plugins: []
};

export default config;
