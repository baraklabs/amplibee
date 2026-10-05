import type { PlatformProvider, PublishInput, PublishResult } from "../types";

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const API_BASE = "https://api.linkedin.com/v2";

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;

export const linkedinProvider: PlatformProvider = {
  definition: {
    id: "linkedin",
    name: "LinkedIn",
    shortName: "LinkedIn",
    color: "#0A66C2",
    accountTypes: ["profile", "page"],
    characterLimit: 3000,
    authType: "oauth2",
    capabilities: {
      connect: true,
      refreshToken: false,
      publish: true,
      schedule: false,
      analytics: false,
    },
    limitations:
      "LinkedIn access tokens expire after roughly 60 days and must be reconnected manually — LinkedIn does not grant refresh tokens outside its partner program. Publishing to company pages requires the page's admin to have approved Amplibee in the LinkedIn Page admin settings. Post-level analytics are not exposed by LinkedIn's standard API tier.",
  },

  getOAuthUrl(state, redirectUri) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID ?? "",
      redirect_uri: redirectUri,
      scope: "openid profile email w_member_social",
      state,
    });
    return `${AUTH_URL}?${params.toString()}`;
  },

  async exchangeCodeForToken(code, redirectUri) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("LinkedIn OAuth is not configured on this server.");
    }
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!response.ok) throw new Error(`LinkedIn token exchange failed: ${response.status}`);
    const data = (await response.json()) as { access_token: string; expires_in?: number };

    const profile = await fetch(`${API_BASE}/userinfo`, {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const profileData = (await profile.json()) as { sub: string; name: string; email?: string };

    return {
      accessToken: data.access_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined,
      accountId: profileData.sub,
      accountName: profileData.name,
      accountHandle: profileData.email,
    };
  },

  async publishPost(accessToken, input: PublishInput): Promise<PublishResult> {
    const response = await fetch(`${API_BASE}/ugcPosts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${input.platformAccountId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: input.content },
            shareMediaCategory: input.linkUrl ? "ARTICLE" : "NONE",
            ...(input.linkUrl && {
              media: [{ status: "READY", originalUrl: input.linkUrl }],
            }),
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `LinkedIn API error (${response.status}): ${errorBody}` };
    }

    const externalId = response.headers.get("x-restli-id") ?? undefined;
    return { success: true, externalId };
  },
};
