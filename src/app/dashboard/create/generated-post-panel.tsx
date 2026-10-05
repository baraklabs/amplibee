"use client";

import * as React from "react";
import {
  Copy,
  Scissors,
  Expand,
  Sparkles,
  MessageSquarePlus,
  MessageSquareX,
  Code2,
  MessageCircle,
  Send,
  CalendarClock,
  Save,
  Check,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { getPlatform } from "@/lib/platforms/registry";
import type { PlatformIdDb } from "@/types/database";
import {
  refineGeneratedPost,
  updateGeneratedPostContent,
  publishGeneratedPost,
} from "./actions";

interface Account {
  id: string;
  platform: PlatformIdDb;
  displayName: string;
  status: string;
}

const refineButtons: { action: Parameters<typeof refineGeneratedPost>[1]; icon: typeof Scissors; label: string }[] = [
  { action: "shorten", icon: Scissors, label: "Shorten" },
  { action: "expand", icon: Expand, label: "Expand" },
  { action: "improve_hook", icon: Sparkles, label: "Improve hook" },
  { action: "add_cta", icon: MessageSquarePlus, label: "Add CTA" },
  { action: "remove_cta", icon: MessageSquareX, label: "Remove CTA" },
  { action: "more_technical", icon: Code2, label: "More technical" },
  { action: "more_conversational", icon: MessageCircle, label: "More conversational" },
];

export function GeneratedPostPanel({
  postId,
  platform,
  initialContent,
  initialStatus,
  accounts,
}: {
  postId: string;
  platform: PlatformIdDb;
  initialContent: string;
  initialStatus: string;
  accounts: Account[];
}) {
  const [content, setContent] = React.useState(initialContent);
  const [status, setStatus] = React.useState(initialStatus);
  const [dirty, setDirty] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [accountId, setAccountId] = React.useState(accounts[0]?.id ?? "");
  const [scheduleAt, setScheduleAt] = React.useState("");

  const platformDef = getPlatform(platform).definition;
  const overLimit = platformDef.characterLimit ? content.length > platformDef.characterLimit : false;

  async function runRefine(action: string) {
    setPendingAction(action);
    setError(null);
    const result = await refineGeneratedPost(postId, action);
    setPendingAction(null);
    if (result.status === "success" && result.content) {
      setContent(result.content);
      setDirty(false);
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  async function handleSave() {
    setPendingAction("save");
    await updateGeneratedPostContent(postId, content);
    setDirty(false);
    setPendingAction(null);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handlePublish(schedule: boolean) {
    if (!accountId) {
      setError("Connect and select an account first.");
      return;
    }
    setPendingAction(schedule ? "schedule" : "publish");
    setError(null);
    const result = await publishGeneratedPost(postId, accountId, schedule ? scheduleAt : undefined);
    setPendingAction(null);
    if (result.status === "success") {
      setStatus(schedule ? "scheduled" : "published");
    } else {
      setError(result.error ?? "Publishing failed.");
    }
  }

  const canPublishDirectly = platformDef.capabilities.publish;

  return (
    <div className="flex flex-col gap-4">
      {platformDef.limitations && (
        <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          {platformDef.limitations}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1 border-b border-border pb-3">
        {refineButtons.map(({ action, icon, label }) => (
          <IconButton
            key={action}
            icon={icon}
            label={label}
            disabled={pendingAction !== null}
            onClick={() => runRefine(action)}
          />
        ))}
        <div className="mx-1 h-5 w-px bg-border" />
        <IconButton icon={copied ? Check : Copy} label="Copy" onClick={handleCopy} />
      </div>

      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setDirty(true);
          }}
          rows={platform === "x" ? 4 : 12}
          disabled={pendingAction !== null}
        />
        {pendingAction && !["publish", "schedule", "save"].includes(pendingAction) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/70 text-sm text-muted-foreground">
            Rewriting…
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className={overLimit ? "font-medium text-destructive" : ""}>
          {content.length}
          {platformDef.characterLimit ? ` / ${platformDef.characterLimit}` : ""} characters
        </span>
        <Badge variant={status === "published" ? "success" : status === "scheduled" ? "accent" : "outline"}>
          {status.replace("_", " ")}
        </Badge>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <PlatformIcon platform={platform} className="size-4 text-muted-foreground" />
          {accounts.length > 0 ? (
            <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="h-8 w-48">
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.displayName}
                </option>
              ))}
            </Select>
          ) : (
            <span className="text-xs text-muted-foreground">No {platformDef.name} account connected</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" loading={pendingAction === "save"} onClick={handleSave} disabled={!dirty}>
            <Save className="size-3.5" />
            Save draft
          </Button>
          <input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
          />
          <Button
            size="sm"
            variant="outline"
            loading={pendingAction === "schedule"}
            disabled={!scheduleAt || accounts.length === 0}
            onClick={() => handlePublish(true)}
          >
            <CalendarClock className="size-3.5" />
            Schedule
          </Button>
          <Button
            size="sm"
            loading={pendingAction === "publish"}
            disabled={accounts.length === 0 || !canPublishDirectly}
            onClick={() => handlePublish(false)}
          >
            <Send className="size-3.5" />
            Publish now
          </Button>
        </div>
      </div>
    </div>
  );
}
