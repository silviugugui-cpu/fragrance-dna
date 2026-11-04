export const LOCALES = ['en', 'ro', 'fr', 'de', 'es', 'it', 'pt'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const LOCALE_LABELS: Record<Locale, { native: string; english: string; flag: string }> = {
  en: { native: 'English', english: 'English', flag: '🇬🇧' },
  fr: { native: 'Français', english: 'French', flag: '🇫🇷' },
  de: { native: 'Deutsch', english: 'German', flag: '🇩🇪' },
  es: { native: 'Español', english: 'Spanish', flag: '🇪🇸' },
  it: { native: 'Italiano', english: 'Italian', flag: '🇮🇹' },
  pt: { native: 'Português', english: 'Portuguese', flag: '🇵🇹' },
  ro: { native: 'Română', english: 'Romanian', flag: '🇷🇴' },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
