# FragranceDNA Architecture

## Canonical Freeze Notice

Canonical Architecture v2 is frozen and implementation-ready.

Public SEO metadata uses `https://olfactivedna.com` as `metadataBase`.
The shared root layout sets canonical and Open Graph URLs to `./`, which
Next.js resolves against the current route, including dynamic brand paths.
Do not use `/` in the shared layout: it would make every page canonicalize to
the homepage. Query parameters are excluded from these route URLs.

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

The canonical SQLite exceeds GitHub's 100 MiB per-file limit with complete
photo associations. Git tracks its lossless `data/generated/fragrancedna.sqlite.gz`
snapshot instead of the unpacked file. Run `npm run db:pack` after changing the
database, and commit the archive. `predev` and `prebuild` restore missing SQLite
automatically, verify its integrity, and preserve existing local edits. Vercel
always restores the tracked snapshot before building; runtime file tracing still
bundles the normal `.sqlite`, not the archive. Packing uses SQLite's consistent
backup API and is not a second catalog or a data migration.

MasterFragrancePool is the single source of truth.

Never create:

* duplicate fragrance databases
* parallel fragrance catalogs
* disconnected fragrance datasets

All fragrance systems must use the canonical pool.

Public fragrance profiles use `/fragrances/[recordId]`, resolved from indexed
SQLite `record_id` or `canonical_key`. Editorial `source_record_id` aliases map
through `editorial_fragrances.row_id`, never through an external source URL.
`getFragranceHref` is the shared URL builder; unresolved references use
`/fragrances?q=BRAND+PERFUME`. The library reads this query on entry.
Search responses expose the indexed internal ID, not `externalId`.
Perfumer works retain their editorial identity for statistics and receive a
separate canonical record ID for navigation. House catalogs and relationship
references link to the same profiles. Relationship mapping uses exact normalized
canonical brand/perfume keys, not fuzzy matches or source URLs. Evidence and
attribution links remain secondary, explicitly labeled external citations.
Individual fragrance profiles do not display a generic import "Source" link or
send its URL to the client. Import provenance remains stored in SQLite.
Known perfumer names link to their internal profiles; unknown creators stay text.
Profiles are rendered on demand from the canonical SQLite, including available
notes, accords, creators, badges and documented relationships. No second catalog
or generated page inventory is maintained.

The Discover sidebar shows localized section titles only, without subtitle
hints, consistently across its overview, fragrance library, perfumers, houses,
territories and occasions.
Sidebar navigation uses unboxed uppercase text, matching the header navigation.
Hover, keyboard focus and the selected section underline only the final wrapped
line; selection also exposes `aria-current="page"`.
Header navigation uses a single pseudo-element underline for hover, keyboard
focus and the active section, with no second bottom-border underline.
Grounding, Test, DNA, Collection and FAQ use `home-aligned-page` to avoid stacking
PageShell, frame and first-section top padding. Their first content starts at the
content offset: 1.25rem on small screens and 2rem from 1024px.
The homepage card starts 0.72rem below the header, matching the visible
`discover-page-frame` outline rather than its inner content padding.
The territory label is "Olfactive Territories" (localized). Perfumer cards and
profiles display the top-tier creation count only; evaluated counts remain
internal ranking inputs. The directory retains search and sorting without a
minimum-creation filter. Directory portraits retain full-height cover crops
with editorial focal positions that keep faces visible.
Signature-work links carry a `fromPerfumer` slug so the fragrance's back link
returns to that profile, including after reload or opening a new tab. The server
accepts only known editorial perfumer slugs; other visits return to the library.
Canonical fragrance metadata URLs exclude this navigation context.
Need to Know, Perfumer Profiles and the fragrance library share a top-aligned introductory image crop:
60% of the original 2000:1333 image height at unchanged width. Mobile titles
remain below the image for readability; desktop titles stay overlaid.
The library uses `/fragrances-library-pop-art.png` as an image-only banner,
without a title, backing panel or introductory paragraph below.
The houses directory and occasions page use the same compact, image-only hero
with `/images/top-olfactive-houses-pop-art.png` and
`/images/occasions-of-wear-pop-art.png`, respectively. Individual house pages
retain their existing header without the directory banner.
The occasions banner is the first content panel, followed by its title and
introduction, then filters.
The embedded Olfactive Territories hero uses the same desktop aspect ratio,
with filters over the image and no introductory text. Small screens allow the
filter panels to determine its height so all controls remain accessible.
Selecting a Need to Know category scrolls to the updated reading panel, including
reselecting the active category. Initial page entry does not scroll; reduced-motion
preferences disable the smooth animation.
Library filter menus are positioned directly below their controls with bounded,
scrollable lists, including searchable brand suggestions and badge filters.
They retain keyboard selection and Escape/outside dismissal; other form-based
badge filters retain native selects for GET submission.
The localized seasonal-cue methodology appears in FAQ rather than below the
fragrance library filters.
FAQ opens with `/images/faq-pop-art.png` in the shared compact, top-aligned
image-only hero, followed directly by confidence badges and FAQ entries.
The former guide introduction and Grounding/evaluation CTAs are not displayed;
a screen-reader-only page heading preserves the accessible document structure.
User-facing product branding is OlfactiveDNA in every locale. Legacy storage
keys, database filenames and event identifiers remain unchanged for compatibility.

