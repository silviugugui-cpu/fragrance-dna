# Canonical Architecture v2

## Purpose
Define the frozen implementation-ready architecture for FragranceDNA.

## Owner
Architecture.

## Dependencies
PRODUCT_DOCTRINE.md, ARCHITECTURE_PRINCIPLES.md.

## Canonical Responsibility
Primary architecture blueprint for implementation and governance.

## System Identity
FragranceDNA is a Persistent Olfactory Intelligence Platform.

## Core Systems
1. User Intelligence System
- Captures immutable user interactions.
- Projects Persistent User DNA and confidence models.
- Accepts evidence from Grounding, Adaptive Test, and optional Collection Reinforcement.

2. Test Intelligence System
- Adaptive learning workflow.
- Objective: maximize quality and efficiency of learning.

3. Fragrance Intelligence System
- Normalizes external provider data into canonical fragrance knowledge.
- Maintains confidence and version lineage for fragrance facts.

4. Recommendation Intelligence System
- Consumes Persistent User DNA + context + objective + canonical fragrance intelligence.
- Produces explainable and reproducible recommendations.

## Canonical Boundaries
1. Test Engine and Recommendation Engine are independent systems.
2. Persistent User DNA is the only contract for user intelligence exchange.
3. Canonical Fragrance Intelligence is the only contract for fragrance knowledge exchange.

## Canonical Data Flows
1. Interaction Flow
User Interaction -> Event Store -> Projections (DNA, confidence, states, explainability)

Collection Reinforcement is part of the same interaction flow.
It does not create a parallel learning system.

2. Recommendation Flow
User DNA + Context + Objective + Canonical Fragrance Intelligence -> Retrieval -> Ranking -> Explainable Recommendation

3. Replay Flow
Historical events + model version snapshots -> deterministic reconstruction of prior decision states

## Non-Negotiable Constraints
1. Browser storage is cache only.
2. Authenticated database profile is canonical source of truth.
3. No direct provider-schema consumption in recommendation logic.
4. No hardcoded universal test questions.
5. No opaque decisions without explainability traces.
