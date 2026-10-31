"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/serverSession";
import {
  cancelCurrentExecution,
  publishMasterDatabase,
  rebuildMasterDatabase,
  resumeBuilderFromCheckpoint,
  rollbackPublishedMasterDatabase,
  retryBuilderJob,
  runBuilderDryRun,
  runBuilderFromControlCenter,
  runSelectedBuilderStage,
  runStagedBuilderExecution,
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
  await requireAdminSession();
  await runBuilderFromControlCenter("import");
  revalidateStudio();
};

export const runSelectedStageAction = async (formData: FormData): Promise<void> => {
  await requireAdminSession();
  const stage = formData.get("stage");
  await runSelectedBuilderStage(typeof stage === "string" ? stage : null);
  revalidateStudio();
};

export const runDryRunAction = async (): Promise<void> => {
  await requireAdminSession();
  await runBuilderDryRun();
  revalidateStudio();
};

export const rebuildMasterDatabaseAction = async (): Promise<void> => {
  await requireAdminSession();
  await rebuildMasterDatabase();
  revalidateStudio();
};

export const cancelExecutionAction = async (): Promise<void> => {
  await requireAdminSession();
  await cancelCurrentExecution();
  revalidateStudio();
};

export const publishMasterDatabaseAction = async (): Promise<void> => {
  await requireAdminSession();
  await publishMasterDatabase();
  revalidateStudio();
};

export const rollbackPublishedMasterDatabaseAction = async (): Promise<void> => {
  await requireAdminSession();
  await rollbackPublishedMasterDatabase();
  revalidateStudio();
};

export const runStagedExecutionAction = async (formData: FormData): Promise<void> => {
  await requireAdminSession();
  const raw = formData.get("stage");
  const stage = typeof raw === "string" ? Number.parseInt(raw, 10) : Number.NaN;

  if (stage === 1 || stage === 2 || stage === 3 || stage === 4) {
    await runStagedBuilderExecution(stage);
  }

  revalidateStudio();
};

export const resumeFromCheckpointAction = async (): Promise<void> => {
  await requireAdminSession();
  await resumeBuilderFromCheckpoint();
  revalidateStudio();
};

export const retryJobAction = async (formData: FormData): Promise<void> => {
  await requireAdminSession();
  const jobId = formData.get("jobId");
  await retryBuilderJob(typeof jobId === "string" ? jobId : null);
  revalidateStudio();
};
