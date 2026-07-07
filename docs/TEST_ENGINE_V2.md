# Test Engine v2

## Purpose
Define the canonical adaptive learning engine that improves Persistent User DNA.

## Owner
Test Intelligence Team.

## Dependencies
USER_DNA_MODEL.md, FRAGRANCE_INTELLIGENCE_MODEL.md, EVENT_MODEL.md.

## Canonical Responsibility
Learn user intelligence efficiently and accurately, independent from recommendation providers.

## Core Rules
1. Test engine objective is learning, not recommending from provider catalogs.
2. Evaluation catalog is decoupled from recommendation catalog.
3. Evaluation dimensions are fragrance-specific and generated from canonical attributes.
4. Universal hardcoded question sets are not allowed.
5. Adaptive Test and Collection Reinforcement must use the same canonical evaluation engine and behavior-signal methodology.

## Learning Loop
1. Select candidate maximizing information gain + expected enjoyment + diversity constraints.
2. Generate dynamic evaluation dimensions.
3. Capture immutable evaluation event.
4. Update DNA and confidence projections.
5. Re-evaluate next best candidate.

## Shared Evaluation Engine
Adaptive Test remains the primary discovery mechanism.
Collection Reinforcement may reuse the same canonical evaluation engine after a user adds a fragrance to My Collection and chooses to evaluate it.
Collection Reinforcement does not introduce a second scoring methodology.
It reuses canonical attributes, canonical question generation, canonical behavior events, canonical behavior projection, and the DNA Fusion Engine through a different entry point.

## Stage Policy
1. Discovery
2. Refinement
3. Validation
4. Maintenance

Each stage tunes exploration rate, confidence thresholds, and stopping criteria.
