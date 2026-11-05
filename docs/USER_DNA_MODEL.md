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
Current DNA uses explicit Grounding choices as initial per-attribute priors.
Love is positive, Avoid negative, explicit Neutral zero; unrated is absent.
A submitted, explicit attribute-liking answer replaces its prior, including when
it contradicts Grounding. The conflict is recorded as resolved by newer direct
evidence. Unconfirmed attributes retain their priors.

Schema-version 2 evaluations keep three independent signals:
- Perception (0-3) records noticeability, never liking or preference confidence.
- Explicit attribute liking (-2 to 2) updates that attribute's preference.
- Overall fragrance liking (-2 to 2) informs composition/similarity ranking,
  never all constituent notes.

Preference confidence depends only on explicit attribute-liking evidence and
its consistency. "Not noticed" and "unable" cannot lower an affinity.
The latest direct liking is the effective affinity; repeated consistent answers
increase confidence, while conflicting recent answers reopen adaptive questions.
Historical sliders are archived as `legacy-intensity` perception, not preference.
Legacy vector/confidence/history projections remain archived, not active DNA.

## Constraints
1. Context never mutates DNA directly.
2. Collection state never mutates DNA directly.
3. Collection evaluations may refine Behavior DNA through canonical behavior events, but they do not rebuild the profile from scratch.
4. DNA is projection-derived and replayable.
