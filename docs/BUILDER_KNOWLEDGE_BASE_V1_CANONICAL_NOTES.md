# Builder Knowledge Base v1 Canonical Notes

## Purpose
Define the first real populated Knowledge Base dataset in Builder STEP 5.

## Scope
This milestone implements canonical Notes dataset only.

This milestone does not implement:
1. accords domain population
2. olfactory families population
3. facets domain population
4. translation rule execution logic
5. metadata enrichment logic
6. excel import logic
7. runtime system changes

## Canonical Alignment
Knowledge Base v1 Notes aligns with:
1. Builder Data Architecture Knowledge Base ownership boundary
2. Canonical Master Perfume Object provenance and versioning requirements
3. Fragrance Metadata Schema governance and traceability rules
4. Knowledge Base Foundation contracts from STEP 4

## Implemented Notes Dataset
Real canonical Notes entities are implemented in:
1. lib/builder/knowledge/canonicalNotes.ts
2. lib/builder/knowledge/notesRepository.ts

Dataset characteristics:
1. entityType is notes for all entities
2. each entity includes canonicalName, aliases, description, status, version, schemaVersion, relationships, metadata, provenance
3. aliases support unlimited entries and typed alias metadata
4. relationships are contract-level only with no inference

## Alias Contract in Notes v1
Alias structure supports:
1. language aliases
2. spelling aliases
3. commercial aliases
4. historical aliases
5. builder aliases

Aliases remain vocabulary-only and are not translation rules.

## Relationship Contract in Notes v1
Relationships supported:
1. synonym
2. parent
3. child
4. related
5. derived_from

No relationship inference is implemented.

## Validation Contract
Notes dataset validation enforces:
1. unique entity identifiers
2. duplicate canonical name detection
3. duplicate alias detection
4. relationship integrity (target must exist)

Validation remains extensible for future semantic governance.

## Pipeline Integration
Knowledge stage now emits a real Notes knowledge artifact payload:
1. knowledgeBaseNotesV1 container
2. canonical notes entities
3. notes category metadata and validation
4. dataset-level validation and duplicate reporting
5. loader and serializer outputs

Translation stage continues to consume KnowledgeArtifact contracts only.
No translation logic is introduced.

## Dependency Boundary
Knowledge Base remains upstream from Translation Engine.

Knowledge Base does not depend on Translation Engine execution.

## Remaining Work
Future milestones may add:
1. accords, families, facets datasets
2. cross-domain vocabulary constraints
3. persistence adapters
4. translation-consumer mapping policies
