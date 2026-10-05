import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Workflow } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { WorkflowRow } from "./workflow-row";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import type { PlatformIdDb } from "@/types/database";

export const metadata: Metadata = { title: "Workflows" };
export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const { data: workflows } = await supabase
    .from("workflows")
    .select("id, name, source_type, approval_mode, publish_mode, is_active")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: steps } = await supabase
    .from("workflow_steps")
    .select("workflow_id, target_platform, step_type")
    .eq("step_type", "publish")
    .in("workflow_id", (workflows ?? []).map((w) => w.id));

  const platformsByWorkflow = new Map<string, PlatformIdDb[]>();
  for (const step of steps ?? []) {
    if (!step.target_platform) continue;
    const list = platformsByWorkflow.get(step.workflow_id) ?? [];
    list.push(step.target_platform as PlatformIdDb);
    platformsByWorkflow.set(step.workflow_id, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Workflows"
        description="Reusable pipelines from a source to one or more destinations."
        action={
          <Button asChild>
            <Link href="/dashboard/workflows/new">
              <Plus className="size-4" />
              New workflow
            </Link>
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card px-5">
        {workflows && workflows.length > 0 ? (
          <div className="flex flex-col">
            {workflows.map((workflow) => (
              <WorkflowRow
                key={workflow.id}
                id={workflow.id}
                name={workflow.name}
                sourceType={workflow.source_type}
                approvalMode={workflow.approval_mode}
                publishMode={workflow.publish_mode}
                isActive={workflow.is_active}
                destinationPlatforms={platformsByWorkflow.get(workflow.id) ?? []}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Workflow}
            title="No workflows yet"
            description="Create a workflow to automatically turn a source into platform-native drafts."
            action={
              <Button size="sm" asChild>
                <Link href="/dashboard/workflows/new">New workflow</Link>
              </Button>
            }
            className="border-0"
          />
        )}
      </div>
    </div>
  );
}
