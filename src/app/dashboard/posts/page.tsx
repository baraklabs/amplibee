import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { PostsTable, type PostRow } from "./posts-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import type { PlatformIdDb } from "@/types/database";

export const metadata: Metadata = { title: "Posts" };
export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const { data: rows } = await supabase
    .from("generated_posts")
    .select("id, platform, content, status, created_at, account_id, workflow_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  const accountIds = [...new Set((rows ?? []).map((r) => r.account_id).filter((v): v is string => Boolean(v)))];
  const workflowIds = [...new Set((rows ?? []).map((r) => r.workflow_id).filter((v): v is string => Boolean(v)))];

  const [{ data: accounts }, { data: workflows }, { data: scheduled }] = await Promise.all([
    accountIds.length
      ? supabase.from("connected_accounts").select("id, display_name").in("id", accountIds)
      : Promise.resolve({ data: [] as { id: string; display_name: string }[] }),
    workflowIds.length
      ? supabase.from("workflows").select("id, name").in("id", workflowIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    supabase.from("scheduled_posts").select("generated_post_id, scheduled_for").eq("user_id", userId),
  ]);

  const accountNameById = new Map((accounts ?? []).map((a) => [a.id, a.display_name]));
  const workflowNameById = new Map((workflows ?? []).map((w) => [w.id, w.name]));
  const scheduledMap = new Map((scheduled ?? []).map((s) => [s.generated_post_id, s.scheduled_for]));

  const posts: PostRow[] = (rows ?? []).map((row) => ({
    id: row.id,
    platform: row.platform as PlatformIdDb,
    content: row.content,
    status: row.status,
    createdAt: row.created_at,
    accountName: row.account_id ? (accountNameById.get(row.account_id) ?? null) : null,
    workflowName: row.workflow_id ? (workflowNameById.get(row.workflow_id) ?? null) : null,
    scheduledFor: scheduledMap.get(row.id) ?? null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Posts" description="Every generated post, wherever it stands." />
      <PostsTable posts={posts} />
    </div>
  );
}
