"use client";

import * as React from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { channelList } from "@/lib/channels/registry";
import { promotionTypeLabels, campaignGoalLabels, budgetTypeLabels } from "@/lib/campaign-labels";
import { idleActionState } from "@/lib/types/action-state";
import { updateCampaignDetails } from "../actions";
import type { PromotionType, CampaignGoal, BudgetType, ChannelId } from "@/types/database";

export interface CampaignDetailsInitial {
  name: string;
  promotionType: PromotionType;
  productUrl: string;
  repoUrl: string;
  goal: CampaignGoal;
  brief: string;
  budgetType: BudgetType;
  targetChannels: ChannelId[];
  contentProfileId: string;
}

export function CampaignDetailsForm({
  campaignId,
  initial,
  contentProfiles,
}: {
  campaignId: string;
  initial: CampaignDetailsInitial;
  contentProfiles: { id: string; name: string }[];
}) {
  const action = updateCampaignDetails.bind(null, campaignId);
  const [state, formAction, isPending] = useActionState(action, idleActionState);
  const [channels, setChannels] = React.useState<Set<ChannelId>>(new Set(initial.targetChannels));

  function toggleChannel(channel: ChannelId) {
    setChannels((prev) => {
      const next = new Set(prev);
      if (next.has(channel)) next.delete(channel);
      else next.add(channel);
      return next;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {[...channels].map((channel) => (
        <input key={channel} type="hidden" name="targetChannels" value={channel} />
      ))}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={initial.name} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="promotionType">What you&apos;re promoting</Label>
          <Select id="promotionType" name="promotionType" defaultValue={initial.promotionType}>
            {Object.entries(promotionTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="goal">Goal</Label>
          <Select id="goal" name="goal" defaultValue={initial.goal}>
            {Object.entries(campaignGoalLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="productUrl">Product URL</Label>
          <Input id="productUrl" name="productUrl" type="url" defaultValue={initial.productUrl} placeholder="https://" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="repoUrl">Repo URL</Label>
          <Input id="repoUrl" name="repoUrl" type="url" defaultValue={initial.repoUrl} placeholder="https://github.com/…" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="budgetType">Budget</Label>
        <Select id="budgetType" name="budgetType" defaultValue={initial.budgetType}>
          {Object.entries(budgetTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Target channels</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {channelList.map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => toggleChannel(platform.id)}
              className={
                channels.has(platform.id)
                  ? "flex items-center gap-1.5 rounded-md border border-primary bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground"
                  : "flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
              }
            >
              <PlatformIcon platform={platform.id} className="size-3.5" colored />
              {platform.name}
            </button>
          ))}
        </div>
      </div>

      {contentProfiles.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contentProfileId">Content profile</Label>
          <Select id="contentProfileId" name="contentProfileId" defaultValue={initial.contentProfileId}>
            <option value="">Default</option>
            {contentProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="brief">What you&apos;re promoting (used to regenerate briefs)</Label>
        <Textarea id="brief" name="brief" rows={5} defaultValue={initial.brief} maxLength={20000} />
      </div>

      {state.status === "error" && <p className="text-sm text-destructive">{state.error}</p>}
      {state.status === "success" && <p className="text-sm text-success">Saved.</p>}
      <Button type="submit" loading={isPending} disabled={channels.size === 0} className="self-start">
        Save details
      </Button>
    </form>
  );
}
