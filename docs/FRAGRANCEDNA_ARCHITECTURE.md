# FragranceDNA Architecture

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

Recommendations should be based on:

* DNA compatibility
* profile attributes
* collection coverage
* gap analysis

Never rely solely on popularity.

---

## UX Philosophy

The user experience should feel:

* exploratory
* premium
* luxury
* narrative-driven

Avoid questionnaire-style interactions whenever possible.

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
