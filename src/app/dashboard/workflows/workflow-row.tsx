"use client";

import * as React from "react";
import { Pencil, Trash2, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { deleteWorkflow, toggleWorkflowActive } from "./actions";
import type { PlatformIdDb } from "@/types/database";

export function WorkflowRow({
  id,
  name,
  sourceType,
  approvalMode,
  publishMode,
  isActive,
  destinationPlatforms,
}: {
  id: string;
  name: string;
  sourceType: string;
  approvalMode: string;
  publishMode: string;
  isActive: boolean;
  destinationPlatforms: PlatformIdDb[];
}) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{name}</p>
          <Badge variant={isActive ? "success" : "outline"}>{isActive ? "Active" : "Paused"}</Badge>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{sourceType.replace("_", " ")}</span>
          <span aria-hidden="true">→</span>
          <div className="flex items-center gap-1">
            {destinationPlatforms.map((p) => (
              <PlatformIcon key={p} platform={p} className="size-3.5" />
            ))}
          </div>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{approvalMode}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{publishMode}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          icon={Power}
          label={isActive ? "Pause" : "Activate"}
          disabled={isPending}
          onClick={() => startTransition(() => toggleWorkflowActive(id, !isActive))}
        />
        <IconButton icon={Pencil} label="Edit" href={`/dashboard/workflows/${id}/edit`} />
        <IconButton
          icon={Trash2}
          label="Delete"
          disabled={isPending}
          onClick={() => startTransition(() => deleteWorkflow(id))}
        />
      </div>
    </div>
  );
}