---

## Collection Architecture

Your Collection opens with `/images/your-collection-pop-art.png` in the shared
compact, image-only hero, before the existing title and collection widgets.

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

The batch image generator reads the canonical MasterFragrancePool and stores generated PNG assets under `public/images/perfumes`, with `ai-generated-perfumes--` filename prefixes. It records the public asset path on the matching canonical fragrance records; it does not create a second catalog.

Generated images are artistic interpretations inspired by fragrance metadata, not verified photographs of retail bottles. The generator skips records with an existing usable local image, uses deterministic filenames, processes one image at a time, and can be safely resumed by running it again.

Set `OPENAI_API_KEY` in `.env.local`, preview the backlog with `npm run images:generate -- --dry-run`, and start with a small batch using `npm run images:generate -- --limit 5`. Use `npm run images:generate -- --all` only after reviewing the backlog and expected API usage. Each generated image is a billable API request. The current local catalog has tens of thousands of fragrances without a local image, so a full run can incur substantial API and storage costs; generated assets are written to the project and may significantly increase its size.

## Product photo transfers

`npx tsx scripts/importFragranceProductPhotos.ts --input EXTRACTED_TRANSFER_DIRECTORY`
validates a schema v1 photo manifest without changing image associations. Add
`--apply` to import. The importer matches `fragrance_id` to the canonical SQLite
record ID or key and verifies brand and perfume names before writing anything.
It refuses missing, ambiguous, or conflicting image assignments.

Product photos are stored in `public/images/perfumes` with `product-photos--` content-hashed
filenames. Shared image files are stored once. The existing
`updateMasterFragranceLocalImage` helper updates both indexed local paths and
record JSON, including embedded User DNA profile image references. Existing
remote image URLs and all other fragrance metadata remain unchanged. The importer
backs up SQLite before applying updates in a single transaction and records source
URLs, checksums, and associations in
`data/generated/product-photo-import-report.json`. The SQLite database bundled
with a transfer is not a replacement for the canonical MasterFragrancePool.

The importer also accepts indexed schema v1 manifests with `canonical_key`,
`image_source_url`, `image_rights_note`, `source_type`, and `status: "downloaded"`.
For split photo packages, extract the index and pass each extracted `images`
directory using repeated `--images-dir DIRECTORY` arguments. Every association
must resolve to exactly one supplied file. Source and rights notes are preserved
in the import report; importing does not establish permission to redistribute.
Keep unlicensed transfers local until publication rights are confirmed.
Authorized product photos can be published to the project's connected public
Vercel Blob store using `scripts/uploadPerfumeImagesToBlob.ts`. The operator must
confirm publication rights with `--rights-confirmed`; the CSV itself is not a
license. Preview with `node --import tsx scripts/uploadPerfumeImagesToBlob.ts`,
then add `--apply --rights-confirmed` to publish. Optional `--limit N` processes
the first N rows, retaining descending manifest priority. By default the free Hobby plan
has operation and transfer limits as well as storage limits: 1 GB of storage
does not permit 8,049 uploads in one month. The uploader caps new objects at
1,800 in a conservative rolling 31-day window (including other objects in this store), reserving
part of the 2,000 monthly advanced operations for listing and administration.
Dashboard actions and other stores can also consume the allowance: check team
usage before each run. Start with `--limit 1800`; after a quota reset, increase
the cumulative limit by at most 1,800 to continue. No scheduler or paid upgrade
is enabled. Hobby can suspend Blob access if any allowance is exhausted.

