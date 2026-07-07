# Learning Model

## Purpose
Define the canonical conceptual model for how FragranceDNA learns from user behavior over time.

## Owner
User Intelligence + Test Intelligence.

## Dependencies
PRODUCT_DOCTRINE.md, ARCHITECTURE_PRINCIPLES.md, CANONICAL_ARCHITECTURE_V2.md, USER_DNA_MODEL.md, TEST_ENGINE_V2.md, EXPLAINABILITY.md.

## Canonical Responsibility
Specify the learning semantics that govern how FragranceDNA accumulates user intelligence, updates confidence, and balances exploration against exploitation without binding the system to a single implementation strategy.

## Scope
1. This document defines the conceptual learning model.
2. This document does not prescribe implementation-specific formulas, storage layouts, or coefficient values.
3. This document does not change recommendation behavior.
4. This document does not change adaptive selector behavior.
5. This document exists to provide a stable canonical contract for future implementation work.

## Core Model
FragranceDNA learns by converting immutable user interactions into persistent behavioral evidence.
That evidence updates Behavior DNA, confidence projections, and future test-selection priorities.
The learning system optimizes for durable understanding of the user, not only immediate prediction accuracy.

The platform has exactly three canonical learning sources:
1. Grounding
2. Adaptive Test
3. Collection Reinforcement

Grounding establishes the initial prior.
Adaptive Test remains the primary discovery mechanism.
Collection Reinforcement is an optional long-term refinement mechanism that contributes additional evidence through the same canonical evaluation pipeline used by Adaptive Test.

The model operates under five architectural constraints:
1. Learning is event-derived and replayable.
2. Persistent User DNA remains the only canonical user intelligence contract.
3. Recommendation logic consumes learned intelligence but does not define learning truth.
4. Context may influence serving decisions but does not directly rewrite canonical DNA.
5. Every learning outcome must remain explainable and reproducible.

## 1. Behavior Affinity

### Definition
Behavior Affinity is the learned directional relationship between a user and a fragrance attribute, axis, accord family, or other canonical behavioral feature inferred from observed interactions.

### Meaning
Behavior Affinity expresses what the system has learned from behavior rather than what the user initially declared.
It represents empirical preference signal strength and direction, including positive attraction, negative aversion, and uncertainty.

### Evolution
Behavior Affinity evolves through accumulated interaction evidence.
Consistent evidence strengthens directional certainty.
Mixed evidence reduces directional certainty or reveals conditional preference structure.
As evidence matures, Behavior Affinity becomes a more influential component of Current DNA while remaining confidence-aware and replayable.

## 2. Behavior Confidence

### Definition
Behavior Confidence is the system's estimate of how trustworthy learned behavioral conclusions are for a user, feature, or region of the profile.

### Evidence Accumulation
Behavior Confidence increases when the system observes repeated, interpretable, and sufficiently diverse evidence.
Evidence quality matters in addition to evidence quantity.
Signals with broader behavioral coverage, stronger consistency, clearer polarity, and better contextual separation contribute more useful confidence than isolated or ambiguous events.

### Confidence Evolution
Confidence should evolve gradually rather than jump abruptly from limited evidence.
It may increase at different rates across global, axis, and attribute levels.
New contradictory evidence may slow confidence growth, flatten it, or reduce it when prior conclusions become less reliable.
Confidence growth should reflect both what is known and how robustly it is known.
Confidence may be reinforced by repeated evidence from either Adaptive Test or Collection Reinforcement when both use the same canonical behavioral interpretation rules.

## 3. Information Gain

### Definition
Information Gain is the expected reduction in user-profile uncertainty produced by evaluating a candidate.

### Purpose
Its purpose is to prioritize learning efficiency.
The engine should prefer candidates that are likely to clarify unresolved parts of the user's profile, distinguish between competing hypotheses, or improve confidence where the profile remains weak.

### Influence on Candidate Selection
Candidates with higher Information Gain are conceptually favored when the system needs more learning.
Information Gain may come from novelty, profile coverage, disagreement resolution, uncertainty reduction, or strategic confirmation of an emerging pattern.
The model should allow different operational stages to value different forms of information gain without changing the canonical meaning of the concept.

## 4. Expected Enjoyment

### Definition
Expected Enjoyment is the model's estimate of how likely a candidate is to produce a positive or at least acceptable user experience during learning.

### Purpose
Its purpose is to keep learning humane, credible, and engagement-preserving.
The learning engine should not optimize for information extraction alone if doing so would repeatedly create poor user experiences.

### Trade-offs
Expected Enjoyment can conflict with pure exploration.
High-information candidates may be more uncertain or riskier.
Highly enjoyable candidates may teach less when the model already understands that region of preference space.
The canonical model therefore treats Expected Enjoyment as a balancing force rather than an absolute objective.

## 5. Learning Pressure

### Definition
Learning Pressure is the system's current need to acquire new information rather than rely on existing understanding.

