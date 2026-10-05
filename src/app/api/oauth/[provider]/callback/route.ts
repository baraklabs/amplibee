import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/auth/session";
import { getPlatform } from "@/lib/platforms/registry";
import type { PlatformId } from "@/lib/platforms/types";
import { encryptSecret } from "@/lib/crypto";

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

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(`oauth_state_${platformId}`)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/dashboard/accounts?error=invalid_state`);
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.redirect(`${origin}/login?next=/dashboard/accounts`);
  }
  const supabase = createAdminClient();

  if (!platform.exchangeCodeForToken) {
    return NextResponse.redirect(`${origin}/dashboard/accounts?error=not_oauth`);
  }

  try {
    const redirectUri = `${origin}/api/oauth/${platformId}/callback`;
    const result = await platform.exchangeCodeForToken(code, redirectUri);

    const { error } = await supabase.from("connected_accounts").upsert(
      {
        user_id: userId,
        platform: platformId,
        account_type: "profile",
        external_account_id: result.accountId,
        display_name: result.accountName,
        handle: result.accountHandle ?? null,
        encrypted_access_token: encryptSecret(result.accessToken),
        encrypted_refresh_token: result.refreshToken ? encryptSecret(result.refreshToken) : null,
        token_expires_at: result.expiresAt ?? null,
        status: "connected",
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "user_id,platform,external_account_id" },
    );

    if (error) throw error;

    const response = NextResponse.redirect(`${origin}/dashboard/accounts?connected=${platformId}`);
    response.cookies.delete(`oauth_state_${platformId}`);
    return response;
  } catch (err) {
    console.error(`OAuth callback failed for ${platformId}:`, err);
    return NextResponse.redirect(`${origin}/dashboard/accounts?error=connection_failed`);
  }
}
