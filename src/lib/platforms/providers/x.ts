import type { PlatformProvider, PublishInput, PublishResult } from "../types";

const AUTH_URL = "https://x.com/i/oauth2/authorize";
const TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const API_BASE = "https://api.twitter.com/2";

const CLIENT_ID = process.env.X_CLIENT_ID;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET;

export const xProvider: PlatformProvider = {
  definition: {
    id: "x",
    name: "X",
    shortName: "X",
    color: "#000000",
    accountTypes: ["profile"],
    characterLimit: 280,
    authType: "oauth2",
    capabilities: {
      connect: true,
      refreshToken: true,
      publish: true,
      schedule: false,
      analytics: true,
    },
    limitations:
      "Scheduling happens inside Amplibee, not on X's servers — posts are queued and published at the scheduled time by our worker. Analytics require the connected account to have API read access under your X developer tier.",
  },

  getOAuthUrl(state, redirectUri) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID ?? "",
      redirect_uri: redirectUri,
      scope: "tweet.read tweet.write users.read offline.access",
      state,
      code_challenge: "challenge",
      code_challenge_method: "plain",
    });
    return `${AUTH_URL}?${params.toString()}`;
  },

  async exchangeCodeForToken(code, redirectUri) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("X OAuth is not configured on this server.");
    }
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: "challenge",
      }),
    });

    if (!response.ok) {
      throw new Error(`X token exchange failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    const me = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const meData = (await me.json()) as { data?: { id: string; name: string; username: string } };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined,
      accountId: meData.data?.id ?? "",
      accountName: meData.data?.name ?? "X account",
      accountHandle: meData.data?.username,
    };
  },

  async refreshToken(refreshToken) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("X OAuth is not configured on this server.");
    }
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    });
    if (!response.ok) throw new Error(`X token refresh failed: ${response.status}`);
    const data = (await response.json()) as { access_token: string; expires_in?: number };
    return {
      accessToken: data.access_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined,
    };
  },

  async publishPost(accessToken, input: PublishInput): Promise<PublishResult> {
    const text = input.linkUrl ? `${input.content}\n\n${input.linkUrl}` : input.content;
    const response = await fetch(`${API_BASE}/tweets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `X API error (${response.status}): ${errorBody}` };
    }

    const data = (await response.json()) as { data?: { id: string } };
    const id = data.data?.id;
    return {
      success: true,
      externalId: id,
      externalUrl: id ? `https://x.com/i/web/status/${id}` : undefined,
    };
  },
};
