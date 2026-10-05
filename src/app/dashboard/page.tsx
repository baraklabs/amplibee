import Link from "next/link";
import type { Metadata } from "next";
import { Users, FileStack, CalendarClock, PenSquare, Link2, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { MiniBarChart } from "@/components/dashboard/mini-bar-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { truncate, formatDate } from "@/lib/utils";
import type { PlatformIdDb } from "@/types/database";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

const statusVariant: Record<string, "outline" | "accent" | "success" | "destructive"> = {
  draft: "outline",
  scheduled: "accent",
  published: "success",
  failed: "destructive",
};

export default async function DashboardOverviewPage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const [
    { count: connectedAccountsCount },
    { count: scheduledCount },
    { count: draftsCount },
    { count: backlinksCount },
    { data: recentPosts },
  ] = await Promise.all([
    supabase.from("connected_accounts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("scheduled_posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending"),
    supabase
      .from("generated_posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "draft"),
    supabase.from("backlinks").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("generated_posts")
      .select("id, platform, content, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const last7Days = Array.from({ length: 7 }, () => 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Overview"
        description="Where your posts stand right now."
        action={
          <Button asChild>
            <Link href="/dashboard/create">
              <PenSquare className="size-4" />
              New post
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Connected accounts" value={connectedAccountsCount ?? 0} icon={Users} colorIndex={0} />
        <StatCard label="Scheduled" value={scheduledCount ?? 0} icon={CalendarClock} colorIndex={1} />
        <StatCard label="Drafts" value={draftsCount ?? 0} icon={FileStack} colorIndex={2} />
        <StatCard label="Backlinks generated" value={backlinksCount ?? 0} icon={Link2} colorIndex={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[15px] font-semibold text-foreground">
              Recent posts
            </h2>
            <Link
              href="/dashboard/posts"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View all <ArrowUpRight className="size-3" />
            </Link>
          </div>

          <div className="mt-4">
            {recentPosts && recentPosts.length > 0 ? (
              <ul className="flex flex-col divide-y divide-border">
                {recentPosts.map((post) => (
                  <li key={post.id} className="flex items-center gap-3 py-3">
                    <PlatformIcon
                      platform={post.platform as PlatformIdDb}
                      className="size-4 shrink-0"
                    />
                    <p className="flex-1 truncate text-sm text-foreground">
                      {truncate(post.content, 70)}
                    </p>
                    <Badge variant={statusVariant[post.status] ?? "outline"}>{post.status}</Badge>
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {formatDate(post.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={FileStack}
                title="No posts yet"
                description="Create your first post and generate a platform-native version for each destination in a couple of minutes."
                action={
                  <Button size="sm" asChild>
                    <Link href="/dashboard/create">New post</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <MiniBarChart data={last7Days} label="Posts published, last 7 days" />
          <p className="mt-4 text-xs text-muted-foreground">
            Publishing activity will show up here once you connect an account and publish a post.
          </p>
        </div>
      </div>
    </div>
  );
}
