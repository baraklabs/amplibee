export type PlatformId = "x" | "linkedin" | "youtube" | "instagram" | "facebook";

export type AccountType = "profile" | "page" | "channel";

export interface PlatformCapabilities {
  /** Can initiate an OAuth connection flow. */
  connect: boolean;
  /** Can refresh an expired access token without user interaction. */
  refreshToken: boolean;
  /** Can create/publish a post directly through the platform's own API. */
  publish: boolean;
  /** Can pull post-level analytics (impressions, engagement, clicks) back. */
  analytics: boolean;
}

export interface PlatformDefinition {
  id: PlatformId;
  name: string;
  shortName: string;
  color: string;
  accountTypes: AccountType[];
  capabilities: PlatformCapabilities;
  /** Human-readable explanation of what's NOT supported and why, shown in the UI. */
  limitations?: string;
  characterLimit?: number;
  authType: "oauth2";
  /** What a published post typically looks like — used in marketing copy. */
  contentKind: string;
}

export interface ConnectedAccountSummary {
  id: string;
  platform: PlatformId;
  accountType: AccountType;
  displayName: string;
  handle: string | null;
  avatarUrl: string | null;
  status: "connected" | "expired" | "revoked" | "error";
  lastSyncedAt: string | null;
}

export interface PublishInput {
  /** The platform's own account/page/channel id, not our DB row id. */
  platformAccountId: string;
  content: string;
  linkUrl?: string;
}

export interface PublishResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
}

export interface OAuthTokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  accountId: string;
  accountName: string;
  accountHandle?: string;
}

/**
 * Adapter contract every platform integration implements. Only methods a
 * platform's public API genuinely supports should be present — see each
 * provider's `capabilities` for what is and isn't wired up. Oyekool never
 * publishes anything without the connected account owner's own OAuth grant.
 */
export interface PlatformProvider {
  definition: PlatformDefinition;
  getOAuthUrl?(state: string, redirectUri: string): string;
  exchangeCodeForToken?(code: string, redirectUri: string): Promise<OAuthTokenResult>;
  refreshToken?(refreshToken: string): Promise<{ accessToken: string; expiresAt?: string }>;
  publishPost?(accessToken: string, input: PublishInput): Promise<PublishResult>;
}
