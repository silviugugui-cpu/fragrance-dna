# Phase 1 Technical Design Brief

## Purpose
Prepare Phase 1 implementation of the Intelligence Foundation with zero hidden surprises before production code changes.

## Owner
Architecture + Backend + Data + Frontend leads.

## Dependencies
- PRODUCT_DOCTRINE.md
- ARCHITECTURE_PRINCIPLES.md
- CANONICAL_ARCHITECTURE_V2.md
- DATA_MODEL.md
- EVENT_MODEL.md
- USER_DNA_MODEL.md
- ENGINEERING_GUIDELINES.md
- IMPLEMENTATION_ROADMAP.md

## Phase Scope
Phase 1 introduces the event spine and projection skeleton while preserving existing user-facing behavior.
No Test Engine v2 policy changes are included in this phase.
No Recommendation Engine v2 ranking changes are included in this phase.

## 1. Current Architecture Inventory

### 1.1 Modules that remain unchanged in Phase 1
- app UI pages and design system components except wiring points needed for event dual-write.
- lib/engine/seedBuilder.ts
- lib/engine/userVectorBuilder.ts
- lib/engine/matchingEngine.ts
- lib/engine/scoringEngine.ts
- lib/data and collection helper modules.

### 1.2 Modules that will be extended in Phase 1
- app/grounding/page.tsx
- app/test/page.tsx
- lib/dnaSession.ts
- lib/engine/userProfileManager.ts
- lib/auth/authContext.ts
- lib/types.ts

Extension pattern:
- Keep current behavior.
- Add event production hooks.
- Add projection read adapters behind feature flags.

### 1.3 Modules that are not changed now but marked for later deprecation
- lib/dnaSession.ts as localStorage-canonical session authority.
- lib/engine/userProfileManager.ts as localStorage-canonical user profile authority.
- direct dependence on lib/db.json for test sequencing in app/test/page.tsx.

### 1.4 Modules that become adapters in Phase 1
- Legacy Session Adapter inside lib/dnaSession.ts:
  Bridges local storage session shape into event and projection contracts.
- Legacy Profile Adapter inside lib/engine/userProfileManager.ts:
  Bridges legacy profile update calls into event write API.
- Legacy Auth Adapter inside lib/auth/authContext.ts:
  Provides authenticated identity envelope for event metadata while auth remains local in current implementation.

## 2. Dependency Graph

### 2.1 Before Phase 1
Grounding page
-> seedBuilder
-> userVectorBuilder
-> dnaSession localStorage write
-> userProfileManager localStorage write
-> route push test

Test page
-> lib/db.json static list
-> dnaSession localStorage read and write
-> userProfileManager localStorage write

DNA page and results page
-> dnaSession localStorage read
-> userProfileManager localStorage read

Auth context
-> localStorage user and session only

### 2.2 After Phase 1
Grounding page
-> seedBuilder
-> userVectorBuilder
-> Event Producer
-> Legacy adapter writes remain behind dual-write
-> projection read optional behind flag

Test page
-> Event Producer for answer and checkpoint events
-> Legacy adapter writes remain behind dual-write
-> projection read optional behind flag

DNA session module
-> Session Projection Reader adapter
-> Event Producer for session updates
-> legacy local session compatibility remains enabled

User profile manager
-> User DNA Projection Reader adapter
-> Event Producer for profile updates
-> legacy local profile compatibility remains enabled

New shared foundation modules
-> Event envelope validator
-> Idempotency key utility
-> Event transport client
-> Projection access layer
-> Feature flag evaluator

### 2.3 Dependency changes explained
1. UI pages stop writing intelligence state only to local storage and start producing canonical events.
2. Current local storage paths remain active during Phase 1 for backward compatibility.
3. Read model migration is controlled by projection read feature flags.
4. Event store and projection layer become required dependencies for intelligence-producing flows.

## 3. Database Design

## 3.1 Phase 1 database objective
Create minimal durable schema to support event intake, idempotency, and initial projections without changing recommendation policy logic.

## 3.2 Proposed tables

1. user_event_store
- id bigint primary key generated always as identity
- event_id uuid not null unique
- event_type varchar(120) not null
- event_version int not null
- user_id varchar(120) not null
- session_id varchar(120) null
- occurred_at timestamptz not null
- received_at timestamptz not null default now()
- payload_json jsonb not null
- context_json jsonb null
- engine_versions_json jsonb not null
- correlation_id varchar(120) null
- causation_id varchar(120) null
- idempotency_key varchar(200) not null
- producer varchar(120) not null

2. user_event_idempotency
- id bigint primary key generated always as identity
- idempotency_key varchar(200) not null unique
- event_id uuid not null unique
- user_id varchar(120) not null
- created_at timestamptz not null default now()

