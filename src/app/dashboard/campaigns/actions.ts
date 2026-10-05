"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { campaignSchema } from "@/lib/validation/campaigns";
import { refineActionSchema } from "@/lib/validation/campaign-compose";
import { generateForChannel, refineBrief } from "@/lib/ai/campaign-brief";
import { loadDefaultAIProvider, loadContentProfile } from "@/lib/ai/server-helpers";
import { buildTrackedUrl } from "@/lib/backlinks";
import type { ActionState } from "@/lib/types/action-state";
import type { CampaignStatus, ApplicationStatus } from "@/types/database";
import type { ChannelId } from "@/lib/channels/types";

async function assertOwnsCampaign(userId: string, campaignId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("campaigns").select("id").eq("id", campaignId).eq("user_id", userId).single();
  return Boolean(data);
}

export async function updateCampaignStatus(campaignId: string, status: CampaignStatus) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const supabase = createAdminClient();

  await supabase.from("campaigns").update({ status }).eq("id", campaignId).eq("user_id", userId);
  revalidatePath("/dashboard/campaigns");
  revalidatePath(`/dashboard/campaigns/${campaignId}`);
}

export async function setCampaignPublic(campaignId: string, isPublic: boolean) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const supabase = createAdminClient();

  await supabase.from("campaigns").update({ is_public: isPublic }).eq("id", campaignId).eq("user_id", userId);
  revalidatePath("/dashboard/campaigns");
  revalidatePath(`/dashboard/campaigns/${campaignId}`);
}

export interface PublishState {
  status: "success" | "error";
  error?: string;
}

/** Sets the campaign live and visible in the public network directory — never publishes any content anywhere. */
export async function publishCampaignToNetwork(campaignId: string): Promise<PublishState> {
  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("campaigns")
    .update({ status: "active", is_public: true })
    .eq("id", campaignId)
    .eq("user_id", userId);

  if (error) return { status: "error", error: "Could not publish this campaign." };

  revalidatePath("/dashboard/campaigns");
  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  revalidatePath("/dashboard/campaigns/new");
  return { status: "success" };
}

export async function deleteCampaign(campaignId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const supabase = createAdminClient();

  await supabase.from("campaigns").delete().eq("id", campaignId).eq("user_id", userId);
  revalidatePath("/dashboard/campaigns");
}

export async function updateCampaignDetails(
  campaignId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = campaignSchema.safeParse({
    name: formData.get("name"),
    promotionType: formData.get("promotionType"),
    productUrl: formData.get("productUrl") ?? "",
    repoUrl: formData.get("repoUrl") ?? "",
    goal: formData.get("goal"),
    brief: formData.get("brief") ?? "",
    contentProfileId: formData.get("contentProfileId") ?? "",
    budgetType: formData.get("budgetType"),
    targetChannels: formData.getAll("targetChannels"),
  });

  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("campaigns")
    .update({
      name: parsed.data.name,
      promotion_type: parsed.data.promotionType,
      product_url: parsed.data.productUrl || null,
      repo_url: parsed.data.repoUrl || null,
      goal: parsed.data.goal,
      brief: parsed.data.brief || "",
      content_profile_id: parsed.data.contentProfileId || null,
      target_channels: parsed.data.targetChannels,
      budget_type: parsed.data.budgetType,
    })
    .eq("id", campaignId)
    .eq("user_id", userId);

  if (error) return { status: "error", error: "Could not update this campaign." };

  // Any newly added channel gets an empty draft brief so it shows up to edit/generate.
  const { data: existingBriefs } = await supabase.from("campaign_briefs").select("channel").eq("campaign_id", campaignId);
  const existingChannels = new Set((existingBriefs ?? []).map((b) => b.channel));
  const newChannels = parsed.data.targetChannels.filter((channel) => !existingChannels.has(channel));
  if (newChannels.length > 0) {
    await supabase
      .from("campaign_briefs")
      .insert(newChannels.map((channel) => ({ campaign_id: campaignId, channel, content: "", status: "draft" as const })));
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  revalidatePath("/dashboard/campaigns");
  return { status: "success" };
}

export interface BriefEditState {
  status: "idle" | "success" | "error";
  error?: string;
  content?: string;
}

export async function updateCampaignBrief(briefId: string, content: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const supabase = createAdminClient();

  const { data: brief } = await supabase.from("campaign_briefs").select("campaign_id").eq("id", briefId).single();
  if (!brief || !(await assertOwnsCampaign(userId, brief.campaign_id))) return;

  await supabase.from("campaign_briefs").update({ content }).eq("id", briefId);
  revalidatePath(`/dashboard/campaigns/${brief.campaign_id}`);
  revalidatePath("/dashboard/campaigns/new");
}

export async function regenerateCampaignBrief(briefId: string): Promise<BriefEditState> {
  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const { data: brief } = await supabase.from("campaign_briefs").select("id, channel, campaign_id").eq("id", briefId).single();
  if (!brief) return { status: "error", error: "Brief not found." };

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, brief, content_profile_id")
    .eq("id", brief.campaign_id)
    .eq("user_id", userId)
    .single();
  if (!campaign) return { status: "error", error: "Not authorized." };

  const aiProvider = await loadDefaultAIProvider(userId);
  if (!aiProvider) return { status: "error", error: "Connect an AI provider in BYOK to regenerate." };
  const profile = await loadContentProfile(userId, campaign.content_profile_id ?? undefined);

  try {
    const content = await generateForChannel({
      sourceContent: campaign.brief,
      targetPlatform: brief.channel as ChannelId,
      profile,
      providerId: aiProvider.providerId,
      apiKey: aiProvider.apiKey,
      model: aiProvider.model,
      baseUrl: aiProvider.baseUrl,
    });

    await supabase
      .from("campaign_briefs")
      .update({ content, ai_provider: aiProvider.providerId, ai_model: aiProvider.model })
      .eq("id", briefId);

    revalidatePath(`/dashboard/campaigns/${brief.campaign_id}`);
    return { status: "success", content };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : "Regeneration failed." };
  }
}

