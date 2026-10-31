"use server";

import { revalidatePath } from "next/cache";
import {
  createEmailUser,
  deleteManagedUser,
  resetManagedUserPassword,
} from "@/lib/auth/serverUserStore";
import { requireAdminSession } from "@/lib/auth/serverSession";

const revalidateStudioUsers = (): void => {
  revalidatePath("/studio");
  revalidatePath("/studio/users");
};

export const createStudioUserAction = async (formData: FormData): Promise<void> => {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  await createEmailUser({ name, email, password });
  revalidateStudioUsers();
};

export const deleteStudioUserAction = async (formData: FormData): Promise<void> => {
  await requireAdminSession();
  const userId = String(formData.get("userId") ?? "").trim();
  await deleteManagedUser(userId);
  revalidateStudioUsers();
};

export const resetStudioUserPasswordAction = async (formData: FormData): Promise<void> => {
  await requireAdminSession();
  const userId = String(formData.get("userId") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");

  await resetManagedUserPassword({ userId, newPassword });
  revalidateStudioUsers();
};
