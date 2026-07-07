# Canonical Master Perfume Object

## Purpose
Define the canonical complete fragrance object contract that every fragrance must eventually follow inside the future Master Perfume Database.

## Owner
Fragrance Intelligence Team + Architecture.

## Dependencies
PRODUCT_DOCTRINE.md, ARCHITECTURE_PRINCIPLES.md, CANONICAL_ARCHITECTURE_V2.md, ARCHITECTURE_FREEZE_V2_1.md, FRAGRANCE_METADATA_MODEL.md, FRAGRANCE_METADATA_SCHEMA.md, RECOMMENDATION_ENGINE.md, CONFIDENCE_ENGINE.md.

## Canonical Responsibility
Provide the architecture-level object contract that Builder will eventually generate and that downstream systems will consume consistently.

## Scope
Architecture and documentation only.

This document defines object contract semantics only.

## Hard Constraints
1. No runtime behavior change.
2. No Discovery Engine redesign.
3. No Recommendation Engine redesign.
4. No Learning Engine redesign.
5. No Confidence Engine redesign.
6. No Builder implementation changes.
7. No existing fragrance JSON file modifications.
8. Preserve backward compatibility.
9. Diagnostic Library remains the canonical fragrance intelligence source.

## Not A Database Schema
This contract is not relational storage design.
It defines conceptual object domains, field responsibilities, inheritance semantics, validity requirements, and governance requirements.

## Canonical Object Mission
The Canonical Master Perfume Object represents a single fragrance as one unified object composed of:
1. Existing canonical Fragrance Intelligence
2. Canonical Fragrance Metadata
3. Brand Intelligence inheritance-aware metadata
4. Provenance and governance metadata

## Complete Canonical Object Hierarchy

### Top-Level Object
master_perfume_object

### Top-Level Domains
1. identity
2. classification
3. brand_intelligence
4. availability
5. recommendation_metadata
6. performance
7. relationships
8. fragrance_intelligence
9. builder_metadata
10. governance_metadata

## Canonical Object Skeleton (Conceptual)
```yaml
master_perfume_object:
  identity: {}
  classification: {}
  brand_intelligence: {}
  availability: {}
  recommendation_metadata: {}
  performance: {}
  relationships: {}
  fragrance_intelligence: {}
  builder_metadata: {}
  governance_metadata: {}
```

## Field State Semantics (Mandatory Rule)
No property in the canonical fragrance object may contain meaningless null values.

Every optional property must explicitly carry one field-state semantic:
1. Known
2. Estimated
3. Unknown
4. Not Applicable

### Semantic Definitions
1. Known: factual value exists with reliable source basis.
2. Estimated: value is inferred by Builder or canonical enrichment logic.
3. Unknown: property is relevant but reliable value is not currently available.
4. Not Applicable: property does not apply to this fragrance by definition.

### Canonical Null Rule
1. Null must not be used as a metadata meaning.
2. Empty placeholders must not be used as metadata meaning.
3. Optional properties must always be state-explicit.
4. Builder must never emit ambiguous metadata.

## Provenance Rule For Inferred Properties
Every inferred property must support provenance and traceability.

Mandatory provenance support fields for inferred properties:
1. source
2. generated_by
3. method
4. version
5. confidence
6. timestamp

Provenance is mandatory for governance and reproducibility.

## Domain Contracts
Each section below defines Purpose, Producer, Consumers, Mandatory fields, and Optional fields.

### 1. Identity

#### Purpose
Provide stable cross-system fragrance identity.

#### Producer
Builder (from canonical sources and normalization rules).

#### Consumers
Recommendation, Search, Collection, Explainability, Future APIs.

#### Mandatory Fields
1. id
2. brand
3. fragrance_name

#### Optional Fields
1. collection
2. concentration
3. release_year
4. perfumer
5. identity_aliases

### 2. Classification

#### Purpose
Provide canonical class metadata for filtering and serving context.

#### Producer
Builder.

#### Consumers
Recommendation, Search, Collection, Explainability, Future APIs.

#### Mandatory Fields
1. origin

#### Optional Fields
1. brand_type
2. style_family
3. classification_confidence

