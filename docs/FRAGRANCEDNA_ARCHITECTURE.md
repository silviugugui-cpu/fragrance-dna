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

