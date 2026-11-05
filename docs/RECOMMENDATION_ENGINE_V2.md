# Recommendation Engine v2

## Explicit preference evidence

Recommendations replay schema-2 submitted evaluations with explicit Grounding
priors. They score attribute liking/prior compatibility and overall fragrance
liking with canonical-attribute Jaccard similarity as independent contributions.
Noticeability never increases liking. Overall dislike never assigns dislike to
individual notes. Direct attribute liking may replace a contradictory Grounding
Avoid; Avoid is therefore not an immutable hard exclusion.

Legacy, unversioned DNA vectors are not used as liking evidence. `userVector`
is not required or consumed by the endpoint or sent by the client. Scores derive
from validated evaluation records and explicit priors. Explicit attributes use
their recency-weighted affinity multiplied by evidence confidence; Grounding
priors have weight 0.35. The denominator counts matching attributes without
cancelling low-confidence attenuation. Overall liking remains separate.
Catalog membership, owned exclusions,
badge filters and public source/score whitelists remain unchanged.

The API retains its 0..1 comparative ranking score. The interface displays
`Preference fit` as a value out of 100, with an explicit explanation that this
is neither a probability nor a guarantee of liking.

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
