"use client";

import {
  Copy,
  Scissors,
  Expand,
  Sparkles,
  MessageSquarePlus,
  MessageSquareX,
  Code2,
  MessageCircle,
  Check,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";
import type { CampaignBriefState } from "./use-campaign-brief";

const refineButtons: { action: string; icon: typeof Scissors; label: string }[] = [
  { action: "shorten", icon: Scissors, label: "Shorten" },
  { action: "expand", icon: Expand, label: "Expand" },
  { action: "improve_hook", icon: Sparkles, label: "Improve hook" },
  { action: "add_cta", icon: MessageSquarePlus, label: "Add CTA" },
  { action: "remove_cta", icon: MessageSquareX, label: "Remove CTA" },
  { action: "more_technical", icon: Code2, label: "More technical" },
  { action: "more_conversational", icon: MessageCircle, label: "More conversational" },
];

export function BriefPanel({ brief }: { brief: CampaignBriefState }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-heading text-[15px] font-semibold text-foreground">Talking points</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Edit directly, or use a quick rewrite below. This is a starting point for an influencer to adapt in their own voice.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1 border-b border-border pb-3">
        {refineButtons.map(({ action, icon, label }) => (
          <IconButton
            key={action}
            icon={icon}
            label={label}
            disabled={brief.pendingAction !== null}
            onClick={() => brief.runRefine(action)}
          />
        ))}
        <div className="mx-1 h-5 w-px bg-border" />
        <IconButton icon={brief.copied ? Check : Copy} label="Copy" onClick={brief.handleCopy} />
      </div>

      <div className="relative mt-3">
        <Textarea
          value={brief.content}
          onChange={(e) => brief.updateContent(e.target.value)}
          rows={brief.channel === "x" ? 5 : 12}
          disabled={brief.pendingAction !== null}
        />
        {brief.isRewriting && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/70 text-sm text-muted-foreground">
            Rewriting…
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{brief.content.length} characters</span>
        <Badge variant={brief.status === "approved" ? "success" : "outline"}>{brief.status}</Badge>
      </div>

      {brief.error && <p className="mt-2 text-sm text-destructive">{brief.error}</p>}

      <button
        type="button"
        onClick={brief.handleSave}
        disabled={!brief.dirty || brief.pendingAction !== null}
        className="mt-3 text-xs font-medium text-foreground underline decoration-dotted disabled:pointer-events-none disabled:opacity-50"
      >
        {brief.pendingAction === "save" ? "Saving…" : "Save edits"}
      </button>
    </div>
  );
}
