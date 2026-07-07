# ADR-0002: Event Sourcing

## Status
Accepted

## Context
The platform must preserve user intelligence permanently, support replay, and avoid losing interaction history.

## Decision
Adopt immutable event sourcing for intelligence-producing interactions.
Operational read models are projection-based and rebuildable.

## Consequences
1. Historical interactions are preserved for replay and future model improvements.
2. Projection architecture is required.
3. Idempotency and schema versioning are mandatory.
