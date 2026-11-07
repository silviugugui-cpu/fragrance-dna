"use client";

import Link from "next/link";
import { topPerfumerProfiles } from "@/lib/data/topPerfumerProfiles";
import { normalizeCreator, type CreatorCredit } from "@/lib/data/perfumerEvidence";
import { useLanguage } from "@/lib/i18n";

export default function PerfumerCredits({ credits }: { credits: Array<Pick<CreatorCredit, "name">> }) {
  const { locale } = useLanguage();
  return <>{credits.map((credit, index) => {
    const profile = topPerfumerProfiles.find((item) => normalizeCreator(item.name) === normalizeCreator(credit.name));
    return <span key={`${credit.name}:${index}`}>
      {index > 0 && " · "}
      {profile
        ? <Link href={`/articles/perfumers/${profile.slug}`} className="underline underline-offset-4">{credit.name}</Link>
        : <span>{credit.name}</span>}
    </span>;
  })}</>;
}
