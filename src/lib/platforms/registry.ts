import type { PlatformId, PlatformProvider, PlatformDefinition } from "./types";
import { xProvider } from "./providers/x";
import { linkedinProvider } from "./providers/linkedin";
import { youtubeProvider } from "./providers/youtube";
import { instagramProvider } from "./providers/instagram";
import { facebookProvider } from "./providers/facebook";

/**
 * Central registry of platform adapters. Add a new platform by writing a
 * provider module (see providers/x.ts for the fullest example) and
 * registering it here — nothing else in the app should import a provider
 * module directly.
 */
export const platformRegistry: Record<PlatformId, PlatformProvider> = {
  x: xProvider,
  linkedin: linkedinProvider,
  youtube: youtubeProvider,
  instagram: instagramProvider,
  facebook: facebookProvider,
};

export const platformList = Object.values(platformRegistry);
export const platformDefinitions: PlatformDefinition[] = platformList.map((p) => p.definition);

/** Platforms on the public roadmap, not yet in {@link platformRegistry} — rendered as "coming soon" badges on marketing pages. */
export const upcomingPlatforms = ["TikTok", "Threads", "Pinterest", "Mastodon"];

export function getPlatform(id: PlatformId): PlatformProvider {
  const provider = platformRegistry[id];
  if (!provider) throw new Error(`Unknown platform: ${id}`);
  return provider;
}

export function isPlatformConfigured(id: PlatformId): boolean {
  switch (id) {
    case "x":
      return Boolean(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET);
    case "linkedin":
      return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
    case "youtube":
      return Boolean(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET);
    case "instagram":
    case "facebook":
      return Boolean(process.env.META_CLIENT_ID && process.env.META_CLIENT_SECRET);
    default:
      return false;
  }
}
