import { DEFAULT_LOCALE, isLocale, type Locale } from './config';
import en, { type Dictionary } from './dictionaries/en';
import fr from './dictionaries/fr';
import de from './dictionaries/de';
import es from './dictionaries/es';
import it from './dictionaries/it';
import pt from './dictionaries/pt';
import ro from './dictionaries/ro';
import { withDiscoveryLabels } from './discoveryCopy';

export const DICTIONARIES: Record<Locale, Dictionary> = {
  en: withDiscoveryLabels(en, "en"), fr: withDiscoveryLabels(fr, "fr"), de: withDiscoveryLabels(de, "de"),
  es: withDiscoveryLabels(es, "es"), it: withDiscoveryLabels(it, "it"), pt: withDiscoveryLabels(pt, "pt"), ro: withDiscoveryLabels(ro, "ro"),
};

/** Server-safe dictionary lookup; falls back to the default locale for unknown values. */
export function getDictionary(locale: string | undefined | null): Dictionary {
  return DICTIONARIES[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

export type { Dictionary };
