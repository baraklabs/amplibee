import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptSecret } from "@/lib/crypto";
import { getPlatform } from "@/lib/platforms/registry";
import type { PlatformIdDb } from "@/types/database";

/**
 * Publishes every due `scheduled_posts` row. Nothing in this codebase calls
 * this on a timer — wire it to a scheduler that hits this route on an
 * interval (Vercel Cron, Supabase Cron, or any external cron-to-HTTP
 * service), sending `CRON_SECRET` as a bearer token. Without that, scheduled
 * posts sit in `scheduled_posts` with status "pending" forever.
 */
export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data: due } = await supabase
    .from("scheduled_posts")
    .select("id, generated_post_id, account_id")
    .eq("status", "pending")
    .lte("scheduled_for", nowIso)
    .limit(50);

  const results: { id: string; status: "sent" | "failed"; error?: string }[] = [];

  for (const row of due ?? []) {
    try {
      const { data: post } = await supabase
        .from("generated_posts")
        .select("id, user_id, platform, content")
        .eq("id", row.generated_post_id)
        .single();
      const { data: account } = await supabase
        .from("connected_accounts")
        .select("id, external_account_id, encrypted_access_token, status")
        .eq("id", row.account_id)
        .single();

      if (!post || !account || account.status !== "connected" || !account.encrypted_access_token) {
        throw new Error("Post or account is no longer available.");
      }

      const platform = getPlatform(post.platform as PlatformIdDb);
      if (!platform.definition.capabilities.publish || !platform.publishPost) {
        throw new Error(`${platform.definition.name} doesn't support publishing through its API.`);
      }

      const accessToken = decryptSecret(account.encrypted_access_token);
      const result = await platform.publishPost(accessToken, {
        platformAccountId: account.external_account_id ?? "",
        content: post.content,
      });

      if (!result.success) throw new Error(result.error ?? "Publishing failed.");

      await supabase.from("published_posts").insert({
        user_id: post.user_id,
        generated_post_id: post.id,
        account_id: account.id,
        external_id: result.externalId,
        external_url: result.externalUrl,
      });
      await supabase.from("generated_posts").update({ status: "published" }).eq("id", post.id);
      await supabase.from("scheduled_posts").update({ status: "sent" }).eq("id", row.id);

      results.push({ id: row.id, status: "sent" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error.";
      await supabase
        .from("scheduled_posts")
        .update({ status: "failed", error_message: message })
        .eq("id", row.id);
      await supabase.from("generated_posts").update({ status: "failed" }).eq("id", row.generated_post_id);
      results.push({ id: row.id, status: "failed", error: message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
