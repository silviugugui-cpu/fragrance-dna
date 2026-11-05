"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import type { EvidencedPerfumerProfile } from "@/lib/database/perfumerProfiles";
import { getDiscoveryCopy } from "@/lib/i18n/discoveryCopy";
import { getPerfumerText } from "@/lib/data/topPerfumerTranslations";
import PerfumerPortrait from "../PerfumerPortrait";
import { getPerfumerFragranceHref } from "@/lib/fragranceNavigation";
import PerfumerCredits from "@/components/PerfumerCredits";
import { getFragrancePageCopy } from "@/lib/i18n/fragrancePageCopy";

const panel = "rounded-3xl border border-[rgba(var(--public-champagne-channels,156,120,65),0.35)] bg-[rgba(var(--public-surface-channels,10,10,10),0.45)] p-6 sm:p-8";
const ink = "text-[color:var(--public-ink-primary,#f2ddb1)]";
const muted = "text-[color:var(--public-ink-secondary,#d9c7a2)]";
const caption = "font-articles-body text-xs text-[color:var(--public-ink-muted,#bb9660)]";

export default function PerfumerProfileClient({ profile }: { profile: EvidencedPerfumerProfile }) {
  const { locale, t } = useLanguage();
  const copy = t.articles.perfumers.directory;
  const text = getPerfumerText(profile, locale);
  const discovery = getDiscoveryCopy(locale);
  const fragranceCopy = getFragrancePageCopy(locale);

  return (
    <main className="relative mx-auto w-[90vw] max-w-[1200px] pb-16 pt-8 lg:pt-10">
      <Link href="/articles/perfumers" className={`mb-5 inline-flex rounded-full border border-current px-4 py-2 text-xs ${muted}`}>
        &larr; {copy.all}
      </Link>
      <section className="overflow-hidden rounded-[28px] border border-[rgba(var(--public-champagne-channels,159,123,68),0.45)] bg-[rgba(var(--public-surface-channels,10,10,10),0.55)]">
        <div className="grid lg:grid-cols-[minmax(300px,0.85fr)_1.15fr]">
          <div className="relative min-h-[420px] bg-[rgba(var(--public-surface-channels,10,10,10),0.6)] lg:min-h-[650px]">
            <PerfumerPortrait key={profile.slug} profile={profile} priority />
          </div>
          <div className="min-w-0 p-6 sm:p-9 lg:p-12">
            <p className={caption}>{discovery.profile} · {profile.rank === null ? discovery.notRanked : copy.profileRank(profile.rank)}</p>
            <h1 className={`mt-3 font-articles-heading text-[clamp(2rem,4vw,3.6rem)] leading-tight ${ink}`}>{profile.name}</h1>
            <div className={`mt-5 flex flex-wrap gap-2 text-xs ${muted}`}>
              <span className="rounded-full border border-current px-3 py-1.5">{profile.topCreations} {discovery.top}</span>
            </div>
            <div data-perfumer-biography lang={locale} className={`mt-8 space-y-4 font-articles-body text-base leading-relaxed ${ink}`}>
              <p>{text.bio}</p>
              <p>{text.approach}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-6">
        <div className={panel}>
          <h2 className={`mt-2 font-articles-heading text-2xl ${ink}`}>{discovery.works}</h2>
          <p className={`mt-3 text-sm ${muted}`}>{discovery.rankingHelp}</p>
          <ul className="mt-5">
            {profile.works.map((creation) => (
              <li key={creation.id} className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[color:var(--public-border,rgba(180,145,85,0.4))] py-3 ${ink}`}>
                <Link href={getPerfumerFragranceHref(creation.recordId, creation.brand, creation.name, profile.slug)} className="underline underline-offset-4">{creation.name}</Link>
                <Link href={getPerfumerFragranceHref(creation.recordId, creation.brand, creation.name, profile.slug)} className={`text-sm underline underline-offset-4 ${muted}`}>{creation.brand}</Link>
                <span className={`w-full text-sm ${muted}`}><PerfumerCredits credits={creation.credits} /></span>
              </li>
            ))}
          </ul>
          {!profile.works.length && <p className={`mt-4 ${muted}`}>{discovery.noWorks}</p>}
        </div>
      </section>
      <section className={`mt-6 ${panel}`}>
        <h2 className={`font-articles-heading text-2xl ${ink}`}>{discovery.sources}</h2>
        <a href={profile.biographySourceUrl} target="_blank" rel="noopener noreferrer" className={`mt-4 inline-block underline underline-offset-4 ${muted}`}>{discovery.biography} — {new URL(profile.biographySourceUrl).hostname}</a>
        <p className={`mt-3 text-sm ${muted}`}>{discovery.attribution}: {discovery.works}</p>
        <ul className="mt-3 flex flex-wrap gap-3">
          {[...new Set(profile.works.flatMap((work) => work.credits.map((credit) => credit.source)))].map((source) => <li key={source}><a href={source} target="_blank" rel="noopener noreferrer" className={`text-sm underline underline-offset-4 ${muted}`}>{fragranceCopy.attribution} — {new URL(source).pathname.split("/").filter(Boolean).pop()}</a></li>)}
        </ul>
      </section>
    </main>
  );
}
