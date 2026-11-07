"use client";

import Link from "next/link";
import type { PublicFragrance } from "@/lib/database/publicFragrances";
import type { CreatorCredit } from "@/lib/data/perfumerEvidence";
import { useLanguage } from "@/lib/i18n";
import { getFragrancePageCopy } from "@/lib/i18n/fragrancePageCopy";
import { PerfumeImageWithFallback } from "@/components/design-system/PerfumeImageWithFallback";
import FragranceBadges from "@/components/FragranceBadges";
import FragranceRelationships from "@/components/FragranceRelationships";
import PerfumerCredits from "@/components/PerfumerCredits";
import { getPerfumeImageCandidates } from "@/lib/design/perfumeImage";

export default function FragranceProfileClient({ fragrance, credits, returnPerfumer }: {
  fragrance: PublicFragrance; credits: Array<Pick<CreatorCredit, "name">>;
  returnPerfumer?: { slug: string; name: string };
}) {
  const { locale, t } = useLanguage();
  const copy = getFragrancePageCopy(locale);
  const detail = t.fragrances.detail;
  const dna = Object.entries(fragrance.dnaAxes ?? {});
  const rows = [
    [detail.launched, fragrance.launchYear],
    [detail.audience, fragrance.gender],
    [detail.category, fragrance.brandType],
  ].filter(([, value]) => Boolean(value));
  const noteStages = [
    { label: detail.topNotes, notes: fragrance.notesByStage?.top ?? [] },
    { label: detail.heartNotes, notes: fragrance.notesByStage?.heart ?? [] },
    { label: detail.baseNotes, notes: fragrance.notesByStage?.base ?? [] },
  ].filter((stage) => stage.notes.length > 0);
  const heading = "font-articles-heading text-[color:var(--public-ink-primary,#f4deb2)]";
  const muted = "text-[color:var(--public-ink-secondary,#dacfb7)]";
  return (
    <main className="relative mx-auto w-[90vw] max-w-[1100px] pb-16 pt-8 lg:pt-10">
      <Link href={returnPerfumer ? `/articles/perfumers/${returnPerfumer.slug}` : "/fragrances"} className={`mb-5 inline-block rounded-full border border-current px-4 py-2 text-sm ${muted}`}>&larr; {returnPerfumer?.name ?? copy.back}</Link>
      <article className="rounded-[28px] border border-[color:var(--public-border,rgba(180,145,85,0.4))] bg-[rgba(var(--public-surface-channels,20,15,10),0.95)] p-6 sm:p-9">
        <div className="grid gap-8 sm:grid-cols-[220px_minmax(0,1fr)]">
          <PerfumeImageWithFallback candidates={getPerfumeImageCandidates(fragrance)}
            alt={`${fragrance.brand} ${fragrance.perfume}`} className="h-64 w-full rounded-2xl bg-white object-contain p-4" />
          <header className="min-w-0">
            <p className={`text-sm uppercase tracking-widest ${muted}`}>{fragrance.brand}</p>
            <h1 className={`${heading} mt-2 text-3xl sm:text-5xl`}>{fragrance.perfume}</h1>
            <dl className={`mt-5 space-y-3 text-sm ${muted}`}>
              {rows.map(([label, value]) => <div key={label}><dt className="inline font-semibold">{label}: </dt><dd className="inline">{value}</dd></div>)}
              {(credits.length > 0 || fragrance.perfumer) && <div>
                <dt className="inline font-semibold">{detail.perfumer}: </dt>
                <dd className="inline">{credits.length ? <PerfumerCredits credits={credits} /> : fragrance.perfumer}</dd>
              </div>}
            </dl>
            <div className="mt-5"><FragranceBadges badges={fragrance.badges} /></div>
          </header>
        </div>
        {fragrance.description && <section className="mt-8">
          <h2 className={`${heading} text-2xl`}>{detail.about}</h2>
          <p className={`mt-3 whitespace-pre-line leading-relaxed ${muted}`}>{fragrance.description}</p>
        </section>}
        {fragrance.mainAccords.length > 0 && <section className="mt-8">
          <h2 className={`${heading} text-2xl`}>{detail.mainAccords}</h2>
          <ul className={`mt-3 flex flex-wrap gap-2 ${muted}`}>{fragrance.mainAccords.map((accord) =>
            <li key={accord} className="rounded-full border border-current px-3 py-1 text-sm">{t.fragrances.accordLabels[accord] ?? accord}</li>)}</ul>
        </section>}
        {noteStages.length > 0 ? <section className="mt-8">
          <h2 className={`${heading} text-2xl`}>{t.articles.houses.notes}</h2>
          <dl className={`mt-3 grid gap-3 sm:grid-cols-3 ${muted}`}>{noteStages.map(({ label, notes }) =>
            <div key={label}>
              <dt className="font-semibold">{label}</dt>
              <dd className="mt-1">{notes.join(", ")}</dd>
            </div>)}</dl>
        </section> : fragrance.notes.length > 0 && <section className="mt-8">
          <h2 className={`${heading} text-2xl`}>{t.articles.houses.notes}</h2>
          <p className={`mt-3 ${muted}`}>{fragrance.notes.join(", ")}</p>
        </section>}
        {dna.length > 0 && <section className="mt-8">
          <h2 className={`${heading} text-2xl`}>{detail.dnaProfile}</h2>
          <dl className={`mt-3 grid gap-3 sm:grid-cols-2 ${muted}`}>{dna.map(([axis, value]) =>
            <div key={axis} className="flex justify-between gap-4 border-b border-current pb-2"><dt>{t.common.axes[axis] ?? axis}</dt><dd>{value}</dd></div>)}</dl>
        </section>}
        <div className={muted}><FragranceRelationships relationships={fragrance.relationships} /></div>
      </article>
    </main>
  );
}
