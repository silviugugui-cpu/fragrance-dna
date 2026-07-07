# Event Model

## Purpose
Define immutable event contracts for all learning and decision signals.

## Owner
Backend + Data Platform.

## Dependencies
DATA_MODEL.md, ENGINE_VERSIONING.md.

## Canonical Responsibility
Single contract for intelligence-producing interactions.

## Event Principles
1. Append-only and immutable.
2. Versioned schema with backward compatibility.
3. Idempotent ingestion.
4. Deterministic replay support.

## Mandatory Event Metadata
1. event_id
2. event_type
3. user_id (authenticated principal)
4. session_id (if applicable)
5. occurred_at
6. received_at
7. payload
8. context
9. engine component versions
10. correlation and causation ids
11. idempotency key

## Canonical Event Groups
1. grounding events
2. fragrance evaluation events
3. recommendation decision events
4. recommendation feedback events
5. collection and preference state events
6. session lifecycle events

## Phase 1 Foundation Modules
Current Phase 1 event foundation modules are implemented in:
1. lib/intelligence/events/types.ts
2. lib/intelligence/events/contracts.ts
3. lib/intelligence/events/envelope.ts
4. lib/intelligence/events/idempotency.ts
5. lib/intelligence/events/eventFactory.ts
6. lib/intelligence/events/eventValidator.ts
7. lib/intelligence/events/eventSerializer.ts
8. lib/intelligence/events/eventRepository.ts
9. lib/intelligence/events/eventStore.ts
10. lib/intelligence/events/eventPublishingPipeline.ts
11. lib/intelligence/events/eventWriter.ts
12. lib/intelligence/events/ordering.ts

Feature flag contract for Phase 1 rollout is implemented in:
1. lib/intelligence/flags/phase1Flags.ts

## Replay Contract
Replays must recreate equivalent projections and recommendation snapshots for a given historical version set.

Canonical deterministic ordering is defined in:
1. EVENT_ORDERING_CONTRACT.md

Current ordering utility implementation is:
1. lib/intelligence/events/ordering.ts
