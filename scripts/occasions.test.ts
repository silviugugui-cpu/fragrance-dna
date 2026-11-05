import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { occasions, filterOccasions, type OccasionFilters } from "../lib/data/occasions";
import { getOccasionCopy, getOccasionText, getOccasionNoteLabel } from "../lib/data/occasionTranslations";
import { territories } from "../lib/data/territories";
import { LOCALES } from "../lib/i18n/config";
import { getDictionary } from "../lib/i18n/getDictionary";
import { articlesMenuItems } from "../app/articles/articlesMenu";
import sitemap from "../app/sitemap";

const empty: OccasionFilters = { occasion: "", season: "", time: "", setting: "", territory: "" };

test("eight occasion guides use canonical territories and axes with complete local PNG artwork", () => {
  assert.equal(occasions.length, 8);
  assert.equal(new Set(occasions.map((item) => item.id)).size, 8);
  const ids = new Set(Object.values(territories).map((territory) => territory.id));
  const axes = getDictionary("en").common.axes;
  for (const item of occasions) {
    assert.ok(item.territoryIds.every((id) => ids.has(id)), item.id);
    assert.ok(item.axisIds.every((id) => id in axes && id !== "Presence"), item.id);
    assert.equal(item.imagePath, `/images/occasions/${item.id}.png`);
    const bytes = fs.readFileSync(path.join(process.cwd(), "public", ...item.imagePath.split("/")));
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  }
});

test("every locale has localized page text and eight complete occasion translations", () => {
  for (const locale of LOCALES) {
    const copy = getOccasionCopy(locale);
    assert.ok(Object.values(copy).every((text) => typeof text === "string" && text.length > 0));
    const menu = getDictionary(locale).articles.menu.items.occasions;
    assert.equal(copy.menu, menu.label);
    occasions.forEach((item, index) => {
      const text = getOccasionText(item, index, locale);
      assert.ok(Object.values(text).every((value) => value.length > 10), `${locale}/${item.id}`);
      if (locale !== "en") assert.notEqual(text.guidance, item.guidance.en);
      item.noteExamples.forEach((note) => assert.ok(getOccasionNoteLabel(note, locale).length > 1));
    });
  }
});

test("occasion filters combine, account for mixed settings and anytime, and reset without mutation", () => {
  assert.equal(filterOccasions(empty).length, 8);
  assert.equal(filterOccasions({ ...empty, occasion: "outdoors-warm-days", season: "winter" }).length, 0);
  assert.equal(filterOccasions({ ...empty, occasion: "outdoors-warm-days", season: "summer", setting: "outdoors", time: "day", territory: "fresh-citrus" }).length, 1);
  assert.equal(filterOccasions({ ...empty, occasion: "work-study", setting: "outdoors" }).length, 0);
  assert.equal(filterOccasions({ ...empty, occasion: "everyday", setting: "outdoors", time: "evening" }).length, 1);
  assert.equal(filterOccasions({ ...empty, occasion: "formal-occasions", time: "day" }).length, 1);
  assert.equal(filterOccasions({ ...empty, occasion: "missing" }).length, 0);
  assert.equal(filterOccasions(empty).length, 8);
});

test("Discover menu and sitemap expose exactly one occasion route", () => {
  assert.deepEqual(articlesMenuItems[0], { href: "/fragrances", key: "fragrances" });
  assert.equal(articlesMenuItems.filter((item) => item.key === "fragrances").length, 1);
  for (const locale of LOCALES) assert.ok(getDictionary(locale).articles.menu.items.fragrances.label);
  assert.equal(articlesMenuItems.filter((item) => item.href === "/articles/occasions").length, 1);
  assert.equal(sitemap().filter((entry) => entry.url === "https://olfactivedna.com/articles/occasions").length, 1);
});
