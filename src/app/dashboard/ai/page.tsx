import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProviderManager, type ConfiguredProviderRow } from "./provider-manager";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { decryptSecret, maskSecret } from "@/lib/crypto";
import { aiProviderRegistry, aiProviderList } from "@/lib/ai/registry";
import type { AIProviderIdDb } from "@/types/database";

export const metadata: Metadata = { title: "BYOK" };
export const dynamic = "force-dynamic";

export default async function AIProvidersPage() {
  const supabase = createAdminClient();
  const userId = (await getCurrentUserId())!;

  const { data: rows } = await supabase
    .from("ai_providers")
    .select("id, provider, label, base_url, encrypted_api_key, default_model, is_default, last_test_status")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  const configured: ConfiguredProviderRow[] = (rows ?? []).map((row) => {
    const providerId = row.provider as AIProviderIdDb;
    return {
      id: row.id,
      provider: providerId,
      definition: providerId === "custom" ? null : aiProviderRegistry[providerId].definition,
      label: row.label,
      baseUrl: row.base_url,
      defaultModel: row.default_model,
      isDefault: row.is_default,
      lastTestStatus: row.last_test_status,
      maskedKey: maskSecret(decryptSecret(row.encrypted_api_key)),
    };
  });

  const configuredFixedIds = new Set(configured.filter((c) => c.definition).map((c) => c.provider));
  const availableFixed = aiProviderList
    .filter((provider) => !configuredFixedIds.has(provider.definition.id))
    .map((provider) => provider.definition);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="BYOK"
        description="Bring your own key. Oyekool never marks up AI usage — connect OpenAI, Anthropic, OpenRouter, or any OpenAI-compatible provider directly and pay that provider at their rates."
      />

      <ProviderManager configured={configured} availableFixed={availableFixed} />
    </div>
  );
}
