import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse } from "../_shared/http.ts";
import { createServiceClient } from "../_shared/supabaseClient.ts";
import { verifyGoogleIdToken } from "../_shared/google.ts";
import { sendWelcomeEmail } from "../_shared/email.ts";
import { notifyTelegram } from "../_shared/telegram.ts";
import { ensureProfile } from "../_shared/profile.ts";
import { generateRefreshToken, refreshTokenExpiresAt, hashRefreshToken, deviceInfoFrom } from "../_shared/session.ts";
import { signAccessToken } from "../_shared/jwt.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null);
    const credential = String(body?.credential ?? "").trim();
    if (!credential) return jsonResponse(400, { error: "Missing Google credential." }, corsHeaders);

    const profile = await verifyGoogleIdToken(credential);
    if (!profile) return jsonResponse(400, { error: "Google sign-in failed. Please try again." }, corsHeaders);

    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from("users")
      .select("id, active")
      .eq("email_id", profile.email)
      .maybeSingle();
    if (existing && !existing.active) {
      return jsonResponse(400, { error: "This account is inactive." }, corsHeaders);
    }

    const { data: upserted, error } = await supabase
      .from("users")
      .upsert(
        {
          email_id: profile.email,
          first_name: profile.firstName,
          last_name: profile.lastName,
          verified: true,
        },
        { onConflict: "email_id" },
      )
      .select("id")
      .single();
    if (error) {
      console.error("auth-google: upsert failed", error);
      return jsonResponse(500, { error: "Something went wrong. Please try again." }, corsHeaders);
    }

    if (!existing) {
      const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || null;
      await ensureProfile(supabase, upserted.id, name);
      await sendWelcomeEmail(profile.email, profile.firstName);
      await notifyTelegram(
        `🎉 New Oyekool Signup\n\n👤 Name: ${name ?? "(no name)"}\n📧 Email: ${profile.email}\n🔑 Via: Google`,
      );
    }

    const refreshToken = generateRefreshToken();
    const info = deviceInfoFrom(req);
    const { error: sessionError } = await supabase.from("user_sessions").insert({
      user_id: upserted.id,
      refresh_token_hash: await hashRefreshToken(refreshToken),
      device_type: info.deviceType,
      platform: info.platform,
      app_version: info.appVersion,
      arch: info.arch,
      ip_address: info.ipAddress,
      expires_at: refreshTokenExpiresAt(),
    });
    if (sessionError) {
      console.error("auth-google: session insert failed", sessionError);
      return jsonResponse(500, { error: "Something went wrong. Please try again." }, corsHeaders);
    }

    const accessToken = await signAccessToken(upserted.id);
    return jsonResponse(200, { requiresVerification: false, accessToken, refreshToken }, corsHeaders);
  } catch (err) {
    console.error("auth-google: unhandled error", err);
    return jsonResponse(500, { error: "Something went wrong. Please try again." }, corsHeaders);
  }
});
