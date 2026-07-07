"use server";

import { revalidatePath } from "next/cache";
import {
  cancelCurrentExecution,
  publishMasterDatabase,
  rebuildMasterDatabase,
  retryBuilderJob,
  runBuilderDryRun,
  runBuilderFromControlCenter,
  runSelectedBuilderStage,
} from "@/lib/builder/controlCenter/builderControlCenter";

const revalidateStudio = (): void => {
  revalidatePath("/studio");
  revalidatePath("/studio/dashboard");
  revalidatePath("/studio/pipeline");
  revalidatePath("/studio/validation");
  revalidatePath("/studio/review");
  revalidatePath("/studio/master-database");
};

export const runBuilderNowAction = async (): Promise<void> => {
  await runBuilderFromControlCenter("import");
  revalidateStudio();
};

export const runSelectedStageAction = async (formData: FormData): Promise<void> => {
  const stage = formData.get("stage");
  await runSelectedBuilderStage(typeof stage === "string" ? stage : null);
  revalidateStudio();
};

export const runDryRunAction = async (): Promise<void> => {
  await runBuilderDryRun();
  revalidateStudio();
};

export const rebuildMasterDatabaseAction = async (): Promise<void> => {
  await rebuildMasterDatabase();
  revalidateStudio();
};

export const cancelExecutionAction = async (): Promise<void> => {
  await cancelCurrentExecution();
  revalidateStudio();
};

export const publishMasterDatabaseAction = async (): Promise<void> => {
  await publishMasterDatabase();
  revalidateStudio();
};

export const retryJobAction = async (formData: FormData): Promise<void> => {
  const jobId = formData.get("jobId");
  await retryBuilderJob(typeof jobId === "string" ? jobId : null);
  revalidateStudio();
};
