import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { Composer } from "./composer";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import type { PlatformIdDb } from "@/types/database";

export const metadata: Metadata = { title: "Create" };
export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const [{ data: contentProfiles }, { data: accountRows }, { count: aiProviderCount }] = await Promise.all([
    supabase.from("content_profiles").select("id, name").eq("user_id", userId).order("created_at"),
    supabase
      .from("connected_accounts")
      .select("id, platform, display_name, status")
      .eq("user_id", userId),
    supabase
      .from("ai_providers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const accounts = (accountRows ?? []).map((row) => ({
    id: row.id,
    platform: row.platform as PlatformIdDb,
    displayName: row.display_name,
    status: row.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create"
        description="Write once. Generate a platform-native version for each destination."
      />
      <Composer
        contentProfiles={contentProfiles ?? []}
        accounts={accounts}
        hasAIProvider={(aiProviderCount ?? 0) > 0}
      />
    </div>
  );
}
