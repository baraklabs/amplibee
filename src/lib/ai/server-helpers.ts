import { createAdminClient } from "@/lib/supabase/admin";
import { decryptSecret } from "@/lib/crypto";
import { defaultContentProfile, type ContentProfile } from "@/lib/ai/transform";
import type { AIProviderIdDb } from "@/types/database";

/**
 * Shared BYOK-provider and brand-profile loading used by the composer
 * (`dashboard/create`) and anywhere else content gets generated — kept in
 * one place instead of duplicated per route.
 */

export interface ResolvedAIProvider {
  providerId: AIProviderIdDb;
  apiKey: string;
  model: string;
  baseUrl: string | null;
}

export async function loadDefaultAIProvider(userId: string): Promise<ResolvedAIProvider | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("ai_providers")
    .select("provider, encrypted_api_key, default_model, base_url")
    .eq("user_id", userId)
    .eq("is_default", true)
    .single();

  if (!data) return null;
  return {
    providerId: data.provider,
    apiKey: decryptSecret(data.encrypted_api_key),
    model: data.default_model,
    baseUrl: data.base_url,
  };
}

/** Explicit provider (by ai_providers row id) chosen in the Create form, falling back to the account default. */
export async function loadSelectedAIProvider(
  userId: string,
  rowId?: string,
  model?: string,
): Promise<ResolvedAIProvider | null> {
  if (!rowId) return loadDefaultAIProvider(userId);

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("ai_providers")
    .select("provider, encrypted_api_key, default_model, base_url")
    .eq("id", rowId)
    .eq("user_id", userId)
    .single();

  if (!data) return null;
  return {
    providerId: data.provider,
    apiKey: decryptSecret(data.encrypted_api_key),
    model: model || data.default_model,
    baseUrl: data.base_url,
  };
}

export async function loadContentProfile(userId: string, profileId?: string): Promise<ContentProfile> {
  const supabase = createAdminClient();
  const query = supabase.from("content_profiles").select("*").eq("user_id", userId);

  const { data } = profileId ? await query.eq("id", profileId).single() : await query.eq("is_default", true).single();

  if (!data) return defaultContentProfile;

  return {
    tone: data.tone,
    audience: data.audience,
    brandVoice: data.brand_voice,
    length: data.length,
    formality: data.formality,
    ctaStyle: data.cta_style,
    topicsToAvoid: data.topics_to_avoid,
    wordsToAvoid: data.words_to_avoid,
    personalContext: data.personal_context,
  };
}
