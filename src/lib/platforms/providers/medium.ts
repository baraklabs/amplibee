import type { PlatformProvider, PublishInput, PublishResult } from "../types";

const API_BASE = "https://api.medium.com/v1";

/**
 * Medium's public API (developers.medium.com) is accessed with a
 * self-issued "integration token" from the user's Medium settings —
 * there is no OAuth redirect flow. Medium stopped issuing new
 * integration tokens to accounts created after their 2023 API changes,
 * so this path only works for accounts that already have one. Everyone
 * else uses the "Copy for Medium" export in the composer instead.
 */
export const mediumProvider: PlatformProvider = {
  definition: {
    id: "medium",
    name: "Medium",
    shortName: "Medium",
    color: "#000000",
    accountTypes: ["profile", "publication"],
    authType: "api_token",
    capabilities: {
      connect: true,
      refreshToken: false,
      publish: true,
      schedule: false,
      analytics: false,
    },
    limitations:
      "Medium no longer issues new integration tokens to accounts created after 2023 — if your account doesn't already have one, publishing isn't available and Amplibee falls back to a formatted export you paste into Medium's editor yourself. Medium's API has no scheduling or analytics endpoints.",
  },

  async publishPost(accessToken, input: PublishInput): Promise<PublishResult> {
    const me = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!me.ok) {
      return { success: false, error: "Medium integration token is invalid or expired." };
    }
    const meData = (await me.json()) as { data?: { id: string } };
    const userId = meData.data?.id;
    if (!userId) {
      return { success: false, error: "Could not resolve Medium user id." };
    }

    const response = await fetch(`${API_BASE}/users/${userId}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: input.content.split("\n")[0]?.slice(0, 100) || "Untitled",
        contentFormat: "markdown",
        content: input.linkUrl ? `${input.content}\n\n[Read more](${input.linkUrl})` : input.content,
        publishStatus: "draft",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `Medium API error (${response.status}): ${errorBody}` };
    }

    const data = (await response.json()) as { data?: { id: string; url: string } };
    return { success: true, externalId: data.data?.id, externalUrl: data.data?.url };
  },
};
