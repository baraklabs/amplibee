import { Plus, Info } from "lucide-react";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { AccountRow } from "./account-row";
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
  const connectButton = configured ? (
    <Button size="sm" variant="outline" asChild>
      <a href={`/api/oauth/${platform.id}/start`}>
        <Plus className="size-3.5" />
        Connect
      </a>
    </Button>
  ) : (
    <Tooltip label="This platform isn't configured on the server yet">
      <span>
        <Button size="sm" variant="outline" disabled>
          <Plus className="size-3.5" />
          Connect
        </Button>
      </span>
    </Tooltip>
  );

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <PlatformIcon platform={platform.id} className="size-5" />
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
              reconnectHref={`/api/oauth/${platform.id}/start`}
            />
          ))
        ) : (
          <p className="py-4 text-sm text-muted-foreground">No accounts connected yet.</p>
        )}
      </div>
    </div>
  );
}
