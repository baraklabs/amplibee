import { siteUrl } from "./site.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// Reuses the Baraklabs org's already-verified Doculigent sending domain in Resend (same
// account as RESEND_API_KEY) until oyekool.com has its own verified domain — override
// with AUTH_FROM_EMAIL/HELLO_FROM_EMAIL secrets once that's set up.
const AUTH_FROM_EMAIL = Deno.env.get("AUTH_FROM_EMAIL") ?? "Oyekool <auth@mail.oyekool.com>";
const HELLO_FROM_EMAIL = Deno.env.get("HELLO_FROM_EMAIL") ?? "Oyekool <hello@mail.oyekool.com>";
const REPLY_TO_EMAIL = Deno.env.get("REPLY_TO_EMAIL") ?? "info@oyekool.com";
const SITE_URL = siteUrl();

/** Escapes text dropped into the HTML templates below — otp/name/email all ultimately come
 * from request bodies, so this isn't optional even though the values are usually harmless. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Table-based layout (not flexbox/grid) and every style inline — the only markup subset
 * that renders consistently across Gmail, Outlook, and Apple Mail. Brand colors match
 * globals.css's --accent / --primary / --accent-soft. */
function emailLayout(preheader: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>Oyekool</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f6f6f4; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f6f4;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px; max-width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(20,20,26,0.08);">
            <tr>
              <td align="center" style="padding:32px 40px; background-color:#14141a;">
                <span style="display:inline-block; vertical-align:middle; font-size:19px; font-weight:700; color:#ffffff; letter-spacing:-0.02em;">Oyekool</span>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 32px; border-top:1px solid #e5e5e0;">
                <p style="margin:0; font-size:13px; line-height:20px; color:#6b6b66;">
                  Sent by Oyekool &middot; <a href="${SITE_URL}" style="color:#ff5a1f; text-decoration:none;">oyekool.com</a><br />
                  Questions? Just reply to this email — it reaches us directly.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmail(opts: { from: string; to: string; subject: string; html: string; text: string }): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...opts, reply_to: REPLY_TO_EMAIL }),
  });
  if (!res.ok) {
    console.error("sendEmail: Resend API error", res.status, await res.text());
  }
}

/**
 * Sends the verification code by email via Resend. If RESEND_API_KEY isn't set (e.g. local
 * dev — `npx supabase start` has no way to configure this), prints the code instead of
 * blocking sign-up entirely; watch the function logs to read it. Set the secret once a real
 * project is linked: `npx supabase secrets set RESEND_API_KEY=...`.
 */
export async function sendOtpEmail(email: string, otp: string, verifyUrl: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log(`[otp] ${email}: ${otp} — ${verifyUrl}`);
    return;
  }

  const code = escapeHtml(otp);
  const href = escapeHtml(verifyUrl);
  const html = emailLayout(
    `Your verification code is ${otp}`,
    `
      <p style="margin:0 0 8px; font-size:15px; line-height:24px; color:#14141a;">Hi,</p>
      <p style="margin:0 0 24px; font-size:15px; line-height:24px; color:#14141a;">
        Enter this code to verify your email address and finish signing in to Oyekool.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td align="center" style="padding:20px; background-color:#fff1e9; border-radius:12px;">
            <span style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace; font-size:32px; font-weight:700; letter-spacing:0.3em; color:#ff5a1f;">${code}</span>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px; font-size:15px; line-height:24px; color:#14141a;">
        Or verify in one click:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td align="center" style="border-radius:10px; background-color:#ff5a1f;">
            <a href="${href}" style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
              Verify my email
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0; font-size:13px; line-height:20px; color:#6b6b66;">
        This code and link expire in 10 minutes. If you didn't request this, you can safely
        ignore this email.
      </p>
    `,
  );

  await sendEmail({
    from: AUTH_FROM_EMAIL,
    to: email,
    subject: "Your Oyekool verification code",
    html,
    text: `Your Oyekool verification code is ${otp}.\n\nOr verify in one click: ${verifyUrl}\n\nThis code and link expire in 10 minutes. If you didn't request this, you can safely ignore this email.`,
  });
}

/**
 * Password reset. Carries both proofs for the same reset row — the 6-digit code to type
 * back into the tab they started in, and a link for the common case where they've already
 * lost that tab. Either one works; whichever is used first burns the other.
 */
export async function sendPasswordResetEmail(email: string, otp: string, resetUrl: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log(`[reset] ${email}: ${otp} — ${resetUrl}`);
    return;
  }

  const code = escapeHtml(otp);
  const href = escapeHtml(resetUrl);
  const html = emailLayout(
    `Your password reset code is ${otp}`,
    `
      <p style="margin:0 0 8px; font-size:15px; line-height:24px; color:#14141a;">Hi,</p>
      <p style="margin:0 0 24px; font-size:15px; line-height:24px; color:#14141a;">
        We received a request to reset your Oyekool password. Enter this code on the reset screen:
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td align="center" style="padding:20px; background-color:#fff1e9; border-radius:12px;">
            <span style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace; font-size:32px; font-weight:700; letter-spacing:0.3em; color:#ff5a1f;">${code}</span>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px; font-size:15px; line-height:24px; color:#14141a;">
        Or reset it in one click:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td align="center" style="border-radius:10px; background-color:#ff5a1f;">
            <a href="${href}" style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
              Reset my password
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0; font-size:13px; line-height:20px; color:#6b6b66;">
        This code and link expire in 15 minutes. If you didn't request a password reset, you can
        safely ignore this email — your password won't change.
      </p>
    `,
  );

  await sendEmail({
    from: AUTH_FROM_EMAIL,
    to: email,
    subject: "Reset your Oyekool password",
    html,
    text: `Your Oyekool password reset code is ${otp}.\n\nOr reset it in one click: ${resetUrl}\n\nThis code and link expire in 15 minutes. If you didn't request a password reset, you can safely ignore this email — your password won't change.`,
  });
}

/** Sent once, right after an account first becomes verified (password OTP verify, email
 * link, or Google sign-up). Same fire-and-log-on-failure behavior as sendOtpEmail — a
 * delivery failure here shouldn't block the auth flow that triggered it. */
export async function sendWelcomeEmail(email: string, firstName?: string | null): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log(`[welcome] ${email}`);
    return;
  }

  const greetName = firstName ? escapeHtml(firstName) : null;
  const html = emailLayout(
    "Welcome to Oyekool — your account is ready to go.",
    `
      <p style="margin:0 0 8px; font-size:15px; line-height:24px; color:#14141a;">${greetName ? `Hi ${greetName},` : "Hi,"}</p>
      <p style="margin:0 0 28px; font-size:15px; line-height:24px; color:#14141a;">
        Welcome to Oyekool — your account is verified and ready to go.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 4px;">
        <tr>
          <td align="center" style="border-radius:10px; background-color:#ff5a1f;">
            <a href="${SITE_URL}/dashboard" style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">
              Go to your dashboard
            </a>
          </td>
        </tr>
      </table>
    `,
  );

  await sendEmail({
    from: HELLO_FROM_EMAIL,
    to: email,
    subject: "Welcome to Oyekool",
    html,
    text: `${firstName ? `Hi ${firstName},` : "Hi,"}\n\nWelcome to Oyekool — your account is verified and ready to go.\n\n${SITE_URL}/dashboard`,
  });
}
