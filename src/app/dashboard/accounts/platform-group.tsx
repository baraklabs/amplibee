"use client";

import * as React from "react";
import { Plus, Info } from "lucide-react";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { AccountRow } from "./account-row";
import { ConnectMediumDialog } from "./connect-medium-dialog";
import { ConnectSubstackDialog } from "./connect-substack-dialog";
import type { PlatformDefinition, ConnectedAccountSummary } from "@/lib/platforms/types";

export function PlatformGroup({
  platform,
  accounts,
  configured,
}: {
  platform: PlatformDefinition;
  accounts: ConnectedAccountSummary[];
  configured: boolean;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const connectButton = (() => {
    if (platform.authType === "oauth2") {
      if (!configured) {
        return (
          <Tooltip label="This platform isn't configured on the server yet">
            <span>
              <Button size="sm" variant="outline" disabled>
                <Plus className="size-3.5" />
                Connect
              </Button>
            </span>
          </Tooltip>
        );
      }
      return (
        <Button size="sm" variant="outline" asChild>
          <a href={`/api/oauth/${platform.id}/start`}>
            <Plus className="size-3.5" />
            Connect
          </a>
        </Button>
      );
    }

    return (
      <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
        <Plus className="size-3.5" />
        Connect
      </Button>
    );
  })();

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <PlatformIcon platform={platform.id} className="size-4 text-foreground" />
          <h3 className="font-heading text-[15px] font-semibold text-foreground">{platform.name}</h3>
        </div>
        {connectButton}
      </div>

      {platform.limitations && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <p>{platform.limitations}</p>
        </div>
      )}

      <div className="mt-2">
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <AccountRow
              key={account.id}
              id={account.id}
              displayName={account.displayName}
              handle={account.handle}
              accountType={account.accountType}
              status={account.status}
              lastSyncedAt={account.lastSyncedAt}
              reconnectHref={platform.authType === "oauth2" ? `/api/oauth/${platform.id}/start` : undefined}
            />
          ))
        ) : (
          <p className="py-4 text-sm text-muted-foreground">No accounts connected yet.</p>
        )}
      </div>

      {platform.id === "medium" && (
        <ConnectMediumDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      )}
      {platform.id === "substack" && (
        <ConnectSubstackDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      )}
    </div>
  );
}