export async function refineCampaignBrief(briefId: string, action: string): Promise<BriefEditState> {
  const parsedAction = refineActionSchema.safeParse(action);
  if (!parsedAction.success) return { status: "error", error: "Unknown action." };

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const { data: brief } = await supabase.from("campaign_briefs").select("id, channel, content, campaign_id").eq("id", briefId).single();
  if (!brief) return { status: "error", error: "Brief not found." };
  if (!(await assertOwnsCampaign(userId, brief.campaign_id))) return { status: "error", error: "Not authorized." };

  const aiProvider = await loadDefaultAIProvider(userId);
  if (!aiProvider) return { status: "error", error: "No default AI provider configured." };

  try {
    const content = await refineBrief({
      content: brief.content,
      action: parsedAction.data,
      targetPlatform: brief.channel as ChannelId,
      providerId: aiProvider.providerId,
      apiKey: aiProvider.apiKey,
      model: aiProvider.model,
      baseUrl: aiProvider.baseUrl,
    });

    await supabase.from("campaign_briefs").update({ content }).eq("id", briefId);
    revalidatePath(`/dashboard/campaigns/${brief.campaign_id}`);
    return { status: "success", content };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : "Refinement failed." };
  }
}

export async function addCampaignLink(campaignId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const destinationUrl = String(formData.get("destinationUrl") ?? "").trim();
  if (!destinationUrl) return { status: "error", error: "Add a destination URL." };

  const suggestedCta = String(formData.get("suggestedCta") ?? "").trim();
  const utmSource = String(formData.get("utmSource") ?? "").trim();
  const utmMedium = String(formData.get("utmMedium") ?? "").trim();
  const utmCampaign = String(formData.get("utmCampaign") ?? "").trim();

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  if (!(await assertOwnsCampaign(userId, campaignId))) return { status: "error", error: "Not authorized." };

  const supabase = createAdminClient();
  const trackedUrl = buildTrackedUrl(destinationUrl, {
    source: utmSource || undefined,
    medium: utmMedium || undefined,
    campaign: utmCampaign || undefined,
  });

  const { error } = await supabase.from("campaign_links").insert({
    campaign_id: campaignId,
    destination_url: destinationUrl,
    tracked_url: trackedUrl,
    suggested_cta: suggestedCta || null,
    utm_source: utmSource || null,
    utm_medium: utmMedium || null,
    utm_campaign: utmCampaign || null,
  });

  if (error) return { status: "error", error: "Could not save this link." };
  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  return { status: "success" };
}

export async function deleteCampaignLink(linkId: string, campaignId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  if (!(await assertOwnsCampaign(userId, campaignId))) return;
  const supabase = createAdminClient();

  await supabase.from("campaign_links").delete().eq("id", linkId).eq("campaign_id", campaignId);
  revalidatePath(`/dashboard/campaigns/${campaignId}`);
}

export async function updateApplicationStatus(applicationId: string, campaignId: string, status: ApplicationStatus) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  if (!(await assertOwnsCampaign(userId, campaignId))) return;
  const supabase = createAdminClient();

  await supabase.from("campaign_applications").update({ status }).eq("id", applicationId).eq("campaign_id", campaignId);
  revalidatePath(`/dashboard/campaigns/${campaignId}`);
}
