import type {
  CanonicalRawNoteEntry,
  RawNotesCanonicalRepresentation,
} from "@/lib/builder/rawImport/types";

const asString = (value: unknown): string => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
};

const buildSimpleArrayEntries = (notes: string[]): CanonicalRawNoteEntry[] =>
  notes.map((note, index) => ({
    value: note,
    globalIndex: index,
    indexInGroup: index,
    group: null,
  }));

const buildGroupedEntries = (groups: Record<string, string[]>): CanonicalRawNoteEntry[] => {
  const entries: CanonicalRawNoteEntry[] = [];
  let globalIndex = 0;

  for (const [group, notes] of Object.entries(groups)) {
    for (let indexInGroup = 0; indexInGroup < notes.length; indexInGroup += 1) {
      entries.push({
        value: notes[indexInGroup],
        globalIndex,
        indexInGroup,
        group,
      });
      globalIndex += 1;
    }
  }

  return entries;
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isGroupedObject = (value: unknown): value is Record<string, string[]> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  for (const groupValues of Object.values(value as Record<string, unknown>)) {
    if (!isStringArray(groupValues)) {
      return false;
    }
  }

  return true;
};

export const parseRawNotesValue = (rawValue: unknown): RawNotesCanonicalRepresentation => {
  if (rawValue === undefined || rawValue === null || asString(rawValue).trim() === "") {
    return {
      detectedStructure: "empty",
      rawValue,
      preserved: {
        type: "empty",
        value: null,
      },
      entries: [],
    };
  }

  const rawText = asString(rawValue).trim();
  let parsed: unknown = rawValue;

  if (typeof rawValue === "string") {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return {
        detectedStructure: "unsupported",
        rawValue,
        preserved: {
          type: "unsupported",
          value: rawValue,
        },
        entries: [],
      };
    }
  }

  if (isStringArray(parsed)) {
    return {
      detectedStructure: "simple-array",
      rawValue,
      preserved: {
        type: "simple-array",
        value: parsed.slice(),
      },
      entries: buildSimpleArrayEntries(parsed),
    };
  }

  if (isGroupedObject(parsed)) {
    const grouped = Object.fromEntries(
      Object.entries(parsed).map(([group, notes]) => [group, notes.slice()]),
    );

    return {
      detectedStructure: "grouped-object",
      rawValue,
      preserved: {
        type: "grouped-object",
        value: grouped,
      },
      entries: buildGroupedEntries(grouped),
    };
  }

  return {
    detectedStructure: "unsupported",
    rawValue,
    preserved: {
      type: "unsupported",
      value: parsed,
    },
    entries: [],
  };
};