For a verified Pro subscription, pass `--plan pro` to explicitly disable only
the Hobby image-count/storage ceilings. Pro usage is billable; this option does
not upgrade the account or impose a spending cap. To publish every local image
already associated in canonical SQLite (including perfumes without scores or
editorial membership), first run
`node --import tsx scripts/createFullBlobManifest.ts`, then
`node --import tsx scripts/uploadPerfumeImagesToBlob.ts --input data/generated/vercel-blob-full-catalog-manifest.csv --plan pro --apply --rights-confirmed`.
The generated manifest is a local ingestion inventory, never a second catalog.
It preserves existing Blob keys, deduplicates identical image bytes by SHA-256,
and uses deterministic content-addressed keys for newly discovered images.
Shared photos retain their existing database associations; no names or scores
are used to guess matches. Duplicate canonical rows with distinct local photos
retain their own photo: mappings update only rows sharing both key and local path.
JPEG, PNG and WebP files are supported and original bytes remain unchanged.

The manifest is local ingestion input in
`data/generated/vercel-blob-olfactive-score-manifest.csv`, not a runtime catalog.
Before uploads, every file's size/hash, canonical key, master row ID, editorial
source ID and local image association must match. Uploads preserve original
bytes and exact deterministic Blob keys without random suffixes or overwrites.
The uploader backs up SQLite, verifies downloaded Blob bytes against the SHA-256,
then writes only `blobImageUrl` and embedded `canonicalBlobImageUrl` fields.
Existing local paths, original remote URLs, badges, scores and DNA are retained.
Duplicate canonical rows with the same local image receive the same association. Reruns list existing
objects and verify their size/hash before reuse; conflicts fail explicitly.
On Hobby the complete store, including unrelated objects, must remain below the
850,000,000-byte operational ceiling. Credentials come from server-only
`BLOB_READ_WRITE_TOKEN`, never client props, source code or committed reports.

`getPerfumeImageCandidates` orders Blob, local and original remote images for
library, perfume profiles, house catalogs and recommendations. Collection
resolution and adaptive test profiles carry the same Blob association while
retaining local fallback candidates. Unpublished perfumes keep their existing
image behavior. Local JSONL events and the final upload summary under
`data/generated` support recovery and report verified object counts/bytes;
the canonical SQLite mappings are deployed with the application.
Asset validation processes one file at a time rather than retaining the entire
photo library in memory. All matching canonical rows and their embedded test
profiles receive the same image path.

All local perfume image writers use the single flat `public/images/perfumes`
directory, served at `/images/perfumes/`. Filenames retain a source prefix to
avoid collisions between libraries. UI artwork, logos, and icons remain separate.
Run `npx tsx scripts/consolidatePerfumePhotos.ts` to validate older libraries and
add `--apply` to consolidate them. The migration backs up SQLite and changed
JSON reference files, verifies copied image checksums, updates canonical records
and embedded profile references, then removes the original files. The photo
library remains local and excluded from Git; consolidation does not publish it.

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

### Explicit preference evidence and catalog classification

Grounding starts with twelve `unrated` categories. Only explicit Love, Avoid
and Neutral choices are saved in schema version 2; at least two Love/Avoid
choices are required. Neutral carries zero vector weight. Legacy unversioned
saves cannot distinguish untouched Neutral from explicit Neutral: preserve
Love/Avoid on restore and leave their former Neutral categories unrated.
Existing saved DNA is not silently overwritten; saving Grounding again
rebuilds its seed/vector from the explicit choices.

Collection territory coverage counts distinct canonical IDs only from owned
perfumes' `reviewedTerritories` entries with reviewed status, HTTP source and
confidence in (0,1]. Wishlist and unclassified perfumes do not contribute.
No eligible classifications means unknown coverage, not zero or a size-based
estimate. Note keywords also no longer fabricate DNA-axis coverage.

Public inspiration filtering uses sourced canonical `relationships` with
`inspired_by`/`clone_of`, reference brand/perfume and confidence in (0,1].
The legacy `Dupe/Middle Eastern` brand category is not evidence of origin or
copying and is not exposed as such. `originRegion` is a separate, explicit
record attribute; unknown origin remains unknown. Editorial comparisons map
to `resembles`, not `clone_of`. Brand-declared inspiration maps to `inspired_by`.
`scripts/migrateFragranceRelationships.ts` backs up SQLite and promotes only
existing documented evidence into canonical records; subsequent editorial
imports retain this mapping. No region is inferred from a brand's name.

