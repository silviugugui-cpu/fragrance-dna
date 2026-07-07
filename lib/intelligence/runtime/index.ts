/**
 * Canonical Architecture v2
 * Phase 1 - Step 3
 *
 * ADR References:
 * ADR-0002 Event Sourcing
 *
 * Purpose:
 * Export runtime infrastructure abstractions without production wiring.
 */

export * from "@/lib/intelligence/runtime/eventBus";
export * from "@/lib/intelligence/runtime/eventPublisher";
export * from "@/lib/intelligence/runtime/eventIngestion";
export * from "@/lib/intelligence/runtime/eventDispatcher";

export * from "@/lib/intelligence/runtime/bootstrap/reducerBootstrap";
export * from "@/lib/intelligence/runtime/bootstrap/projectionBootstrap";

export * from "@/lib/intelligence/runtime/shadow/shadowValidation";
