# Builder Data Architecture

## Purpose
Define the canonical internal data architecture of the FragranceDNA Builder administration system.

## Owner
Fragrance Intelligence Team + Architecture.

## Dependencies
PRODUCT_DOCTRINE.md, ARCHITECTURE_PRINCIPLES.md, CANONICAL_ARCHITECTURE_V2.md, ARCHITECTURE_FREEZE_V2_1.md, FRAGRANCE_METADATA_MODEL.md, FRAGRANCE_METADATA_SCHEMA.md, CANONICAL_MASTER_PERFUME_OBJECT.md.

## Canonical Responsibility
Specify the complete Builder internal data model used to transform raw fragrance sources into canonical Master Perfume Objects for the Master Perfume Database.

## Scope
Architecture and documentation only.

This document does not define:
1. SQL tables
2. database code
3. Builder module implementation
4. mapping implementation
5. transformation algorithms
6. runtime service logic

## Hard Constraints
1. Do not simplify requested architecture.
2. Do not redesign frozen engines.
3. Do not modify runtime behavior.
4. Do not implement Builder logic.
5. Do not implement database code.
6. Do not create SQL schema.
7. Every new architecture decision must be documented in this file.

## Builder System Identity
Builder is an internal administration system.

Builder responsibility:
transform raw fragrance data into canonical Master Perfume Objects that are published into the Master Perfume Database.

Builder does not redesign or override Core Engine responsibilities.

## Canonical Internal Data Architecture Overview
Builder manages independent internal datasets with strict ownership boundaries.

Canonical internal datasets:
1. Raw Import Database
2. Brand Intelligence Database
3. Knowledge Base
4. Translation Rules
5. Fragrance Intelligence Database
6. Master Perfume Database

## Global Architectural Principles
1. Every internal database has one primary responsibility.
2. No duplicated ownership across datasets.
3. Every generated artifact is versioned.
4. Every inferred value has provenance.
5. Master Perfume Database is always generated.
6. Master Perfume Database is never manually edited.
7. Diagnostic Library remains canonical fragrance intelligence source.
8. Builder enrichment may extend metadata but may not rewrite frozen runtime contracts.

## Internal Dataset Contracts

### 1. Raw Import Database

#### Purpose
Store source-ingested fragrance records before canonical normalization.

#### Responsibilities
1. preserve original source payload fidelity
2. keep source lineage per ingestion batch
3. support traceability back to import source snapshots
4. provide stable input to normalization stage

#### Input Sources
1. external provider exports
2. curated source packages
3. operational fragrance pools
4. future upstream ingestion connectors

#### Lifetime
1. long enough to guarantee reproducibility and audit replay
2. retained per governed archival policy
3. never treated as runtime recommendation source

#### Ownership Boundary
Raw Import owns source-state records only.
It does not own canonical identities, inferred metadata, or runtime-serving objects.

### 2. Brand Intelligence Database

#### Purpose
Store brand-level metadata shared across fragrances from the same brand.

#### Responsibilities
1. maintain shared brand metadata package
2. define brand defaults used for fragrance-level inheritance
3. preserve brand-level provenance and version lineage
4. expose override resolution context for fragrance metadata

#### Shared Brand Metadata
Examples of brand-level metadata domains:
1. availability defaults
2. accessibility defaults
3. brand category
4. brand popularity
5. brand reputation
6. other stable brand-level metadata

#### Brand Defaults
Brand defaults are canonical baseline values applied to eligible fragrance metadata domains before fragrance-specific overrides.

#### Brand Inheritance
1. inheritance is explicit and domain-aware
2. inheritance resolution must be traceable
3. inherited values remain distinguishable from overridden values

#### Future Overrides
Fragrance-level metadata may override inherited defaults only when fragrance-specific evidence requires deviation.

#### Ownership Boundary
Brand Intelligence owns brand-level shared defaults and brand metadata.
It does not own fragrance-level final object composition.

### 3. Knowledge Base

#### Purpose
Maintain canonical enrichment vocabulary and semantic reference assets used by Builder enrichment stages.

#### Responsibilities
1. maintain notes knowledge resources
2. maintain accords vocabulary
3. maintain olfactive family references
4. maintain synonym references
5. maintain translation vocabulary support
6. maintain relationship vocabulary and reference structures
7. provide versioned semantic assets for enrichment consistency

#### Core Knowledge Domains
1. Notes
2. Accords
3. Families
4. Synonyms
5. Translation vocabulary
6. Relationships

#### Ownership Boundary
Knowledge Base owns semantic vocabulary resources.
It does not own final fragrance object output.

### 4. Translation Rules

#### Purpose
Define canonical translation policy from external source fields to Builder canonical data domains.

#### Responsibilities
1. external source normalization policy
2. canonical mapping rules policy
3. conflict resolution policy
4. translation contract versioning
5. translation traceability policy

#### External Source Normalization
Translation Rules define how heterogeneous external field semantics are normalized into stable canonical semantics.

#### Canonical Mapping Rules
Translation Rules define declarative mapping contracts between source semantics and canonical data domains.
This document defines mapping architecture only, not concrete mapping implementations.

#### Conflict Resolution
Translation Rules define policy precedence for conflicting source signals.
Conflict outcomes must be deterministic, versioned, and provenance-traceable.

#### Versioning
Every translation rule set is versioned and bound to generated artifacts for replay and audit.

