import type { PlatformProvider } from "../types";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_BASE = "https://www.googleapis.com/youtube/v3";

// Deliberately a separate app/credential pair from NEXT_PUBLIC_GOOGLE_CLIENT_ID
// (used for "Sign in with Google") — that client isn't scoped for the YouTube
// Data API, and reusing it would silently widen what it can ask a user for.
const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;

export const youtubeProvider: PlatformProvider = {
  definition: {
    id: "youtube",
    name: "YouTube",
    shortName: "YouTube",
    color: "#FF0000",
    accountTypes: ["channel"],
    authType: "oauth2",
    contentKind: "a video or short",
    capabilities: {
      connect: true,
      refreshToken: true,
      // Uploading a video requires sending the actual video file (a
      // multipart/resumable upload), not a text post — the composer here is
      // text-only today, so there's nothing to upload yet. Connecting a
      // channel works and is ready for when video upload is added.
      publish: false,
      analytics: false,
    },
    limitations:
      "Publishing isn't wired up yet — uploading to YouTube means sending an actual video file, and the composer doesn't support that yet. Connecting a channel works today and is ready for when video upload is added.",
  },

  getOAuthUrl(state, redirectUri) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID ?? "",
      redirect_uri: redirectUri,
      scope: "https://www.googleapis.com/auth/youtube.readonly",
      access_type: "offline",
      prompt: "consent",
      state,
    });
    return `${AUTH_URL}?${params.toString()}`;
  },

  async exchangeCodeForToken(code, redirectUri) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("YouTube OAuth is not configured on this server.");
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
    if (!response.ok) throw new Error(`YouTube token exchange failed: ${response.status}`);
    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    const channelResponse = await fetch(
      `${API_BASE}/channels?part=snippet&mine=true`,
      { headers: { Authorization: `Bearer ${data.access_token}` } },
    );
    const channelData = (await channelResponse.json()) as {
      items?: { id: string; snippet: { title: string; customUrl?: string } }[];
    };
    const channel = channelData.items?.[0];
    if (!channel) {
      throw new Error("No YouTube channel found on this Google account.");
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined,
      accountId: channel.id,
      accountName: channel.snippet.title,
      accountHandle: channel.snippet.customUrl,
    };
  },

  async refreshToken(refreshToken) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error("YouTube OAuth is not configured on this server.");
    }
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });
    if (!response.ok) throw new Error(`YouTube token refresh failed: ${response.status}`);
    const data = (await response.json()) as { access_token: string; expires_in?: number };
    return {
      accessToken: data.access_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined,
    };
  },
};