#### Canonical Classification Rule
origin is independent from style semantics.
origin has canonical values:
1. Designer
2. Niche
3. Dupe

### 3. Brand Intelligence

#### Purpose
Represent stable brand-level metadata shared by fragrances from the same brand.

#### Producer
Builder (from canonical brand knowledge and enrichment pipeline).

#### Consumers
Recommendation, Search, Collection, Explainability, Future APIs.

#### Mandatory Fields
1. brand_id
2. brand_name

#### Optional Fields
1. availability_defaults
2. accessibility_defaults
3. brand_category
4. brand_popularity
5. brand_reputation
6. brand_metadata_confidence

#### Inheritance Model (Mandatory Architectural Decision)
1. Fragrance objects inherit applicable Brand Intelligence defaults.
2. Fragrance-level metadata may override inherited defaults only when fragrance-specific evidence requires override.
3. Inheritance resolution is metadata-domain specific and must be explicit.
4. Override does not mutate the brand-level source metadata.
5. Inheritance logic is implementation concern; inheritance contract is frozen here.

### 4. Availability

#### Purpose
Represent fragrance-level availability and acquisition metadata.

#### Producer
Builder.

#### Consumers
Recommendation, Search, Collection, Explainability, Future APIs.

#### Mandatory Fields
1. inheritance_resolution_status

#### Optional Fields
1. availability_class
2. easy_to_find
3. discontinued
4. limited_edition
5. reformulated
6. availability_override_reason

#### Inheritance Coupling Rule
Availability may inherit brand defaults and may be overridden by fragrance-specific evidence.

### 5. Recommendation Metadata

#### Purpose
Provide recommendation-facing metadata context without embedding recommendation algorithms.

#### Producer
Builder.

#### Consumers
Recommendation, Search, Collection, Explainability, Future APIs.

#### Mandatory Fields
1. recommendation_metadata_version

#### Optional Fields
1. gender_direction
2. seasonality
3. occasion_suitability
4. context_tags
5. compatibility_hints
6. recommendation_flags

#### Boundary Rule
This domain provides metadata only.
It does not define recommendation formulas, ranking logic, or filtering algorithms.

### 6. Performance

#### Purpose
Provide canonical performance descriptors.

#### Producer
Builder.

#### Consumers
Recommendation, Search, Collection, Explainability, Future APIs.

#### Mandatory Fields
1. performance_metadata_version

#### Optional Fields
1. projection_estimate
2. longevity_estimate
3. sillage_estimate
4. performance_notes

### 7. Relationships

#### Purpose
Represent explicit fragrance structural relationships.

#### Producer
Builder (from curated and validated relationship data).

#### Consumers
Recommendation, Search, Collection, Explainability, Future APIs.

#### Mandatory Fields
1. relationship_metadata_version

#### Optional Fields
1. clone_of
2. inspired_by
3. flanker_of
4. same_collection_relationship
5. near_duplicate_group

#### Relationship Rule
Relationship metadata supports explainability and warnings.
It does not force recommendation penalty rules by itself.

### 8. Fragrance Intelligence

#### Purpose
Reference existing canonical fragrance intelligence domains only.

#### Producer
Diagnostic Library (canonical source), then Builder references and normalization.

#### Consumers
Recommendation, Search, Collection, Explainability, Future APIs.

#### Mandatory Fields
1. dna_axes
2. semantic_layer
3. user_attributes

#### Optional Fields
1. intelligence_confidence
2. intelligence_version
3. intelligence_evidence_summary

#### Frozen Intelligence Rule
This document does not redesign Fragrance Intelligence.
It references existing canonical intelligence only.

### 9. Builder Metadata

#### Purpose
Record Builder generation and enrichment trace context.

#### Producer
Builder.

#### Consumers
Recommendation, Search, Collection, Explainability, Future APIs.

#### Mandatory Fields
1. builder_version
2. processing_version
3. generated_at

#### Optional Fields
1. generation_profile
2. enrichment_pipeline_id
3. transformation_trace
4. builder_notes

### 10. Governance Metadata

#### Purpose
Provide governance, validation, and lifecycle control metadata.

