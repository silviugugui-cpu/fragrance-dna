"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { territories } from "@/lib/data/territories";
import { filterOccasions, occasions, type OccasionFilters } from "@/lib/data/occasions";
import { getOccasionCopy, getOccasionText, getOccasionNoteLabel } from "@/lib/data/occasionTranslations";
import ArticlesRail from "../ArticlesRail";
import ArticlesIntroHero from "../ArticlesIntroHero";
import { articlesMenuItems } from "../articlesMenu";

const initialFilters: OccasionFilters = { occasion: "", season: "", setting: "", time: "", territory: "" };
const panel = "rounded-3xl border border-[color:var(--public-border,rgba(180,145,85,0.4))] bg-[rgba(var(--public-surface-channels,10,10,10),0.55)]";
const chip = "rounded-full border border-current px-3 py-1 text-xs";

export default function OccasionsClient({ availableNotes }: { availableNotes: string[] }) {
  const { locale, t } = useLanguage();
  const copy = getOccasionCopy(locale);
  const [filters, setFilters] = useState(initialFilters);
  const filtered = filterOccasions(filters);
  const territoryList = Object.values(territories);
  const controls: Array<{ key: keyof OccasionFilters; label: string; options: Array<{ value: string; label: string }> }> = [
    { key: "occasion", label: copy.menu, options: occasions.map((item, index) => ({ value: item.id, label: getOccasionText(item, index, locale).title })) },
    { key: "season", label: copy.season, options: ["spring", "summer", "fall", "winter"].map((value, index) => ({ value, label: [copy.spring, copy.summer, copy.fall, copy.winter][index] })) },
    { key: "setting", label: copy.setting, options: [{ value: "indoors", label: copy.indoors }, { value: "outdoors", label: copy.outdoors }] },
    { key: "time", label: copy.time, options: [{ value: "day", label: copy.day }, { value: "evening", label: copy.evening }] },
    { key: "territory", label: copy.territories, options: territoryList.map((item) => ({ value: item.id, label: t.territoryData[item.id].name })) },
  ];

  return (
    <main lang={locale} className="relative mx-auto w-[90vw] max-w-[1600px] pb-16 pt-8 text-[color:var(--public-ink-primary,#f2ddb1)] lg:pt-10">
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
        <aside className="articles-brand-rail-shell">
          <ArticlesRail>
            <p className="text-center text-[10px] uppercase tracking-[0.28em]">{t.articles.menu.passionMenu}</p>
            <nav aria-label={t.articles.menu.passionMenu} className="mt-6 flex flex-col gap-3">
              {articlesMenuItems.map((item) => {
                const entry = t.articles.menu.items[item.key];
                const active = item.href === "/articles/occasions";
                return <Link key={item.key} href={item.href} aria-current={active ? "page" : undefined} data-active={String(active)} className="articles-rail-button">
                  <span>{entry.label}</span>
                </Link>;
              })}
            </nav>
          </ArticlesRail>
        </aside>
        <div className="articles-content-column min-w-0">
          <div className="mb-5">
            <ArticlesIntroHero imageSrc="/images/occasions-of-wear-pop-art.png" />
          </div>
          <section className="mb-5">
            <div className={`${panel} p-6 sm:p-10`}>
              <p className="font-articles-body text-xs uppercase tracking-[0.2em]">{copy.menu}</p>
              <h1 className="mt-3 font-articles-heading text-[clamp(2rem,4vw,3.8rem)] leading-tight">{copy.title}</h1>
              <p className="mt-5 max-w-4xl font-articles-body leading-relaxed">{copy.intro}</p>
            </div>
          </section>
          <div className={`${panel} mb-5 p-5`}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {controls.map((control) => <label key={control.key} className="min-w-0 text-sm">
                <span className="mb-2 block">{control.label}</span>
                <select value={filters[control.key]} onChange={(event) => setFilters({ ...filters, [control.key]: event.target.value })}
                  className="w-full rounded-xl border border-current bg-[rgb(var(--public-surface-channels,21,18,13))] px-3 py-3">
                  <option value="">{copy.all}</option>
                  {control.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>)}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p role="status" aria-live="polite">{filtered.length} / {occasions.length}</p>
              <button type="button" onClick={() => setFilters(initialFilters)} className={`${chip} py-2`}>{copy.reset}</button>
            </div>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            {filtered.map((item) => {
              const text = getOccasionText(item, occasions.indexOf(item), locale);
              const notes = item.noteExamples.filter((note) => availableNotes.includes(note.toLowerCase()));
              return <article id={item.id} key={item.id} className={`${panel} overflow-hidden`}>
                <div className="relative aspect-[4/3]">
                  <Image src={item.imagePath} alt={text.imageAlt} fill sizes="(min-width:1280px) 40vw, (min-width:1024px) 70vw, 90vw" className="object-cover" />
                </div>
                <div className="space-y-5 p-5 sm:p-7">
                  <div>
                    <h2 className="font-articles-heading text-2xl">{text.title}</h2>
                    <p className="mt-3 leading-relaxed">{text.summary}</p>
                  </div>
                  <div><h3 className="font-semibold">{copy.lookFor}</h3><p className="mt-2 leading-relaxed">{text.guidance}</p></div>
                  <div><h3 className="mb-3 text-sm font-semibold">{copy.territories}</h3>
                    <ul className="flex flex-wrap gap-2">{item.territoryIds.map((id) => <li key={id}><Link href={`/articles/territories#${id}`} className={`${chip} inline-block hover:underline`}>{t.territoryData[id].name}</Link></li>)}</ul>
                  </div>
                  {notes.length > 0 && <div><h3 className="mb-3 text-sm font-semibold">{copy.notes}</h3><ul className="flex flex-wrap gap-2">{notes.map((note) => <li key={note} className={chip}>{getOccasionNoteLabel(note, locale)}</li>)}</ul></div>}
                  <div><h3 className="mb-3 text-sm font-semibold">{copy.axes}</h3><ul className="flex flex-wrap gap-2">{item.axisIds.map((id) => <li key={id} className={chip}>{t.common.axes[id]}</li>)}</ul></div>
                  <div className="border-t border-current pt-4"><h3 className="text-sm font-semibold">{copy.tip}</h3><p className="mt-2 text-sm leading-relaxed">{text.applicationTip}</p></div>
                </div>
              </article>;
            })}
          </div>
          {filtered.length === 0 && <p className={`${panel} p-8`} role="status">{copy.empty}</p>}
          <div className={`${panel} mt-6 space-y-4 p-6`}>
            <p className="text-sm leading-relaxed">{copy.notice}</p>
            <Link href="/fragrances" className={`${chip} inline-block py-3`}>{copy.catalog}</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
