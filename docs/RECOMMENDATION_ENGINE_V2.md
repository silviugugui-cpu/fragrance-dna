# Recommendation Engine v2

## Purpose
Define objective-driven, context-aware recommendation intelligence that consumes canonical user and fragrance intelligence.

## Owner
Recommendation Intelligence Team.

## Dependencies
USER_DNA_MODEL.md, FRAGRANCE_INTELLIGENCE_MODEL.md, EXPLAINABILITY.md, ENGINE_VERSIONING.md.

## Canonical Responsibility
Produce explainable, reproducible recommendations from canonical inputs.

## Inputs
1. Persistent User DNA
2. Confidence projections
3. Preference and collection state
4. Recommendation objective
5. Serving context
6. Canonical Fragrance Intelligence

## Constraints
1. Never consume raw provider schemas directly.
2. Never consume test internals (order, candidate pool, question definitions).
3. Every recommendation persists reproducibility metadata.

## Reproducibility Payload
1. user DNA snapshot id
2. fragrance intelligence snapshot id
3. engine component versions
4. objective
5. context
6. reason trace id
7. ranking policy id
