"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { generateContentSchema } from "@/lib/validation/campaign-compose";
import { generateForChannel } from "@/lib/ai/campaign-brief";
import { loadSelectedAIProvider, loadContentProfile } from "@/lib/ai/server-helpers";
import { buildTrackedUrl } from "@/lib/backlinks";
import type { ChannelId, BudgetType, CampaignGoal } from "@/types/database";
import type { z } from "zod";

export interface CampaignBriefView {
  id: string;
  channel: ChannelId;
  content: string;
  status: string;
}

export interface CreateCampaignState {
  status: "idle" | "success" | "error";
  error?: string;
  campaignId?: string;
  campaignName?: string;
  briefs?: CampaignBriefView[];
}

const budgetTypes: BudgetType[] = ["unpaid", "paid", "gifted"];

function parseBudgetType(value: FormDataEntryValue | null): BudgetType {
  return budgetTypes.includes(value as BudgetType) ? (value as BudgetType) : "unpaid";
}

function parseGenerateForm(formData: FormData) {
  return generateContentSchema.safeParse({
    promotionType: formData.get("promotionType"),
    name: formData.get("name") ?? "",
    rawContent: formData.get("rawContent"),
    productUrl: formData.get("productUrl") ?? "",
    repoUrl: formData.get("repoUrl") ?? "",
    goal: formData.get("goal") || undefined,
    linkUrl: formData.get("linkUrl") ?? "",
    contentProfileId: formData.get("contentProfileId") ?? "",
    targetPlatforms: formData.getAll("targetPlatforms"),
    anchorText: formData.get("anchorText") ?? "",
    utmSource: formData.get("utmSource") ?? "",
    utmMedium: formData.get("utmMedium") ?? "",
    utmCampaign: formData.get("utmCampaign") ?? "",
    aiProviderId: formData.get("aiProviderId") ?? "",
    model: formData.get("model") ?? "",
  });
}

type ParsedGenerateForm = z.infer<typeof generateContentSchema>;

/** Inserts the `campaigns` row (status starts draft) and an optional `campaign_links` row. */
async function createCampaignRow(userId: string, parsed: ParsedGenerateForm, budgetType: BudgetType) {
  const supabase = createAdminClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: userId,
      name: parsed.name || parsed.rawContent.slice(0, 80),
      promotion_type: parsed.promotionType,
      product_url: parsed.productUrl || null,
      repo_url: parsed.repoUrl || null,
      goal: (parsed.goal ?? "awareness") as CampaignGoal,
      brief: parsed.rawContent,
      content_profile_id: parsed.contentProfileId || null,
      target_channels: parsed.targetPlatforms,
      budget_type: budgetType,
      status: "draft",
      is_public: false,
    })
    .select("id, name")
    .single();

  if (error || !campaign) return null;

  if (parsed.linkUrl) {
    const trackedUrl = buildTrackedUrl(parsed.linkUrl, {
      source: parsed.utmSource || undefined,
      medium: parsed.utmMedium || undefined,
      campaign: parsed.utmCampaign || undefined,
    });
    await supabase.from("campaign_links").insert({
      campaign_id: campaign.id,
      destination_url: parsed.linkUrl,
      tracked_url: trackedUrl,
      suggested_cta: parsed.anchorText || null,
      utm_source: parsed.utmSource || null,
      utm_medium: parsed.utmMedium || null,
      utm_campaign: parsed.utmCampaign || null,
    });
  }

  return campaign;
}

export async function generateCampaign(_prev: CreateCampaignState, formData: FormData): Promise<CreateCampaignState> {
  const parsed = parseGenerateForm(formData);
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const aiProvider = await loadSelectedAIProvider(userId, parsed.data.aiProviderId || undefined, parsed.data.model || undefined);
  if (!aiProvider) {
    return { status: "error", error: "Connect an AI provider in BYOK before generating." };
  }

  const profile = await loadContentProfile(userId, parsed.data.contentProfileId || undefined);
  const budgetType = parseBudgetType(formData.get("budgetType"));

  const campaign = await createCampaignRow(userId, parsed.data, budgetType);
  if (!campaign) return { status: "error", error: "Could not create the campaign." };

  const trackedLink = parsed.data.linkUrl
    ? buildTrackedUrl(parsed.data.linkUrl, {
        source: parsed.data.utmSource || undefined,
        medium: parsed.data.utmMedium || undefined,
        campaign: parsed.data.utmCampaign || undefined,
      })
    : undefined;

  const briefs: CampaignBriefView[] = [];
  for (const channel of parsed.data.targetPlatforms) {
    try {
      const content = await generateForChannel({
        sourceContent: parsed.data.rawContent,
        targetPlatform: channel,
        profile,
        providerId: aiProvider.providerId,
        apiKey: aiProvider.apiKey,
        model: aiProvider.model,
        baseUrl: aiProvider.baseUrl,
        linkUrl: trackedLink,
      });

      const { data: brief, error } = await supabase
        .from("campaign_briefs")
        .insert({
          campaign_id: campaign.id,
          channel,
          content,
          status: "draft",
          ai_provider: aiProvider.providerId,
          ai_model: aiProvider.model,
        })
        .select("id, channel, content, status")
        .single();

      if (!error && brief) briefs.push(brief);
    } catch (err) {
      briefs.push({
        id: `error-${channel}`,
        channel,
        content: err instanceof Error ? `Generation failed: ${err.message}` : "Generation failed.",
        status: "failed",
      });
    }
  }

  revalidatePath("/dashboard/campaigns/new");
  revalidatePath("/dashboard/campaigns");
  return { status: "success", campaignId: campaign.id, campaignName: campaign.name, briefs };
}

/** Skips AI entirely — saves what was typed as-is for each selected channel. Always available, BYOK or not. */
export async function writeCampaignManually(_prev: CreateCampaignState, formData: FormData): Promise<CreateCampaignState> {
  const parsed = parseGenerateForm(formData);
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();
  const budgetType = parseBudgetType(formData.get("budgetType"));

  const campaign = await createCampaignRow(userId, parsed.data, budgetType);
  if (!campaign) return { status: "error", error: "Could not create the campaign." };

  const briefs: CampaignBriefView[] = [];
  for (const channel of parsed.data.targetPlatforms) {
    const { data: brief, error } = await supabase
      .from("campaign_briefs")
      .insert({ campaign_id: campaign.id, channel, content: parsed.data.rawContent, status: "draft" })
      .select("id, channel, content, status")
      .single();

    if (!error && brief) briefs.push(brief);
  }

  revalidatePath("/dashboard/campaigns/new");
  revalidatePath("/dashboard/campaigns");
  return { status: "success", campaignId: campaign.id, campaignName: campaign.name, briefs };
}
