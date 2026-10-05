import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { WorkflowBuilder } from "../workflow-builder";
import { createWorkflow } from "../actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import type { PlatformIdDb } from "@/types/database";

export const metadata: Metadata = { title: "New workflow" };
export const dynamic = "force-dynamic";

export default async function NewWorkflowPage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const [{ data: accountRows }, { data: contentProfiles }] = await Promise.all([
    supabase
      .from("connected_accounts")
      .select("id, platform, display_name")
      .eq("user_id", userId)
      .eq("status", "connected"),
    supabase.from("content_profiles").select("id, name").eq("user_id", userId),
  ]);

  const accounts = (accountRows ?? []).map((row) => ({
    id: row.id,
    platform: row.platform as PlatformIdDb,
    displayName: row.display_name,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New workflow" description="Chain a source, AI rewrite, and destinations together." />
      <WorkflowBuilder action={createWorkflow} accounts={accounts} contentProfiles={contentProfiles ?? []} />
    </div>
  );
}
