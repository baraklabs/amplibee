"use client";

import * as React from "react";
import { useActionState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connectMediumAccount } from "./actions";
import { idleActionState } from "@/lib/types/action-state";

export function ConnectMediumDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(connectMediumAccount, idleActionState);

  React.useEffect(() => {
    if (state.status === "success") onClose();
  }, [state.status, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Connect Medium"
      description="Paste a Medium integration token from your Medium account settings."
    >
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="integrationToken">Integration token</Label>
          <Input id="integrationToken" name="integrationToken" required autoComplete="off" />
          <p className="text-xs text-muted-foreground">
            Medium only issues these to accounts created before their 2023 API changes. If you
            don&apos;t have one, use the &ldquo;Copy for Medium&rdquo; export in the composer instead.
          </p>
        </div>
        {state.status === "error" && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" loading={isPending} className="self-start">
          Connect
        </Button>
      </form>
    </Dialog>
  );
}
