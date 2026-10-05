import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse } from "../_shared/http.ts";
import { createServiceClient } from "../_shared/supabaseClient.ts";
import { sendWelcomeEmail } from "../_shared/email.ts";
import { notifyTelegram } from "../_shared/telegram.ts";
import { ensureProfile } from "../_shared/profile.ts";
import { OTP_MAX_ATTEMPTS } from "../_shared/otp.ts";
import {
  generateRefreshToken,
  refreshTokenExpiresAt,
  readBearerToken,
  hashRefreshToken,
  deviceInfoFrom,
} from "../_shared/session.ts";
import { signAccessToken, verifyTemporaryToken } from "../_shared/jwt.ts";

const SESSION_EXPIRED = "Your verification session has expired. Please sign in again.";
const INVALID_OR_EXPIRED = "That code is invalid or has expired.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const temporaryToken = readBearerToken(req);
    const userId = temporaryToken ? await verifyTemporaryToken(temporaryToken) : null;
    if (!userId) return jsonResponse(401, { error: SESSION_EXPIRED }, corsHeaders);

    const body = await req.json().catch(() => null);
    const code = String(body?.code ?? "").trim();
    if (!code) return jsonResponse(400, { error: "Verification code is required." }, corsHeaders);

    const supabase = createServiceClient();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email_id, otp, otp_expires_at, otp_attempts, verified, active, first_name, last_name")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("auth-verify: lookup failed", error);
      return jsonResponse(500, { error: "Something went wrong. Please try again." }, corsHeaders);
    }
    if (!user || !user.active || !user.otp) {
      return jsonResponse(400, { error: INVALID_OR_EXPIRED }, corsHeaders);
    }
    if (user.otp_attempts >= OTP_MAX_ATTEMPTS) {
      return jsonResponse(400, { error: "Too many incorrect attempts. Request a new code." }, corsHeaders);
    }
    if (!user.otp_expires_at || new Date(user.otp_expires_at).getTime() < Date.now()) {
      return jsonResponse(400, { error: "That code has expired. Request a new one." }, corsHeaders);
    }
    if (user.otp !== code) {
      await supabase.from("users").update({ otp_attempts: user.otp_attempts + 1 }).eq("id", user.id);
      return jsonResponse(400, { error: "That code is incorrect." }, corsHeaders);
    }

    const { error: updateError } = await supabase
      .from("users")
      // verification_token_hash goes too: the code and the emailed link are one challenge,
      // so spending either has to retire both.
      .update({
        verified: true,
        otp: null,
        otp_expires_at: null,
        otp_attempts: 0,
        verification_token_hash: null,
      })
      .eq("id", user.id);
    if (updateError) {
      console.error("auth-verify: update failed", updateError);
      return jsonResponse(500, { error: "Something went wrong. Please try again." }, corsHeaders);
    }

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
      console.error("auth-verify: session insert failed", sessionError);
      return jsonResponse(500, { error: "Something went wrong. Please try again." }, corsHeaders);
    }

    // Only the first time an account crosses unverified -> verified, not on re-verification.
    if (!user.verified) {
      const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || null;
      await ensureProfile(supabase, user.id, name);
      await sendWelcomeEmail(user.email_id, user.first_name);
      await notifyTelegram(
        `🎉 New Oyekool Signup\n\n👤 Name: ${name ?? "(no name)"}\n📧 Email: ${user.email_id}\n🔑 Via: Password`,
      );
    }

    const accessToken = await signAccessToken(user.id);
    return jsonResponse(200, { requiresVerification: false, accessToken, refreshToken }, corsHeaders);
  } catch (err) {
    console.error("auth-verify: unhandled error", err);
    return jsonResponse(500, { error: "Something went wrong. Please try again." }, corsHeaders);
  }
});