#### Ownership Boundary
Translation Rules own translation policy.
They do not own source ingestion records or final runtime objects.

### 5. Fragrance Intelligence Database

#### Purpose
Store canonical fragrance intelligence package used by Builder to assemble final canonical objects.

#### Responsibilities
1. preserve canonical fragrance intelligence references
2. host intelligence-aligned fragrance records for composition
3. track intelligence enrichment lineage
4. support intelligence version and provenance context

#### Canonical Fragrance Intelligence Domains
1. DNA Axes
2. Semantic Layer
3. User Attributes

#### Builder-Generated Intelligence
Builder may generate additional intelligence-support metadata or confidence descriptors when governance rules permit.
Builder does not rewrite canonical Diagnostic Library intelligence semantics.

#### Ownership Boundary
Fragrance Intelligence Database owns canonical intelligence packaging for Builder composition.
It does not own final publication lifecycle state in Master Perfume Database.

### 6. Master Perfume Database

#### Purpose
Store final canonical Master Perfume Objects published by Builder.

#### Responsibilities
1. hold canonical final fragrance objects
2. serve runtime consumer read access
3. preserve published object versions
4. preserve publication governance state

#### Runtime Consumption
Consumed by runtime systems only as canonical fragrance object source:
1. Recommendation
2. Search
3. Collection
4. Explainability
5. Future APIs

#### Builder Perspective
Master Perfume Database is read-only from Builder perspective after publication.
Builder publishes generated objects; it does not manually edit already-published canonical records.

#### Ownership Boundary
Master Perfume Database owns published canonical object state only.
It does not own upstream enrichment source responsibilities.

## Complete Builder Pipeline

Raw Import

↓

Normalization

↓

Brand Intelligence

↓

Knowledge Enrichment

↓

Translation

↓

Fragrance Intelligence

↓

Metadata Enrichment

↓

Validation

↓

Canonical Master Perfume Object

↓

Master Perfume Database

### Pipeline Stage Responsibilities
1. Raw Import: capture source records with lineage.
2. Normalization: stabilize identity and canonical input shape.
3. Brand Intelligence: resolve shared brand defaults and inheritance context.
4. Knowledge Enrichment: apply semantic resource context from Knowledge Base.
5. Translation: apply versioned translation rules and conflict policy.
6. Fragrance Intelligence: compose canonical intelligence package references.
7. Metadata Enrichment: complete metadata domains with explicit state semantics and provenance.
8. Validation: enforce canonical contract validity before publication.
9. Canonical Master Perfume Object: finalized contract-compliant object.
10. Master Perfume Database: generated final publication store.

## Ownership And Non-Duplication Contract
1. Raw Import owns source snapshots only.
2. Brand Intelligence owns brand-shared metadata only.
3. Knowledge Base owns semantic vocabulary assets only.
4. Translation Rules own translation policies only.
5. Fragrance Intelligence Database owns intelligence packaging only.
6. Master Perfume Database owns published canonical object state only.

No dataset may duplicate canonical ownership of another dataset's primary responsibility.

## Versioning Contract
Every generated artifact must be versioned at minimum by:
1. artifact type
2. artifact version
3. generating rule/version context
4. generation timestamp

Version lineage must support reproducibility and historical reconstruction.

## Provenance Contract
Every inferred value must include provenance support metadata at minimum:
1. source
2. generated_by
3. method
4. version
5. confidence
6. timestamp

Provenance is mandatory for governance, audit, replay, and validation acceptance.

## Publication Contract
1. Master Perfume Database entries are generated outputs only.
2. Manual direct editing of published canonical objects is prohibited.
3. Corrections require upstream regeneration through Builder pipeline.
4. Publication state must remain traceable to upstream artifact versions.

## Compatibility With Frozen Runtime
This architecture preserves runtime boundaries:
1. does not redesign Discovery Engine
2. does not redesign Recommendation Engine
3. does not redesign Learning Engine
4. does not redesign Confidence Engine
5. does not alter runtime behavior

Runtime systems consume generated canonical outputs only.

## Out Of Scope
This document does not define:
1. SQL schema
2. database table structures
3. Builder implementation modules
4. mapping implementation details
5. transformation algorithms
6. runtime code changes

## Acceptance Criteria
Milestone is complete only if:
1. complete internal Builder data model is defined
2. all required internal datasets are defined with purpose and responsibilities
3. Brand Intelligence defaults and inheritance are defined
4. Knowledge Base domains are defined
5. Translation Rules responsibilities and versioning are defined
6. Fragrance Intelligence dataset responsibilities are defined
7. Master Perfume Database publication and read-only contract are defined
8. full pipeline is documented end-to-end
9. ownership, versioning, and provenance contracts are explicit

## Builder Architecture Readiness Assessment

### Assessment Question
Is the Builder architecture now complete enough to begin implementation?

### Assessment Result
Yes.

### Readiness Evidence
1. Internal datasets and ownership boundaries are fully defined.
2. End-to-end pipeline stages are fully defined.
3. Versioning and provenance governance contracts are explicit.
4. Brand Intelligence inheritance model is explicit.
5. Master Perfume Database publication contract is explicit and generation-only.
6. Runtime boundaries and freeze constraints are preserved.

### Remaining Blockers
No critical architectural blockers remain.

### Final Statement
Builder data architecture is considered complete and implementation can begin.