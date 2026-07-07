# Explainability

## Purpose
Define explainability requirements for recommendations, DNA evolution, and confidence evolution.

## Owner
Recommendation + User Intelligence.

## Dependencies
EVENT_MODEL.md, USER_DNA_MODEL.md, RECOMMENDATION_ENGINE_V2.md.

## Canonical Responsibility
Ensure all user-facing intelligence outcomes are traceable and understandable.

## Explainability Scope
1. Recommendation rationale
2. Recommendation exclusions
3. DNA evolution rationale
4. Confidence change rationale
5. Profile evolution timeline

## Explainability Requirements
1. Reason traces must derive from actual decision inputs and model states.
2. Every recommendation must have a reproducible explanation payload.
3. Explanations must include positive and negative evidence.

## Compliance Constraint
No opaque production decision may be shipped without explainability artifacts.
