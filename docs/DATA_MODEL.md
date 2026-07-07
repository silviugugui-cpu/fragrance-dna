# Data Model

## Purpose
Define canonical persistent entities, projections, and ownership boundaries.

## Owner
Data Architecture.

## Dependencies
CANONICAL_ARCHITECTURE_V2.md, EVENT_MODEL.md.

## Canonical Responsibility
Authoritative model for persisted state used by all intelligence systems.

## Canonical Stores
1. Event Store (immutable, append-only)
2. Projection Store (derived operational views)
3. Snapshot Store (versioned decision and model snapshots)

## Core Entity Families
1. User Intelligence
- User DNA projection
- Confidence projections (global, axis, attribute)
- Preference state projection

2. Session Intelligence
- Active and resumable learning session state
- Candidate sequencing state

3. Recommendation Intelligence
- Decision snapshot
- Objective/context metadata
- Explainability and reproducibility references

4. Fragrance Intelligence
- Canonical fragrance representation
- Provider mapping lineage
- Evidence and confidence metrics

## Ownership Rules
1. Event Store is source-of-truth for interaction history.
2. Projections are derived and rebuildable.
3. Browser cache is non-canonical.

## Phase 1 Step 2 Foundation Modules
Projection foundation modules introduced in Phase 1 Step 2:
1. lib/intelligence/projections/types.ts
2. lib/intelligence/projections/models/userProjection.ts
3. lib/intelligence/projections/models/groundingProjection.ts
4. lib/intelligence/projections/models/testProjection.ts
5. lib/intelligence/projections/models/profileProjection.ts
6. lib/intelligence/projections/reducers/userProjectionReducer.ts
7. lib/intelligence/projections/reducers/groundingProjectionReducer.ts
8. lib/intelligence/projections/reducers/testProjectionReducer.ts
9. lib/intelligence/projections/reducers/profileProjectionReducer.ts
10. lib/intelligence/projections/registry/projectionRegistry.ts
11. lib/intelligence/projections/replay/replayEngine.ts
