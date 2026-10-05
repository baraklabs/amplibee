"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId, clearSessionCookies } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validation/security";
import type { ActionState } from "@/lib/types/action-state";

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = changePasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ password_hash: bcrypt.hashSync(parsed.data.newPassword, 10) })
    .eq("id", userId);

  if (error) return { status: "error", error: "Could not update password." };
  return { status: "success" };
}

export async function deleteAccount() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const supabase = createAdminClient();
  await supabase.from("users").delete().eq("id", userId);
  await clearSessionCookies();
  redirect("/");
}
