# Perfume house articles data handoff

Database for the Fragrantiq articles section. It is a companion database and does not modify `data/generated/fragrancedna.sqlite`.

## Contents

- 80 selected perfume houses: 35 niche, 10 dupe, and 35 designer.
- 8857 fragrance records copied from the current Fragrantiq catalog using `record_id` and `canonical_key` as stable source joins.
- 8216 records point to an existing product image in the Fragrantiq project. Images stay in `public/images/perfumes`; the database stores their site paths. Records without an image remain present and have `image_exists = 0`.
- 8768 perfumes have a community rating; 88 have no source rating in the local catalog. Raw values and provenance are retained only in internal tables for deriving badges.
- 8857 perfumes have one row with three ready-to-display badges. Each badge family has five scored levels plus the generic `undefined` state, displayed as “Nedefinit”.
- 80 original, logo-free editorial SVG illustrations in `brand-art/`; the integration destination is `public/images/brand-editorial/`.
- 13902 note/accord-based territory suggestions (5033 unique primary candidates). These are drafts with evidence terms, source URL, confidence, method ID, and review status.
- 2124 explicit dupe-similarity records, including records marked `pending_research` rather than treating unknown as “no resemblance”. Current statuses: {'brand_claimed_inspired_by': 3, 'documented_resemblance': 7, 'pending_research': 2114}.

## Important tables

- `brands`: house selection, official-site candidate URL, editorial description draft, and source-catalog record count.
- `brand_art`: local SVG path, alt text, method, and motifs.
- `fragrances`: catalog records with source URL, year, perfumer where present, accords, notes, description, image path, and original source IDs.
- `fragrance_ratings` and `fragrance_rating_sources`: internal calculation/provenance tables; these retain the imported raw values and sources and should not be queried by public UI components.
- `fragrance_badge_definitions`: internal rulebook for the five ranges and generic `undefined` state in each badge family.
- `fragrance_badges`: one code per badge family and perfume; contains no raw score, vote count, or source name.
- `article_fragrance_catalog` / `article_fragrance_badges` / `article_fragrance_ratings`: public-safe views containing product metadata and the three badge codes/labels only. They omit platform names, source URLs, raw scores, and vote counts.
- `featured_fragrances`: the representative perfume from the 80-house workbook and its exact/curated/ambiguous/not-found catalog match.
- `dupe_similarities`: explicit reference brand/perfume, relation type, source, source type, confidence, and research status.
- `olfactory_territories`, `dna_axes`, `dna_model_metadata`: exact definitions imported from the provided OlfactiveDNA export, plus the live runtime affinity-engine rules.
- `fragrance_territory_suggestions`: product-side editorial candidates derived from notes/accords. These do not use user DNA scores.

## OlfactiveDNA boundary

The 11 canonical dashboard axes and 10 territories match the provided JSON and the project runtime. The runtime territory-affinity calculation describes a user's affinity to each territory; it does not classify a perfume. Product territory rows therefore use the separate `editorial-note-accord-rule-v1` method, include evidence and confidence, and start in `editorial_review_pending`. No fragrance axis profile is fabricated from the user-preference formulas.

## Dupe likeness

The `dupe_similarities` table has a row for every catalog perfume in the selected dupe houses. States mean:

- `brand_claimed_inspired_by`: the brand itself names the reference.
- `documented_resemblance`: an external comparison source reports the resemblance; source type distinguishes editorial, community, and comparison database.
- `pending_research`: no source-backed pair was recorded yet; this does not mean “no resemblance”.
- `reviewed_no_match`: reserved for a future explicit review that finds no well-supported match.

## Perfume badge rules

Badges are the only rating-related values intended for display. The underlying local snapshot remains in internal tables for provenance and calculation, but the public-safe views do not reveal source names, URLs, scores, or vote totals.

- **Scor comunitar** uses the normalized score: `low` 0–<60, `moderate` 60–<70, `good` 70–<80, `very_good` 80–<90, `top_rated` 90–100. A missing score is `undefined` / “Nedefinit”.
- **Popularitate** uses the reported vote count: `emerging` 1–49, `growing` 50–199, `popular` 200–999, `very_popular` 1,000–4,999, `iconic` 5,000+. A missing or zero count is `undefined` / “Nedefinit”.
- **Olfactive Score** is the platform's combined 0–100 score: 80% confidence-adjusted community score plus 20% vote-count popularity percentile within the same source community. Its five bands are `discovery` 0–<60, `promising` 60–<70, `noticed` 70–<80, `favorite` 80–<90, `reference` 90–100. It is `undefined` / “Nedefinit” unless both a community score and a positive vote count exist.

The normalized community score uses a 50-vote prior toward the source-community median. Vote percentiles are compared only within each source community to avoid equating unlike scales. These are catalog-snapshot badges, not a live feed, sales metric, or official Fragrantiq user rating. The frontend should query the safe view:

```sql
SELECT source_record_id, brand_name, perfume_name,
       community_badge_code, community_badge,
       popularity_badge_code, popularity_badge,
       olfactive_score_badge_code, olfactive_score_badge
FROM article_fragrance_badges;
```

## Before public release

House descriptions and official-site candidate domains carry review status in the database. Verify/replace these editorial drafts and website links from the first-party brand pages. The source product catalogue has coverage gaps: a few representative perfumes are missing or have ambiguous edition variants; consult `featured_fragrances.match_status` before showing a missing item as researched. Product image file paths stay rooted in the existing project.

## Integration paths

The staged folder is the source package. Copy the SQLite file to `data/generated/perfume-house-articles.sqlite` and the contents of `brand-art/` to `public/images/brand-editorial/` in the Fragrantiq project. No existing database rows or product photos need to be rewritten.
