import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { WorkflowBuilder } from "../../workflow-builder";
import { updateWorkflow } from "../../actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import type { PlatformIdDb } from "@/types/database";

export const metadata: Metadata = { title: "Edit workflow" };
export const dynamic = "force-dynamic";

export default async function EditWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const [{ data: workflow }, { data: steps }, { data: accountRows }, { data: contentProfiles }] =
    await Promise.all([
      supabase.from("workflows").select("*").eq("id", id).eq("user_id", userId).single(),
      supabase.from("workflow_steps").select("*").eq("workflow_id", id).order("position"),
      supabase
        .from("connected_accounts")
        .select("id, platform, display_name")
        .eq("user_id", userId)
        .eq("status", "connected"),
      supabase.from("content_profiles").select("id, name").eq("user_id", userId),
    ]);

  if (!workflow) notFound();

  const accounts = (accountRows ?? []).map((row) => ({
    id: row.id,
    platform: row.platform as PlatformIdDb,
    displayName: row.display_name,
  }));

  const destinations = (steps ?? [])
    .filter((step) => step.step_type === "publish" && step.target_platform && step.target_account_id)
    .map((step) => ({
      platform: step.target_platform as PlatformIdDb,
      accountId: step.target_account_id as string,
    }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit workflow" description={workflow.name} />
      <WorkflowBuilder
        action={updateWorkflow.bind(null, workflow.id)}
        accounts={accounts}
        contentProfiles={contentProfiles ?? []}
        initial={{
          name: workflow.name,
          sourceType: workflow.source_type,
          sourceAccountId: workflow.source_account_id,
          contentProfileId: workflow.content_profile_id,
          approvalMode: workflow.approval_mode,
          publishMode: workflow.publish_mode,
          destinations,
        }}
      />
    </div>
  );
}
