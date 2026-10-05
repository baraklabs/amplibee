import type { PlatformProvider, PublishInput, PublishResult } from "../types";

const GRAPH_VERSION = "v21.0";
const AUTH_URL = `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`;
const TOKEN_URL = `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`;
const API_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// Shared with instagram.ts — Instagram's Business API is reached through the
// same Meta app and the same OAuth dialog, just different scopes.
const CLIENT_ID = process.env.META_CLIENT_ID;
const CLIENT_SECRET = process.env.META_CLIENT_SECRET;

export const facebookProvider: PlatformProvider = {
  definition: {
    id: "facebook",
    name: "Facebook",
    shortName: "Facebook",
    color: "#1877F2",
    accountTypes: ["page"],
    authType: "oauth2",
    contentKind: "a post or story",
    capabilities: {
      connect: true,
      refreshToken: false,
      publish: true,
      analytics: false,
    },
    limitations:
      "Connects the first Page returned by your Facebook account — picking a specific Page when you manage several isn't wired up yet. Meta's long-lived Page tokens last about 60 days and need reconnecting after that. Posting to personal profiles isn't supported by Facebook's API for apps like this — only Pages.",
  },

  getOAuthUrl(state, redirectUri) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID ?? "",
      redirect_uri: redirectUri,
      scope: "pages_show_list,pages_manage_posts,pages_read_engagement",
      state,
    });
    return `${AUTH_URL}?${params.toString()}`;
  },

  async exchangeCodeForToken(code, redirectUri) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("Facebook OAuth is not configured on this server.");
    }
    const tokenParams = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      code,
    });
    const response = await fetch(`${TOKEN_URL}?${tokenParams.toString()}`);
    if (!response.ok) throw new Error(`Facebook token exchange failed: ${response.status}`);
    const data = (await response.json()) as { access_token: string; expires_in?: number };

    // A user access token can't post to a Page directly — fetch the Pages this
    // user manages and use the first one's own Page access token instead.
    const pagesResponse = await fetch(
      `${API_BASE}/me/accounts?access_token=${encodeURIComponent(data.access_token)}`,
    );
    if (!pagesResponse.ok) throw new Error(`Could not list Facebook Pages: ${pagesResponse.status}`);
    const pagesData = (await pagesResponse.json()) as {
      data?: { id: string; name: string; access_token: string }[];
    };
    const page = pagesData.data?.[0];
    if (!page) {
      throw new Error("No Facebook Page found for this account — connect an account that manages at least one Page.");
    }

    return {
      accessToken: page.access_token,
      accountId: page.id,
      accountName: page.name,
    };
  },

  async publishPost(accessToken, input: PublishInput): Promise<PublishResult> {
    const body = new URLSearchParams({ message: input.content, access_token: accessToken });
    if (input.linkUrl) body.set("link", input.linkUrl);

    const response = await fetch(`${API_BASE}/${encodeURIComponent(input.platformAccountId)}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `Facebook API error (${response.status}): ${errorBody}` };
    }

    const data = (await response.json()) as { id?: string };
    return {
      success: true,
      externalId: data.id,
      externalUrl: data.id ? `https://www.facebook.com/${data.id}` : undefined,
    };
  },
};
