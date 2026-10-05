import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Megaphone } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CampaignRow } from "./campaign-row";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import type { ChannelId } from "@/types/database";

export const metadata: Metadata = { title: "Campaigns" };
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, status, goal, budget_type, is_public, target_channels")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Campaigns"
        description="What you're briefing influencers to genuinely promote to their own audience."
        action={
          <Button asChild>
            <Link href="/dashboard/campaigns/new">
              <Plus className="size-4" />
              New campaign
            </Link>
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card px-5">
        {campaigns && campaigns.length > 0 ? (
          <div className="flex flex-col">
            {campaigns.map((campaign) => (
              <CampaignRow
                key={campaign.id}
                id={campaign.id}
                name={campaign.name}
                status={campaign.status}
                goal={campaign.goal}
                budgetType={campaign.budget_type}
                isPublic={campaign.is_public}
                targetChannels={campaign.target_channels as ChannelId[]}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Megaphone}
            title="No campaigns yet"
            description="Brief what you're promoting and let real influencers discover it in the network."
            action={
              <Button size="sm" asChild>
                <Link href="/dashboard/campaigns/new">New campaign</Link>
              </Button>
            }
            className="border-0"
          />
        )}
      </div>
    </div>
  );
}
