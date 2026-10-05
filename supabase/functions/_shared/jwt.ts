import { SignJWT, jwtVerify } from "https://esm.sh/jose@5";

const ACCESS_TOKEN_TTL = "30m";
const PENDING_TOKEN_TTL = "30m";

const ISSUER = Deno.env.get("JWT_ISSUER") ?? "https://oyekool.com";
const AUDIENCE = Deno.env.get("JWT_AUDIENCE") ?? "oyekool-api";

function secretKey(): Uint8Array {
  const secret = Deno.env.get("JWT_SECRET");
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return new TextEncoder().encode(secret);
}

function sign(userId: number | string, purpose: string, ttl: string): Promise<string> {
  return new SignJWT({ purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secretKey());
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

export function signAccessToken(userId: number | string): Promise<string> {
  return sign(userId, "access", ACCESS_TOKEN_TTL);
}

export function verifyAccessToken(token: string): Promise<string | null> {
  return verify(token, "access");
}

export function signTemporaryToken(userId: number | string): Promise<string> {
  return sign(userId, "verify", PENDING_TOKEN_TTL);
}

export function verifyTemporaryToken(token: string): Promise<string | null> {
  return verify(token, "verify");
}
