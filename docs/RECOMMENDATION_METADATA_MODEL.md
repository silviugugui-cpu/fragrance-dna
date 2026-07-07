# Recommendation Metadata Model

## Purpose
Define the canonical persistent fragrance metadata domain consumed by the Recommendation Engine.

## Scope
Architecture only.

This model contains only fragrance-level properties.

This model does not define:
1. recommendation logic
2. user preferences
3. user DNA
4. compatibility scores
5. Fragrance Intelligence

## Canonical Boundary
Recommendation Metadata is part of the Master Perfume Object and remains fact-oriented.

Recommendation Metadata is not a ranking output.

## Owner
Builder Metadata Domain Owner.

## Producer Stage
Metadata stage.

## Primary Consumers
1. Recommendation Engine (as factual input only)
2. Search and filtering interfaces
3. Governance and validation workflows

## Metadata Domains
1. Brand Type Metadata
2. Availability Metadata
3. Seasonality Metadata
4. Gender Direction Metadata
5. Occasion Metadata
6. Performance Estimate Metadata

## Canonical Contract (Conceptual)
```yaml
recommendationMetadata:
  brandType: {}
  availabilityClass: {}
  recommendedSeasons: []
  genderDirection: {}
  occasionMetadata: []
  performanceEstimates: {}
```

## Property Specification

### 1. Brand Type Metadata

| Field | Purpose | Description | Data Type | Required / Optional | Source | Producer | Consumer | Deterministic / Inferred | Validation Rules | Future Extensibility |
|---|---|---|---|---|---|---|---|---|---|---|
| recommendationMetadata.brandType | Classify fragrance brand positioning for downstream filtering contexts | Canonical brand-type label for the fragrance brand context | enum string | Optional | Brand Intelligence facts, canonical brand classification inputs | Metadata stage | Recommendation Engine, filtering | Deterministic | Must be one of: Designer, Niche, Dupe | Additional enumerations can be appended through governed schema versioning |
| recommendationMetadata.brandTypeSource | Ensure traceability of brand type fact | Origin of factual brand-type assignment | string | Optional | Metadata provenance inputs | Metadata stage | Governance, audit | Deterministic | Non-empty when brandType is present | Can be extended to structured provenance object |

### 2. Availability Metadata

| Field | Purpose | Description | Data Type | Required / Optional | Source | Producer | Consumer | Deterministic / Inferred | Validation Rules | Future Extensibility |
|---|---|---|---|---|---|---|---|---|---|---|
| recommendationMetadata.availabilityClass | Represent practical market availability of the fragrance | Canonical availability class label | enum string | Optional | Availability factual channels | Metadata stage | Recommendation Engine, filtering | Deterministic | Must be one of: Common, Moderate, Rare, Discontinued, Unknown | Region-specific availability classes can be added |
| recommendationMetadata.availabilityVerifiedAt | Track freshness of availability fact | Last verification timestamp for availability class | string (ISO-8601) | Optional | Availability verification source | Metadata stage | Governance, Recommendation Engine | Deterministic | Must be valid ISO-8601 when present | Multiple verification timestamps per region can be added |

### 3. Seasonality Metadata

| Field | Purpose | Description | Data Type | Required / Optional | Source | Producer | Consumer | Deterministic / Inferred | Validation Rules | Future Extensibility |
|---|---|---|---|---|---|---|---|---|---|---|
| recommendationMetadata.recommendedSeasons | Represent factual season suitability labels at fragrance level | Canonical season suitability list | enum string[] | Optional | Fragrance metadata channels, factual descriptors | Metadata stage | Recommendation Engine, UI filters | Inferred | Each value must be one of: Spring, Summer, Autumn, Winter, All Season | Weighted season suitability can be added as separate structure |
| recommendationMetadata.seasonalityConfidence | Convey confidence of season suitability assignment | Confidence scalar for recommendedSeasons assignment | number | Optional | Metadata inference outputs | Metadata stage | Governance, Recommendation Engine | Inferred | Must be between 0 and 1 | Per-season confidence map can be added |

### 4. Gender Direction Metadata

| Field | Purpose | Description | Data Type | Required / Optional | Source | Producer | Consumer | Deterministic / Inferred | Validation Rules | Future Extensibility |
|---|---|---|---|---|---|---|---|---|---|---|
| recommendationMetadata.genderDirection | Represent fragrance market direction labeling | Canonical direction category of fragrance presentation | enum string | Optional | Classification metadata and canonical labels | Metadata stage | Recommendation Engine, filters | Deterministic | Must be one of: Leaning Feminine, Unisex, Leaning Masculine | Multi-axis presentation labels can be added |
| recommendationMetadata.genderDirectionSource | Keep provenance of direction label | Source channel for genderDirection fact | string | Optional | Metadata provenance | Metadata stage | Governance | Deterministic | Non-empty when genderDirection exists | Structured provenance object can be added |