3. projection_user_dna_current
- user_id varchar(120) primary key
- grounding_dna_json jsonb not null
- behavior_dna_json jsonb not null
- current_dna_json jsonb not null
- confidence_global numeric(5,2) not null
- confidence_axes_json jsonb not null
- confidence_attributes_json jsonb not null
- profile_stage varchar(32) not null
- source_event_offset bigint not null
- updated_at timestamptz not null

4. projection_user_session_current
- user_id varchar(120) not null
- session_id varchar(120) not null
- status varchar(32) not null
- current_index int not null
- answered_count int not null
- answered_order_json jsonb not null
- current_vector_json jsonb not null
- source_event_offset bigint not null
- updated_at timestamptz not null
- primary key (user_id, session_id)

5. projection_user_state
- user_id varchar(120) primary key
- preference_state_json jsonb not null
- collection_state_json jsonb not null
- recommendation_state_json jsonb not null
- source_event_offset bigint not null
- updated_at timestamptz not null

## 3.3 Indexes
- idx_event_user_time on user_event_store (user_id, occurred_at desc)
- idx_event_type_time on user_event_store (event_type, occurred_at desc)
- idx_event_session_time on user_event_store (session_id, occurred_at desc)
- idx_event_received on user_event_store (received_at desc)
- gin_event_payload on user_event_store using gin (payload_json)
- gin_event_context on user_event_store using gin (context_json)

## 3.4 Constraints
- unique event_id
- unique idempotency_key across event intake
- check event_version > 0
- check event_type not empty
- foreign identity consistency checks performed at service layer for now

## 3.5 Idempotency strategy
1. Producer creates deterministic idempotency key from:
- user_id
- event_type
- producer action id
- action timestamp bucket or monotonic sequence id
2. API writes to user_event_idempotency first using insert conflict handling.
3. If key already exists, API returns existing event_id and treats write as success.

## 3.6 Versioning strategy
- event_version is per event_type semantic version integer.
- engine_versions_json stores per-component versions:
  grounding_model, dna_model, confidence_model, projection_model, client_schema.
- Projection rows track source_event_offset for deterministic replay.

## 4. Event Contracts Introduced in Phase 1

## 4.1 Event list

1. grounding_submitted_v1
- Producer: app/grounding/page.tsx
- Consumer: projection builders for user DNA and session
- Payload:
  love_tokens array string
  neutral_tokens array string
  avoid_tokens array string
  seed_json object
  user_vector_json object
- Versioning: event_type grounding_submitted, event_version 1
- Idempotency: key grounded on user_id + session_id + grounding_submission_nonce

2. test_answer_submitted_v1
- Producer: app/test/page.tsx
- Consumer: session projection, DNA projection, confidence projection
- Payload:
  fragrance_id string
  answer_dimensions_json object
  current_index int
  answered_count int
- Versioning: test_answer_submitted version 1
- Idempotency: user_id + session_id + fragrance_id + answer_revision

3. dna_session_checkpointed_v1
- Producer: lib/dnaSession.ts adapter path
- Consumer: session projection
- Payload:
  current_index int
  answered_order_json array string
  current_vector_json object
  confidence_estimate numeric
- Versioning: dna_session_checkpointed version 1
- Idempotency: user_id + session_id + checkpoint_sequence

4. user_vector_updated_v1
- Producer: lib/engine/userProfileManager.ts adapter path
- Consumer: user DNA projection and confidence projection
- Payload:
  vector_json object
  confidence_level numeric
  total_interactions int
  evolution_stage string
- Versioning: user_vector_updated version 1
- Idempotency: user_id + source_action_id

5. legacy_state_mirrored_v1
- Producer: compatibility adapter layer
- Consumer: migration validation pipeline only
- Payload:
  legacy_session_hash string
  legacy_profile_hash string
  mirrored_at timestamptz
- Versioning: legacy_state_mirrored version 1
- Idempotency: user_id + mirror_window

## 4.2 Event envelope standard
All events carry common envelope fields defined in EVENT_MODEL.md.

## 5. Projection Design

## 5.1 Projections introduced in Phase 1
1. User DNA Current Projection
2. User Session Current Projection
3. User State Projection

## 5.2 Event to projection mapping

1. User DNA Current Projection
Updated by:
- grounding_submitted_v1
- test_answer_submitted_v1
- user_vector_updated_v1

2. User Session Current Projection
Updated by:
- grounding_submitted_v1
- test_answer_submitted_v1
- dna_session_checkpointed_v1

3. User State Projection
Updated by:
- legacy_state_mirrored_v1 in Phase 1
- future collection and feedback events in later phases

