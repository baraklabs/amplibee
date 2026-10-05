"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";

export async function disconnectAccount(accountId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const supabase = createAdminClient();

  await supabase
    .from("connected_accounts")
    .update({
      status: "revoked",
      encrypted_access_token: null,
      encrypted_refresh_token: null,
    })
    .eq("id", accountId)
    .eq("user_id", userId);

  revalidatePath("/dashboard/accounts");
}

export async function deleteAccount(accountId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const supabase = createAdminClient();

  await supabase.from("connected_accounts").delete().eq("id", accountId).eq("user_id", userId);
  revalidatePath("/dashboard/accounts");
}
