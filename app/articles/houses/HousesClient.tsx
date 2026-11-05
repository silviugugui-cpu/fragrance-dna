"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import type { DupeEvidence, EditorialHouse, readEditorialHouseCatalog } from "@/lib/database/curatedCatalog";
import { PerfumeImageWithFallback } from "@/components/design-system/PerfumeImageWithFallback";
import { territories } from "@/lib/data/territories";
import ArticlesRail from "../ArticlesRail";
import { articlesMenuItems } from "../articlesMenu";
import FragranceBadges from "@/components/FragranceBadges";
import FragranceBadgeFilters from "@/components/FragranceBadgeFilters";
import type { BadgeFilters } from "@/lib/fragranceBadges";
import { getFragranceHref } from "@/lib/fragranceNavigation";
import { getFragrancePageCopy } from "@/lib/i18n/fragrancePageCopy";
import { getPerfumeImageCandidates } from "@/lib/design/perfumeImage";

type Catalog = NonNullable<ReturnType<typeof readEditorialHouseCatalog>>;
const panel = "rounded-3xl border border-[color:var(--public-border,rgba(180,145,85,0.4))] bg-[rgba(var(--public-surface-channels,25,20,16),0.8)] p-5 sm:p-7";
const muted = "text-[color:var(--public-ink-secondary,#dacfb7)]";
const heading = "font-articles-heading text-[color:var(--public-ink-primary,#f4ddb2)]";
const textList = (value: unknown): string[] => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === "string") : [];

