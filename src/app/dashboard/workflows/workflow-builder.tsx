"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus, Trash2, Wand2, ShieldCheck, Send, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { WorkflowNode } from "@/components/platform/workflow-node";
import { WorkflowConnector } from "@/components/platform/workflow-connector";
import { PlatformIcon } from "@/components/platform/platform-icon";
import { idleActionState } from "@/lib/types/action-state";
import type { PlatformIdDb } from "@/types/database";

const inputTypeLabels: Record<string, string> = {
  x_post: "X post",
  text: "Text",
  url: "URL",
  github_repo: "GitHub repo",
  product_hunt: "Product Hunt",
  blog_post: "Blog post",
};

const platformOptions: PlatformIdDb[] = ["x", "linkedin", "medium", "substack"];

interface AccountOption {
  id: string;
  platform: PlatformIdDb;
  displayName: string;
}

interface ContentProfileOption {
  id: string;
  name: string;
}

interface Destination {
  platform: PlatformIdDb;
  accountId: string;
}

export function WorkflowBuilder({
  action,
  accounts,
  contentProfiles,
  initial,
}: {
  action: (state: { status: "idle" | "error" | "success"; error?: string }, formData: FormData) => Promise<{ status: "idle" | "error" | "success"; error?: string }>;
  accounts: AccountOption[];
  contentProfiles: ContentProfileOption[];
  initial?: {
    name: string;
    sourceType: string;
    sourceAccountId: string | null;
    contentProfileId: string | null;
    approvalMode: string;
    publishMode: string;
    destinations: Destination[];
  };
}) {
  const [state, formAction, isPending] = useActionState(action, idleActionState);
  const [sourceType, setSourceType] = React.useState(initial?.sourceType ?? "text");
  const [approvalMode, setApprovalMode] = React.useState(initial?.approvalMode ?? "manual");
  const [destinations, setDestinations] = React.useState<Destination[]>(
    initial?.destinations ?? [],
  );

  function addDestination() {
    const firstAccount = accounts[0];
    if (!firstAccount) return;
    setDestinations((prev) => [...prev, { platform: firstAccount.platform, accountId: firstAccount.id }]);
  }

  function updateDestination(index: number, next: Partial<Destination>) {
    setDestinations((prev) => prev.map((d, i) => (i === index ? { ...d, ...next } : d)));
  }

  function removeDestination(index: number) {
    setDestinations((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form action={formAction} className="flex flex-col gap-5 lg:col-span-2">
        <input type="hidden" name="destinations" value={JSON.stringify(destinations)} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Workflow name</Label>
          <Input id="name" name="name" defaultValue={initial?.name} required placeholder="e.g. Launch day cross-post" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sourceType">Source type</Label>
            <Select id="sourceType" name="sourceType" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
              {Object.entries(inputTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sourceAccountId">Source account (optional)</Label>
            <Select id="sourceAccountId" name="sourceAccountId" defaultValue={initial?.sourceAccountId ?? ""}>
              <option value="">None</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.displayName}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {contentProfiles.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contentProfileId">AI content profile</Label>
            <Select id="contentProfileId" name="contentProfileId" defaultValue={initial?.contentProfileId ?? ""}>
              <option value="">Default</option>
              {contentProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between">
            <Label>Destinations</Label>
            <Button type="button" size="sm" variant="outline" onClick={addDestination} disabled={accounts.length === 0}>
              <Plus className="size-3.5" />
              Add destination
            </Button>
          </div>

          {accounts.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Connect an account first from the Accounts page to add a destination.
            </p>
          )}

          <div className="mt-3 flex flex-col gap-2">
            {destinations.map((destination, index) => (
              <div key={index} className="flex items-center gap-2 rounded-md border border-border p-2.5">
                <PlatformIcon platform={destination.platform} className="size-4 shrink-0 text-muted-foreground" />
                <Select
                  className="h-8"
                  value={destination.platform}
                  onChange={(e) => {
                    const platform = e.target.value as PlatformIdDb;
                    const nextAccount = accounts.find((a) => a.platform === platform);
                    updateDestination(index, { platform, accountId: nextAccount?.id ?? "" });
                  }}
                >
                  {platformOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
                <Select
                  className="h-8"
                  value={destination.accountId}
                  onChange={(e) => updateDestination(index, { accountId: e.target.value })}
                >
                  {accounts
                    .filter((a) => a.platform === destination.platform)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.displayName}
                      </option>
                    ))}
                </Select>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeDestination(index)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="approvalMode">Approval</Label>
            <Select
              id="approvalMode"
              name="approvalMode"
              value={approvalMode}
              onChange={(e) => setApprovalMode(e.target.value)}
            >
              <option value="manual">Manual approval</option>
              <option value="automatic">Automatic</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="publishMode">Publishing</Label>
            <Select id="publishMode" name="publishMode" defaultValue={initial?.publishMode ?? "draft"}>
              <option value="draft">Draft only</option>
              <option value="immediate">Publish immediately</option>
              <option value="schedule">Schedule</option>
            </Select>
          </div>
        </div>

        {state.status === "error" && <p className="text-sm text-destructive">{state.error}</p>}

        <Button type="submit" loading={isPending} disabled={destinations.length === 0} className="self-start">
          Save workflow
        </Button>
      </form>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-eyebrow mb-3">Preview</p>
        <div className="flex flex-col">
          <WorkflowNode icon={GitBranch} label={inputTypeLabels[sourceType]} sublabel="Source" />
          <WorkflowConnector />
          <WorkflowNode icon={Wand2} label="AI rewrite" sublabel="Per destination" variant="accent" />
          {approvalMode === "manual" && (
            <>
              <WorkflowConnector />
              <WorkflowNode icon={ShieldCheck} label="Manual approval" />
            </>
          )}
          {destinations.map((destination, index) => (
            <React.Fragment key={index}>
              <WorkflowConnector />
              <WorkflowNode
                icon={Send}
                label={accounts.find((a) => a.id === destination.accountId)?.displayName ?? destination.platform}
                sublabel={destination.platform}
              />
            </React.Fragment>
          ))}
          {destinations.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">Add a destination to see the flow.</p>
          )}
        </div>
      </div>
    </div>
  );
}
