/**
 * Server-only wrappers around the supabase/functions/auth-* edge functions. This is the
 * server-rendered counterpart to doculigent-website's src/lib/auth.ts: same endpoints and
 * response shapes, but called from Server Actions (never the browser) since Oyekool's
 * dashboard is server-rendered and gated by src/proxy.ts, not a client-side SPA reading
 * tokens from localStorage. Callers are responsible for turning the returned tokens into
 * cookies — see src/lib/auth/session.ts.
 */
const FUNCTIONS_URL = `${process.env.SUPABASE_URL}/functions/v1`;

const GENERIC_ERROR = "Something went wrong. Please try again.";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PendingAuth {
  temporaryToken: string;
  email: string;
  name: string | null;
}

export type AuthOutcome =
  | { ok: true; requiresVerification: false; tokens: AuthTokens }
  | { ok: true; requiresVerification: true; pending: PendingAuth }
  | { ok: false; error: string };

export type SimpleOutcome = { ok: true } | { ok: false; error: string };

async function postJson(path: string, body: unknown, headers?: Record<string, string>) {
  const res = await fetch(`${FUNCTIONS_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { res, data };
}

function toAuthOutcome(res: Response, data: Record<string, unknown> | null): AuthOutcome {
  if (res.ok) {
    if (typeof data?.accessToken === "string" && typeof data?.refreshToken === "string") {
      return { ok: true, requiresVerification: false, tokens: { accessToken: data.accessToken, refreshToken: data.refreshToken } };
    }
    if (typeof data?.temporaryToken === "string" && typeof data?.email === "string") {
      return {
        ok: true,
        requiresVerification: true,
        pending: { temporaryToken: data.temporaryToken, email: data.email, name: typeof data.name === "string" ? data.name : null },
      };
    }
  }
  const message = typeof data?.error === "string" ? data.error : GENERIC_ERROR;
  return { ok: false, error: message };
}

async function authRequest(path: string, body: unknown): Promise<AuthOutcome> {
  try {
    const { res, data } = await postJson(path, body);
    return toAuthOutcome(res, data);
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

export function signIn(email: string, password: string): Promise<AuthOutcome> {
  return authRequest("auth-signin", { email, password });
}

export function signUp(name: string, email: string, password: string): Promise<AuthOutcome> {
  return authRequest("auth-signup", { name, email, password });
}

export function signInWithGoogle(credential: string): Promise<AuthOutcome> {
  return authRequest("auth-google", { credential });
}

export async function verifyEmail(temporaryToken: string, code: string): Promise<AuthOutcome> {
  try {
    const { res, data } = await postJson("auth-verify", { code }, { Authorization: `Bearer ${temporaryToken}` });
    return toAuthOutcome(res, data);
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function verifyEmailWithToken(token: string): Promise<AuthOutcome> {
  try {
    const { res, data } = await postJson("auth-verify-link", { token });
    return toAuthOutcome(res, data);
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function resendVerificationCode(
  temporaryToken: string,
): Promise<{ ok: true; temporaryToken: string } | { ok: false; error: string }> {
  try {
    const { res, data } = await postJson("auth-resend-code", {}, { Authorization: `Bearer ${temporaryToken}` });
    if (res.ok && typeof data?.temporaryToken === "string") {
      return { ok: true, temporaryToken: data.temporaryToken };
    }
    return { ok: false, error: typeof data?.error === "string" ? data.error : GENERIC_ERROR };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

export function requestPasswordReset(email: string): Promise<SimpleOutcome> {
  return postSimple("auth-forgot-password", { email });
}

export function resetPassword(
  params: { token: string; password: string } | { email: string; code: string; password: string },
): Promise<SimpleOutcome> {
  return postSimple("auth-reset-password", params);
}

async function postSimple(path: string, body: unknown): Promise<SimpleOutcome> {
  try {
    const { res, data } = await postJson(path, body);
    if (res.ok) return { ok: true };
    return { ok: false, error: typeof data?.error === "string" ? data.error : GENERIC_ERROR };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const { res, data } = await postJson("auth-refresh", { refreshToken });
    if (!res.ok || typeof data?.accessToken !== "string" || typeof data?.refreshToken !== "string") return null;
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch {
    return null;
  }
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    await postJson("auth-logout", { refreshToken });
  } catch {
    // Fire-and-forget — the cookies are cleared regardless of whether this call lands.
  }
}

export interface RemoteUser {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  fullName: string;
  companyName: string;
  websiteUrl: string;
}

export async function fetchCurrentUser(accessToken: string): Promise<RemoteUser | null> {
  try {
    const res = await fetch(`${FUNCTIONS_URL}/auth-user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.user ?? null;
  } catch {
    return null;
  }
}