export default function HousesClient({
  houses = [], catalog, query = "", filters = {}, initialCategory = "",
}: { houses?: EditorialHouse[]; catalog?: Catalog; query?: string; filters?: BadgeFilters; initialCategory?: string }) {
  const { t, locale } = useLanguage();
  const copy = t.articles.houses;
  const fragranceCopy = getFragrancePageCopy(locale);
  const pathname = usePathname();
  const [search, setSearch] = useState(query);
  const [category, setCategory] = useState(initialCategory);
  const categories: Record<string, string> = {
    "Nișă": t.fragrances.categoryOptions.niche,
    Dupe: t.fragrances.categoryOptions.dupe,
    Designer: t.fragrances.categoryOptions.designer,
  };
  const hasBadgeFilters = Object.values(filters).some(Boolean);
  const filtered = houses.filter((house) => (!category || house.category === category)
    && house.name.toLocaleLowerCase().includes(search.toLocaleLowerCase().trim())
    && (!hasBadgeFilters || (house.matchingCount ?? house.count) > 0));
  const filterParams = Object.fromEntries(Object.entries(filters).filter(([, value]) => Boolean(value)));
  const directoryLink = `/articles/houses?${new URLSearchParams(filterParams)}`;
  const houseLink = (id: string) => `/articles/houses/${id}?${new URLSearchParams(filterParams)}`;
  const territoryLabel = (id: string): string => {
    const territory = Object.values(territories).find((item) => item.id === id);
    return territory ? t.territoryData[id]?.name ?? territory.name : id;
  };
  const pageLink = (page: number): string =>
    `${pathname}?${new URLSearchParams({ ...filterParams, q: query, page: String(page) })}`;
  const houseAccords = catalog
    ? catalog.houseAccords.map((accord) => t.fragrances.accordLabels[accord] ?? accord).join(", ")
    : "";
  const renderSimilarity = (similarity: DupeEvidence, index: number) => similarity.status === "pending_research" ? (
    <p key={index} className={`mt-4 text-xs ${muted}`}>{copy.pending}</p>
  ) : similarity.source && (
    <div key={index} className={`mt-4 rounded-xl border border-current p-3 text-sm ${muted}`}>
      <p>{similarity.status === "brand_claimed_inspired_by" ? copy.brandClaim : copy.similarity}</p>
      <p className="mt-1 font-semibold"><Link href={similarity.referenceHref ?? getFragranceHref(null, similarity.referenceBrand ?? "", similarity.referencePerfume ?? "")} className="underline">{similarity.referenceBrand} · {similarity.referencePerfume}</Link></p>
      {similarity.summary && <p className="mt-2">{similarity.summary}</p>}
      <a href={similarity.source} className="mt-2 inline-block underline" target="_blank" rel="noopener noreferrer">{fragranceCopy.evidence}</a>
      {similarity.sourceType && <p className="mt-1 text-xs">{similarity.sourceType}</p>}
    </div>
  );

  return (
    <main className="relative mx-auto w-[90vw] max-w-[1600px] pb-16 pt-8">
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="articles-brand-rail-shell">
          <ArticlesRail>
            <p className={`text-center text-xs uppercase tracking-widest ${muted}`}>{t.articles.menu.passionMenu}</p>
            <nav aria-label={t.articles.menu.passionMenu} className="mt-6 flex flex-col gap-3">
              {articlesMenuItems.map((item) => {
                const entry = t.articles.menu.items[item.key];
                const active = item.href === "/articles/houses";
                return (
                  <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                    data-active={active ? "true" : "false"} className="articles-rail-button rounded-2xl border px-4 py-4">
                    <span className={`${heading} block text-lg`}>{entry.label}</span>
                    <span className={`mt-2 block text-xs ${muted}`}>{entry.hint}</span>
                  </Link>
                );
              })}
            </nav>
          </ArticlesRail>
        </aside>
        <div className="articles-content-column min-w-0 space-y-6">
          <header className={panel}>
            {catalog && <Link href={directoryLink} className={`text-sm underline ${muted}`}>{copy.back}</Link>}
            <h1 className={`${heading} mt-3 text-3xl sm:text-5xl`}>{catalog?.house.name ?? copy.title}</h1>
            <p className={`mt-4 leading-relaxed ${muted}`}>{copy.intro}</p>
            <p role="note" className="mt-4 rounded-xl border border-amber-500/30 p-3 text-sm text-[color:var(--public-ink-secondary,#e4c891)]">
              {copy.notice}
            </p>
          </header>
          {!catalog ? (
            <>
              <form action={pathname} method="get" className={`${panel} flex flex-wrap items-end gap-4`}>
                <label className={`flex-1 ${muted}`}>
                  {copy.search}
                  <input name="q" value={search} onChange={(event) => setSearch(event.target.value)} type="search"
                    className="mt-2 block w-full rounded-xl border border-current bg-transparent p-3" />
                </label>
                <label className={muted}>
                  {t.fragrances.search.category}
                  <select name="category" value={category} onChange={(event) => setCategory(event.target.value)}
                    className="mt-2 block rounded-xl border border-current bg-[rgb(var(--public-surface-channels,25,20,16))] p-3">
                    <option value="">{t.fragrances.categoryOptions.all}</option>
                    {Object.entries(categories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                  </select>
                </label>
                <p aria-live="polite" className={muted}>{filtered.length} / {houses.length}</p>
                <FragranceBadgeFilters key={JSON.stringify(filters)} filters={filters} />
                <button className={`rounded-xl border border-current p-3 ${muted}`} type="submit">{copy.searchAction}</button>
                <Link href="/articles/houses" className={`text-sm underline ${muted}`}>{t.fragrances.search.clearFilters}</Link>
                <p className={`w-full text-xs ${muted}`}>{t.fragrances.badges.note}</p>
              </form>
              {filtered.length === 0 && <p className={`${panel} ${muted}`}>{copy.noResults}</p>}
              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((house) => (
                  <article key={house.id} className={`${panel} overflow-hidden`}>
                    <Link href={houseLink(house.id)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={house.image} alt={house.name} width={600} height={400} loading="lazy"
                        className="aspect-[3/2] w-full rounded-xl object-cover" />
                      <p className={`mt-4 text-xs uppercase tracking-widest ${muted}`}>{categories[house.category]}</p>
                      <h2 className={`${heading} mt-2 text-2xl`}>{house.name}</h2>
                    </Link>
                    <p className={`mt-3 text-sm ${muted}`}>{copy.catalog}: {house.matchingCount ?? house.count} / {house.count}</p>
                  </article>
                ))}
              </section>
            </>
          ) : (
            <>
              <section className={`${panel} grid gap-5 md:grid-cols-[minmax(0,1fr)_2fr]`}>
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={catalog.house.image} alt={catalog.house.name} width={600} height={400} className="w-full rounded-xl" />
                  <figcaption className={`mt-2 text-xs ${muted}`}>{copy.art}</figcaption>
                </figure>
                <div className={muted}>
                  <p>{categories[catalog.house.category]} · {copy.catalog}: {catalog.house.count}</p>
                  <div className="mt-4">
                    <h2 className={`${heading} text-xl`}>{copy.description}</h2>
                    <p data-house-description lang={locale} className="mt-3 leading-relaxed">
                      {copy.editorialDescription(catalog.house.name, houseAccords)}
                    </p>
                  </div>
                  {catalog.house.website && (
                    <div className="mt-4 text-sm">
                      <p>{copy.website}</p>
                      <a href={catalog.house.website} target="_blank" rel="noopener noreferrer" className="break-all underline">
                        {catalog.house.website}
                      </a>
                    </div>
                  )}
                </div>
              </section>
              <form action={pathname} method="get" className={`${panel} flex flex-wrap items-end gap-3`}>
                <label className={`flex-1 ${muted}`}>{copy.fragranceSearch}
                  <input key={query} name="q" defaultValue={query} type="search" maxLength={200}
                    className="mt-2 block w-full rounded-xl border border-current bg-transparent p-3" />
                </label>
                <FragranceBadgeFilters key={JSON.stringify(filters)} filters={filters} />
                <button className={`rounded-xl border border-current p-3 ${muted}`} type="submit">{copy.searchAction}</button>
                <Link href={pathname} className={`text-sm underline ${muted}`}>{t.fragrances.search.clearFilters}</Link>
                <p className={`w-full text-xs ${muted}`}>{t.fragrances.badges.note}</p>
              </form>
              <p className={muted} aria-live="polite">{copy.catalog}: {catalog.total}</p>
              {catalog.fragrances.length === 0 && <p className={`${panel} ${muted}`}>{copy.noResults}</p>}
              <section className="grid gap-5 xl:grid-cols-2">
                {catalog.fragrances.map(({ rowId, record, details, badges }) => (
                  <article key={rowId} id={`fragrance-${rowId}`} className={panel}>
                    <div className="flex items-start gap-4">
                      <PerfumeImageWithFallback candidates={getPerfumeImageCandidates(record)}
                        alt={`${record.brand} ${record.perfume}`} className="h-36 w-28 shrink-0 rounded-xl bg-white object-contain p-2" />
                      <div className="min-w-0">
                        <h2 className={`${heading} text-2xl`}><Link href={getFragranceHref(record.id, record.brand, record.perfume)} className="underline underline-offset-4">{record.perfume}</Link></h2>
                        <dl className={`mt-3 space-y-2 text-sm ${muted}`}>
                          {record.launchYear && <div><dt className="inline">{t.fragrances.detail.launched}: </dt><dd className="inline">{record.launchYear}</dd></div>}
                          {record.perfumer && <div><dt className="inline">{t.fragrances.detail.perfumer}: </dt><dd className="inline">{record.perfumer}</dd></div>}
                        </dl>
                      </div>
                      <FragranceBadges badges={badges} />
                    </div>
                    {record.description && <p className={`mt-4 text-sm leading-relaxed ${muted}`}>{record.description}</p>}
                    {textList(record.mainAccords).length > 0 && <p className={`mt-4 text-sm ${muted}`}>
                      <strong>{t.fragrances.detail.mainAccords}: </strong>{textList(record.mainAccords).join(", ")}
                    </p>}
                    {textList(record.notes).length > 0 && <p className={`mt-3 text-sm ${muted}`}>
                      <strong>{copy.notes}: </strong>{textList(record.notes).join(", ")}
                    </p>}
                    {details.sourceUrl && <a className={`mt-3 inline-block text-sm underline ${muted}`} href={details.sourceUrl}
                      target="_blank" rel="noopener noreferrer">{copy.source}</a>}
                    {details.territories.length > 0 && (
                      <details className={`mt-4 text-sm ${muted}`}>
                        <summary className="cursor-pointer underline">{copy.territories}</summary>
                        <ul className="mt-3 space-y-3">
                          {details.territories.map((suggestion) => (
                            <li key={suggestion.id}>
                              <Link href="/articles/territories" className="font-semibold underline">{territoryLabel(suggestion.id)}</Link>
                              <p>{copy.evidence}: {suggestion.evidence.join(", ")}</p>
                              <p>{copy.method}: {suggestion.method}</p>
                              <p>{copy.confidence}: {suggestion.confidence} · {copy.reviewStatus}: {suggestion.status}</p>
                              {suggestion.source && <a href={suggestion.source} target="_blank" rel="noopener noreferrer" className="underline">{copy.source}</a>}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                    {details.similarities.map(renderSimilarity)}
                  </article>
                ))}
              </section>
              <nav className={`flex items-center justify-between gap-4 ${muted}`} aria-label={copy.page}>
                {catalog.page > 1 ? <Link className="underline" href={pageLink(catalog.page - 1)}>{copy.previous}</Link> : <span />}
                <span>{copy.page} {catalog.page} / {catalog.pages}</span>
                {catalog.page < catalog.pages ? <Link className="underline" href={pageLink(catalog.page + 1)}>{copy.next}</Link> : <span />}
              </nav>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
