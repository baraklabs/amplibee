import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import type { PlatformIdDb } from "@/types/database";

export const metadata: Metadata = { title: "Connected accounts" };
export const dynamic = "force-dynamic";

export default async function ConnectedAccountsSettingsPage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const { data: accounts } = await supabase
    .from("connected_accounts")
    .select("id, platform, display_name, status")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Connected accounts
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage connections, add new accounts, or reconnect expired ones from Accounts.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/accounts">
            Manage <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-col divide-y divide-border rounded-lg border border-border">
        {accounts && accounts.length > 0 ? (
          accounts.map((account) => (
            <div key={account.id} className="flex items-center gap-3 px-4 py-3">
              <PlatformIcon platform={account.platform as PlatformIdDb} className="size-4 text-foreground" />
              <span className="flex-1 text-sm font-medium text-foreground">{account.display_name}</span>
              <Badge variant={account.status === "connected" ? "success" : "outline"}>
                {account.status}
              </Badge>
            </div>
          ))
        ) : (
          <p className="px-4 py-6 text-sm text-muted-foreground">No accounts connected yet.</p>
        )}
      </div>
    </div>
  );
}
