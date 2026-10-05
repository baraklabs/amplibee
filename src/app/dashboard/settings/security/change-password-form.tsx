"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { idleActionState } from "@/lib/types/action-state";
import { changePassword } from "./actions";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, idleActionState);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      {state.status === "error" && <p className="text-sm text-destructive">{state.error}</p>}
      {state.status === "success" && <p className="text-sm text-success">Password updated.</p>}
      <Button type="submit" loading={isPending} className="self-start">
        Update password
      </Button>
    </form>
  );
}
