"use server";

import { revalidatePath } from "next/cache";
import {
  createCombinedDatabaseRecord,
  deleteCombinedDatabaseRecord,
  updateCombinedDatabaseRecord,
} from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";
import type { UserDnaProfileRecord } from "@/lib/database/masterFragranceDatabase";
import { requireAdminSession } from "@/lib/auth/serverSession";

const revalidateMasterDatabase = (): void => {
  revalidatePath("/studio");
  revalidatePath("/studio/master-database");
  revalidatePath("/studio/brands");
  revalidatePath("/studio/collection");
};

const splitListField = (value: FormDataEntryValue | null): string[] => {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const readTextField = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

const parseScores = (value: FormDataEntryValue | null): Record<string, number> => {
  if (typeof value !== "string") return {};
  const scores: Record<string, number> = {};
  for (const line of value.split(/\n+/)) {
    const [namePart, valuePart] = line.split(":");
    const name = String(namePart ?? "").trim();
    const score = Number(String(valuePart ?? "").trim());
    if (name && Number.isFinite(score)) scores[name] = score;
  }
  return scores;
};

export const saveMasterDatabaseRecordAction = async (formData: FormData): Promise<void> => {
  await requireAdminSession();
  const recordId = readTextField(formData, "recordId");
  const updatedRecord = updateCombinedDatabaseRecord(recordId, {
    perfume: readTextField(formData, "perfume"),
    brand: readTextField(formData, "brand"),
    launchYear: readTextField(formData, "launchYear"),
    source: readTextField(formData, "source"),
    status: readTextField(formData, "status"),
    externalId: readTextField(formData, "externalId"),
    externalUrl: readTextField(formData, "externalUrl"),
    rating: readTextField(formData, "rating"),
    voteCount: readTextField(formData, "voteCount"),
    sourceFingerprint: readTextField(formData, "sourceFingerprint"),
    perfumer: readTextField(formData, "perfumer"),
    gender: readTextField(formData, "gender"),
    description: readTextField(formData, "description"),
    imageUrl: readTextField(formData, "imageUrl"),
    localImagePath: readTextField(formData, "localImagePath"),
    notes: splitListField(formData.get("notes")),
    mainAccords: splitListField(formData.get("mainAccords")),
    userDnaTestEnabled: formData.get("userDnaTestEnabled") === "on",
    userDnaProfile: {
      testProfileId: readTextField(formData, "userDnaProfileId"),
      name: readTextField(formData, "userDnaProfileName"),
      type: readTextField(formData, "userDnaProfileType"),
      dna_axes: parseScores(formData.get("userDnaAxes")),
      semantic_v1: parseScores(formData.get("userDnaSemantic")),
      user_attributes_v3: {
        abstract: splitListField(formData.get("userDnaAbstractAttributes")),
        concrete: splitListField(formData.get("userDnaConcreteAttributes")),
      },
    } satisfies UserDnaProfileRecord,
  });

  if (!updatedRecord) {
    throw new Error("Unable to update the selected perfume record.");
  }

  revalidateMasterDatabase();
};

export const createMasterDatabaseRecordAction = async (formData: FormData): Promise<void> => {
  await requireAdminSession();
  const createdRecord = createCombinedDatabaseRecord({
    perfume: readTextField(formData, "perfume"),
    brand: readTextField(formData, "brand"),
    launchYear: readTextField(formData, "launchYear"),
    source: readTextField(formData, "source"),
    status: readTextField(formData, "status"),
    externalId: readTextField(formData, "externalId"),
    externalUrl: readTextField(formData, "externalUrl"),
    rating: readTextField(formData, "rating"),
    voteCount: readTextField(formData, "voteCount"),
    sourceFingerprint: readTextField(formData, "sourceFingerprint"),
    perfumer: readTextField(formData, "perfumer"),
    gender: readTextField(formData, "gender"),
    description: readTextField(formData, "description"),
    imageUrl: readTextField(formData, "imageUrl"),
    localImagePath: readTextField(formData, "localImagePath"),
    notes: splitListField(formData.get("notes")),
    mainAccords: splitListField(formData.get("mainAccords")),
  });

  if (!createdRecord) {
    throw new Error("Unable to create a new perfume record. Brand and Perfume are required.");
  }

  revalidateMasterDatabase();
};

export const deleteMasterDatabaseRecordAction = async (formData: FormData): Promise<void> => {
  await requireAdminSession();
  const recordId = readTextField(formData, "recordId");
  const deleted = deleteCombinedDatabaseRecord(recordId);

  if (!deleted) {
    throw new Error("Unable to delete the selected perfume record.");
  }

  revalidateMasterDatabase();
};
