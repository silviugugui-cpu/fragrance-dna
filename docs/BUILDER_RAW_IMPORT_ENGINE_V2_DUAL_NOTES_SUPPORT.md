# Builder Raw Import Engine v2 - Dual Notes Structure Support

## Scope
This milestone extends only the Raw Import Engine.

It does not implement translation, metadata enrichment, recommendation logic, or source normalization.

## Motivation
The raw source database contains multiple legitimate `notes` structures.

Builder must adapt to source structures while preserving all source information exactly.

## Supported Notes Structures
1. `simple-array`: JSON array of strings
2. `grouped-object`: JSON object where each key maps to a JSON array of strings

## Preservation Guarantees
1. Raw source value remains unchanged in `rawRecord.notes`.
2. Original parsed structure is preserved in `parsed.notes.preserved`.
3. Canonical deterministic representation is exposed in `parsed.notes.entries`.
4. Position information is preserved:
   - simple-array: index-based order
   - grouped-object: group + index-in-group + global index

## Backward Compatibility
1. Existing `rawRecord` and `rawValues` fields are unchanged.
2. Existing stages consuming raw data continue to work.
3. New parsed notes representation is additive and non-breaking.

## Validation
Dedicated validation script: `tmp/validateRawImportStep9DualNotes.ts`

Validation proves:
1. every supported structure is detected correctly;
2. no information is lost during import;
3. grouped note positions are preserved;
4. simple-array notes continue to work unchanged;
5. stage contracts remain compatible.