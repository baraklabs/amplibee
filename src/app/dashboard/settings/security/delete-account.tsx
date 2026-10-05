"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { deleteAccount } from "./actions";

export function DeleteAccount() {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Delete account
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete your account"
        description="This permanently deletes your account, connected accounts, and generated content. This can't be undone."
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={isPending}
            onClick={() => startTransition(() => deleteAccount())}
          >
            Delete permanently
          </Button>
        </div>
      </Dialog>
    </>
  );
}
