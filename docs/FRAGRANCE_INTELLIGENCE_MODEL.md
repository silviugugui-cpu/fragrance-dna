# Fragrance Intelligence Model

## Purpose
Define canonical fragrance knowledge representation independent of data providers.

## Owner
Fragrance Intelligence Team.

## Dependencies
DATA_MODEL.md, ENGINE_VERSIONING.md.

## Canonical Responsibility
Provider-agnostic fragrance intelligence consumed by recommendation and analysis systems.

## Canonical Layer
External Providers -> Canonical Fragrance Intelligence -> Platform Consumers

## Canonical Fragrance Concepts
1. Canonical fragrance identity
2. Canonical attributes and axis mapping
3. Provider mapping lineage
4. Evidence count
5. Expert confidence
6. Community confidence
7. Attribute confidence
8. Version history

## Rules
1. Recommendation systems must not consume raw provider schemas.
2. Provider changes are isolated in ingestion adapters.
3. Canonical representation is versioned and replay-compatible.
