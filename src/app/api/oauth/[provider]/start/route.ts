import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUserId } from "@/lib/auth/session";
import { getPlatform, isPlatformConfigured } from "@/lib/platforms/registry";
import type { PlatformId } from "@/lib/platforms/types";

const VALID_PLATFORMS: PlatformId[] = ["x", "linkedin", "medium", "substack"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const origin = request.nextUrl.origin;

  if (!VALID_PLATFORMS.includes(provider as PlatformId)) {
    return NextResponse.redirect(`${origin}/dashboard/accounts?error=unknown_platform`);
  }

  const platformId = provider as PlatformId;
  const platform = getPlatform(platformId);

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.redirect(`${origin}/login?next=/dashboard/accounts`);
  }

  if (platform.definition.authType !== "oauth2" || !platform.getOAuthUrl) {
    return NextResponse.redirect(`${origin}/dashboard/accounts?error=not_oauth`);
  }

  if (!isPlatformConfigured(platformId)) {
    return NextResponse.redirect(`${origin}/dashboard/accounts?error=not_configured&platform=${platformId}`);
  }

  const state = crypto.randomUUID();
  const redirectUri = `${origin}/api/oauth/${platformId}/callback`;
  const authUrl = platform.getOAuthUrl(state, redirectUri);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(`oauth_state_${platformId}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  return response;
}
