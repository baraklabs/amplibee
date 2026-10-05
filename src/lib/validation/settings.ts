import { z } from "zod";

export const contentProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  tone: z.string().trim().min(1).max(60),
  audience: z.string().trim().max(200).optional().or(z.literal("")),
  brandVoice: z.string().trim().max(300).optional().or(z.literal("")),
  length: z.enum(["short", "medium", "long"]),
  formality: z.enum(["casual", "neutral", "formal"]),
  ctaStyle: z.string().trim().max(200).optional().or(z.literal("")),
  topicsToAvoid: z.string().trim().max(400).optional().or(z.literal("")),
  wordsToAvoid: z.string().trim().max(400).optional().or(z.literal("")),
  personalContext: z.string().trim().max(600).optional().or(z.literal("")),
  defaultHashtags: z.string().trim().max(200).optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});

export const aiProviderSchema = z
  .object({
    provider: z.enum(["openai", "anthropic", "openrouter", "custom"]),
    label: z.string().trim().min(1, "Name is required").max(60),
    baseUrl: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
    apiKey: z.string().trim().min(10, "Enter a valid API key"),
    defaultModel: z.string().trim().min(1, "Model is required"),
    isDefault: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === "custom" && !data.baseUrl) {
      ctx.addIssue({ code: "custom", message: "Base URL is required for a custom provider.", path: ["baseUrl"] });
    }
  });
