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
Explicit attribute-liking answers are combined as a recency-weighted mean:
newest weight 1, each preceding answer multiplied by 0.75. Tested attributes
use this mean instead of their prior, with influence attenuated by confidence.
A difference from Grounding is provisional after one response. It is resolved
only when the last two explicit answers agree in direction, the weighted mean
contradicts the prior in that direction, and confidence is at least 0.5.
Unconfirmed attributes retain their priors; Grounding is not immutable.

Schema-version 2 evaluations keep three independent signals:
- Perception (0-3) records noticeability, never liking or preference confidence.
- Explicit attribute liking (-2 to 2) updates that attribute's preference.
- Overall fragrance liking (-2 to 2) informs composition/similarity ranking,
  never all constituent notes.

Preference confidence depends only on explicit attribute-liking evidence and
its consistency. "Not noticed" and "unable" cannot lower an affinity.
Attribute confidence is min(1, count / 3), halved when the last three explicit
answers contain different signs (including Neutral). Vector and matching
contributions multiply the weighted affinity by this confidence; their
denominators do not normalize low confidence back to full influence.
Unconfirmed priors have influence 0.35. Conflicting recent answers and
provisional Grounding differences reopen adaptive questions.
Historical sliders are archived as `legacy-intensity` perception, not preference.
Legacy vector/confidence/history projections remain archived, not active DNA.

The personal radar, dominant axes, shifts and narrative use ten olfactive axes.
Profile Confidence is a separate statistic, never a Presence value. Conceptual
fragrance Presence remains reserved for an independently measured signal.
Territory cards and affinity calculations share the same typed canonical axes.
Collection coverage shows the classified/owned denominator; it does not infer a
personal explorer category from an arbitrary number of represented territories.

## Constraints
1. Context never mutates DNA directly.
2. Collection state never mutates DNA directly.
3. Collection evaluations may refine Behavior DNA through canonical behavior events, but they do not rebuild the profile from scratch.
4. DNA is projection-derived and replayable.
