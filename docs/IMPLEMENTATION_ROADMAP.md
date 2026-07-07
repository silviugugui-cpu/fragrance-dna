# Implementation Roadmap

## Purpose
Define phased, low-regression migration from current implementation to Canonical Architecture v2.

## Owner
Architecture + Delivery.

## Dependencies
CANONICAL_ARCHITECTURE_V2.md, DATA_MODEL.md, EVENT_MODEL.md.

## Canonical Responsibility
Execution plan with safety gates, acceptance criteria, and rollback strategy.

## Phase 0: Governance and Documentation
- Establish canonical docs, ADR baseline, and engineering rules.
- No runtime logic changes.

## Phase 1: Event Spine and Projection Skeleton
- Introduce immutable event capture and projection foundation.
- Enable dual-write from existing flows.

## Phase 2: Persistent User DNA v2
- Add Grounding DNA, Behavior DNA, Current DNA blend.
- Add global, axis, and attribute confidence projections.

## Phase 3: Test Engine v2 in Shadow Mode
- Adaptive candidate ordering and dynamic fragrance-specific evaluation dimensions.
- Shadow-only comparison against legacy behavior.

## Phase 4: Canonical Fragrance Intelligence Layer
- Provider ingestion adapters and canonical normalization.
- Versioned fragrance knowledge snapshots.

## Phase 5: Recommendation Engine v2 Cut-In
- Objective + context-aware ranking.
- Explainability and reproducibility metadata persisted per recommendation.

## Phase 6: Legacy Decommission
- Remove deprecated preference logic and local-storage canonical paths.
- Keep only compatibility adapters required for historical continuity.

## Delivery Rules
1. One phase at a time.
2. Stop after each phase and request approval.
3. Every phase requires compliance, regression, migration, and rollback verification.
