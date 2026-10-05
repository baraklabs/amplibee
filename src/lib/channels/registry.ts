import type { ChannelId, ChannelDefinition } from "./types";

/**
 * Central registry of channel metadata. Add a new channel by adding an
 * entry here — nothing else in the app should hardcode this list.
 */
export const channelRegistry: Record<ChannelId, ChannelDefinition> = {
  x: { id: "x", name: "X", shortName: "X", color: "#000000", contentKind: "a post or thread" },
  linkedin: { id: "linkedin", name: "LinkedIn", shortName: "LinkedIn", color: "#0A66C2", contentKind: "a post" },
  youtube: { id: "youtube", name: "YouTube", shortName: "YouTube", color: "#FF0000", contentKind: "a video" },
  instagram: { id: "instagram", name: "Instagram", shortName: "Instagram", color: "#E1306C", contentKind: "a post or reel" },
};

export const channelList = Object.values(channelRegistry);

export function getChannel(id: ChannelId): ChannelDefinition {
  const definition = channelRegistry[id];
  if (!definition) throw new Error(`Unknown channel: ${id}`);
  return definition;
}
