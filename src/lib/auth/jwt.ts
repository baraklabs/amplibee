import { jwtVerify } from "jose";

// Verify-only counterpart to supabase/functions/_shared/jwt.ts — signing only ever happens
// in the edge functions (auth-signin, auth-signup, auth-google, auth-refresh, ...). Next.js
// just needs to check a token it was already handed, so there's no signAccessToken here.
const ISSUER = process.env.JWT_ISSUER ?? "https://oyekool.com";
const AUDIENCE = process.env.JWT_AUDIENCE ?? "oyekool-api";

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set. Generate one with `openssl rand -hex 32`.");
  return new TextEncoder().encode(secret);
}

async function verify(token: string, purpose: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER, audience: AUDIENCE });
    if (payload.purpose !== purpose || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

/** Returns the signed-in user's id (as a string — public.users.id is bigint), or null. */
export function verifyAccessToken(token: string): Promise<string | null> {
  return verify(token, "access");
}

export function verifyTemporaryToken(token: string): Promise<string | null> {
  return verify(token, "verify");
}
