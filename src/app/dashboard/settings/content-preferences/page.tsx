import type { Metadata } from "next";
import { ProfileList } from "./profile-list";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Content preferences" };
export const dynamic = "force-dynamic";

export default async function ContentPreferencesPage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const { data: profiles } = await supabase
    .from("content_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  return (
    <div>
      <h2 className="font-heading text-base font-semibold text-foreground">Content preferences</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Reusable tone and brand voice settings applied when Amplibee generates content for you.
      </p>
      <div className="mt-6">
        <ProfileList profiles={profiles ?? []} />
      </div>
    </div>
  );
}