### Purpose
Learning Pressure provides the canonical conceptual bridge between exploration and exploitation.
It expresses how strongly the engine should prefer candidates that improve understanding versus candidates that mainly confirm or capitalize on existing knowledge.

### When the Engine Prefers Exploration
The engine conceptually prefers exploration when uncertainty is high, coverage is uneven, confidence is shallow, contradictions are unresolved, or profile regions remain under-observed.
Exploration is also appropriate when new evidence suggests the current profile may be incomplete, oversimplified, or overfit to narrow interaction history.

### When the Engine Prefers Exploitation
The engine conceptually prefers exploitation when confidence is already strong in the relevant regions, major coverage gaps have narrowed, and the next best learning step is to refine or validate known preferences rather than discover entirely new ones.
Exploitation is appropriate when the user experience would benefit from staying near learned preference structure while still generating useful evidence.

### Canonical Interpretation
Learning Pressure is not a fixed stage label or single metric.
It is a synthesized concept that may be inferred from uncertainty, confidence distribution, evidence diversity, stage policy, unresolved conflicts, and recent learning progress.

## 6. Coverage Gap

### Definition
Coverage Gap is the degree to which relevant areas of the user's preference space remain insufficiently observed or understood.

### Purpose
Its purpose is to prevent the profile from appearing confident only because it has repeatedly sampled a narrow region.
Coverage Gap helps the system distinguish between genuine understanding and local familiarity.

### Future Implementation
Future implementations may estimate Coverage Gap across axes, attribute clusters, style families, intensity ranges, or other canonical learning surfaces.
Coverage Gap should remain a guide for exploration pressure and profile completeness rather than a user-facing score by default.

## 7. Behavior Stability

### Definition
Behavior Stability is the degree to which learned behavioral patterns remain consistent across time, contexts, and repeated observations.

### Purpose
Its purpose is to separate durable preference structure from temporary noise, novelty effects, mood-driven variance, or sparse contradictions.
Stable patterns deserve stronger long-term influence in Current DNA than unstable ones.

### Future Implementation
Future implementations may evaluate stability through repeat confirmations, time-separated consistency, contradiction patterns, or context-aware persistence checks.
Behavior Stability should shape how strongly learned evidence is treated as enduring intelligence without requiring that all preferences become rigid.

## 8. Novelty

### Definition
Novelty is the degree to which a candidate exposes the user to meaningfully new learning territory relative to prior observations.

### Purpose
Its purpose is to expand the model's understanding, improve coverage, and reduce the risk of a narrow or repetitive learning loop.
Novelty supports exploration, but it is not valuable merely because it is different.
The system should value novelty when it meaningfully contributes to profile understanding, contradiction testing, or coverage expansion.

## 9. Candidate Scoring

### Conceptual Scoring Model
Candidate selection should be guided by a conceptual multi-objective scoring model rather than a single static rule.
At minimum, the model may consider:
1. Information Gain
2. Expected Enjoyment
3. Learning Pressure
4. Coverage Gap
5. Behavior Confidence distribution
6. Behavior Stability considerations
7. Novelty
8. Diversity and safety constraints

The canonical requirement is not a fixed formula.
The requirement is that candidate scoring remains explainable, stage-aware, and aligned with the learning objective of improving Persistent User DNA efficiently and responsibly.

### Flexibility Constraint
Implementations must remain free to change weighting strategy, scoring structure, normalization approach, or stage policy without invalidating this document, provided that:
1. Persistent User DNA remains the canonical intelligence output.
2. Learning remains event-derived and replayable.
3. Selection logic remains explainable.
4. Recommendation behavior is not implicitly redefined by learning heuristics.

## 10. Future Evolution

### Evolution Principle
The learning model should evolve through versioned semantics, adapters, and replay-safe projection changes rather than destructive redefinition of existing profiles.

### Backward Compatibility
Future improvements must preserve the ability to interpret historical events and reconstruct prior profile states under the model version active at the time.
Existing user profiles should not be invalidated simply because the learning model becomes more expressive.

### Safe Expansion Paths
The model may evolve by:
1. Adding new confidence dimensions.
2. Refining how uncertainty, stability, or coverage are measured.
3. Improving stage policy and exploration strategy.
4. Introducing richer explainability artifacts.
5. Expanding the feature surfaces over which learning operates.

### Non-Breaking Rule
Model evolution is non-breaking when historical intelligence remains replayable, explainable, and mappable into the current canonical DNA framework.
If a future change cannot satisfy those conditions, it requires explicit versioning and migration strategy.

## Summary
FragranceDNA learning is the disciplined accumulation of behavioral evidence into persistent, confidence-aware user intelligence.
Its canonical objective is not merely to predict the next enjoyable item, but to build durable olfactory understanding that compounds over time and can be reused across future product surfaces.
Grounding initializes the profile, Adaptive Test discovers it efficiently, and Collection Reinforcement optionally refines it without rebuilding DNA from scratch.