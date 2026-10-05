/**
 * The channels influencers actually post on. Amplibee never publishes to
 * these on anyone's behalf — this is metadata only (label, color, icon),
 * used to render choices and badges across campaigns, briefs, and network
 * profiles.
 */
export type ChannelId = "x" | "linkedin" | "youtube" | "instagram";

export interface ChannelDefinition {
  id: ChannelId;
  name: string;
  shortName: string;
  color: string;
  /** What a genuine deliverable on this channel typically looks like. */
  contentKind: string;
}