Public library cards/details expose the three badges, never raw rating/vote
fields. The popularity dimension's stable codes remain backward compatible,
but labels describe review volume rather than popularity or iconic status.
The library explanation identifies source snapshots and the adjusted 80/20
formula; it does not claim live or first-party votes.

Territory definitions use canonical Elegance/Comfort instead of legacy
Refinement/Sensuality. The legacy perfumer-affinity helper excludes Presence entirely from its
distance and reasons: dashboard Presence is profile confidence, not preference.

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

### Selected perfume houses and purchase recommendations

The staged `perfume-house-articles.sqlite` is an ingestion source, never a second
runtime fragrance catalog. Validate it with
`npx tsx scripts/importPerfumeHouseArticles.ts --input data/generated/perfume-house-articles.sqlite`
and add `--apply` to import. The importer validates stable IDs/keys and normalized
brand/perfume identity, verifies local assets, and backs up the canonical SQLite
before a single transaction. Nonempty supplied documentation takes precedence;
missing values do not erase existing fields. New identities are inserted through
the existing canonical insert helper. Test profiles, remote photos, and unrelated
metadata are retained. Earlier changed field values and source URLs are preserved
with editorial membership; repeated imports do not replace the first prior values.

`editorial_houses` stores house metadata and review status.
`editorial_fragrances` references canonical `fragrances.row_id`, adding selection
membership, provenance, source territory suggestions, and resemblance evidence.
It does not duplicate perfume metadata. Each import replaces the selected
membership atomically, not the underlying canonical fragrance catalog.
Per-fragrance provenance is stored losslessly as a gzip-compressed JSON map
per house (`details_blob`), keyed by canonical row ID, and decompressed only
when that house is read. This avoids repeating source URLs and method labels
thousands of times in the deployment database. Import compacts SQLite after
the transaction. Duplicate canonical rows retain membership but appear once
per source identity in editorial counts and paginated lists.
`/api/recommendations` only draws candidates from this membership, retaining DNA
ranking, grounding exclusions and owned-item filtering. Missing imports fail
explicitly rather than silently reverting to the full catalog. Search, collection,
and adaptive test continue using the entire canonical catalog.

`/articles/houses` provides the selected-house directory, with category/search
filters and `/articles/houses/[houseId]` paginated house catalogs. Public house
profiles use seven-language editorial catalog overviews instead of the imported
Romanian workflow boilerplate. Each overview describes the four most frequently
documented accords across the house's canonical catalog, counting each source
identity once per accord. It is independent of search, badge filters and the
current page; it does not extrapolate a single representative perfume to the
whole house or invent brand history. Houses without documented accords receive
a localized invitation to explore their available compositions.
The description is visible without expanding a draft panel and changes with the
selected language, including accord names. Workbook selections and unresolved
representative messages are not part of public house cards/profiles. Original
descriptions, representative evidence and review statuses remain in canonical
editorial metadata for future research, not in the visible house presentation.
Brand links use the neutral label `Website`; this UI change does not certify
their verification status. Partial catalog coverage and the editorial nature of
territory suggestions remain disclosed. The workbook order is not a popularity ranking.
Product territory suggestions use their own note/accord method and are not user
territory affinities or confirmed product classifications. Resemblance reports
retain source type; brand-declared inspiration is distinct from third-party
comparisons, and pending research is never presented as a verified equivalence.
Evidence about a workbook representative absent from the source catalog remains
on the house's representative metadata; it never creates an invented perfume or
an eligible purchase candidate.
The supplied source does not include verified top/heart/base note pyramids.
Artwork is original editorial SVG, not an official brand logo or bottle photo.
Product-photo originals remain in the local-only `public/images/perfumes`
library. Authorized photos may additionally be delivered from Vercel Blob;
unlicensed assets remain local and still require rights and editorial review.

### Wearing occasions

The fragrance catalog stays at `/fragrances` for existing links, but belongs to
Discover: it is the first shared vertical menu item and uses the same rail.
It is not a standalone desktop or mobile primary navigation item. Discover is
active on this route and on all `/articles/*` pages.

