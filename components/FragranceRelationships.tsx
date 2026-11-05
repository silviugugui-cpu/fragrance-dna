"use client";

import Link from "next/link";
import type { PublicFragranceRelationship } from "@/lib/database/publicFragrances";
import { useLanguage } from "@/lib/i18n";
import { getFragrancePageCopy } from "@/lib/i18n/fragrancePageCopy";

export default function FragranceRelationships({ relationships }: { relationships: PublicFragranceRelationship[] }) {
  const { locale, t } = useLanguage();
  const copy = getFragrancePageCopy(locale);
  return <>{relationships.map((relation) => (
    <div key={`${relation.type}:${relation.source}:${relation.href}`} className="mt-4 text-sm">
      <p>{relation.type === "resembles" ? t.articles.houses.similarity
        : relation.type === "clone_of" ? copy.cloneOf : t.articles.houses.brandClaim}:{" "}
        <Link href={relation.href} className="underline underline-offset-4">
          {relation.referenceBrand} · {relation.referencePerfume}
        </Link>
      </p>
      <a href={relation.source} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs underline underline-offset-4">{copy.evidence}</a>
    </div>
  ))}</>;
}
