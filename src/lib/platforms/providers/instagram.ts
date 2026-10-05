import type { PlatformProvider } from "../types";

const GRAPH_VERSION = "v21.0";
const AUTH_URL = `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`;
const TOKEN_URL = `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`;
const API_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// Instagram's Business API has no OAuth dialog of its own — a connection goes
// through the same Meta app and login flow as Facebook (an Instagram Business
// account must be linked to a Facebook Page). See facebook.ts.
const CLIENT_ID = process.env.META_CLIENT_ID;
const CLIENT_SECRET = process.env.META_CLIENT_SECRET;

export const instagramProvider: PlatformProvider = {
  definition: {
    id: "instagram",
    name: "Instagram",
    shortName: "Instagram",
    color: "#E1306C",
    accountTypes: ["page"],
    authType: "oauth2",
    contentKind: "a post, story, or reel",
    capabilities: {
      connect: true,
      refreshToken: false,
      // Instagram's publish API only accepts an already-hosted image/video URL
      // (a two-step create-container-then-publish flow) — the composer here
      // is text-only today, so there's nothing to attach yet. Connecting an
      // account works and is ready for when media upload is added.
      publish: false,
      analytics: false,
    },
    limitations:
      "Publishing isn't wired up yet — Instagram's API requires an already-hosted image or video URL, and the composer doesn't support media upload yet. Connecting an account links the Instagram Business account tied to your first Facebook Page, ready for when that's added.",
  },

  getOAuthUrl(state, redirectUri) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID ?? "",
      redirect_uri: redirectUri,
      scope: "pages_show_list,instagram_basic,instagram_content_publish,pages_read_engagement",
      state,
    });
    return `${AUTH_URL}?${params.toString()}`;
  },

  async exchangeCodeForToken(code, redirectUri) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("Instagram OAuth is not configured on this server.");
    }
    const tokenParams = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      code,
    });
    const response = await fetch(`${TOKEN_URL}?${tokenParams.toString()}`);
    if (!response.ok) throw new Error(`Instagram token exchange failed: ${response.status}`);
    const data = (await response.json()) as { access_token: string };

    const pagesResponse = await fetch(
      `${API_BASE}/me/accounts?fields=instagram_business_account{id,username}&access_token=${encodeURIComponent(data.access_token)}`,
    );
    if (!pagesResponse.ok) throw new Error(`Could not list Facebook Pages: ${pagesResponse.status}`);
    const pagesData = (await pagesResponse.json()) as {
      data?: { id: string; instagram_business_account?: { id: string; username: string } }[];
    };
    const pageWithInstagram = pagesData.data?.find((page) => page.instagram_business_account);
    const igAccount = pageWithInstagram?.instagram_business_account;
    if (!igAccount) {
      throw new Error(
        "No Instagram Business account found — link one to a Facebook Page you manage, then reconnect.",
      );
    }

    return {
      accessToken: data.access_token,
      accountId: igAccount.id,
      accountName: igAccount.username,
      accountHandle: `@${igAccount.username}`,
    };
  },
};
