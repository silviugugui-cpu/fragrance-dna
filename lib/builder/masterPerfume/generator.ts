import { createBuilderConfig } from "@/lib/builder/config";
import { createDefaultRawImportReader } from "@/lib/builder/rawImport";

type UnknownValue = {
  state: "Unknown";
  reason: string;
};

type DomainEnvelope<TData> = {
  owner: string;
  producerStage: string;
  data: TData;
};

type SampleMasterPerfumeObject = {
  objectType: "masterPerfumeObjectV1";
  objectVersion: string;
  identity: DomainEnvelope<{
    fragranceId: string;
    sourceRecordKey: string;
    displayName: string;
    slug: UnknownValue;
    aliases: UnknownValue;
  }>;
  brand: DomainEnvelope<{
    brandNameRaw: string;
    brandNameCanonical: UnknownValue;
    brandId: UnknownValue;
    brandAliases: UnknownValue;
  }>;
  classification: DomainEnvelope<{
    objectType: "fragrance";
    concentrationRaw: UnknownValue;
    concentrationCanonical: UnknownValue;
    genderRaw: UnknownValue;
    genderCanonical: UnknownValue;
  }>;
  releaseInformation: DomainEnvelope<{
    launchYearRaw: string;
    launchYear: UnknownValue;
    releaseCountryRaw: UnknownValue;
    releaseCountryCanonical: UnknownValue;
  }>;
  rawNotes: DomainEnvelope<{
    sourceValue: unknown;
    detectedStructure: string;
    preservedStructure: unknown;
    entries: unknown[];
    structureVersion: string;
  }>;
  canonicalNotes: DomainEnvelope<{
    items: UnknownValue;
    unresolvedSourceNotes: UnknownValue;
  }>;
  notePyramid: DomainEnvelope<{
    rawStructureType: string;
    top: UnknownValue;
    middle: UnknownValue;
    base: UnknownValue;
    unlayered: UnknownValue;
  }>;
  mainAccords: DomainEnvelope<{
    sourceValue: unknown;
    detectedStructure: UnknownValue;
    entries: UnknownValue;
  }>;
  performance: DomainEnvelope<{
    longevityRaw: unknown;
    sillageRaw: unknown;
    longevityCanonical: UnknownValue;
    sillageCanonical: UnknownValue;
  }>;
  availability: DomainEnvelope<{
    status: UnknownValue;
    regions: UnknownValue;
    discontinued: UnknownValue;
    lastVerifiedAt: UnknownValue;
  }>;
  relationships: DomainEnvelope<{
    flankers: UnknownValue;
    predecessors: UnknownValue;
    successors: UnknownValue;
    relatedVariants: UnknownValue;
  }>;
  brandIntelligence: DomainEnvelope<{
    brandTier: UnknownValue;
    brandOrigin: UnknownValue;
    brandPortfolioTags: UnknownValue;
    provenance: UnknownValue;
  }>;
  builderMetadata: DomainEnvelope<{
    objectVersion: string;
    pipelineVersion: string;
    generatedAt: string;
    generatedBy: string;
    sourceArtifacts: string[];
  }>;
  governanceMetadata: DomainEnvelope<{
    contractStatus: "pass" | "warn" | "fail";
    validationErrors: string[];
    validationWarnings: string[];
    provenance: {
      source: string;
      generator: string;
      method: string;
      version: string;
      confidence: number | null;
      timestamp: string;
    };
    dataLineageHash: UnknownValue;
  }>;
  sampleContext: {
    workbookPath: string;
    worksheetName: string;
    worksheetRowIndex: number;
    sourceRowRawRecord: Record<string, unknown>;
    sourceRowRawValues: unknown[];
  };
};

type GeneratorResult = {
  fragranceName: string;
  populatedDomains: number;
  masterPerfumeObject: SampleMasterPerfumeObject;
};

const UNKNOWN_REASON =
  "Unknown: this field is not produced by currently implemented Builder stages.";

const unknown = (): UnknownValue => ({
  state: "Unknown",
  reason: UNKNOWN_REASON,
});

