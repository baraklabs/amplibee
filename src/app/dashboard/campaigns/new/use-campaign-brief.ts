"use client";

import * as React from "react";
import { getChannel } from "@/lib/channels/registry";
import type { ChannelId } from "@/types/database";
import { refineCampaignBrief, updateCampaignBrief } from "../actions";

/** All state and actions for one campaign brief — shared by the editable-text and preview panels. */
export function useCampaignBrief({
  briefId,
  channel,
  initialContent,
  initialStatus,
}: {
  briefId: string;
  channel: ChannelId;
  initialContent: string;
  initialStatus: string;
}) {
  const [loadedBriefId, setLoadedBriefId] = React.useState(briefId);
  const [content, setContent] = React.useState(initialContent);
  const [status] = React.useState(initialStatus);
  const [dirty, setDirty] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Reset when the active brief changes (e.g. switching channel tabs) — a render-time
  // state adjustment, not an effect, so it happens before paint.
  if (briefId !== loadedBriefId) {
    setLoadedBriefId(briefId);
    setContent(initialContent);
    setDirty(false);
    setPendingAction(null);
    setError(null);
  }

  const platformDef = getChannel(channel);

  function updateContent(value: string) {
    setContent(value);
    setDirty(true);
  }

  async function runRefine(action: string) {
    setPendingAction(action);
    setError(null);
    const result = await refineCampaignBrief(briefId, action);
    setPendingAction(null);
    if (result.status === "success" && result.content !== undefined) {
      setContent(result.content);
      setDirty(false);
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  async function handleSave() {
    setPendingAction("save");
    await updateCampaignBrief(briefId, content);
    setDirty(false);
    setPendingAction(null);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return {
    channel,
    platformDef,
    content,
    status,
    dirty,
    pendingAction,
    error,
    copied,
    isRewriting: pendingAction !== null && pendingAction !== "save",
    updateContent,
    runRefine,
    handleSave,
    handleCopy,
  };
}

export type CampaignBriefState = ReturnType<typeof useCampaignBrief>;
