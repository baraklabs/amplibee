import { z } from "zod";
import { promotionTypeSchema, channelSchema, campaignGoalSchema } from "./campaign-compose";

export const campaignSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  promotionType: promotionTypeSchema,
  productUrl: z.string().trim().url().optional().or(z.literal("")),
  repoUrl: z.string().trim().url().optional().or(z.literal("")),
  goal: campaignGoalSchema,
  brief: z.string().trim().max(20000).optional().or(z.literal("")),
  contentProfileId: z.string().uuid().optional().or(z.literal("")),
  budgetType: z.enum(["unpaid", "paid", "gifted"]),
  targetChannels: z.array(channelSchema).min(1, "Add at least one channel"),
  isPublic: z.boolean().optional(),
});

export type CampaignInput = z.infer<typeof campaignSchema>;
