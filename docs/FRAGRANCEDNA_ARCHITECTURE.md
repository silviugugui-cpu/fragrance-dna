# FragranceDNA Architecture

## Canonical Freeze Notice

Canonical Architecture v2 is frozen and implementation-ready.

Primary canonical references are:

* PRODUCT_DOCTRINE.md
* ARCHITECTURE_PRINCIPLES.md
* CANONICAL_ARCHITECTURE_V2.md
* DATA_MODEL.md
* EVENT_MODEL.md
* USER_DNA_MODEL.md
* FRAGRANCE_INTELLIGENCE_MODEL.md
* TEST_ENGINE_V2.md
* RECOMMENDATION_ENGINE_V2.md
* ENGINE_VERSIONING.md
* EXPLAINABILITY.md
* IMPLEMENTATION_ROADMAP.md
* ENGINEERING_GUIDELINES.md
* ADR/

In case of conflict, the v2 canonical references above take precedence for implementation decisions.

## Canonical Fragrance Source

MasterFragrancePool is the single source of truth.

Never create:

* duplicate fragrance databases
* parallel fragrance catalogs
* disconnected fragrance datasets

All fragrance systems must use the canonical pool.

---

## Collection Architecture

Collection stores references to fragrances.

Collection does NOT store duplicated fragrance metadata.

Example:

{
fragranceId: string,
personalRating?: number,
owned?: boolean,
wishlist?: boolean,
notes?: string
}

Brand, name, image and DNA attributes must come from the canonical fragrance database.

---

## Local AI Perfume Images

The batch image generator reads the canonical MasterFragrancePool and stores generated PNG assets under `public/images/ai-generated-perfumes`. It records the public asset path on the matching canonical fragrance records; it does not create a second catalog.

Generated images are artistic interpretations inspired by fragrance metadata, not verified photographs of retail bottles. The generator skips records with an existing usable local image, uses deterministic filenames, processes one image at a time, and can be safely resumed by running it again.

Set `OPENAI_API_KEY` in `.env.local`, preview the backlog with `npm run images:generate -- --dry-run`, and start with a small batch using `npm run images:generate -- --limit 5`. Use `npm run images:generate -- --all` only after reviewing the backlog and expected API usage. Each generated image is a billable API request. The current local catalog has tens of thousands of fragrances without a local image, so a full run can incur substantial API and storage costs; generated assets are written to the project and may significantly increase its size.

## Product photo transfers

`npx tsx scripts/importFragranceProductPhotos.ts --input EXTRACTED_TRANSFER_DIRECTORY`
validates a schema v1 photo manifest without changing image associations. Add
`--apply` to import. The importer matches `fragrance_id` to the canonical SQLite
record ID or key and verifies brand and perfume names before writing anything.
It refuses missing, ambiguous, or conflicting image assignments.

Product photos are stored in `public/images/product-photos` with content-hashed
filenames. Shared image files are stored once. The existing
`updateMasterFragranceLocalImage` helper updates both indexed local paths and
record JSON, including embedded User DNA profile image references. Existing
remote image URLs and all other fragrance metadata remain unchanged. The importer
backs up SQLite before applying updates in a single transaction and records source
URLs, checksums, and associations in
`data/generated/product-photo-import-report.json`. The SQLite database bundled
with a transfer is not a replacement for the canonical MasterFragrancePool.

## DNA Architecture

DNA Model v1 contains:

* Freshness
* Warmth
* Complexity
* Elegance
* Character
* Presence
* Comfort
* Uniqueness
* Versatility
* Luxury
* Formality

Always use canonical axis names.

---

## Recommendation Philosophy

### Exploratory territory affinity

The homepage links to `/dna#olfactory-territories`. This section ranks all ten
existing territories using the current user's evidence-backed DNA dashboard
values. It uses test DNA when evaluations exist, otherwise an interacted profile
or Grounding vector; a default session vector is not evidence. Profile hydration
and subsequent DNA updates refresh the calculation. No territory results are
shown for a profile without preference evidence.

The `calculateTerritoryAffinities` projection is an explainable exploratory
heuristic, not a calibrated recommendation probability: the score is the rounded
mean of the territory's unique associated canonical axes (0-100). Legacy
`Refinement` maps to `Elegance`, and `Sensuality` maps to `Comfort` as a provisional
descriptor proxy, not a claim that the concepts are identical. `Presence` is
excluded because the current dashboard derives it from confidence. Each card
shows its contributing scores; overall confidence is shown separately. Scores
are independent and do not sum to 100. This read-only display never mutates
Persistent User DNA or the canonical territory catalog.

Recommendations should be based on:

* DNA compatibility
* profile attributes
* collection coverage
* gap analysis

