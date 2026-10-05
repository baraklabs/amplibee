"use client";

import * as React from "react";
import { RefreshCw, Trash2, Unlink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { formatDateTime } from "@/lib/utils";
import { disconnectAccount, deleteAccount } from "./actions";
import type { ConnectionStatus } from "@/types/database";

const statusBadge: Record<ConnectionStatus, { label: string; variant: "success" | "warning" | "destructive" | "outline" }> = {
  connected: { label: "Connected", variant: "success" },
  expired: { label: "Expired", variant: "warning" },
  revoked: { label: "Disconnected", variant: "outline" },
  error: { label: "Error", variant: "destructive" },
};

export function AccountRow({
  id,
  displayName,
  handle,
  accountType,
  status,
  lastSyncedAt,
  reconnectHref,
}: {
  id: string;
  displayName: string;
  handle: string | null;
  accountType: string;
  status: ConnectionStatus;
  lastSyncedAt: string | null;
  reconnectHref?: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const badge = statusBadge[status];
  const needsReconnect = status === "revoked" || status === "expired" || status === "error";

  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <Badge variant="outline" className="capitalize">
            {accountType}
          </Badge>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {handle ? `${handle} · ` : ""}
          {lastSyncedAt ? `Last synced ${formatDateTime(lastSyncedAt)}` : "Never synced"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {needsReconnect && reconnectHref && (
          <a
            href={reconnectHref}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <RefreshCw className="size-3.5" />
            Reconnect
          </a>
        )}
        {status === "connected" && (
          <IconButton
            icon={Unlink}
            label="Disconnect"
            disabled={isPending}
            onClick={() => startTransition(() => disconnectAccount(id))}
          />
        )}
        <IconButton
          icon={Trash2}
          label="Remove"
          disabled={isPending}
          onClick={() => startTransition(() => deleteAccount(id))}
        />
      </div>
    </div>
  );
}
