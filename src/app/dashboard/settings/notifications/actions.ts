"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import type { ActionState } from "@/lib/types/action-state";
import type { NotificationPreferences } from "@/types/database";

export async function updateNotificationPreferences(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const preferences: NotificationPreferences = {
    scheduled_post_published: formData.get("scheduled_post_published") === "on",
    workflow_failed: formData.get("workflow_failed") === "on",
    weekly_summary: formData.get("weekly_summary") === "on",
  };

  const { error } = await supabase
    .from("profiles")
    .update({ notification_preferences: preferences })
    .eq("id", userId);

  if (error) return { status: "error", error: "Could not save preferences." };

  revalidatePath("/dashboard/settings/notifications");
  return { status: "success" };
}
