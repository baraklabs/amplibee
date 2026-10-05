"use client";

import { PlatformIcon } from "@/components/platform/platform-icon";
import type { CampaignBriefState } from "./use-campaign-brief";

export function CampaignPreview({ brief, campaignName }: { brief: CampaignBriefState; campaignName: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-heading text-[15px] font-semibold text-foreground">Preview</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        An approximation of how an influencer might adapt this on {brief.platformDef.name} — never posted by Amplibee.
      </p>

      <div className="mt-4 rounded-lg border border-border p-4">
        <div className="flex items-center gap-2.5">
          <PlatformIcon platform={brief.channel} className="size-8 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">An influencer&apos;s own account</p>
            <p className="text-xs text-muted-foreground">{brief.platformDef.name} · {campaignName}</p>
          </div>
        </div>

        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{brief.content || "Nothing written yet."}</p>
      </div>
    </div>
  );
}
