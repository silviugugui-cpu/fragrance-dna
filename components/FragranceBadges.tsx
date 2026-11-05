"use client";

import { useLanguage } from "@/lib/i18n";
import { BADGE_FAMILIES, badgeLevel, UNDEFINED_BADGES, type FragranceBadges as Badges } from "@/lib/fragranceBadges";

export default function FragranceBadges({ badges = UNDEFINED_BADGES }: { badges?: Badges }) {
  const { t } = useLanguage();
  const copy = t.fragrances.badges;
  return (
    <div className="mt-4 space-y-3 text-[color:var(--public-ink-primary,#ecdcbb)]" title={copy.note}>
      {BADGE_FAMILIES.map((family) => {
        const level = badgeLevel(family, badges[family]);
        const label = level ? copy[`${family}Levels`][level - 1] : copy.undefined;
        return (
          <div key={family} data-badge-family={family} data-badge-code={badges[family]}>
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
              <span className="text-[color:var(--public-ink-secondary,#dacfb7)]">{copy[family]}</span>
              <span className="rounded-full border border-current px-2 py-0.5 font-medium">{label}</span>
            </div>
            {level > 0 && (
              <div role="meter" aria-label={copy[family]} aria-valuemin={0} aria-valuemax={5}
                aria-valuenow={level} aria-valuetext={`${label} · ${copy.level(level)}`}
                className="mt-1.5 flex h-1.5 gap-1">
                {[1, 2, 3, 4, 5].map((step) => (
                  <span key={step} className="flex-1 rounded-full bg-current" style={{ opacity: step <= level ? 0.9 : 0.15 }} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
