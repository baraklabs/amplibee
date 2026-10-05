import type { Metadata } from "next";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { PlatformGroup } from "./platform-group";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { platformList, isPlatformConfigured } from "@/lib/platforms/registry";
import type { ConnectedAccountSummary } from "@/lib/platforms/types";
import type { PlatformIdDb } from "@/types/database";

export const metadata: Metadata = { title: "Accounts" };
export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  unknown_platform: "That platform isn't supported.",
  not_oauth: "That platform doesn't use OAuth.",
  not_configured: "This platform isn't configured on the server yet — add API credentials to connect it.",
  invalid_state: "The connection request expired or was invalid. Please try again.",
  connection_failed: "We couldn't complete the connection. Please try again.",
};

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const { data: rows } = await supabase
    .from("connected_accounts")
    .select("id, platform, account_type, display_name, handle, avatar_url, status, last_synced_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  const accounts: ConnectedAccountSummary[] = (rows ?? []).map((row) => ({
    id: row.id,
    platform: row.platform as PlatformIdDb,
    accountType: row.account_type,
    displayName: row.display_name,
    handle: row.handle,
    avatarUrl: row.avatar_url,
    status: row.status,
    lastSyncedAt: row.last_synced_at,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounts"
        description="Connect the accounts you publish to. Add more than one per platform."
      />

      {connected && (
        <div className="flex items-center gap-2.5 rounded-md border border-border bg-success-soft px-4 py-3 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" />
          Connected successfully.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 rounded-md border border-border bg-destructive-soft px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          {errorMessages[error] ?? "Something went wrong."}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {platformList.map((platform) => (
          <PlatformGroup
            key={platform.definition.id}
            platform={platform.definition}
            accounts={accounts.filter((a) => a.platform === platform.definition.id)}
            configured={isPlatformConfigured(platform.definition.id)}
          />
        ))}
      </div>
    </div>
  );
}
