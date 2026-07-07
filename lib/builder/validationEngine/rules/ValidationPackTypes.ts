export type ValidationIssueSeverity = "none" | "warning" | "error";

export interface ValidationPackPerfumeRecord {
  rowIndex: number;
  brand: string;
  perfume: string;
  launchYearRaw: unknown;
  notesRaw: unknown;
  mainAccordsRaw: unknown;
  longevityRaw: unknown;
  sillageRaw: unknown;
  preferredBrandFormatting: string | null;
}

export interface ParsedTokenList {
  items: string[];
  isInvalidStructure: boolean;
}

const toText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const parseListFromUnknown = (value: unknown): ParsedTokenList => {
  if (value === null || value === undefined) {
    return {
      items: [],
      isInvalidStructure: false,
    };
  }

  if (Array.isArray(value)) {
    return {
      items: value.map((item) => toText(item)).filter((item) => item.length > 0),
      isInvalidStructure: false,
    };
  }

  if (typeof value === "object") {
    const out: string[] = [];
    for (const nested of Object.values(value as Record<string, unknown>)) {
      if (Array.isArray(nested)) {
        for (const item of nested) {
          const text = toText(item);
          if (text.length > 0) {
            out.push(text);
          }
        }
      } else {
        const text = toText(nested);
        if (text.length > 0) {
          out.push(text);
        }
      }
    }

    return {
      items: out,
      isInvalidStructure: false,
    };
  }

  const textValue = toText(value);
  if (textValue.length === 0) {
    return {
      items: [],
      isInvalidStructure: false,
    };
  }

  try {
    const parsed = JSON.parse(textValue);
    return parseListFromUnknown(parsed);
  } catch {
    return {
      items: [],
      isInvalidStructure: true,
    };
  }
};

export const parseNotesList = (value: unknown): ParsedTokenList =>
  parseListFromUnknown(value);

export const parseMainAccordsList = (value: unknown): ParsedTokenList => {
  const parsed = parseListFromUnknown(value);
  if (parsed.items.length > 0 || !parsed.isInvalidStructure) {
    return parsed;
  }

  const textValue = toText(value);
  if (!textValue.includes(",")) {
    return parsed;
  }

  return {
    items: textValue
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
    isInvalidStructure: false,
  };
};

export const parseVoteDistribution = (
  raw: unknown,
): Record<string, number> => {
  if (raw === null || raw === undefined) {
    return {};
  }

  let value: unknown = raw;
  if (typeof value === "string") {
    const text = value.trim();
    if (text.length === 0) {
      return {};
    }

    try {
      value = JSON.parse(text);
    } catch {
      return {};
    }
  }

  const output: Record<string, number> = {};
  if (Array.isArray(value)) {
    value.forEach((vote, index) => {
      const numberVote = Number(vote);
      if (Number.isFinite(numberVote) && numberVote >= 0) {
        output[String(index)] = numberVote;
      }
    });
    return output;
  }

  if (typeof value !== "object") {
    return {};
  }

  for (const [bucket, vote] of Object.entries(value as Record<string, unknown>)) {
    const numberVote = Number(vote);
    if (Number.isFinite(numberVote) && numberVote >= 0) {
      output[bucket] = numberVote;
    }
  }

  return output;
};

export const isAllZeroDistribution = (
  distribution: Record<string, number>,
): boolean => {
  const values = Object.values(distribution);
  if (values.length === 0) {
    return true;
  }

  return values.every((value) => value === 0);
};

export const normalizeBrandFormattingKey = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");
