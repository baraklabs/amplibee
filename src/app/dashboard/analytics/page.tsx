import type { Metadata } from "next";
import { Send, Link2, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { truncate } from "@/lib/utils";
import type { PlatformIdDb } from "@/types/database";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const [{ count: publishedCount }, { count: backlinksCount }, { data: published }, { data: analyticsRows }] =
    await Promise.all([
      supabase.from("published_posts").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("backlinks").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase
        .from("published_posts")
        .select("id, generated_post_id, published_at")
        .eq("user_id", userId)
        .order("published_at", { ascending: false })
        .limit(50),
      supabase.from("analytics").select("published_post_id, impressions, engagements, clicks").eq("user_id", userId),
    ]);

  const generatedPostIds = [...new Set((published ?? []).map((p) => p.generated_post_id))];
  const { data: generatedPosts } = generatedPostIds.length
    ? await supabase.from("generated_posts").select("id, platform, content").in("id", generatedPostIds)
    : { data: [] as { id: string; platform: string; content: string }[] };

  const generatedById = new Map((generatedPosts ?? []).map((g) => [g.id, g]));
  const analyticsByPost = new Map((analyticsRows ?? []).map((a) => [a.published_post_id, a]));

  const totals = (analyticsRows ?? []).reduce(
    (acc, row) => ({
      impressions: acc.impressions + row.impressions,
      engagements: acc.engagements + row.engagements,
      clicks: acc.clicks + row.clicks,
    }),
    { impressions: 0, engagements: 0, clicks: 0 },
  );

  const platformsUsed = new Set((generatedPosts ?? []).map((g) => g.platform));

  const topPosts = (published ?? [])
    .map((p) => ({
      ...p,
      generated: generatedById.get(p.generated_post_id),
      analytics: analyticsByPost.get(p.id),
    }))
    .filter((p) => p.analytics)
    .sort((a, b) => (b.analytics?.engagements ?? 0) - (a.analytics?.engagements ?? 0))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Analytics" description="How your published posts are performing." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Posts published" value={publishedCount ?? 0} icon={Send} colorIndex={0} />
        <StatCard label="Platforms used" value={platformsUsed.size} icon={TrendingUp} colorIndex={1} />
        <StatCard label="Reach (impressions)" value={totals.impressions} icon={Eye} colorIndex={2} />
        <StatCard label="Clicks" value={totals.clicks} icon={MousePointerClick} colorIndex={3} />
        <StatCard label="Backlinks generated" value={backlinksCount ?? 0} icon={Link2} colorIndex={4} />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-heading text-[15px] font-semibold text-foreground">Top performing posts</h2>
        <div className="mt-4">
          {topPosts.length > 0 ? (
            <div className="flex flex-col divide-y divide-border">
              {topPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-3 py-3">
                  {post.generated && (
                    <PlatformIcon
                      platform={post.generated.platform as PlatformIdDb}
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                  )}
                  <p className="flex-1 truncate text-sm text-foreground">
                    {post.generated ? truncate(post.generated.content, 70) : "—"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {post.analytics?.engagements ?? 0} engagements
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No performance data yet"
              description="Analytics appear here once a connected platform reports engagement for a published post. Not every platform's API exposes this."
              className="border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
