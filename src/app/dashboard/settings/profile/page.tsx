import type { Metadata } from "next";
import { ProfileForm } from "./profile-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profile settings" };
export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const [{ data: profile }, { data: user }] = await Promise.all([
    supabase.from("profiles").select("full_name, company_name, website_url").eq("id", userId).single(),
    supabase.from("users").select("email_id").eq("id", userId).single(),
  ]);

  return (
    <div>
      <h2 className="font-heading text-base font-semibold text-foreground">Profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This is how you appear across Amplibee.
      </p>
      <div className="mt-6">
        <ProfileForm
          fullName={profile?.full_name ?? ""}
          companyName={profile?.company_name ?? ""}
          websiteUrl={profile?.website_url ?? ""}
          email={user?.email_id ?? ""}
        />
      </div>
    </div>
  );
}
