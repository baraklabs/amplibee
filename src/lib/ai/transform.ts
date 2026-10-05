import type { PlatformId } from "@/lib/platforms/types";
import { getAIProviderRuntime } from "./registry";
import type { AIProviderId } from "./types";

/**
 * A brand's saved voice for AI post drafting — tone, audience, and facts
 * that should stay consistent across every platform a post goes out to.
 */
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
  audience: "builders and early adopters",
  brandVoice: "direct, confident, no fluff",
  length: "medium",
  formality: "neutral",
  ctaStyle: "soft — invite people to check it out, no hard sell",
  topicsToAvoid: "",
  wordsToAvoid: "",
  personalContext: "",
};

const channelInstructions: Record<PlatformId, string> = {
  x: "Write a single X post — a hook, a real point of view, no corporate voice. Stay under 280 characters. No hashtags unless natural.",
  linkedin:
    "Write a LinkedIn post with context: why this matters, who it helps, what's new — first person, professional but human, 3-6 short paragraphs with line breaks. 150-350 words.",
  youtube:
    "Write a YouTube title and description: a specific, non-clickbait title, and a short description expanding on it with a clear reason to watch.",
  instagram:
    "Write a caption to go alongside a photo, reel, or story — a personal, authentic-sounding hook and a light call to action. Short, scannable, a couple of relevant hashtags at most.",
  facebook:
    "Write a Facebook post — slightly warmer and more explained than an X post, assuming less shared context from the reader. A clear point, no jargon, a natural length for a feed post.",
};

function buildSystemPrompt(profile: ContentProfile): string {
  const lines = [
    "You are helping a brand draft a social media post, adapted for the specific platform it's going out to.",
    "Write a draft the brand can edit before posting — never generic marketing copy, never something that reads like it was pasted unchanged across every platform.",
    "Stay faithful to the source material's facts — never invent claims, numbers, or quotes.",
    "Never suggest or imply buying followers, bots, fake engagement, or anything that isn't a genuine post from the brand's own account.",
    `Tone: ${profile.tone}.`,
    `Audience: ${profile.audience}.`,
    `Brand voice: ${profile.brandVoice}.`,
    `Formality: ${profile.formality}.`,
    `Target length: ${profile.length}.`,
    `Call-to-action style: ${profile.ctaStyle}.`,
  ];
  if (profile.topicsToAvoid) lines.push(`Do not mention: ${profile.topicsToAvoid}.`);
  if (profile.wordsToAvoid) lines.push(`Avoid these words/phrases: ${profile.wordsToAvoid}.`);
  if (profile.personalContext) lines.push(`Context about the product/company: ${profile.personalContext}.`);
  lines.push("Output only the finished brief text — no preamble, no explanation, no quotation marks around it.");
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
  const instruction = channelInstructions[input.targetPlatform];
  const prompt = [
    `Channel: ${input.targetPlatform}`,
    instruction,
    input.linkUrl ? `Suggest working this link in naturally: ${input.linkUrl}` : "",
    "",
    "What's being promoted:",
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
  shorten: "Shorten this by roughly a third while keeping the core message intact.",
  expand: "Expand this with one more concrete supporting detail or example, without padding.",
  improve_hook: "Rewrite only the opening line to be a stronger hook. Keep the rest unchanged.",
  add_cta: "Add a single short call-to-action at the end, matching the existing tone.",
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
      "You edit social media post drafts precisely. Make only the requested change, and keep it sounding like a genuine brand post, not generic ad copy. Output only the finished text, no preamble.",
    prompt: `Channel: ${input.targetPlatform}\nInstruction: ${instruction}\n\nCurrent text:\n${input.content}`,
  });

  return result.text.trim();
}
