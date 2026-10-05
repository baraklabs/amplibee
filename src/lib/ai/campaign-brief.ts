import type { ChannelId } from "@/lib/channels/types";
import { getAIProviderRuntime } from "./registry";
import type { AIProviderId } from "./types";

/**
 * A product's "voice" for campaign brief generation — what the product owner
 * sounds like and wants influencers to say, not a personal writing style.
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

const channelInstructions: Record<ChannelId, string> = {
  x: "Write a single X post an influencer could post as their own genuine reaction — a hook, a real opinion on why this is worth trying, no corporate voice. Stay under 280 characters. No hashtags unless natural.",
  linkedin:
    "Write a LinkedIn post shaped as an influencer's own take: why they're excited about this, who it helps, and what stood out — first person, professional but human, 3-6 short paragraphs with line breaks. 150-350 words.",
  youtube:
    "Write a short video talking-points outline an influencer could use to introduce this in their own words: a hook for the first 10 seconds, 3-4 beats covering what it is and why it's worth their audience's time, and a natural closing mention — not a script to read verbatim.",
  instagram:
    "Write a caption an influencer could post alongside a photo, reel, or story — a personal, authentic-sounding hook, why it's worth sharing, and a light call to action. Short, scannable, a couple of relevant hashtags at most.",
};

function buildSystemPrompt(profile: ContentProfile): string {
  const lines = [
    "You are helping a product owner brief influencers who will genuinely promote their product or open-source repo to their own audience.",
    "Write talking points and suggested captions the influencer can adapt in their own voice — never a corporate ad, never something that reads like it was pasted from the company.",
    "Stay faithful to the source material's facts — never invent claims, numbers, or quotes.",
    "Never suggest or imply buying followers, bots, fake engagement, vote manipulation, or anything that isn't a genuine post to a real audience.",
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

export interface GenerateForChannelInput {
  sourceContent: string;
  targetPlatform: ChannelId;
  profile: ContentProfile;
  providerId: AIProviderId;
  apiKey: string;
  model: string;
  baseUrl?: string | null;
  linkUrl?: string;
}

export async function generateForChannel(input: GenerateForChannelInput): Promise<string> {
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

export async function refineBrief(input: {
  content: string;
  action: RefinementAction;
  targetPlatform: ChannelId;
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
      "You edit influencer campaign briefs precisely. Make only the requested change, and keep it sounding like a genuine personal post, not an ad. Output only the finished text, no preamble.",
    prompt: `Channel: ${input.targetPlatform}\nInstruction: ${instruction}\n\nCurrent text:\n${input.content}`,
  });

  return result.text.trim();
}
