# Event Ordering Contract

## Purpose
Define the canonical deterministic event ordering strategy used by replay and projection rebuild flows.

## Owner
Architecture + Data Platform.

## Dependencies
EVENT_MODEL.md, ENGINE_VERSIONING.md.

## Canonical Responsibility
Guarantee deterministic replay order across environments and future engine versions.

## Ordering Fields
Events are ordered using this precedence:
1. occurredAt ascending
2. receivedAt ascending
3. eventId ascending (lexicographic tie-break)

## Version Interaction
1. Event version does not define ordering.
2. Event version defines payload interpretation and reducer compatibility.
3. Replay order is independent from reducer version selection.

## Replay Guarantees
1. Same ordered input stream and same reducer versions produce the same projection output.
2. Unknown events are safely ignored by reducers and do not break replay determinism.
3. Replay order validation must fail fast when ordering contract is violated.

## Tie-Breaking Strategy
1. If occurredAt is identical, compare receivedAt.
2. If receivedAt is identical, compare eventId.
3. eventId tie is invalid and indicates duplicate or malformed event stream.

## Sequence Semantics
Replay sequence is deterministic and monotonic per ordered stream.
lastSequence in projection metadata reflects the count position of the last applied event.
