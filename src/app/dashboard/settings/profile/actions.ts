"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { profileSchema } from "@/lib/validation/settings";
import type { ActionState } from "@/lib/types/action-state";

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    companyName: formData.get("companyName"),
    websiteUrl: formData.get("websiteUrl"),
  });

  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      company_name: parsed.data.companyName || null,
      website_url: parsed.data.websiteUrl || null,
    })
    .eq("id", userId);

  if (error) return { status: "error", error: "Could not save your profile." };

  revalidatePath("/dashboard/settings/profile");
  return { status: "success" };
}