const makeFragranceId = (brand: string, perfume: string): string => {
  const base = `${brand} ${perfume}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base.length > 0 ? `fragrance-${base}` : "fragrance-unknown";
};

const requiredDomains = [
  "identity",
  "brand",
  "classification",
  "releaseInformation",
  "rawNotes",
  "canonicalNotes",
  "notePyramid",
  "mainAccords",
  "performance",
  "availability",
  "relationships",
  "brandIntelligence",
  "builderMetadata",
  "governanceMetadata",
] as const;

export const generateSampleMasterPerfumeObject = (): GeneratorResult => {
  const config = createBuilderConfig();
  const reader = createDefaultRawImportReader();
  const payload = reader.read({
    workbookPath: config.rawImport.workbookPath,
    worksheetNames: config.rawImport.worksheetNames,
    requiredHeaders: config.rawImport.requiredHeaders,
    identifierColumn: config.rawImport.identifierColumn,
    importVersion: config.rawImport.importVersion,
  });

  const worksheet = payload.rawDatabase.worksheets[0];
  if (!worksheet) {
    throw new Error("No worksheet available in raw import payload");
  }

  const row = worksheet.rows.find((candidate) => {
    const brand = String(candidate.rawRecord.brand ?? "").trim();
    const perfume = String(candidate.rawRecord.perfume ?? "").trim();
    return brand !== "" && perfume !== "";
  }) ?? worksheet.rows[0];

  if (!row) {
    throw new Error("No fragrance rows found in raw import payload");
  }

  const brand = String(row.rawRecord.brand ?? "Unknown");
  const perfume = String(row.rawRecord.perfume ?? "Unknown");
  const launchYearRaw = String(row.rawRecord.launch_year ?? "");
  const notesParsed = row.parsed?.notes;

  const generatedAt = new Date().toISOString();
  const fragranceId = makeFragranceId(brand, perfume);
  const sourceRecordKey = `${worksheet.worksheetName}:${row.rowIndex}`;

  const object: SampleMasterPerfumeObject = {
    objectType: "masterPerfumeObjectV1",
    objectVersion: "1.0.0",
    identity: {
      owner: "Builder Import Domain Owner",
      producerStage: "import",
      data: {
        fragranceId,
        sourceRecordKey,
        displayName: perfume,
        slug: unknown(),
        aliases: unknown(),
      },
    },
    brand: {
      owner: "Builder Import Domain Owner",
      producerStage: "import",
      data: {
        brandNameRaw: brand,
        brandNameCanonical: unknown(),
        brandId: unknown(),
        brandAliases: unknown(),
      },
    },
    classification: {
      owner: "Builder Normalize Domain Owner",
      producerStage: "normalize",
      data: {
        objectType: "fragrance",
        concentrationRaw: unknown(),
        concentrationCanonical: unknown(),
        genderRaw: unknown(),
        genderCanonical: unknown(),
      },
    },
    releaseInformation: {
      owner: "Builder Import Domain Owner",
      producerStage: "import",
      data: {
        launchYearRaw,
        launchYear: unknown(),
        releaseCountryRaw: unknown(),
        releaseCountryCanonical: unknown(),
      },
    },
    rawNotes: {
      owner: "Builder Import Domain Owner",
      producerStage: "import",
      data: {
        sourceValue: row.rawRecord.notes,
        detectedStructure: notesParsed?.detectedStructure ?? "empty",
        preservedStructure: notesParsed?.preserved ?? {
          type: "empty",
          value: null,
        },
        entries: notesParsed?.entries ?? [],
        structureVersion: "1.0.0",
      },
    },
    canonicalNotes: {
      owner: "Builder Knowledge Domain Owner",
      producerStage: "knowledge",
      data: {
        items: unknown(),
        unresolvedSourceNotes: unknown(),
      },
    },
    notePyramid: {
      owner: "Builder Translation Domain Owner",
      producerStage: "translation",
      data: {
        rawStructureType: notesParsed?.detectedStructure ?? "empty",
        top: unknown(),
        middle: unknown(),
        base: unknown(),
        unlayered: unknown(),
      },
    },
    mainAccords: {
      owner: "Builder Import Domain Owner",
      producerStage: "import",
      data: {
        sourceValue: row.rawRecord.main_accords,
        detectedStructure: unknown(),
        entries: unknown(),
      },
    },
    performance: {
      owner: "Builder Import Domain Owner",
      producerStage: "import",
      data: {
        longevityRaw: row.rawRecord.longevity,
        sillageRaw: row.rawRecord.sillage,
        longevityCanonical: unknown(),
        sillageCanonical: unknown(),
      },
    },
    availability: {
      owner: "Builder Metadata Domain Owner",
      producerStage: "metadata",
      data: {
        status: unknown(),
        regions: unknown(),
        discontinued: unknown(),
        lastVerifiedAt: unknown(),
      },
    },
    relationships: {
      owner: "Builder Metadata Domain Owner",
      producerStage: "metadata",
      data: {
        flankers: unknown(),
        predecessors: unknown(),
        successors: unknown(),
        relatedVariants: unknown(),
      },
    },
    brandIntelligence: {
      owner: "Builder Brand Intelligence Domain Owner",
      producerStage: "brand-intelligence",
      data: {
        brandTier: unknown(),
        brandOrigin: unknown(),
        brandPortfolioTags: unknown(),
        provenance: unknown(),
      },
    },
    builderMetadata: {
      owner: "Builder Publish Domain Owner",
      producerStage: "publish",
      data: {
        objectVersion: "1.0.0",
        pipelineVersion: config.pipelineVersion,
        generatedAt,
        generatedBy: "step12-master-perfume-generator",
        sourceArtifacts: [
          `raw-import:${payload.source.workbookPath}`,
          `raw-row:${sourceRecordKey}`,
        ],
      },
    },
    governanceMetadata: {
      owner: "Builder Validation Domain Owner",
      producerStage: "validation",
      data: {
        contractStatus: "pass",
        validationErrors: [],
        validationWarnings: [
          "Unknown values are explicit for domains not produced by implemented stages.",
        ],
        provenance: {
          source: payload.source.workbookPath,
          generator: "step12-master-perfume-generator",
          method: "single-fragrance-sample-generation",
          version: "1.0.0",
          confidence: null,
          timestamp: generatedAt,
        },
        dataLineageHash: unknown(),
      },
    },
    sampleContext: {
      workbookPath: payload.source.workbookPath,
      worksheetName: worksheet.worksheetName,
      worksheetRowIndex: row.rowIndex,
      sourceRowRawRecord: row.rawRecord,
      sourceRowRawValues: row.rawValues,
    },
  };

  return {
    fragranceName: perfume,
    populatedDomains: requiredDomains.length,
    masterPerfumeObject: object,
  };
};

export const validateGeneratedMasterPerfumeObject = (
  object: SampleMasterPerfumeObject,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (const domain of requiredDomains) {
    if (!(domain in object)) {
      errors.push(`Missing mandatory domain: ${domain}`);
    }
  }

  const ownershipByDomain: Record<(typeof requiredDomains)[number], string> = {
    identity: "Builder Import Domain Owner",
    brand: "Builder Import Domain Owner",
    classification: "Builder Normalize Domain Owner",
    releaseInformation: "Builder Import Domain Owner",
    rawNotes: "Builder Import Domain Owner",
    canonicalNotes: "Builder Knowledge Domain Owner",
    notePyramid: "Builder Translation Domain Owner",
    mainAccords: "Builder Import Domain Owner",
    performance: "Builder Import Domain Owner",
    availability: "Builder Metadata Domain Owner",
    relationships: "Builder Metadata Domain Owner",
    brandIntelligence: "Builder Brand Intelligence Domain Owner",
    builderMetadata: "Builder Publish Domain Owner",
    governanceMetadata: "Builder Validation Domain Owner",
  };

  for (const domain of requiredDomains) {
    const domainEnvelope = object[domain] as DomainEnvelope<unknown>;
    if (!domainEnvelope || domainEnvelope.owner !== ownershipByDomain[domain]) {
      errors.push(`Ownership mismatch for domain: ${domain}`);
    }
    if (!domainEnvelope?.producerStage) {
      errors.push(`Missing producerStage for domain: ${domain}`);
    }
  }

  if (!object.governanceMetadata.data.provenance) {
    errors.push("Missing governance provenance");
  }

  if (object.rawNotes.data.sourceValue === undefined) {
    errors.push("Raw notes source value is not accessible");
  }

  if (object.mainAccords.data.sourceValue === undefined) {
    errors.push("Main accords source value is not accessible");
  }

  if (!object.sampleContext.sourceRowRawRecord || !object.sampleContext.sourceRowRawValues) {
    errors.push("Raw source row context is not fully preserved");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export type { GeneratorResult, SampleMasterPerfumeObject };