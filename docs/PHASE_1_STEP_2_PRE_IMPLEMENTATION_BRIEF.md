# Phase 1 - Step 2 Pre-Implementation Brief

## 1. Purpose of Step 2
Build the Projection Foundation required by Canonical Architecture v2, Phase 1.
This step introduces projection contracts, projection model scaffolding, reducer skeletons, registry skeleton, and replay engine skeleton.
No runtime integration is included.

## 2. Canonical Architecture Components Introduced
1. Projection contracts
2. Projection model contracts
3. Replay-safe reducer skeletons
4. Version-aware projection registry skeleton
5. Replay engine skeleton

## 3. Files That Will Be Modified
None expected for runtime modules.
Documentation updates may be limited to this brief and Step 2 completion reporting only.

## 4. Files That Will Be Created
Planned creation scope:
1. lib/intelligence/projections/types.ts
2. lib/intelligence/projections/models/userProjection.ts
3. lib/intelligence/projections/models/groundingProjection.ts
4. lib/intelligence/projections/models/testProjection.ts
5. lib/intelligence/projections/models/profileProjection.ts
6. lib/intelligence/projections/reducers/userProjectionReducer.ts
7. lib/intelligence/projections/reducers/groundingProjectionReducer.ts
8. lib/intelligence/projections/reducers/testProjectionReducer.ts
9. lib/intelligence/projections/reducers/profileProjectionReducer.ts
10. lib/intelligence/projections/registry/projectionRegistry.ts
11. lib/intelligence/projections/replay/replayEngine.ts
12. lib/intelligence/projections/index.ts

## 5. Files That Will Depend on These Modules in Later Phases
No dependency wiring in Step 2.
Expected future consumers:
1. app/grounding/page.tsx
2. app/test/page.tsx
3. lib/dnaSession.ts
4. lib/engine/userProfileManager.ts
5. future event ingestion adapter module
6. future projection persistence adapters

## 6. Architecture Impact
Adds infrastructure-only scaffolding for event-sourced projection architecture.
Introduces stable, version-aware contracts to support deterministic replay.
No production behavior change.

## 7. Regression Risks
Low.
Potential risks:
1. Type collisions or import path mistakes.
2. Future misuse of skeleton reducers as production logic without implementation.
Mitigation:
- Keep reducers explicit placeholders.
- Keep unknown event path returning previous state.

## 8. Rollback Strategy
If needed, remove newly introduced projection foundation files in a single revert commit.
No data rollback required.
No runtime rollback required.

## 9. Validation Strategy
1. TypeScript diagnostics on all created files.
2. Static analysis using workspace diagnostics.
3. Import validation by ensuring successful type resolution.
4. Circular dependency detection on new projection module graph.
5. Explicit confirmation checklist:
- no runtime behavior change
- no API behavior change
- no persistence change
- no DB change
- no migration executed
- no user-visible change

## Implementation Guardrails
1. No persistence layer work.
2. No event emit/consume runtime wiring.
3. No feature flag behavior changes.
4. No modifications to Grounding/Test/Profile/Recommendation runtime modules.