`/articles/occasions` is the Discover editorial guide for eight wearing contexts.
The supplied bilingual content lives in `lib/data/occasions.json`; the typed
filter model and five additional locale translations sit alongside it. All
seven locales use the existing territory and canonical axis display labels.
Local original pop-art illustrations ship under `public/images/occasions`.
Occasion, season, setting, time and territory filters combine on guide cards;
mixed settings and anytime include the corresponding specific choices.

These are editorial suggestions, not perfume classifications or recommendation
scores. There is no note-derived territory assignment or DNA mutation. Note
examples are displayed only when an exact normalized note occurs in the
canonical perfume pool. The general catalog CTA is intentionally unfiltered:
the existing catalog has no confirmed occasion-to-perfume bridge, so the page
does not advertise or fabricate matched perfume results. Territory links target
the canonical territory cards. Source policies and calculation details are
not rendered as public workflow copy.

### Perfumer Profiles and discovery semantics

`/articles/perfumers` provides a searchable directory of 15 editorial profiles,
with minimum credited-creation filters (15/25/50), locale-aware sorting and
individual `/articles/perfumers/[slug]` routes in the sitemap. Profile biographies,
creative approaches and interface copy support all seven languages.
`lib/data/topPerfumerProfiles.ts` contains curated people and biography/portrait
provenance, not static ranking counts. Houses such as Houbigant are not people.

The importer preserves the source Olfactive Score and explicit creator credits
(person name, perfumer role, attribution URL) in canonical compressed editorial
details. Existing installations use `node --import tsx scripts/migratePerfumerEvidence.ts`;
it backs up SQLite, validates scores, updates only evidence blobs, and is
idempotent. Runtime reads only the canonical SQLite, never the companion.
These are sourced catalog attributions, not claims of primary-source verification.

`lib/database/perfumerProfiles.ts` deduplicates by source perfume identity and
computes the 67th percentile of all eligible selected-catalog scores using
linear interpolation at `(n-1)*0.67` in ascending order. Zero is valid; missing,
non-finite and out-of-range scores are not fabricated. Cutoff ties qualify.
The current 8,768-score snapshot has cutoff 77.36 and 2,896 qualifying perfumes.
Each distinct perfume counts once for every attributed co-creator with a source.
Profiles show both top-tier and evaluated counts, and all qualifying Signature
Works with attribution links. Biography and attribution Sources are now public.
Raw scores remain internal, including in house-page serialized props.

Among the 15 featured people, rank sorts by qualifying count, then qualifying
share of evaluated creations. Exact ties share a competition rank; filtering
does not recalculate ranks. At least 15 sourced, evaluated creations are required
for rank eligibility; smaller samples show no rank. This is neither a complete
career ranking nor personal DNA compatibility. Unsupported static perfumer-DNA
matches have been removed from the DNA page in favor of a profile-directory link.

`lib/seasonalCues.ts` is shared by the search API and UI. Seasonal Cues remain
accord-based discovery hints, not confirmed wearing recommendations. Results
and details show the exact matching accord evidence; mobile uses the same controls.
`lib/i18n/discoveryCopy.ts` supplies seven-language explanations and distinct
names: Territory Guide (`/territories`), Your Territory Affinities (DNA), and
Olfactive Territories, Explained (`/articles/territories`). Personal affinity
values are independent estimates, not shares summing to 100. Versatility and
other catalog characteristics are explicitly editorial, not personal affinities.

`PerfumerPortrait` references real images on their cited publishers' hosts;
source links are retained in the editorial records, not displayed as overlays.
It reports an unavailable portrait instead
of leaving a broken image; no portraits are copied into the product-photo
library. Attribution and successful loading do not establish redistribution
rights, and remote publishers can change their assets independently.

### Community, popularity and Olfactive badges

The same house importer requires exactly one validated badge row per source
identity and the versioned six-state definitions for each family. Five levels
are scored; `undefined` is a distinct missing-data state, never a zero score.
Community bands are 0–<60, 60–<70, 70–<80, 80–<90 and 90–100. Popularity bands
are 1–49, 50–199, 200–999, 1,000–4,999 and 5,000+ evaluations; absent/zero
counts are undefined. Olfactive Score uses the same score bands and requires
both source score and positive evaluation count. The supplied snapshot method
combines 80% community score adjusted with a 50-vote source-median prior and
20% within-source popularity percentile. It is not DNA compatibility, a sales
measure, a live rating or an independent review by this platform.

