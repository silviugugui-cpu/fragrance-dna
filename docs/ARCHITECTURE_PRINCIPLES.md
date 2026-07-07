# Architecture Principles

## Purpose
Define mandatory architectural constraints for all implementation work under Canonical Architecture v2.

## Owner
Architecture.

## Dependencies
PRODUCT_DOCTRINE.md.

## Canonical Responsibility
System-level rules that cannot be bypassed without an ADR.

## Principles
1. Single Source of Intelligence
- Persistent User DNA is the only canonical user intelligence model.
- No module may maintain competing preference logic.

2. Event-First Intelligence
- User learning signals are captured as immutable events.
- Projections are derived views, not source-of-truth.

3. Test and Recommendation Decoupling
- Test Engine learns user DNA only.
- Recommendation Engine consumes user intelligence only.
- Evaluation and recommendation catalogs are permanently decoupled.

4. Canonical Fragrance Intelligence Boundary
- External provider schemas are never consumed directly by recommendation logic.
- Canonical Fragrance Intelligence is the mandatory ingestion boundary.

5. DNA vs Context Separation
- DNA is long-term preference intelligence.
- Context is temporary serving input.
- Context never rewrites canonical DNA.

6. Preference State vs Collection State Separation
- Preference, ownership, hidden, rejected, wishlist, collection are distinct states.
- Collection enriches recommendations, but does not directly mutate DNA.

7. Explainability and Reproducibility by Design
- Recommendation decisions and profile evolution must be explainable and reproducible.
- Version and trace metadata are mandatory.

8. Evolution Over Rewrite
- Prefer adapters, migrations, and refactors over rewrites.
- Preserve functioning UX unless explicitly changed.

9. Incremental Delivery Safety
- Feature flags, dual-write, shadow mode, and rollback plan are required for risky transitions.
