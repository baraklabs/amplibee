import type { PlatformProvider } from "../types";

/**
 * Substack has no public publishing API. "Connecting" a Substack account
 * only stores the newsletter URL for backlink attribution and export
 * formatting — Amplibee cannot publish, schedule, or read analytics
 * for Substack, and the UI must not imply otherwise.
 */
export const substackProvider: PlatformProvider = {
  definition: {
    id: "substack",
    name: "Substack",
    shortName: "Substack",
    color: "#FF6719",
    accountTypes: ["publication"],
    authType: "manual",
    capabilities: {
      connect: true,
      refreshToken: false,
      publish: false,
      schedule: false,
      analytics: false,
    },
    limitations:
      "Substack does not offer a public API. Amplibee generates a newsletter-formatted draft you copy into Substack's editor yourself — direct publishing and scheduling aren't possible for this platform.",
  },
};
