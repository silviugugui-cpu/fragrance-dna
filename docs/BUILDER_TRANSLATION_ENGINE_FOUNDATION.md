# Builder Translation Engine Foundation

## Purpose
Define the implementation-level foundation for the Translation Rules dataset in Builder Foundation STEP 3.

## Scope
This milestone implements contracts and infrastructure only.

This milestone does not implement:
1. translation logic
2. Knowledge Base logic
3. Metadata Enrichment logic
4. Import logic
5. downstream stage redesign
6. runtime system changes

## Canonical Alignment
This foundation aligns with:
1. Builder Data Architecture Translation Rules dataset ownership
2. Canonical Master Perfume Object provenance and versioning requirements
3. Fragrance Metadata Schema deterministic and inferred governance rules
4. Brand Intelligence foundation contract-first implementation pattern

## Implemented Domain Components
Translation Engine domain in lib/builder/translation includes:
1. translation rule model
2. translation repository
3. translation registry
4. translation validator
5. translation loader contracts
6. translation serializer contracts
7. translation executor interface
8. translation versioning helpers
9. translation provenance helpers

## Translation Rule Model Contract
Translation Rule object contract includes:
1. ruleId
2. ruleType
3. inputPattern
4. outputValue
5. priority
6. enabled
7. version
8. schemaVersion
9. generatedBy
10. createdAt
11. updatedAt
12. provenance

Values are not invented in this milestone.
The contract is structure-only and placeholder-safe.

## Rule Type Infrastructure
Rule type infrastructure exists for future categories:
1. brand normalization
2. note normalization
3. accord normalization
4. concentration normalization
5. gender normalization
6. family normalization
7. metadata normalization
8. relationship normalization

No rule population is performed in this milestone.

## Execution Contract
Execution interfaces are contract-only.

Execution result contract includes:
1. matched
2. confidence
3. canonicalValue
4. ruleId
5. provenance

No execution logic is implemented in this milestone.

## Registry Contract
Registry responsibilities:
1. lookup
2. duplicate detection
3. priority ordering
4. version compatibility
5. enable/disable

## Validation Contracts
Placeholder validation contracts implemented:
1. validateRule
2. validateRegistry
3. validateExecution
4. validateCompatibility

Validation is intentionally non-algorithmic and extensible.

## Serialization and Loader Contracts
Placeholder contracts implemented without file IO:
1. TranslationRuleLoader loadRules
2. TranslationRuleSerializer serializeRule
3. TranslationRuleSerializer serializeRules
4. TranslationRuleSerializer deserializeRule
5. TranslationRuleSerializer deserializeRules

## Pipeline Integration
Builder translation stage now uses the new Translation Engine contracts and emits TranslationArtifact payload containing:
1. translation foundation container
2. repository and registry snapshot metadata
3. execution contract placeholder output
4. loader and serializer placeholder outputs
5. validation contract outputs

No downstream stage modifications were introduced.

## Remaining Work
Future translation milestones should add:
1. governed translation rule ingestion
2. canonical taxonomy constraints
3. stronger compatibility and conflict validation rules
4. deterministic execution implementation
5. persistence adapters
