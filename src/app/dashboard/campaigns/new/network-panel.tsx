"use client";

import * as React from "react";
import Link from "next/link";
import { Globe, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishCampaignToNetwork } from "../actions";

export function NetworkPanel({ campaignId, campaignName }: { campaignId: string; campaignName: string }) {
  const [isPending, startTransition] = React.useTransition();
  const [published, setPublished] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handlePublish() {
    setError(null);
    startTransition(async () => {
      const result = await publishCampaignToNetwork(campaignId);
      if (result.status === "success") {
        setPublished(true);
      } else {
        setError(result.error ?? "Could not publish this campaign.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-heading text-[15px] font-semibold text-foreground">Publish to the network</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        &ldquo;{campaignName}&rdquo; is saved as a draft. Publishing makes it visible to real influencers browsing the
        network — Amplibee never posts anything on your behalf.
      </p>

      {published ? (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-success-soft bg-success-soft px-3 py-2.5 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" />
          Live in the network.
        </div>
      ) : (
        <Button className="mt-4" loading={isPending} onClick={handlePublish}>
          <Globe className="size-4" />
          Publish to network
        </Button>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <Link
        href={`/dashboard/campaigns/${campaignId}`}
        className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        Manage links, applications & deliverables <ArrowUpRight className="size-3" />
      </Link>
    </div>
  );
}
