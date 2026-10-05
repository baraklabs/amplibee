import type { Metadata } from "next";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccount } from "./delete-account";

export const metadata: Metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the password used to log in with email and password.
        </p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="font-heading text-base font-semibold text-destructive">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Deleting your account removes your data permanently. Connected platform accounts are
          not automatically revoked on the platform&apos;s side.
        </p>
        <div className="mt-4">
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
}
