/**
 * Canonical Architecture v2
 * Phase 1 - Step 2
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 * ADR-0003 Persistent User DNA
 *
 * Purpose:
 * Export projection foundation contracts, models, reducers, registry, and replay skeleton.
 */

export * from "@/lib/intelligence/projections/types";

export * from "@/lib/intelligence/projections/models/userProjection";
export * from "@/lib/intelligence/projections/models/groundingProjection";
export * from "@/lib/intelligence/projections/models/testProjection";
export * from "@/lib/intelligence/projections/models/profileProjection";
export * from "@/lib/intelligence/projections/models/behaviorProjection";

export * from "@/lib/intelligence/projections/reducers/userProjectionReducer";
export * from "@/lib/intelligence/projections/reducers/groundingProjectionReducer";
export * from "@/lib/intelligence/projections/reducers/testProjectionReducer";
export * from "@/lib/intelligence/projections/reducers/profileProjectionReducer";
export * from "@/lib/intelligence/projections/reducers/behaviorProjectionReducer";

export * from "@/lib/intelligence/projections/registry/projectionRegistry";
export * from "@/lib/intelligence/projections/replay/replayEngine";
