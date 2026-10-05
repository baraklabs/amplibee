"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { encryptSecret } from "@/lib/crypto";
import { connectMediumSchema, connectSubstackSchema } from "@/lib/validation/accounts";
import type { ActionState } from "@/lib/types/action-state";

export async function connectMediumAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = connectMediumSchema.safeParse({ integrationToken: formData.get("integrationToken") });
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  let accountId: string;
  let accountName: string;
  try {
    const response = await fetch("https://api.medium.com/v1/me", {
      headers: { Authorization: `Bearer ${parsed.data.integrationToken}` },
    });
    if (!response.ok) {
      return { status: "error", error: "Medium rejected this token. Double-check it and try again." };
    }
    const data = (await response.json()) as { data?: { id: string; name: string; username: string } };
    if (!data.data) return { status: "error", error: "Unexpected response from Medium." };
    accountId = data.data.id;
    accountName = data.data.name;
  } catch {
    return { status: "error", error: "Could not reach Medium. Try again in a moment." };
  }

  const { error } = await supabase.from("connected_accounts").upsert(
    {
      user_id: userId,
      platform: "medium",
      account_type: "profile",
      external_account_id: accountId,
      display_name: accountName,
      encrypted_access_token: encryptSecret(parsed.data.integrationToken),
      status: "connected",
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: "user_id,platform,external_account_id" },
  );

  if (error) return { status: "error", error: "Could not save this account." };

  revalidatePath("/dashboard/accounts");
  return { status: "success" };
}

export async function connectSubstackAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = connectSubstackSchema.safeParse({
    publicationName: formData.get("publicationName"),
    publicationUrl: formData.get("publicationUrl"),
  });
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const { error } = await supabase.from("connected_accounts").upsert(
    {
      user_id: userId,
      platform: "substack",
      account_type: "publication",
      external_account_id: parsed.data.publicationUrl,
      display_name: parsed.data.publicationName,
      handle: parsed.data.publicationUrl,
      status: "connected",
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: "user_id,platform,external_account_id" },
  );

  if (error) return { status: "error", error: "Could not save this account." };

  revalidatePath("/dashboard/accounts");
  return { status: "success" };
}

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
