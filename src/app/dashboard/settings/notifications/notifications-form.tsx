"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { idleActionState } from "@/lib/types/action-state";
import { updateNotificationPreferences } from "./actions";
import type { NotificationPreferences } from "@/types/database";

const options: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  {
    key: "scheduled_post_published",
    label: "Scheduled post published",
    description: "Get an email when a scheduled post goes out.",
  },
  {
    key: "workflow_failed",
    label: "Workflow failed",
    description: "Get an email if a publish step in a workflow fails.",
  },
  {
    key: "weekly_summary",
    label: "Weekly summary",
    description: "A weekly digest of what published and how it performed.",
  },
];

export function NotificationsForm({ preferences }: { preferences: NotificationPreferences }) {
  const [state, formAction, isPending] = useActionState(updateNotificationPreferences, idleActionState);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {options.map((option) => (
        <label
          key={option.key}
          className="flex items-start gap-3 rounded-md border border-border p-4"
        >
          <input
            type="checkbox"
            name={option.key}
            defaultChecked={preferences[option.key]}
            className="mt-0.5 size-4 rounded border-input"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">{option.label}</span>
            <span className="block text-xs text-muted-foreground">{option.description}</span>
          </span>
        </label>
      ))}
      {state.status === "success" && <p className="text-sm text-success">Saved.</p>}
      <Button type="submit" loading={isPending} className="self-start">
        Save preferences
      </Button>
    </form>
  );
}
