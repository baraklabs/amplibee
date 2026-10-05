"use client";

import * as React from "react";
import { Pencil, Trash2, Star, Plus, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ContentProfileDialog } from "./profile-dialog";
import { deleteContentProfile, setDefaultContentProfile } from "./actions";
import type { ContentProfileRow } from "./types";

export function ProfileList({ profiles }: { profiles: ContentProfileRow[] }) {
  const [isPending, startTransition] = React.useTransition();
  const [dialogState, setDialogState] = React.useState<{ open: boolean; profile?: ContentProfileRow }>({
    open: false,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Saved tone, audience, and voice configurations used when generating content.
        </p>
        <Button size="sm" onClick={() => setDialogState({ open: true })}>
          <Plus className="size-3.5" />
          New profile
        </Button>
      </div>

      <div className="mt-5">
        {profiles.length === 0 ? (
          <EmptyState
            icon={Sliders}
            title="No content profiles yet"
            description="Create one to set your tone, audience, and brand voice once, then reuse it everywhere."
            action={
              <Button size="sm" onClick={() => setDialogState({ open: true })}>
                New profile
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {profiles.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{profile.name}</p>
                    {profile.is_default && <Badge variant="accent">Default</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {profile.tone} · {profile.formality} · {profile.length}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!profile.is_default && (
                    <IconButton
                      icon={Star}
                      label="Make default"
                      disabled={isPending}
                      onClick={() => startTransition(() => setDefaultContentProfile(profile.id))}
                    />
                  )}
                  <IconButton
                    icon={Pencil}
                    label="Edit"
                    onClick={() => setDialogState({ open: true, profile })}
                  />
                  <IconButton
                    icon={Trash2}
                    label="Delete"
                    disabled={isPending}
                    onClick={() => startTransition(() => deleteContentProfile(profile.id))}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContentProfileDialog
        key={dialogState.profile?.id ?? "new"}
        open={dialogState.open}
        onClose={() => setDialogState({ open: false })}
        profile={dialogState.profile}
      />
    </div>
  );
}
