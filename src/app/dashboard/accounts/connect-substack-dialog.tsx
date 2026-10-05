"use client";

import * as React from "react";
import { useActionState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connectSubstackAccount } from "./actions";
import { idleActionState } from "@/lib/types/action-state";

export function ConnectSubstackDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState(connectSubstackAccount, idleActionState);

  React.useEffect(() => {
    if (state.status === "success") onClose();
  }, [state.status, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Connect Substack"
      description="Substack has no public API, so this just links your publication for backlink attribution and exports."
    >
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="publicationName">Publication name</Label>
          <Input id="publicationName" name="publicationName" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="publicationUrl">Publication URL</Label>
          <Input
            id="publicationUrl"
            name="publicationUrl"
            type="url"
            placeholder="https://yourname.substack.com"
            required
          />
        </div>
        {state.status === "error" && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" loading={isPending} className="self-start">
          Connect
        </Button>
      </form>
    </Dialog>
  );
}
