# Engine Versioning

## Purpose
Define independent versioning strategy for all intelligence components.

## Owner
Architecture + Platform.

## Dependencies
EVENT_MODEL.md, CANONICAL_ARCHITECTURE_V2.md.

## Canonical Responsibility
Guarantee safe upgrades, reproducibility, and historical replay.

## Versioned Components
1. Grounding model
2. DNA fusion model
3. Attribute mapping model
4. Confidence engine
5. Question composer
6. Test candidate policy
7. Compatibility engine
8. Recommendation ranking model
9. Explainability model
10. Fragrance intelligence schema and ontology

## Rules
1. Every decision event stores component version metadata.
2. Breaking changes require migration strategy and ADR.
3. Reproducibility depends on preserved versioned artifacts.
