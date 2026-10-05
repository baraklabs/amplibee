"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { idleActionState } from "@/lib/types/action-state";
import { updateProfile } from "./actions";

export function ProfileForm({
  fullName,
  companyName,
  websiteUrl,
  email,
}: {
  fullName: string;
  companyName: string;
  websiteUrl: string;
  email: string;
}) {
  const [state, formAction, isPending] = useActionState(updateProfile, idleActionState);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={fullName} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="companyName">Company</Label>
        <Input id="companyName" name="companyName" defaultValue={companyName} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="websiteUrl">Website</Label>
        <Input id="websiteUrl" name="websiteUrl" type="url" defaultValue={websiteUrl} placeholder="https://" />
      </div>
      {state.status === "error" && <p className="text-sm text-destructive">{state.error}</p>}
      {state.status === "success" && <p className="text-sm text-success">Saved.</p>}
      <Button type="submit" loading={isPending} className="self-start">
        Save changes
      </Button>
    </form>
  );
}