Canonical `fragrance_badges` references `fragrances.row_id`, storing only three
ordinal levels (0–5). Duplicate canonical identities receive identical badges.
Source ratings, votes and platform provenance stay in the ingestion source;
the import metadata retains its SHA-256, methods and snapshot dates. The
canonical badge table is replaced atomically with the editorial membership.
Unselected perfumes have undefined badges, not extrapolated ratings.

`FragranceBadges` and `FragranceBadgeFilters` are shared seven-language UI
components. Segmented meters encode badge level, not a fabricated exact score;
undefined shows a label without a meter. Directory filters count houses with
matching perfumes, category/name filters combine with them, and links retain
badge filters into house catalogs and pagination. All selected families use
AND semantics on the same fragrance. House SQL, library search and purchase
recommendations filter before pagination/limits. The collection applies the
same badge predicates to resolved canonical records without persisting badges
in user collection entries. Public library responses expose badge codes instead
of raw ratings/votes; house card records omit those raw fields as well.

---

## Internationalization (i18n)

The public site supports 7 languages, displayed in this order: English (default),
Romanian, French, German, Spanish, Italian, and Portuguese. The Studio admin area is
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

### Public themes

The Need to Know and Perfume Creators intro panels display only their localized
intro copy as the page's H1, without a separate kicker or redundant title.
The public navigation labels this area Discover (localized in every language)
on desktop and mobile; its existing `/articles` routes remain unchanged.
Desktop navigation separates the personal journey through Your Collection from
the encyclopedia links starting at Fragrances with a short, centered vertical
divider using the public accent color.
Their shared `ArticlesIntroHero` uses the supplied pop-art images from
`public/Pictures/Smels` in both themes, without filters or stretching. Desktop
headings occupy the artwork's clear upper-left area; mobile headings sit below
the full image within the same card to preserve readability.
Because these images are identical in both themes, their heading stays graphite
(`#30302d`) in both modes. The mobile title surface stays ivory (`#fff1d6`)
instead of changing to a dark background. Text on shared artwork must follow
the image's contrast requirements, not the surrounding page theme.

`lib/theme/publicTheme.ts` is the typed asset registry for Dark and Normal Mode.
Dark remains the default for visitors without a preference. `PublicThemeProvider`
shares the selected theme and assets across the public frame, header, and homepage.
The header's top-right sun/moon button switches modes on desktop and mobile.
Its action label is localized in all supported languages.
On desktop, the language list opens below the full header box with a small gap;
on mobile it retains its vertical dropdown below the language trigger.
The `olfactive-public-theme` cookie stores the choice for one year and is read by
the root layout so reloads render the correct theme and assets from the server,
without first flashing the default theme.

The public frame carries `data-theme="dark"` or `data-theme="normal"` and the
document carries `data-public-theme` for the outer page background.
Studio has no public theme attribute or theme control and retains its original
dark background, typography, and shared-component color fallbacks.
Header content reserves right-side space for this control so the account and
mobile menu stay to its left, including when the account label must truncate.
`lib/branding.ts` defines the only current logo kit, stored in
`public/Logo/new-logo`. Use the transparent champagne logo on dark backgrounds
and transparent graphite logo on light backgrounds. The opaque black/white
variants are available for previews, and the white/black transparent watermarks
are reserved for future use on dark/light backgrounds respectively. Do not
reintroduce older logos or apply watermark overlays without a product requirement.
The shared logo default, including Studio, and social preview use this new kit.
Normal Mode uses the supplied white minimal homepage artwork, the transparent
graphite logo, and the same transparent confidence badges. Product and territory
photographs retain their real colors. Grounding uses the supplied neutral-balance,
attraction-love, and avoidance-avoid `white-mode-2x.jpg` backgrounds in Normal Mode,
without overlay gradients. The theme asset registry maps all three zones;
Dark Mode retains its original PNG backgrounds and contrast gradients.
The Love background in both themes uses `cover` with a right-centered focal
point, filling the card while preserving the artwork's natural proportions and
prioritizing the checkmark side of the image. Never stretch the artwork.

