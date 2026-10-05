import type { PlatformId, PlatformProvider } from "./types";
import { xProvider } from "./providers/x";
import { linkedinProvider } from "./providers/linkedin";
import { mediumProvider } from "./providers/medium";
import { substackProvider } from "./providers/substack";

/**
 * Central registry of platform adapters. Add a new platform by writing a
 * provider module (see providers/x.ts for the fullest example) and
 * registering it here — nothing else in the app should import a
 * provider module directly.
 */
export const platformRegistry: Record<PlatformId, PlatformProvider> = {
  x: xProvider,
  linkedin: linkedinProvider,
  medium: mediumProvider,
  substack: substackProvider,
};

export const platformList = Object.values(platformRegistry);

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
    case "medium":
      return true; // user supplies their own integration token, nothing to configure server-side
    case "substack":
      return true; // manual, nothing to configure
    default:
      return false;
  }
}