Never rely solely on popularity.

---

## Internationalization (i18n)

The public site supports 7 languages: English (default), French, German,
Spanish, Italian, Portuguese, and Romanian. The Studio admin area is
intentionally English-only.

* `lib/i18n/config.ts` — locale list, labels, `NEXT_LOCALE` cookie name.
* `lib/i18n/dictionaries/<locale>/<namespace>.ts` — one folder per locale,
  one file per namespace (common, header, home, grounding, test, dna,
  recommendations, fragrances, brands, collection, articles, faq,
  territories, auth, misc, territoryData). English defines the shape;
  `en/index.ts` exports the `Dictionary` type and every other locale is
  type-checked against it, so missing translations fail compilation.
* `lib/i18n/LanguageProvider.tsx` — client context. `useLanguage()` returns
  `{ locale, setLocale, t }`. The locale persists in the `NEXT_LOCALE`
  cookie (read server-side in `app/layout.tsx` for `<html lang>` and the
  initial render, avoiding hydration flashes) and in localStorage.
* `lib/i18n/getDictionary.ts` — server-safe lookup used by API routes
  (e.g. `/api/recommendations` localizes explanation templates via the
  `locale` field in the request body).
* `components/design-system/LanguageSwitcher.tsx` — header dropdown
  (vertical list below 768px, horizontal strip on desktop, with native language
  names) and mobile-menu grid (full) variants. A single compact control sits in a
  small bordered box at the header's top-left corner, outside the navigation flex
  flow on desktop and mobile. Its dropdown is left-anchored and its mobile options
  have touch-friendly padding.

Public-facing branding uses OlfactiveDNA and olfactive identity terminology in
all seven dictionaries; literal perfume/product references remain unchanged.
Internal route, event, storage, and badge identifiers retain their existing names.
The header shows the user's name and badge image without a visible badge label;
the localized badge description remains available through accessible labels.

Rules: persisted values (localStorage values, API parameters, ids) stay in
canonical English and are mapped to display text through dictionary records;
database-sourced content (fragrance names, canonical attribute metadata)
is not translated. Parameterized strings are arrow functions in the
dictionaries.

## UX Philosophy

The user experience should feel:

* exploratory
* premium
* luxury
* narrative-driven

Avoid questionnaire-style interactions whenever possible.

### Homepage journey

Desktop keeps five subdued, high-contrast links aligned between the six circles
in the hero artwork; illumination is reserved for hover and keyboard focus.
Their labels fit the available button width automatically after locale changes,
resizing, and font loading, using the shared `AutoFitLabel` component.
Below 1200px, the artwork is cropped to its decorative upper region and six
numbered, text-based journey cards replace the small overlaid links. The cards
use the same Grounding, Test, DNA, territory, and recommendation destinations.
The standalone "Continue your journey" guide is no longer shown. Editorial
territory exploration lives under the Articles menu at `/articles/territories`,
with intensity and season filters and inline territory details preserved. Its
embedded layout fills the Articles content column. This editorial menu is
separate from the evidence-backed affinity section on the DNA dashboard.
These layout changes do not alter the particle effects.

On desktop, the shared Articles rail aligns its left border with the horizontal
header container, not the inset logo. It retains its logo-based vertical position
and updates alignment on scrolling and resizing across all Articles pages.
On smaller screens, the rail stays in the normal content flow.

The mobile header logo is centered within its reserved slot without the desktop
logo's translation, below the corner language control and contained in the header.
Mobile profile badges are 32px. The account label truncates when space is tight,
while language and menu controls retain their space inside the header.

### Ambient visual effects

The ambient particle canvas is mounted only on the homepage. Desktop animation
uses 20-25 particles, at most 30 rendered frames per second, a device-pixel-ratio
cap of 1.25, and no more than 12 unshadowed connections per frame.
Narrow viewports (under 900px), coarse-pointer devices, and reduced-motion
preferences receive a single static rendering instead. Preference and viewport
changes are applied immediately. Hidden tabs cancel all pending animation work;
returning to the tab resumes only the appropriate static or animated mode.

---

## Collection Future Features

Collection will later power:

* Collection DNA
* Coverage Analysis
* Redundancy Detection
* Gap Analysis
* Recommendation Engine v2
* Purchase Prioritization

Design systems with these future consumers in mind.

## Agent Workflow

For every implementation:

1. Read repository instructions.
2. Read architecture rules.
3. Implement feature.
4. Restart localhost:3000.
5. Verify locally.
6. Run build.
7. Fix errors.
8. Commit.
9. Push.
10. Verify GitHub.
11. Verify Vercel.
12. Verify production.

A task is not complete before all steps are finished.
