export type PlatformId = "x" | "linkedin" | "medium" | "substack";

export type AccountType = "profile" | "page" | "publication";

export interface PlatformCapabilities {
  /** Can initiate an OAuth connection flow. */
  connect: boolean;
  /** Can refresh an expired access token without user interaction. */
  refreshToken: boolean;
  /** Can create/publish a post directly through the platform's API. */
  publish: boolean;
  /** Can schedule a post for future publishing through the platform's API. */
  schedule: boolean;
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
  authType: "oauth2" | "api_token" | "manual";
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
  /** The platform's own account/user id (e.g. LinkedIn member URN id), not our DB row id. */
  platformAccountId: string;
  content: string;
  linkUrl?: string;
  scheduledFor?: string;
}

export interface PublishResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
}

/**
 * Adapter contract every platform integration implements. Only methods a
 * platform's public API genuinely supports should return success — see
 * each provider's `capabilities` for what is and isn't wired up.
 */
export interface PlatformProvider {
  definition: PlatformDefinition;
  getOAuthUrl?(state: string, redirectUri: string): string;
  exchangeCodeForToken?(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
    accountId: string;
    accountName: string;
    accountHandle?: string;
  }>;
  refreshToken?(refreshToken: string): Promise<{ accessToken: string; expiresAt?: string }>;
  publishPost?(accessToken: string, input: PublishInput): Promise<PublishResult>;
}
