# Engineering Guidelines

## Purpose
Define mandatory implementation rules for Canonical Architecture v2 delivery.

## Owner
Architecture + Engineering Leads.

## Dependencies
ARCHITECTURE_PRINCIPLES.md, CANONICAL_ARCHITECTURE_V2.md.

## Canonical Responsibility
Operational guardrails for safe, compliant implementation.

## Mandatory Rules
1. Never bypass the Event Store for intelligence-producing interactions.
2. Never write directly into Persistent User DNA projections.
3. Never duplicate preference logic across modules.
4. Never consume provider schemas directly in recommendation logic.
5. Never break reproducibility metadata requirements.
6. Never violate architecture boundaries between Test and Recommendation systems.
7. Prefer evolution, adapters, and migrations over rewrites.
8. Preserve backward compatibility whenever possible.
9. Use feature flags for risky behavior changes.
10. Use dual-write for persistence transitions.
11. Use shadow mode before production cutover.
12. Browser storage is cache only, never source-of-truth.
13. Every architectural exception requires an ADR.
14. Every phase completion requires compliance, migration, rollback, and regression verification.
