import { createKnowledgeProvenance } from "@/lib/builder/knowledge/provenance";
import {
  createKnowledgeVersioningFields,
} from "@/lib/builder/knowledge/versioning";
import type { KnowledgeEntityModel } from "@/lib/builder/knowledge/types";

interface NoteSeed {
  entityId: string;
  canonicalName: string;
  description: string;
  aliases?: KnowledgeEntityModel["aliases"];
  relationships?: KnowledgeEntityModel["relationships"];
}

const NOTES_V1_SEEDS: NoteSeed[] = [
  {
    entityId: "note-citrus",
    canonicalName: "Citrus",
    description: "Canonical note representing bright citrus character.",
    aliases: [
      { alias: "agrumes", aliasType: "language", locale: "fr" },
      { alias: "citrusy", aliasType: "spelling", locale: "en" },
      { alias: "note:citrus", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "child", targetEntityId: "note-bergamot" },
      { relationshipType: "child", targetEntityId: "note-lemon" },
      { relationshipType: "child", targetEntityId: "note-grapefruit" },
      { relationshipType: "opposite", targetEntityId: "note-musk" },
    ],
  },
  {
    entityId: "note-bergamot",
    canonicalName: "Bergamot",
    description: "Canonical note representing bergamot peel brightness.",
    aliases: [
      { alias: "bergamote", aliasType: "language", locale: "fr" },
      { alias: "bergamot essence", aliasType: "commercial", locale: "en" },
      { alias: "note:bergamot", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "parent", targetEntityId: "note-citrus" },
      { relationshipType: "related", targetEntityId: "note-lemon" },
    ],
  },
  {
    entityId: "note-lemon",
    canonicalName: "Lemon",
    description: "Canonical note representing lemon zest and juice profile.",
    aliases: [
      { alias: "citron", aliasType: "language", locale: "fr" },
      { alias: "lemon peel", aliasType: "commercial", locale: "en" },
      { alias: "note:lemon", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "parent", targetEntityId: "note-citrus" },
      { relationshipType: "related", targetEntityId: "note-bergamot" },
    ],
  },
  {
    entityId: "note-grapefruit",
    canonicalName: "Grapefruit",
    description: "Canonical note representing grapefruit bitterness and sparkle.",
    aliases: [
      { alias: "pamplemousse", aliasType: "language", locale: "fr" },
      { alias: "grape fruit", aliasType: "spelling", locale: "en" },
      { alias: "note:grapefruit", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "parent", targetEntityId: "note-citrus" },
      { relationshipType: "related", targetEntityId: "note-lemon" },
    ],
  },
  {
    entityId: "note-floral",
    canonicalName: "Floral",
    description: "Canonical note representing floral bouquet profile.",
    aliases: [
      { alias: "floral bouquet", aliasType: "commercial", locale: "en" },
      { alias: "note:floral", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "child", targetEntityId: "note-rose" },
      { relationshipType: "child", targetEntityId: "note-jasmine" },
      { relationshipType: "child", targetEntityId: "note-orange-blossom" },
    ],
  },
  {
    entityId: "note-rose",
    canonicalName: "Rose",
    description: "Canonical note representing rose petal profile.",
    aliases: [
      { alias: "rose de mai", aliasType: "commercial", locale: "fr" },
      { alias: "rose note", aliasType: "historical", locale: "en" },
      { alias: "note:rose", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "parent", targetEntityId: "note-floral" },
      { relationshipType: "related", targetEntityId: "note-jasmine" },
    ],
  },
  {
    entityId: "note-jasmine",
    canonicalName: "Jasmine",
    description: "Canonical note representing jasmine floral character.",
    aliases: [
      { alias: "jasmin", aliasType: "language", locale: "fr" },
      { alias: "jasmine sambac", aliasType: "commercial", locale: "en" },
      { alias: "note:jasmine", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "parent", targetEntityId: "note-floral" },
      { relationshipType: "related", targetEntityId: "note-rose" },
    ],
  },
  {
    entityId: "note-orange-blossom",
    canonicalName: "Orange Blossom",
    description: "Canonical note representing orange blossom floral tone.",
    aliases: [
      { alias: "fleur d'oranger", aliasType: "language", locale: "fr" },
      { alias: "orange blossom absolute", aliasType: "commercial", locale: "en" },
      { alias: "note:orange-blossom", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "parent", targetEntityId: "note-floral" },
      { relationshipType: "derived_from", targetEntityId: "note-citrus" },
    ],
  },
  {
    entityId: "note-cedarwood",
    canonicalName: "Cedarwood",
    description: "Canonical note representing dry cedarwood facets.",
    aliases: [
      { alias: "cedar wood", aliasType: "spelling", locale: "en" },
      { alias: "bois de cedre", aliasType: "language", locale: "fr" },
      { alias: "note:cedarwood", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "related", targetEntityId: "note-sandalwood" },
      { relationshipType: "related", targetEntityId: "note-patchouli" },
    ],
  },
  {
    entityId: "note-sandalwood",
    canonicalName: "Sandalwood",
    description: "Canonical note representing creamy sandalwood profile.",
    aliases: [
      { alias: "sandal wood", aliasType: "spelling", locale: "en" },
      { alias: "bois de santal", aliasType: "language", locale: "fr" },
      { alias: "note:sandalwood", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "related", targetEntityId: "note-cedarwood" },
    ],
  },
  {
    entityId: "note-patchouli",
    canonicalName: "Patchouli",
    description: "Canonical note representing earthy patchouli profile.",
    aliases: [
      { alias: "patchouly", aliasType: "historical", locale: "en" },
      { alias: "patchouli essence", aliasType: "commercial", locale: "en" },
      { alias: "note:patchouli", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "related", targetEntityId: "note-cedarwood" },
    ],
  },
  {
    entityId: "note-vanilla",
    canonicalName: "Vanilla",
    description: "Canonical note representing vanilla pod sweetness.",
    aliases: [
      { alias: "vanille", aliasType: "language", locale: "fr" },
      { alias: "vanilla absolute", aliasType: "commercial", locale: "en" },
      { alias: "note:vanilla", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "synonym", targetEntityId: "note-vanillin" },
      { relationshipType: "related", targetEntityId: "note-amber" },
    ],
  },
  {
    entityId: "note-vanillin",
    canonicalName: "Vanillin",
    description: "Canonical note representing vanillin material profile.",
    aliases: [
      { alias: "vanilline", aliasType: "language", locale: "fr" },
      { alias: "vanillin crystal", aliasType: "commercial", locale: "en" },
      { alias: "note:vanillin", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "synonym", targetEntityId: "note-vanilla" },
      { relationshipType: "derived_from", targetEntityId: "note-vanilla" },
    ],
  },
  {
    entityId: "note-amber",
    canonicalName: "Amber",
    description: "Canonical note representing warm amber accord profile.",
    aliases: [
      { alias: "ambre", aliasType: "language", locale: "fr" },
      { alias: "amber accord", aliasType: "commercial", locale: "en" },
      { alias: "note:amber", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "related", targetEntityId: "note-vanilla" },
      { relationshipType: "related", targetEntityId: "note-musk" },
    ],
  },
  {
    entityId: "note-musk",
    canonicalName: "Musk",
    description: "Canonical note representing musk profile.",
    aliases: [
      { alias: "musc", aliasType: "language", locale: "fr" },
      { alias: "white musk", aliasType: "commercial", locale: "en" },
      { alias: "note:musk", aliasType: "builder", locale: "en" },
    ],
    relationships: [
      { relationshipType: "related", targetEntityId: "note-amber" },
      { relationshipType: "opposite", targetEntityId: "note-citrus" },
    ],
  },
];

export const CANONICAL_NOTES_V1_DATASET_ID = "canonical-notes-v1";

export const createCanonicalNotesKnowledgeEntities = (
  generatedBy: string,
  now: string = new Date().toISOString(),
): KnowledgeEntityModel[] =>
  NOTES_V1_SEEDS.map((seed) => ({
    entityId: seed.entityId,
    entityType: "notes",
    canonicalName: seed.canonicalName,
    aliases: seed.aliases ?? [],
    description: seed.description,
    status: "active",
    ...createKnowledgeVersioningFields(generatedBy, now),
    provenance: createKnowledgeProvenance({
      source: CANONICAL_NOTES_V1_DATASET_ID,
      generator: generatedBy,
      method: "curated-canonical-notes",
      confidence: 1,
      timestamp: now,
    }),
    metadata: {
      datasetId: CANONICAL_NOTES_V1_DATASET_ID,
      domain: "notes",
      stage: "builder-step-5",
      populated: true,
      notes: [
        "First real Knowledge Base dataset.",
        "No inference is performed in this milestone.",
      ],
    },
    relationships: seed.relationships ?? [],
  }));

export const getCanonicalNotesCount = (): number => NOTES_V1_SEEDS.length;
