# ADR-0006: Canonical Fragrance Intelligence

## Status
Accepted

## Context
Provider schemas are heterogeneous and unstable; direct consumption creates coupling and fragility.

## Decision
Introduce Canonical Fragrance Intelligence Layer as mandatory boundary:
External Providers -> Canonical Fragrance Intelligence -> Platform Consumers.

## Consequences
1. Recommendation logic remains provider-agnostic.
2. Provider-specific schema changes are isolated in ingestion adapters.
3. Fragrance knowledge becomes versioned, confidence-aware, and reusable across systems.
