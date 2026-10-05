import type { PlatformId } from "@/lib/platforms/types";
import { getAIProviderRuntime } from "./registry";
import type { AIProviderId } from "./types";

export interface ContentProfile {
  tone: string;
  audience: string;
  brandVoice: string;
  length: "short" | "medium" | "long";
  formality: "casual" | "neutral" | "formal";
  ctaStyle: string;
  topicsToAvoid: string;
  wordsToAvoid: string;
  personalContext: string;
}

export const defaultContentProfile: ContentProfile = {
  tone: "founder",
  audience: "founders and builders",
  brandVoice: "direct, confident, no fluff",
  length: "medium",
  formality: "neutral",
  ctaStyle: "soft — invite people to check it out, no hard sell",
  topicsToAvoid: "",
  wordsToAvoid: "",
  personalContext: "",
};

const platformInstructions: Record<PlatformId, string> = {
  x: "Write a single X post. Stay under 280 characters. Keep the hook in the first line. No hashtags unless the source used them.",
  linkedin:
    "Write a LinkedIn post. 3-6 short paragraphs with line breaks between them, professional but human, add relevant context a LinkedIn audience needs (why this matters), and close with a light call to action. 150-350 words.",
  medium:
    "Expand this into a Medium article. Use a compelling title on the first line prefixed with '# ', then 3-6 H2 sections ('## ') that add context, examples, and depth beyond the source post. 500-900 words.",
  substack:
    "Turn this into a newsletter-style Substack post. Open with a personal, conversational hook, use short paragraphs, include one or two subheadings ('## '), and close with a direct call to action for subscribers. 400-700 words.",
};

function buildSystemPrompt(profile: ContentProfile): string {
  const lines = [
    "You are a ghostwriter helping a founder repurpose one piece of content across platforms.",
    "Stay faithful to the source material's core idea and facts — never invent claims, numbers, or quotes.",
    `Tone: ${profile.tone}.`,
    `Audience: ${profile.audience}.`,
    `Brand voice: ${profile.brandVoice}.`,
    `Formality: ${profile.formality}.`,
    `Target length: ${profile.length}.`,
    `Call-to-action style: ${profile.ctaStyle}.`,
  ];
  if (profile.topicsToAvoid) lines.push(`Do not mention: ${profile.topicsToAvoid}.`);
  if (profile.wordsToAvoid) lines.push(`Avoid these words/phrases: ${profile.wordsToAvoid}.`);
  if (profile.personalContext) lines.push(`Context about the author/company: ${profile.personalContext}.`);
  lines.push("Output only the finished post text — no preamble, no explanation, no quotation marks around it.");
  return lines.join("\n");
}

export interface GenerateForPlatformInput {
  sourceContent: string;
  targetPlatform: PlatformId;
  profile: ContentProfile;
  providerId: AIProviderId;
  apiKey: string;
  model: string;
  baseUrl?: string | null;
  linkUrl?: string;
}

export async function generateForPlatform(input: GenerateForPlatformInput): Promise<string> {
  const provider = getAIProviderRuntime(input.providerId, input.baseUrl);
  const system = buildSystemPrompt(input.profile);
  const instruction = platformInstructions[input.targetPlatform];
  const prompt = [
    `Platform: ${input.targetPlatform}`,
    instruction,
    input.linkUrl ? `Include this link naturally where it fits: ${input.linkUrl}` : "",
    "",
    "Source content:",
    input.sourceContent,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await provider.complete({
    apiKey: input.apiKey,
    model: input.model,
    system,
    prompt,
  });

  return result.text.trim();
}

export type RefinementAction =
  | "shorten"
  | "expand"
  | "improve_hook"
  | "add_cta"
  | "remove_cta"
  | "more_technical"
  | "more_conversational"
  | "change_tone";

const refinementInstructions: Record<RefinementAction, string> = {
  shorten: "Shorten this post by roughly a third while keeping the core message intact.",
  expand: "Expand this post with one more concrete supporting detail or example, without padding.",
  improve_hook: "Rewrite only the opening line to be a stronger hook. Keep the rest unchanged.",
  add_cta: "Add a single short call-to-action at the end, matching the post's existing tone.",
  remove_cta: "Remove any call-to-action at the end and close on the last substantive point instead.",
  more_technical: "Make the language more technical and specific for a developer audience.",
  more_conversational: "Make the language more conversational and casual, like talking to a peer.",
  change_tone: "Rewrite in the requested tone while keeping the same information.",
};

export async function refinePost(input: {
  content: string;
  action: RefinementAction;
  targetPlatform: PlatformId;
  providerId: AIProviderId;
  apiKey: string;
  model: string;
  baseUrl?: string | null;
  newTone?: string;
}): Promise<string> {
  const provider = getAIProviderRuntime(input.providerId, input.baseUrl);
  const instruction =
    input.action === "change_tone" && input.newTone
      ? `Rewrite in a ${input.newTone} tone while keeping the same information.`
      : refinementInstructions[input.action];

  const result = await provider.complete({
    apiKey: input.apiKey,
    model: input.model,
    system:
      "You edit social and long-form posts precisely. Make only the requested change. Output only the finished post text, no preamble.",
    prompt: `Platform: ${input.targetPlatform}\nInstruction: ${instruction}\n\nCurrent post:\n${input.content}`,
  });

  return result.text.trim();
}
