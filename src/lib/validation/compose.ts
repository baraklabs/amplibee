import { z } from "zod";

export const inputTypeSchema = z.enum([
  "x_post",
  "text",
  "url",
  "github_repo",
  "product_hunt",
  "blog_post",
]);

export const platformSchema = z.enum(["x", "linkedin", "medium", "substack"]);

export const generateContentSchema = z.object({
  inputType: inputTypeSchema,
  title: z.string().trim().max(200).optional().or(z.literal("")),
  rawContent: z.string().trim().min(3, "Add some content to work with").max(20000),
  sourceUrl: z.string().trim().url().optional().or(z.literal("")),
  linkUrl: z.string().trim().url().optional().or(z.literal("")),
  contentProfileId: z.string().uuid().optional().or(z.literal("")),
  targetPlatforms: z.array(platformSchema).min(1, "Choose at least one platform"),
  anchorText: z.string().trim().max(140).optional().or(z.literal("")),
  utmSource: z.string().trim().max(60).optional().or(z.literal("")),
  utmMedium: z.string().trim().max(60).optional().or(z.literal("")),
  utmCampaign: z.string().trim().max(60).optional().or(z.literal("")),
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
