import type { Metadata } from "next";
import { NotificationsForm } from "./notifications-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Notification settings" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const { data: profile } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", userId)
    .single();

  return (
    <div>
      <h2 className="font-heading text-base font-semibold text-foreground">Notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">Choose what Amplibee emails you about.</p>
      <div className="mt-6">
        <NotificationsForm
          preferences={
            profile?.notification_preferences ?? {
              scheduled_post_published: true,
              workflow_failed: true,
              weekly_summary: false,
            }
          }
        />
      </div>
    </div>
  );
}
