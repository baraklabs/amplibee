"use client";

import * as React from "react";
import { Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { getChannel } from "@/lib/channels/registry";
import { updateCampaignBrief, regenerateCampaignBrief } from "../actions";
import type { ChannelId, CampaignBriefStatus } from "@/types/database";

export function BriefEditor({
  briefId,
  channel,
  initialContent,
  status,
}: {
  briefId: string;
  channel: ChannelId;
  initialContent: string;
  status: CampaignBriefStatus;
}) {
  const [content, setContent] = React.useState(initialContent);
  const [dirty, setDirty] = React.useState(false);
  const [pending, setPending] = React.useState<"save" | "regenerate" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const platform = getChannel(channel);

  async function handleSave() {
    setPending("save");
    setError(null);
    await updateCampaignBrief(briefId, content);
    setDirty(false);
    setPending(null);
  }

  async function handleRegenerate() {
    setPending("regenerate");
    setError(null);
    const result = await regenerateCampaignBrief(briefId);
    setPending(null);
    if (result.status === "success" && result.content !== undefined) {
      setContent(result.content);
      setDirty(false);
    } else {
      setError(result.error ?? "Regeneration failed.");
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlatformIcon platform={channel} className="size-4" colored />
          <span className="text-sm font-medium text-foreground">{platform.name}</span>
        </div>
        <Badge variant={status === "approved" ? "success" : "outline"}>{status}</Badge>
      </div>

      <Textarea
        className="mt-3"
        rows={channel === "x" ? 5 : 8}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setDirty(true);
        }}
        disabled={pending !== null}
      />

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="outline" loading={pending === "save"} disabled={!dirty || pending === "regenerate"} onClick={handleSave}>
          <Save className="size-3.5" />
          Save
        </Button>
        <Button size="sm" variant="outline" loading={pending === "regenerate"} disabled={pending === "save"} onClick={handleRegenerate}>
          <Sparkles className="size-3.5" />
          Regenerate
        </Button>
      </div>
    </div>
  );
}