## 5.3 Consistency guarantees
- Event ingestion is durable before projection update acknowledgement.
- Projections are eventually consistent with bounded lag target under one second in normal load.
- Active session reads use read-your-write preference when projection flag is enabled.

## 5.4 Replay strategy
1. Rebuild projection by replaying user_event_store ordered by id then occurred_at.
2. Projection processors are pure and deterministic per version.
3. Replay can target:
- full rebuild
- single user rebuild
- single projection rebuild

## 6. Feature Flags for Phase 1

1. ff_events_write_enabled
- Enables event write path from UI adapters.

2. ff_events_write_required
- If enabled, intelligence mutation fails when event write fails.
- Initially false, then raised gradually.

3. ff_projections_read_user_dna
- Reads user DNA from projection store instead of local profile only.

4. ff_projections_read_session
- Reads session from projection store instead of local session only.

5. ff_dual_write_legacy_profile
- Controls local profile write continuity.

6. ff_dual_write_legacy_session
- Controls local session write continuity.

7. ff_phase1_shadow_validation
- Enables parity logging between legacy and projection state.

## 7. Dual-Write Strategy

## 7.1 Goal
Preserve existing behavior while introducing canonical event persistence safely.

## 7.2 Write path in Phase 1
1. User action triggers existing legacy mutation function.
2. Same action produces canonical event.
3. Event is stored durably.
4. Legacy local storage write remains active behind dual-write flags.
5. Shadow validator compares projection state with legacy state snapshots.

## 7.3 Read path in Phase 1
- Default reads remain legacy for minimal regression risk.
- Projection reads are enabled incrementally via flags for cohorts.

## 7.4 Failure handling
1. If event write fails and ff_events_write_required is false:
- keep legacy behavior
- emit telemetry and error trace
2. If ff_events_write_required is true:
- block state mutation
- show recoverable UI error path

## 7.5 Cutover guardrails
- projection parity threshold must be met before making projection reads default.
- rollback path always returns to legacy reads while preserving event writes.

## 8. Testing Plan

## 8.1 Unit tests
- event envelope validation
- idempotency key generation
- projection reducers for each event
- adapter mapping from legacy shapes to event payloads

## 8.2 Integration tests
- event API ingestion with idempotency conflicts
- end-to-end dual-write from grounding and test actions
- projection updates from event stream

## 8.3 Replay tests
- deterministic replay from event history to projection state
- replay parity for sampled users against expected snapshots

## 8.4 Migration tests
- legacy state mirror event generation
- projection bootstrap for users with existing local profile and session data

## 8.5 Regression tests
- grounding completion and navigation
- test progression and answer persistence
- dna page confidence and vector display still functional

## 8.6 Non-functional tests
- ingestion throughput smoke tests
- projection lag checks under concurrent writes

## 9. Acceptance Checklist

1. Event ingestion endpoint implemented with idempotency guarantees.
2. Phase 1 event contracts implemented and documented.
3. Projection tables created with indexes and constraints.
4. Projection processors implemented and replay-capable.
5. Grounding and test flows dual-write enabled behind flags.
6. Legacy behavior preserved when projection reads are disabled.
7. Shadow parity telemetry available and reviewed.
8. Replay determinism tests passing.
9. Regression suite passing for existing user flows.
10. Rollback to legacy read path verified.
11. Documentation updated for any contract changes during implementation.

## 10. Risk Register

## 10.1 Technical risks
1. Event schema drift between frontend producers and backend consumers.
Mitigation: schema contracts, typed validators, contract tests.

2. Non-deterministic projection reducers.
Mitigation: pure reducers, replay tests, version pinning.

3. Idempotency key collisions.
Mitigation: strict key strategy, uniqueness constraints, collision telemetry.

## 10.2 Migration risks
1. Legacy and projection state divergence.
Mitigation: shadow parity checks, cohort rollout, fallback reads.

2. User identity inconsistencies from current local auth model.
Mitigation: stable user id adapter and explicit migration mapping.

## 10.3 Performance risks
1. Event write latency affecting UI interactions.
Mitigation: asynchronous transport where safe, batching optional, circuit breakers.

2. Projection lag under burst traffic.
Mitigation: indexed queries, bounded consumer batches, lag alarms.

## 10.4 Rollback risks
1. Partial cutover leaves mixed state assumptions.
Mitigation: flag matrix with tested rollback combinations.

2. Event write required flag enabled prematurely.
Mitigation: staged rollout and SLO gates before mandatory mode.

## Out of Scope for Phase 1
- Dynamic fragrance-specific question generation.
- Adaptive candidate policy changes.
- Recommendation objective-aware ranking changes.
- Canonical Fragrance Intelligence provider ingestion rollout.

## Phase 1 Implementation Start Gate
Implementation may begin only after this brief is approved and the feature flag matrix is accepted.
