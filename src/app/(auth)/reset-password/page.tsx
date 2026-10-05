import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Reset password",
  description: "Choose a new password for your Oyekool account.",
  path: "/reset-password",
  noIndex: true,
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <div className="w-full max-w-sm">
      <ResetPasswordForm token={token ?? ""} />
    </div>
  );
}
