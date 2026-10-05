"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { workflowSchema, type WorkflowInput } from "@/lib/validation/workflows";
import type { ActionState } from "@/lib/types/action-state";
import type { PlatformIdDb } from "@/types/database";

function parseForm(formData: FormData) {
  const destinationsRaw = formData.get("destinations");
  let destinations: unknown = [];
  try {
    destinations = destinationsRaw ? JSON.parse(destinationsRaw as string) : [];
  } catch {
    destinations = [];
  }

  return workflowSchema.safeParse({
    name: formData.get("name"),
    sourceType: formData.get("sourceType"),
    sourceAccountId: formData.get("sourceAccountId") ?? "",
    contentProfileId: formData.get("contentProfileId") ?? "",
    approvalMode: formData.get("approvalMode"),
    publishMode: formData.get("publishMode"),
    destinations,
  });
}

async function writeSteps(
  supabase: ReturnType<typeof createAdminClient>,
  workflowId: string,
  parsed: WorkflowInput,
) {
  await supabase.from("workflow_steps").delete().eq("workflow_id", workflowId);

  const steps: {
    workflow_id: string;
    position: number;
    step_type: "generate" | "approval" | "publish";
    target_platform?: PlatformIdDb;
    target_account_id?: string;
    config: Record<string, unknown>;
  }[] = [];

  let position = 0;
  for (const destination of parsed.destinations) {
    steps.push({
      workflow_id: workflowId,
      position: position++,
      step_type: "generate",
      target_platform: destination.platform,
      config: {},
    });
  }

  if (parsed.approvalMode === "manual") {
    steps.push({ workflow_id: workflowId, position: position++, step_type: "approval", config: {} });
  }

  for (const destination of parsed.destinations) {
    steps.push({
      workflow_id: workflowId,
      position: position++,
      step_type: "publish",
      target_platform: destination.platform,
      target_account_id: destination.accountId,
      config: {},
    });
  }

  if (steps.length > 0) {
    await supabase.from("workflow_steps").insert(steps);
  }
}

export async function createWorkflow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const { data: workflow, error } = await supabase
    .from("workflows")
    .insert({
      user_id: userId,
      name: parsed.data.name,
      source_type: parsed.data.sourceType,
      source_account_id: parsed.data.sourceAccountId || null,
      content_profile_id: parsed.data.contentProfileId || null,
      approval_mode: parsed.data.approvalMode,
      publish_mode: parsed.data.publishMode,
    })
    .select("id")
    .single();

  if (error || !workflow) return { status: "error", error: "Could not create workflow." };

  await writeSteps(supabase, workflow.id, parsed.data);
  revalidatePath("/dashboard/workflows");
  redirect("/dashboard/workflows");
}

export async function updateWorkflow(
  workflowId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("workflows")
    .update({
      name: parsed.data.name,
      source_type: parsed.data.sourceType,
      source_account_id: parsed.data.sourceAccountId || null,
      content_profile_id: parsed.data.contentProfileId || null,
      approval_mode: parsed.data.approvalMode,
      publish_mode: parsed.data.publishMode,
    })
    .eq("id", workflowId)
    .eq("user_id", userId);

  if (error) return { status: "error", error: "Could not update workflow." };

  await writeSteps(supabase, workflowId, parsed.data);
  revalidatePath("/dashboard/workflows");
  redirect("/dashboard/workflows");
}

export async function deleteWorkflow(workflowId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const supabase = createAdminClient();

  await supabase.from("workflows").delete().eq("id", workflowId).eq("user_id", userId);
  revalidatePath("/dashboard/workflows");
}

export async function toggleWorkflowActive(workflowId: string, isActive: boolean) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const supabase = createAdminClient();

  await supabase
    .from("workflows")
    .update({ is_active: isActive })
    .eq("id", workflowId)
    .eq("user_id", userId);
  revalidatePath("/dashboard/workflows");
}
