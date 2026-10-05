"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { decryptSecret } from "@/lib/crypto";
import { generateContentSchema, refineActionSchema } from "@/lib/validation/compose";
import { generateForPlatform, refinePost } from "@/lib/ai/transform";
import { loadDefaultAIProvider, loadContentProfile } from "@/lib/ai/server-helpers";
import { getPlatform } from "@/lib/platforms/registry";
import { buildTrackedUrl } from "@/lib/backlinks";
import type { PlatformIdDb } from "@/types/database";
import type { PlatformId } from "@/lib/platforms/types";

export interface GeneratedPostView {
  id: string;
  platform: PlatformIdDb;
  content: string;
  status: string;
}

export interface GenerateContentState {
  status: "idle" | "success" | "error";
  error?: string;
  sourcePostId?: string;
  posts?: GeneratedPostView[];
}

export async function generateContent(
  _prev: GenerateContentState,
  formData: FormData,
): Promise<GenerateContentState> {
  const parsed = generateContentSchema.safeParse({
    inputType: formData.get("inputType"),
    title: formData.get("title") ?? "",
    rawContent: formData.get("rawContent"),
    sourceUrl: formData.get("sourceUrl") ?? "",
    linkUrl: formData.get("linkUrl") ?? "",
    contentProfileId: formData.get("contentProfileId") ?? "",
    targetPlatforms: formData.getAll("targetPlatforms"),
  });

  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const aiProvider = await loadDefaultAIProvider(userId);
  if (!aiProvider) {
    return {
      status: "error",
      error: "Connect an AI provider in Settings → AI providers before generating content.",
    };
  }

  const profile = await loadContentProfile(userId, parsed.data.contentProfileId || undefined);

  const trackedLink = parsed.data.linkUrl
    ? buildTrackedUrl(parsed.data.linkUrl, {
        source: parsed.data.utmSource || undefined,
        medium: parsed.data.utmMedium || undefined,
        campaign: parsed.data.utmCampaign || undefined,
      })
    : undefined;

  const { data: sourcePost, error: sourceError } = await supabase
    .from("source_posts")
    .insert({
      user_id: userId,
      input_type: parsed.data.inputType,
      title: parsed.data.title || null,
      raw_content: parsed.data.rawContent,
      source_url: parsed.data.sourceUrl || null,
    })
    .select("id")
    .single();

  if (sourceError || !sourcePost) {
    return { status: "error", error: "Could not save source content." };
  }

  const results: GeneratedPostView[] = [];

  for (const platform of parsed.data.targetPlatforms) {
    try {
      const content = await generateForPlatform({
        sourceContent: parsed.data.rawContent,
        targetPlatform: platform,
        profile,
        providerId: aiProvider.providerId,
        apiKey: aiProvider.apiKey,
        model: aiProvider.model,
        baseUrl: aiProvider.baseUrl,
        linkUrl: trackedLink,
      });

      const { data: generated, error: genError } = await supabase
        .from("generated_posts")
        .insert({
          user_id: userId,
          source_post_id: sourcePost.id,
          platform,
          content,
          status: "draft",
          ai_provider: aiProvider.providerId,
          ai_model: aiProvider.model,
        })
        .select("id, platform, content, status")
        .single();

      if (genError || !generated) continue;
      results.push(generated);

      if (trackedLink && parsed.data.linkUrl) {
        await supabase.from("backlinks").insert({
          user_id: userId,
          generated_post_id: generated.id,
          canonical_url: parsed.data.linkUrl,
          destination_url: trackedLink,
          anchor_text: parsed.data.anchorText || parsed.data.linkUrl,
          utm_source: parsed.data.utmSource || null,
          utm_medium: parsed.data.utmMedium || null,
          utm_campaign: parsed.data.utmCampaign || null,
        });
      }
    } catch (err) {
      results.push({
        id: `error-${platform}`,
        platform,
        content: err instanceof Error ? `Generation failed: ${err.message}` : "Generation failed.",
        status: "failed",
      });
    }
  }

  revalidatePath("/dashboard/create");
  revalidatePath("/dashboard/posts");
  return { status: "success", sourcePostId: sourcePost.id, posts: results };
}

