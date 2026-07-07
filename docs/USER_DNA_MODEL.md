# User DNA Model

## Purpose
Define the canonical user intelligence model and learning semantics.

## Owner
User Intelligence Team.

## Dependencies
DATA_MODEL.md, EVENT_MODEL.md, ENGINE_VERSIONING.md.

## Canonical Responsibility
Authoritative specification for Persistent User DNA and confidence modeling.

## Learning Sources
1. Grounding
2. Adaptive Test
3. Collection Reinforcement

Adaptive Test is the primary discovery mechanism.
Collection Reinforcement is optional and contributes additional behavior evidence through the same canonical evaluation pipeline.

## Canonical DNA Components
1. Grounding DNA (declared preference prior)
2. Behavior DNA (observed interaction evidence)
3. Current DNA (confidence-aware blend)

## Confidence Components
1. Global confidence
2. Axis confidence
3. Attribute confidence

## State Components
1. Preference state: liked, disliked, hidden, rejected
2. Collection state: owned, wishlist, collection membership
3. Recommendation interaction state

## Fusion Principle
Current DNA is derived from Grounding DNA and Behavior DNA with dynamic confidence weights.
Grounding influence may decrease with confidence growth but never reaches zero.

## Constraints
1. Context never mutates DNA directly.
2. Collection state never mutates DNA directly.
3. Collection evaluations may refine Behavior DNA through canonical behavior events, but they do not rebuild the profile from scratch.
4. DNA is projection-derived and replayable.
