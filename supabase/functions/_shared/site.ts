// Every link that leaves the server in an email resolves through here, so pointing a
// local/staging deploy at itself is one env var rather than a hunt through templates.
// Same name and value as the frontend's NEXT_PUBLIC_SITE_URL in env/{dev,prod}.env, so the
// site and its emails can't drift onto different origins. Set it per environment:
//   local  — NEXT_PUBLIC_SITE_URL=http://localhost:3000 in supabase/functions/.env
//   remote — npx supabase secrets set NEXT_PUBLIC_SITE_URL=https://oyekool.com
const BASE_URL = (Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://oyekool.com").replace(
  /\/+$/,
  "",
);

/** `path` is appended as-is, so pass it with a leading slash. */
export function siteUrl(path = ""): string {
  return `${BASE_URL}${path}`;
}

/** The one-click alternative to typing the reset OTP — see auth-reset-password's token path. */
export function passwordResetUrl(token: string): string {
  return siteUrl(`/reset-password?token=${encodeURIComponent(token)}`);
}

/** The one-click alternative to typing the sign-up OTP — see auth-verify-link. */
export function verifyEmailUrl(token: string): string {
  return siteUrl(`/verify-email?token=${encodeURIComponent(token)}`);
}
