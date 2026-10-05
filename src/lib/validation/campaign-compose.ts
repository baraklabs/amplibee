import { z } from "zod";

export const promotionTypeSchema = z.enum([
  "github_repo",
  "saas_product",
  "mobile_app",
  "product_hunt_launch",
  "blog_post",
  "other",
]);

export const channelSchema = z.enum(["x", "linkedin", "youtube", "instagram"]);

export const campaignGoalSchema = z.enum(["stars", "signups", "downloads", "awareness", "traffic"]);

export const generateContentSchema = z.object({
  promotionType: promotionTypeSchema,
  name: z.string().trim().max(200).optional().or(z.literal("")),
  rawContent: z.string().trim().min(3, "Add some detail about what you're promoting").max(20000),
  productUrl: z.string().trim().url().optional().or(z.literal("")),
  repoUrl: z.string().trim().url().optional().or(z.literal("")),
  goal: campaignGoalSchema.optional(),
  linkUrl: z.string().trim().url().optional().or(z.literal("")),
  contentProfileId: z.string().uuid().optional().or(z.literal("")),
  targetPlatforms: z.array(channelSchema).min(1, "Choose at least one channel"),
  anchorText: z.string().trim().max(140).optional().or(z.literal("")),
  utmSource: z.string().trim().max(60).optional().or(z.literal("")),
  utmMedium: z.string().trim().max(60).optional().or(z.literal("")),
  utmCampaign: z.string().trim().max(60).optional().or(z.literal("")),
  aiProviderId: z.string().uuid().optional().or(z.literal("")),
  model: z.string().trim().max(120).optional().or(z.literal("")),
});

export const refineActionSchema = z.enum([
  "shorten",
  "expand",
  "improve_hook",
  "add_cta",
  "remove_cta",
  "more_technical",
  "more_conversational",
]);
