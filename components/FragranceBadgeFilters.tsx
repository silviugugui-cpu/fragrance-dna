"use client";

import { useLanguage } from "@/lib/i18n";
import { BADGE_CODES, BADGE_FAMILIES, type BadgeFilters } from "@/lib/fragranceBadges";
import AnchoredSelect from "./design-system/AnchoredSelect";

export default function FragranceBadgeFilters({
  filters, onChange, anchored = false,
}: { filters: BadgeFilters; onChange?: (filters: BadgeFilters) => void; anchored?: boolean }) {
  const { t } = useLanguage();
  const copy = t.fragrances.badges;
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      {BADGE_FAMILIES.map((family) => (
        <label key={family} className="min-w-0 text-xs text-[color:var(--public-ink-secondary,#dacfb7)]">
          {copy[family]}
          {anchored && onChange ? <AnchoredSelect label={copy[family]} value={filters[family] ?? ""}
            onChange={(value) => onChange({ ...filters, [family]: value })} className="mt-2"
            options={[{ value: "", label: copy.any }, ...BADGE_CODES[family].map((code, index) => ({
              value: code, label: index ? copy[`${family}Levels`][index - 1] : copy.undefined,
            }))]} /> : <select name={family} aria-label={copy[family]}
            {...(onChange ? {
              value: filters[family] ?? "",
              onChange: (event: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...filters, [family]: event.target.value }),
            } : { defaultValue: filters[family] ?? "" })}
            className="mt-2 block w-full rounded-xl border border-current bg-[rgb(var(--public-surface-channels,25,20,16))] p-3 text-sm">
            <option value="">{copy.any}</option>
            {BADGE_CODES[family].map((code, index) => (
              <option key={code} value={code}>{index ? copy[`${family}Levels`][index - 1] : copy.undefined}</option>
            ))}
          </select>}
        </label>
      ))}
    </div>
  );
}