The shared Olfactive Territories section displays its overview artwork and card
photographs without opacity reductions, filters, or overlay gradients in either
theme. The overview kicker, title, and subtitle sit over the lower part of the
overview image in champagne with text shadows for readability. Filter panels sit
over the top of the overview image, above the heading in separate grid rows so
wrapped mobile controls cannot overlap the copy. Individual card descriptions
remain below their images on themed surfaces.
Normal Mode uses the supplied `Territory-white.jpg` overview, with graphite
overlay text and light text shadows; Dark Mode retains `Territory.png`.
Territory cards use a container-sized grid with a 240px minimum target width,
top-aligned equal-ratio images, and wrapping metadata. Filter panels use a
two-column grid with wrapping buttons rather than intrinsic-width flex boxes,
keeping the intensity and season panels side by side on desktop and mobile.

Public Dark Mode typography uses champagne tokens scoped to `data-theme="dark"`:
primary `#f5dfc5`, secondary `#e6c9a8`, muted `#c9ab8b`, and soft `#b89a7b`.
Warm editorial text references these tokens with its previous color as the
fallback, so shared components retain their existing Studio appearance.
Tailwind gold utilities, legacy warm text, box outlines, focus rings, and warm
shadows resolve to public champagne tokens, with original values as Studio
fallbacks. The login link uses the same secondary champagne as navigation.
Gold-filled login submit buttons use a dark surface and champagne text/outline.
Semantic error, warning, success, and chart colors are not recolored.
Normal Mode keeps a white page and homepage artwork, with ivory (`#faf7f0`),
pale ochre (`#f5ead3`), and duck-egg (`#e9f2ef`) card surfaces.
Journey cards alternate these colors; statistics and collection summary tiles
use ochre and duck-egg, while inputs remain white. Grounding uses ochre for
Neutral, duck-egg for Love, and a subtle clay tint for Avoid. Auth page gradients
also use this light palette rather than retaining the original dark warm endpoint.
Graphite text (`#30302d`, `#514b43`), readable muted inks (`#675f55`, `#695f53`),
and restrained bronze accents provide contrast across every surface.
Mobile page shells inherit the light page-background token, and the shared
discovery frame's pseudo-element gradient uses ivory/duck-egg rather than black.
Shared surface, utility, and chart tokens retain the original dark values as
fallbacks. Semantic status colors use darker readable variants on light surfaces.

### Confidence badge artwork

Confidence badge artwork is registered in `DNA_CONFIDENCE_BADGES` in
`lib/dnaSession.ts` and uses the six transparent PNGs in
`public/Badges/OlfactiveDNA-Badges`. Header account badges and the FAQ share this
registry. The FAQ renders individual badges rather than the old composite image.
Confidence thresholds, tier IDs, and localized labels remain unchanged.
Header badges are 6.3rem square on desktop and 2.5rem on mobile, 25% larger
than their previous 5.04rem and 2rem sizes; FAQ badge sizing is independent.

### Homepage journey

The homepage heading displays only the localized `home.heroSubtitle`
("Discover perfumes you truly love." in English), without the DNA prefix.
It sits below the artwork and above the journey cards, left-aligned with their
outer edge on desktop and mobile, with smaller champagne typography and no
separate background or border.

The homepage uses `public/Pictures/Pasi/front-page-black-minimal.png` in Dark
Mode and `front-page-white-minimal.png` in Normal Mode, both supplied without text.
Six numbered journey cards with titles, explanations, and actions appear below
the image inside the same bordered hero container on every screen.
They use one column on mobile, two from 768px, and
three from 1200px, replacing the former desktop image-overlay links.
The artwork's lower black negative space is cropped in a top-aligned 3:1 frame
to bring the cards closer to the flowers without reducing the artwork scale. The cards
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

The mobile header logo uses a 120px by 90px frame (50% larger than 80px by 60px).
The header stays 72px tall; the logo uses a 12px downward translation and intentionally extends
below its border without clipping, leaving the corner language control clear.
The mobile navigation panel follows the header height.
Mobile profile badges are 2.5rem. The account label truncates when space is tight,
while language and menu controls retain their space inside the header.

### Ambient visual effects

The ambient particle canvas is mounted only on the Dark Mode homepage. Desktop animation
uses 20-25 particles, at most 30 rendered frames per second, a device-pixel-ratio
cap of 1.25, and no more than 12 unshadowed connections per frame.
Narrow viewports (under 900px) and coarse-pointer devices show no ambient lights
and schedule no animation. Desktop reduced-motion preferences receive a single
static rendering instead. Preference and viewport
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
