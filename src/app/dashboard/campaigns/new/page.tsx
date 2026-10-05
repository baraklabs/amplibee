import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { Composer } from "./composer";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { aiProviderRegistry } from "@/lib/ai/registry";
import type { AIProviderOption } from "./provider-picker-dialog";
import type { AIProviderIdDb } from "@/types/database";

export const metadata: Metadata = { title: "New Campaign" };
export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const [{ data: contentProfiles }, { data: aiProviderRows }] = await Promise.all([
    supabase.from("content_profiles").select("id, name").eq("user_id", userId).order("created_at"),
    supabase
      .from("ai_providers")
      .select("id, provider, label, default_model, is_default")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  const aiProviders: AIProviderOption[] = (aiProviderRows ?? []).map((row) => {
    const providerId = row.provider as AIProviderIdDb;
    return {
      id: row.id,
      providerId,
      name: row.label || (providerId === "custom" ? "Custom" : aiProviderRegistry[providerId].definition.name),
      defaultModel: row.default_model,
      isDefault: row.is_default,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Campaign"
        description="Brief what you're promoting. Real influencers discover it in the network and post genuinely to their own audience."
      />
      <Composer contentProfiles={contentProfiles ?? []} aiProviders={aiProviders} />
    </div>
  );
}