export interface RefineState {
  status: "idle" | "success" | "error";
  error?: string;
  content?: string;
}

export async function refineGeneratedPost(postId: string, action: string): Promise<RefineState> {
  const parsedAction = refineActionSchema.safeParse(action);
  if (!parsedAction.success) return { status: "error", error: "Unknown action." };

  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const { data: post } = await supabase
    .from("generated_posts")
    .select("id, platform, content")
    .eq("id", postId)
    .eq("user_id", userId)
    .single();
  if (!post) return { status: "error", error: "Post not found." };

  const aiProvider = await loadDefaultAIProvider(userId);
  if (!aiProvider) return { status: "error", error: "No default AI provider configured." };

  try {
    const content = await refinePost({
      content: post.content,
      action: parsedAction.data,
      targetPlatform: post.platform as PlatformId,
      providerId: aiProvider.providerId,
      apiKey: aiProvider.apiKey,
      model: aiProvider.model,
      baseUrl: aiProvider.baseUrl,
    });

    await supabase.from("generated_posts").update({ content }).eq("id", postId);
    revalidatePath("/dashboard/create");
    return { status: "success", content };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : "Refinement failed." };
  }
}

export async function updateGeneratedPostContent(postId: string, content: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const supabase = createAdminClient();

  await supabase
    .from("generated_posts")
    .update({ content })
    .eq("id", postId)
    .eq("user_id", userId);
  revalidatePath("/dashboard/posts");
}

export interface PublishState {
  status: "idle" | "success" | "error";
  error?: string;
}

export async function publishGeneratedPost(
  postId: string,
  accountId: string,
  scheduledFor?: string,
): Promise<PublishState> {
  const userId = await getCurrentUserId();
  if (!userId) return { status: "error", error: "Not authenticated." };
  const supabase = createAdminClient();

  const { data: post } = await supabase
    .from("generated_posts")
    .select("id, platform, content")
    .eq("id", postId)
    .eq("user_id", userId)
    .single();
  if (!post) return { status: "error", error: "Post not found." };

  const { data: account } = await supabase
    .from("connected_accounts")
    .select("id, external_account_id, encrypted_access_token, status")
    .eq("id", accountId)
    .eq("user_id", userId)
    .single();
  if (!account) return { status: "error", error: "Account not found." };

  if (scheduledFor) {
    await supabase.from("scheduled_posts").insert({
      user_id: userId,
      generated_post_id: postId,
      account_id: accountId,
      scheduled_for: scheduledFor,
    });
    await supabase
      .from("generated_posts")
      .update({ status: "scheduled", account_id: accountId })
      .eq("id", postId);
    revalidatePath("/dashboard/posts");
    return { status: "success" };
  }

  const platform = getPlatform(post.platform as PlatformIdDb);
  if (!platform.definition.capabilities.publish || !platform.publishPost) {
    return {
      status: "error",
      error: `${platform.definition.name} doesn't support publishing through its API. Use Copy and paste it in manually.`,
    };
  }
  if (account.status !== "connected" || !account.encrypted_access_token) {
    return { status: "error", error: "This account needs to be reconnected before publishing." };
  }

  try {
    const accessToken = decryptSecret(account.encrypted_access_token);
    const result = await platform.publishPost(accessToken, {
      platformAccountId: account.external_account_id ?? "",
      content: post.content,
    });

    if (!result.success) {
      await supabase
        .from("generated_posts")
        .update({ status: "failed", account_id: accountId })
        .eq("id", postId);
      return { status: "error", error: result.error ?? "Publishing failed." };
    }

    await supabase.from("published_posts").insert({
      user_id: userId,
      generated_post_id: postId,
      account_id: accountId,
      external_id: result.externalId,
      external_url: result.externalUrl,
    });
    await supabase
      .from("generated_posts")
      .update({ status: "published", account_id: accountId })
      .eq("id", postId);

    revalidatePath("/dashboard/posts");
    return { status: "success" };
  } catch (err) {
    await supabase.from("generated_posts").update({ status: "failed" }).eq("id", postId);
    return { status: "error", error: err instanceof Error ? err.message : "Publishing failed." };
  }
}
