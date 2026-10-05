import { sha256Hex } from "./hash.ts";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function readBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  return token || null;
}

export function generateRefreshToken(): string {
  return crypto.randomUUID();
}

export function refreshTokenExpiresAt(): string {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString();
}

export function hashRefreshToken(token: string): Promise<string> {
  return sha256Hex(token);
}

export interface DeviceInfo {
  deviceType: string;
  platform: string | null;
  appVersion: string | null;
  arch: string | null;
  ipAddress: string | null;
}

/** Oyekool only has a web client today, but the shape matches doculigent's so the same
 *  user_sessions schema can carry a future desktop/mobile client without another migration. */
export function deviceInfoFrom(req: Request): DeviceInfo {
  const platform = req.headers.get("x-platform");
  const appVersion = req.headers.get("x-app-version");
  const arch = req.headers.get("x-arch");
  const deviceType = req.headers.get("x-device-type") ?? (platform ? "desktop" : "web");
  const ipAddress = req.headers.get("x-forwarded-for");
  return { deviceType, platform, appVersion, arch, ipAddress };
}