#### Producer
Builder and Validation Pipeline.

#### Consumers
Recommendation, Search, Collection, Explainability, Future APIs.

#### Mandatory Fields
1. validation_status
2. last_updated
3. canonical_contract_version

#### Optional Fields
1. provenance_bundle
2. confidence_bundle
3. quality_flags
4. audit_markers
5. deprecation_markers

## Canonical Optional Field Encoding Guidance
For any optional property, the object should preserve explicit state semantics.

Conceptual encoding pattern:
```yaml
property_name:
  state: Known | Estimated | Unknown | Not Applicable
  value: any
  provenance_ref: optional reference to provenance bundle
```

This is a semantic contract pattern, not implementation schema.

## Object Lifecycle (Canonical)
Raw Import

↓

Normalization

↓

Knowledge Enrichment

↓

Metadata Enrichment

↓

Validation

↓

Canonical Master Perfume Object

### Lifecycle Notes
1. Raw Import ingests source fragrance records.
2. Normalization stabilizes identity and canonical field mapping.
3. Knowledge Enrichment adds evidence-backed intelligence and metadata signals.
4. Metadata Enrichment resolves domain metadata plus inheritance and state semantics.
5. Validation enforces canonical contract completeness and governance requirements.
6. Output is one canonical object consumable across platform surfaces.

## Validation Contract
A fragrance object is valid only if all conditions below are true:
1. Mandatory domains exist.
2. Mandatory fields in each domain are present.
3. Required identifiers are present and non-ambiguous.
4. Metadata inheritance resolution is explicit where inheritance applies.
5. Optional fields use explicit state semantics (Known, Estimated, Unknown, Not Applicable).
6. No invalid null semantics are present.
7. Every inferred property has required provenance support.
8. Fragrance Intelligence references canonical intelligence domains.
9. Governance metadata indicates validation status and canonical contract version.

## Future Compatibility Contract
The canonical object is extension-ready without redesign through:
1. domain-based hierarchy that allows adding new fields per domain
2. explicit optional state semantics avoiding implicit null behavior
3. provenance bundles that support richer inference methods and Builder versions
4. independent Brand Intelligence and Fragrance Intelligence layers
5. recommendation_metadata as a metadata contract surface independent of algorithm definitions
6. governance version fields supporting forward and backward compatibility

This supports future:
1. new metadata
2. new Builder versions
3. new recommendation metadata
4. new explainability metadata

without architectural redesign.

## Out Of Scope
This document does not define:
1. database tables
2. SQLite schema
3. Builder implementation
4. translation algorithms
5. recommendation algorithms
6. search implementation

## Acceptance Criteria
Milestone is complete only if:
1. complete fragrance object is defined
2. every object section has documented responsibilities
3. Brand Intelligence inheritance is defined
4. null semantics are formally defined
5. provenance requirements are documented
6. validation contract is documented
7. object is compatible with future Builder and Master Perfume Database

## Architecture Readiness Assessment

### Assessment Scope
Evaluate readiness to begin implementation of:
1. Master Perfume Database
2. Builder
3. Knowledge Base
4. Translation Engine

### Readiness Result
Architecture is largely implementation-ready at contract level.

### Ready Areas
1. Core Engine boundaries are frozen and respected.
2. Metadata schema and complete canonical object hierarchy are documented.
3. Brand Intelligence inheritance contract is defined.
4. Optional field state semantics are explicit.
5. Provenance and validation governance contracts are explicit.
6. Fragrance Intelligence boundary remains canonical and unchanged.

### Remaining Gaps (Non-Critical, Pre-Implementation Clarifications)
1. Controlled value catalogs for selected enums should be finalized in a dedicated value-set annex.
2. Canonical provenance method taxonomy should be enumerated for governance consistency.
3. Domain-level validation severity policy (error versus warning) should be documented for the Validation Pipeline.
4. Translation Engine mapping policy should define how external fields map into canonical domains before implementation starts.

### Final Assessment
No critical architecture gaps block implementation start.
The Fragrance Intelligence Platform architecture is considered implementation-ready, with the listed non-critical clarifications recommended to improve implementation consistency.