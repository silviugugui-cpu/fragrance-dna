# Contributing

## Purpose
Define the mandatory engineering workflow for all contributors implementing Canonical Architecture v2.

## Scope
Applies to all code, data model, and documentation changes in this repository.

## Branch Strategy
1. Protected branch: main.
2. No direct pushes to main.
3. Work only on short-lived feature branches:
- feat/<area>-<short-description>
- fix/<area>-<short-description>
- chore/<area>-<short-description>
- docs/<area>-<short-description>
4. One branch should target one phase task or one tightly scoped change set.
5. Rebase frequently on main to reduce drift.

## Commit Message Conventions
Use Conventional Commits:
1. feat: new functionality
2. fix: bug fix
3. refactor: behavior-preserving internal change
4. docs: documentation changes
5. test: test additions or updates
6. chore: maintenance or tooling

Format:
<type>(<scope>): <short summary>

Examples:
1. feat(events): add grounding event envelope schema
2. refactor(test-engine): extract candidate policy adapter
3. docs(architecture): update canonical v2 references

Rules:
1. Subject line max 72 chars.
2. Use imperative voice.
3. Include rationale in commit body for architectural changes.
4. Reference ADR id when applicable.

## Pull Request Workflow
1. Open PR as draft for early architectural visibility.
2. Link roadmap phase and checklist.
3. Link related ADR(s) and docs updated.
4. Keep PR scope focused and reviewable.
5. Convert to ready only after local checks pass.

## Pull Request Checklist
1. Scope
- Change is scoped to a single phase or approved sub-task.
- No unrelated refactors.

2. Architecture
- No violation of PRODUCT_DOCTRINE.md.
- No violation of ARCHITECTURE_PRINCIPLES.md.
- No new competing preference model.

3. Data and Persistence
- Event-first path respected for intelligence-producing interactions.
- No direct mutation of Persistent User DNA projections.
- Browser storage not used as source of truth.

4. Recommendation Integrity
- No direct provider schema consumption in recommendation logic.
- Canonical Fragrance Intelligence boundaries preserved.

5. Explainability and Reproducibility
- Decision trace and version metadata preserved for recommendation changes.
- Explainability artifacts updated where required.

6. Quality
- Tests added or updated.
- Documentation updated.
- Migration and rollback notes included if relevant.

## Architecture Compliance Checklist (Mandatory)
1. Feature produces and/or consumes persistent intelligence.
2. Test Engine and Recommendation Engine remain decoupled.
3. Evaluation catalog and recommendation catalogs remain decoupled.
4. User DNA and context remain separate.
5. Preference state and collection state remain separate.
6. Event contracts are versioned and replay-safe.
7. Feature-flag strategy exists for risky behavior changes.
8. Dual-write and shadow mode are used where migration risk is non-trivial.

## ADR Workflow
1. ADR required for:
- Architectural exceptions
- Boundary changes
- Breaking contract changes
- Engine versioning policy changes
- Data model changes affecting canonical contracts

2. ADR process:
- Create draft in docs/ADR
- Include context, decision, alternatives, consequences, rollback path
- Request architecture review
- Merge ADR before or with implementation PR

3. ADR lifecycle states:
- Proposed
- Accepted
- Superseded
- Rejected

4. Superseding ADRs must explicitly reference replaced ADR ids.

## Testing Requirements
1. Unit tests for new policy logic and mapping logic.
2. Integration tests for event ingestion and projection updates.
3. Contract tests for event schema compatibility.
4. Replay tests for deterministic reconstruction where applicable.
5. Feature-flag tests for cutover and fallback paths.
6. Regression tests for existing user flows.

Minimum expectations before merge:
1. New code paths covered.
2. Existing critical flows unchanged or explicitly approved.
3. No known failing tests in touched areas.

## Documentation Requirements
For any architecture-relevant change, update docs in same PR:
1. DATA_MODEL.md for entity or projection changes.
2. EVENT_MODEL.md for event contract changes.
3. USER_DNA_MODEL.md for intelligence logic changes.
4. FRAGRANCE_INTELLIGENCE_MODEL.md for canonical fragrance model changes.
5. TEST_ENGINE_V2.md and/or RECOMMENDATION_ENGINE_V2.md for behavior changes.
6. ENGINE_VERSIONING.md for version policy changes.
7. EXPLAINABILITY.md for reasoning changes.
8. IMPLEMENTATION_ROADMAP.md for phase progress updates.

## Mandatory Review Rules
The following domains require explicit specialist review approval before merge.

1. Persistent User DNA
Required reviewer: User Intelligence owner.
Must verify:
- No direct writes bypassing event and projection pipeline.
- No competing preference representation introduced.
- Confidence semantics remain consistent.

2. Event Store
Required reviewer: Backend or Data owner.
Must verify:
- Schema versioning and idempotency.
- Replay compatibility.
- Migration safety and rollback path.

3. Explainability
Required reviewer: Recommendation or Explainability owner.
Must verify:
- Reason traces correspond to actual model inputs and policy outputs.
- No opaque decision path exposed to users.

4. Canonical Fragrance Intelligence
Required reviewer: Fragrance Intelligence owner.
Must verify:
- No provider schema leakage beyond canonical layer.
- Mapping lineage and confidence metadata maintained.

## Merge Rules
1. Squash merge preferred for single-topic PRs.
2. Rebase merge acceptable for clean commit series with clear history.
3. No merge if required checks or required domain approvals are missing.

## Release Safety Rules
1. Risky behavior changes must be behind feature flags.
2. Data migrations must include verification and rollback steps.
3. Shadow mode required before recommendation and test policy cutovers.
4. Post-merge monitoring plan required for production-impacting changes.