### 5. Occasion Metadata

| Field | Purpose | Description | Data Type | Required / Optional | Source | Producer | Consumer | Deterministic / Inferred | Validation Rules | Future Extensibility |
|---|---|---|---|---|---|---|---|---|---|---|
| recommendationMetadata.occasionMetadata | Represent factual usage-context suitability labels | Canonical list of applicable occasions | enum string[] | Optional | Metadata factual channels and classification context | Metadata stage | Recommendation Engine, UI filters | Inferred | Values must be in: Daily, Office, Casual, Formal, Evening, Special Occasion | Can be extended with context-specific tags |
| recommendationMetadata.occasionConfidence | Represent confidence of occasion assignment | Confidence scalar for occasionMetadata | number | Optional | Metadata inference outputs | Metadata stage | Governance, Recommendation Engine | Inferred | Must be between 0 and 1 | Per-occasion confidence map can be added |

### 6. Performance Estimate Metadata

| Field | Purpose | Description | Data Type | Required / Optional | Source | Producer | Consumer | Deterministic / Inferred | Validation Rules | Future Extensibility |
|---|---|---|---|---|---|---|---|---|---|---|
| recommendationMetadata.performanceEstimates.projectionEstimate | Provide projection-level factual estimate for fragrance serving context | Canonical projection estimate value | number | Optional | Performance factual channels | Metadata stage | Recommendation Engine, display | Inferred | Must be bounded to configured canonical range | Can be replaced by categorical + numeric dual form |
| recommendationMetadata.performanceEstimates.longevityEstimate | Provide longevity-level factual estimate | Canonical longevity estimate value | number | Optional | Performance factual channels | Metadata stage | Recommendation Engine, display | Inferred | Must be bounded to configured canonical range | Can add interval uncertainty representation |
| recommendationMetadata.performanceEstimates.versatilityEstimate | Represent inferred versatility trait at fragrance level | Canonical versatility estimate value | number | Optional | Metadata inference from factual descriptors | Metadata stage | Recommendation Engine | Inferred | Must be bounded to configured canonical range | Can add context-specific versatility variants |
| recommendationMetadata.performanceEstimates.formalityEstimate | Represent inferred formality trait at fragrance level | Canonical formality estimate value | number | Optional | Metadata inference from factual descriptors | Metadata stage | Recommendation Engine | Inferred | Must be bounded to configured canonical range | Can add occasion-dependent formality maps |
| recommendationMetadata.performanceEstimates.luxuryEstimate | Represent inferred luxury trait at fragrance level | Canonical luxury estimate value | number | Optional | Metadata inference from factual descriptors | Metadata stage | Recommendation Engine | Inferred | Must be bounded to configured canonical range | Can add evidence breakdown fields |
| recommendationMetadata.performanceEstimates.scaleVersion | Track estimate scale contract version | Version of estimate scale definitions | string | Optional | Metadata stage configuration | Metadata stage | Governance, Recommendation Engine | Deterministic | Semantic version format when present | Allows non-breaking scale evolution |

## Canonical Enumerations

### Brand Type
1. Designer
2. Niche
3. Dupe

### Availability Class
1. Common
2. Moderate
3. Rare
4. Discontinued
5. Unknown

### Recommended Seasons
1. Spring
2. Summer
3. Autumn
4. Winter
5. All Season

### Gender Direction
1. Leaning Feminine
2. Unisex
3. Leaning Masculine

### Occasion Metadata
1. Daily
2. Office
3. Casual
4. Formal
5. Evening
6. Special Occasion

## Validation Rules (Domain-Level)
1. Recommendation Metadata must contain only fragrance-level properties.
2. Recommendation Metadata must not include user-specific fields.
3. Recommendation Metadata must not include compatibility or ranking scores.
4. Enum-constrained properties must use canonical values exactly.
5. Numeric estimate properties must obey the canonical scale contract.
6. Unknown data must be represented explicitly via allowed value/state, never by silent reinterpretation.

## Dependency Rules
1. Recommendation Metadata depends on canonical Builder outputs only.
2. Recommendation Metadata may consume Translation output and factual metadata channels.
3. Recommendation Metadata must not depend on Recommendation Engine runtime state.
4. Recommendation Metadata must not depend on User DNA or Fragrance Intelligence outputs.

## Readiness
This model is architecture-ready for inclusion as a dedicated domain in the Master Perfume Object and for downstream consumption by Recommendation Engine implementations.