import { z } from "zod";
import { inputTypeSchema, platformSchema } from "./compose";

export const workflowDestinationSchema = z.object({
  platform: platformSchema,
  accountId: z.string().uuid(),
});

export const workflowSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  sourceType: inputTypeSchema,
  sourceAccountId: z.string().uuid().optional().or(z.literal("")),
  contentProfileId: z.string().uuid().optional().or(z.literal("")),
  approvalMode: z.enum(["manual", "automatic"]),
  publishMode: z.enum(["immediate", "schedule", "draft"]),
  destinations: z.array(workflowDestinationSchema).min(1, "Add at least one destination"),
});

export type WorkflowInput = z.infer<typeof workflowSchema>;
