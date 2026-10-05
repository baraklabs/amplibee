"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { channelList } from "@/lib/channels/registry";
import { idleActionState } from "@/lib/types/action-state";
import { saveChannelProfile } from "./actions";

export interface OwnProfile {
  displayName: string;
  category: string;
  platforms: string[];
  niches: string[];
  audienceSize: number | null;
  bio: string;
  rateInfo: string;
  portfolioUrl: string;
  contactUrl: string;
  isVisible: boolean;
}

export function ProfileForm({ profile }: { profile: OwnProfile | null }) {
  const [state, formAction, isPending] = useActionState(saveChannelProfile, idleActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">Name</Label>
        <Input id="displayName" name="displayName" defaultValue={profile?.displayName} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Select id="category" name="category" defaultValue={profile?.category ?? "creator"}>
          <option value="influencer">Influencer</option>
          <option value="creator">Creator</option>
          <option value="community">Community</option>
        </Select>
      </div>

      <div>
        <Label>Channels you post on</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {channelList.map((platform) => (
            <label
              key={platform.id}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground"
            >
              <input
                type="checkbox"
                name="platforms"
                value={platform.id}
                defaultChecked={profile?.platforms?.includes(platform.id)}
                className="size-3.5 rounded border-input"
              />
              <PlatformIcon platform={platform.id} className="size-3.5" colored />
              {platform.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="niches">Niches</Label>
        <Input
          id="niches"
          name="niches"
          defaultValue={profile?.niches?.join(", ")}
          placeholder="devtools, indie SaaS, productivity"
        />
        <p className="text-xs text-muted-foreground">Comma-separated.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audienceSize">Audience size (approx.)</Label>
        <Input
          id="audienceSize"
          name="audienceSize"
          type="number"
          min={0}
          defaultValue={profile?.audienceSize ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={3} defaultValue={profile?.bio} maxLength={400} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rateInfo">Rate info (optional)</Label>
        <Input id="rateInfo" name="rateInfo" defaultValue={profile?.rateInfo} placeholder="e.g. open to gifted, or $X per post" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="portfolioUrl">Portfolio URL (optional)</Label>
        <Input id="portfolioUrl" name="portfolioUrl" type="url" defaultValue={profile?.portfolioUrl} placeholder="https://" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contactUrl">Contact URL</Label>
        <Input id="contactUrl" name="contactUrl" type="url" defaultValue={profile?.contactUrl} placeholder="https://" />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="isVisible"
          defaultChecked={profile?.isVisible ?? false}
          className="size-4 rounded border-input"
        />
        List me publicly in the network directory
      </label>

      {state.status === "error" && <p className="text-sm text-destructive">{state.error}</p>}
      {state.status === "success" && <p className="text-sm text-success">Saved.</p>}
      <Button type="submit" loading={isPending} className="self-start">
        Save profile
      </Button>
    </form>
  );
}
