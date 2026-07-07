# Builder Knowledge Base Foundation

## Purpose
Define the implementation-level foundation for the Knowledge Base dataset in Builder Foundation STEP 4.

## Scope
This milestone implements contracts and infrastructure only.

This milestone does not implement:
1. knowledge enrichment logic
2. translation rules logic
3. metadata enrichment logic
4. import logic
5. downstream stage redesign
6. runtime system changes

## Canonical Alignment
This foundation aligns with:
1. Builder Data Architecture Knowledge Base dataset ownership
2. Canonical Master Perfume Object provenance and versioning requirements
3. Fragrance Metadata Schema governance and vocabulary boundary requirements
4. Brand Intelligence and Translation foundation contract-first implementation pattern

## Implemented Domain Components
Knowledge Base domain in lib/builder/knowledge includes:
1. knowledge entity model
2. knowledge repository
3. knowledge registry
4. knowledge validator
5. knowledge loader contracts
6. knowledge serializer contracts
7. knowledge versioning helpers
8. knowledge provenance helpers
9. knowledge categories contracts

## Knowledge Entity Contract
Knowledge Entity object contract includes:
1. entityId
2. entityType
3. canonicalName
4. aliases
5. description
6. status
7. version
8. schemaVersion
9. generatedBy
10. createdAt
11. updatedAt
12. provenance
13. metadata
14. relationships

Values are not invented in this milestone.
The contract is structure-only and placeholder-safe.

## Categories Contract
Knowledge categories infrastructure includes:
1. Notes
2. Accords
3. Olfactory Families
4. Facets
5. Materials
6. Ingredients
7. Brands
8. Concentrations
9. Gender Directions
10. Seasonality
11. Occasions
12. Performance Terms
13. Relationship Types
14. Translation Vocabulary
15. Metadata Terms
16. Builder Concepts

Each category is independently versionable via category-level version and schemaVersion fields.

## Alias and Relationship Contracts
Aliases:
1. unlimited aliases per entity
2. aliases are vocabulary only
3. aliases are not translation rules

Relationships:
1. parent
2. child
3. synonym
4. related
5. opposite
6. derived_from

No inference logic is implemented in this milestone.

## Repository Contract
In-memory repository supports:
1. registerEntity
2. updateEntity
3. removeEntity
4. getEntity
5. findByAlias
6. findByCategory

No file IO.
No persistence.

## Registry Contract
Registry responsibilities:
1. duplicate detection
2. identifier validation
3. alias lookup
4. category lookup
5. version compatibility

## Validation Contracts
Placeholder validation contracts implemented:
1. validateEntity
2. validateAlias
3. validateRelationship
4. validateCategory

Validation is intentionally non-algorithmic and extensible.

## Serialization and Loader Contracts
Placeholder contracts implemented without file IO:
1. KnowledgeLoader loadKnowledge
2. KnowledgeSerializer serializeEntity
3. KnowledgeSerializer serializeEntities
4. KnowledgeSerializer serializeCategories
5. KnowledgeSerializer deserializeEntity
6. KnowledgeSerializer deserializeEntities
7. KnowledgeSerializer deserializeCategories

## Pipeline Integration
Builder knowledge stage now uses the new Knowledge Base contracts and emits KnowledgeArtifact payload containing:
1. knowledge foundation container
2. repository and registry snapshot metadata
3. category versioning contracts
4. alias and relationship contracts
5. loader and serializer placeholder outputs

No downstream stage modifications were introduced.

## Dependency Boundary
Knowledge Base is upstream of Translation Engine.

Knowledge Base does not depend on Translation Engine.

## Remaining Work
Future knowledge milestones should add:
1. governed vocabulary ingestion
2. stronger taxonomy constraints
3. stronger alias and relationship integrity validation
4. persistence adapters
5. translation-consumer mapping policies
