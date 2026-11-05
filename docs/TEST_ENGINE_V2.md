# Test Engine v2

## Purpose
Define the canonical adaptive learning engine that improves Persistent User DNA.

## Owner
Test Intelligence Team.

## Dependencies
USER_DNA_MODEL.md, FRAGRANCE_INTELLIGENCE_MODEL.md, EVENT_MODEL.md.

## Canonical Responsibility
Learn user intelligence efficiently and accurately, independent from recommendation providers.

## Core Rules
1. Test engine objective is learning, not recommending from provider catalogs.
2. Evaluation catalog is decoupled from recommendation catalog.
3. Evaluation dimensions are fragrance-specific and generated from canonical attributes.
4. Universal hardcoded question sets are not allowed.
5. Adaptive Test and Collection Reinforcement must use the same canonical evaluation engine and behavior-signal methodology.

## Learning Loop
1. Select candidate maximizing information gain + expected enjoyment + diversity constraints.
2. Generate dynamic evaluation dimensions.
3. Capture immutable evaluation event.
4. Update DNA and confidence projections.
5. Re-evaluate next best candidate.

## Shared Evaluation Engine
Adaptive Test remains the primary discovery mechanism.
Collection Reinforcement may reuse the same canonical evaluation engine after a user adds a fragrance to My Collection and chooses to evaluate it.
Collection Reinforcement does not introduce a second scoring methodology.
It reuses canonical attributes, canonical question generation, canonical behavior events, canonical behavior projection, and the DNA Fusion Engine through a different entry point.

## Stage Policy
1. Discovery
2. Refinement
3. Validation
4. Maintenance

Each stage tunes exploration rate, confidence thresholds, and stopping criteria.

## Active evaluation contract (schema 2)

`lib/test/preferenceLearning.ts` owns separate overall liking, perception,
explicit attribute liking, projection replay and adaptive selection.
`lib/test/evaluationSession.ts` validates persisted records/drafts and migrates
legacy sessions without deleting raw slider answers or old projections.

The active test loads only `/api/test/user-dna-pool` (canonical SQLite), selects
one fragrance and at most two canonical attributes, and persists the next draft
only after replaying the submitted record. Six-item preplanned batches are no
longer used. Evaluated IDs and canonical duplicates, including unable attempts,
are excluded. The initial candidate preferentially combines an unconfirmed Love
prior and an uncertain attribute; unavailable combinations receive an explained
learning-value fallback. Selection then balances compatibility, uncertainty,
novelty and recent-brand diversity.

After the initial candidate, candidate score is 1.5 * confidence-aware preference
compatibility + 0.35 * information + 0.15 * novelty + recent-brand diversity.
Compatibility is attenuated for sparse explicit evidence; the overall weight
allows newly submitted liking to affect the next choice without giving a single
attribute response full confidence.
Two consecutive "not noticed" responses multiply that attribute's question
priority by 0.25, three by 0.0625, and later misses bottom out at 0.05.
A noticed response resets this perception cooldown. It never changes liking or
preference confidence. The initial Love/unknown preference also respects reduced
priorities. Provisional Grounding conflicts remain clarification targets.

Each fragrance requires overall liking or the explicit unable status.
Per-attribute perception uses 0/1/2/3. Only noticed attributes require a separate
liking answer (-2/-1/0/1/2). No sliders/default answers are submitted.
Quality questions use localized adjectives, for example "How charismatic did
you find it?", with Not at all / Slightly / Moderately / Very degree choices.
Notes retain noticeability questions. Both use the same 0-3 perception contract
and independently request liking only when the perceived degree is nonzero.
Unable attempts contain no answers, do not count as complete, and do not update
DNA. Three consistent explicit answers can retire a question; a subsequent
explicit conflict reopens it.

Records are append-only and idempotently validated by evaluation/canonical ID.
Draft edits are not learning events. Partial drafts persist immediately in
user-scoped localStorage and synchronize in order to the existing authenticated
profile's `dnaSession` JSON field. Saving failures are surfaced with retry.
There is no new database, service or authentication path.

Legacy slider adapters emit no preference events and produce neutral preference
projections. Collection reinforcement using old intensity-only payloads likewise
cannot generate liking; a future entry point must supply this explicit schema
to share the same learning semantics.
