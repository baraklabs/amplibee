import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse } from "../_shared/http.ts";
import { createServiceClient } from "../_shared/supabaseClient.ts";
import { sendWelcomeEmail } from "../_shared/email.ts";
import { notifyTelegram } from "../_shared/telegram.ts";
import { ensureProfile } from "../_shared/profile.ts";
import { sha256Hex } from "../_shared/hash.ts";
import {
  generateRefreshToken,
  refreshTokenExpiresAt,
  hashRefreshToken,
  deviceInfoFrom,
} from "../_shared/session.ts";
import { signAccessToken } from "../_shared/jwt.ts";

const INVALID_LINK = "This verification link is invalid or has expired. Request a new code.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

/**
 * The one-click half of email verification. Unlike auth-verify this takes no temporary
 * token — the link is opened from an inbox, quite possibly in a browser that never saw the
 * sign-up — so possession of the link token is the entire proof, and it signs the user in.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null);
    const token = String(body?.token ?? "").trim();
    if (!token) return jsonResponse(400, { error: INVALID_LINK }, corsHeaders);

    const supabase = createServiceClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email_id, active, verified, first_name, last_name, otp_expires_at")
      .eq("verification_token_hash", await sha256Hex(token))
      .maybeSingle();

    if (error) {
      console.error("auth-verify-link: lookup failed", error);
      return jsonResponse(500, { error: GENERIC_ERROR }, corsHeaders);
    }
    if (!user || !user.active) return jsonResponse(400, { error: INVALID_LINK }, corsHeaders);
    // The link shares the OTP's deadline — see _shared/verification.ts.
    if (!user.otp_expires_at || new Date(user.otp_expires_at).getTime() < Date.now()) {
      return jsonResponse(400, { error: INVALID_LINK }, corsHeaders);
    }

    const wasVerified = user.verified;

    // Clearing the hash is what makes the link single-use, and the `not null` guard means two
    // clicks racing each other can't both proceed to create a session.
    const { data: claimed, error: updateError } = await supabase
      .from("users")
      .update({
        verified: true,
        otp: null,
        otp_expires_at: null,
        otp_attempts: 0,
        verification_token_hash: null,
      })
      .eq("id", user.id)
      .not("verification_token_hash", "is", null)
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("auth-verify-link: update failed", updateError);
      return jsonResponse(500, { error: GENERIC_ERROR }, corsHeaders);
    }
    if (!claimed) return jsonResponse(400, { error: INVALID_LINK }, corsHeaders);

    const refreshToken = generateRefreshToken();
    const info = deviceInfoFrom(req);
    const { error: sessionError } = await supabase.from("user_sessions").insert({
      user_id: user.id,
      refresh_token_hash: await hashRefreshToken(refreshToken),
      device_type: info.deviceType,
      platform: info.platform,
      app_version: info.appVersion,
      arch: info.arch,
      ip_address: info.ipAddress,
      expires_at: refreshTokenExpiresAt(),
    });
    if (sessionError) {
      console.error("auth-verify-link: session insert failed", sessionError);
      return jsonResponse(500, { error: GENERIC_ERROR }, corsHeaders);
    }

    // Mirrors auth-verify: only on the first crossing of unverified -> verified.
    if (!wasVerified) {
      const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || null;
      await ensureProfile(supabase, user.id, name);
      await sendWelcomeEmail(user.email_id, user.first_name);
      await notifyTelegram(
        `🎉 New Oyekool Signup\n\n👤 Name: ${name ?? "(no name)"}\n📧 Email: ${user.email_id}\n🔑 Via: Email link`,
      );
    }

    const accessToken = await signAccessToken(user.id);
    return jsonResponse(200, { requiresVerification: false, accessToken, refreshToken }, corsHeaders);
  } catch (err) {
    console.error("auth-verify-link: unhandled error", err);
    return jsonResponse(500, { error: GENERIC_ERROR }, corsHeaders);
  }
});
