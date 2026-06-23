import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: {
          50: '#F5F5F5',
          100: '#E8E8E8',
          200: '#D1D1D1',
          300: '#B8B8B8',
          400: '#808080',
          500: '#404040',
          600: '#2B2B2B',
          700: '#1A1A1A',
          800: '#0B0D0F',
          900: '#000000',
        },
        gold: {
          50: '#FEFBF3',
          100: '#FEF5E0',
          200: '#FDE8C0',
          300: '#FDD9A0',
          400: '#FCC860',
          500: '#F4B860',
          600: '#D4AF78',
          700: '#B8944D',
          800: '#8B6F47',
          900: '#6B5436',
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
