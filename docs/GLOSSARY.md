# Glossary

## Purpose
Canonical definitions for architectural and intelligence terms used across FragranceDNA.

## Canonical Terms

1. Persistent User DNA
The canonical, long-lived, replayable user intelligence profile derived from historical interactions through versioned event and projection pipelines.

2. Grounding DNA
The declared-preference component of user intelligence produced from grounding inputs and used as a persistent prior.

3. Behavior DNA
The observed-preference component of user intelligence produced from behavioral events such as evaluations, feedback, and interaction outcomes.

4. Current DNA
The confidence-aware blend of Grounding DNA and Behavior DNA used as current user preference intelligence.

5. Persistent Fragrance Intelligence
The canonical, versioned, provider-agnostic fragrance knowledge model with evidence and confidence metadata.

6. Canonical Fragrance Intelligence
The mandatory normalized fragrance representation consumed by recommendation and other intelligence systems, independent of provider schema.

7. Recommendation Objective
An explicit recommendation intent that defines the problem being optimized, such as discovery, office, blind buy, or collection expansion.

8. Context
Temporary serving constraints and situational inputs, such as season, budget, occasion, weather, availability, and recently worn state.

9. Confidence
A certainty measure associated with intelligence outputs; includes global confidence and granular confidence dimensions.

10. Global Confidence
Overall certainty score for the current quality and stability of user preference intelligence.

11. Axis Confidence
Certainty score for a specific DNA axis.

12. Attribute Confidence
Certainty score for a specific fragrance attribute preference signal.

13. Preference State
User taste-related state such as liked, disliked, hidden, rejected, and favorites.

14. Collection State
Ownership-related state such as owned, wishlist, collection membership, and inventory-related status.

15. Event
An immutable, time-stamped record of a user or system interaction captured for learning, replay, and auditing.

16. Event Store
The append-only canonical store of immutable events used as the source for projections and replay.

17. Projection
A derived, rebuildable read model computed from events for operational serving and user experience.

18. Replay
Deterministic reconstruction of historical projection or decision states using stored events, versions, and snapshots.

19. Explainability
The ability to provide accurate, trace-derived reasons for decisions, profile evolution, and confidence changes.

20. Reproducibility
The ability to reconstruct the exact inputs, versions, policy context, and resulting output for a historical decision.

21. Candidate Pool
The current set of eligible items considered by a decision engine before final ranking and selection.

22. Learning Stage
A maturity phase of user intelligence development, such as Discovery, Refinement, Validation, or Maintenance, used to tune adaptive behavior.

22a. Collection Reinforcement
An optional learning source in which a user evaluates fragrances from My Collection through the same canonical evaluation engine used by Adaptive Test, producing additional behavior evidence that refines existing intelligence without rebuilding DNA from scratch.

23. Shadow Mode
A deployment mode where new logic runs in parallel for comparison without affecting user-visible outputs.

24. Feature Flag
A runtime control used to safely enable, disable, or segment behavior without redeploying core logic.

25. Dual-Write
A migration strategy where data is written to legacy and new pipelines simultaneously to validate parity before cutover.

26. Compatibility Adapter
A transitional component preserving backward compatibility between legacy and canonical contracts during migration.

27. Evaluation Catalog
The curated fragrance set used by the Test Engine strictly for learning user intelligence.

28. Recommendation Catalog
The large-scale fragrance search universe used by Recommendation Intelligence.

29. Test Engine
The intelligence subsystem that optimizes learning quality and confidence growth, independent of recommendation provider concerns.

30. Recommendation Engine
The intelligence subsystem that ranks candidates for a given objective and context using canonical user and fragrance intelligence.

31. Reason Trace
The persisted explainability artifact linking model inputs, policy outputs, and human-readable rationale.

32. Decision Snapshot
The persisted reproducibility artifact containing user intelligence state references, model versions, policy, objective, context, and output metadata.

33. Engine Versioning
Independent version lineage for intelligence components used to support safe upgrades and historical reproducibility.

34. Architecture Freeze
The governance state in which canonical architecture is fixed and changes require explicit ADR-based exceptions.
