import { z } from "zod";

export const connectMediumSchema = z.object({
  integrationToken: z.string().trim().min(10, "Enter a valid Medium integration token"),
});

export const connectSubstackSchema = z.object({
  publicationName: z.string().trim().min(1, "Publication name is required").max(120),
  publicationUrl: z.string().trim().url("Enter a valid URL"),
});
