"use client";

import Link from "next/link";
import { topPerfumerProfiles } from "@/lib/data/topPerfumerProfiles";
import { normalizeCreator, type CreatorCredit } from "@/lib/data/perfumerEvidence";
import { useLanguage } from "@/lib/i18n";
import { getFragrancePageCopy } from "@/lib/i18n/fragrancePageCopy";

export default function PerfumerCredits({ credits }: { credits: CreatorCredit[] }) {
  const { locale } = useLanguage();
  const copy = getFragrancePageCopy(locale);
  return <>{credits.map((credit, index) => {
    const profile = topPerfumerProfiles.find((item) => normalizeCreator(item.name) === normalizeCreator(credit.name));
    return <span key={`${credit.name}:${credit.source}`}>
      {index > 0 && " · "}
      {profile
        ? <Link href={`/articles/perfumers/${profile.slug}`} className="underline underline-offset-4">{credit.name}</Link>
        : <span>{credit.name}</span>}
      {" — "}<a href={credit.source} target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-4">{copy.attribution}</a>
    </span>;
  })}</>;
}
