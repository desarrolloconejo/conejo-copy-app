import { COOKIE_NAME } from "@shared/const";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

export type SessionPayload = { uid: number; name: string };

function getSessionSecret(): Uint8Array {
  const secret = ENV.cookieSecret;
  if (!secret) {
    // Should be unreachable: env.ts refuses to start without it. Kept so a
    // misconfigured test harness fails loudly instead of signing with nothing.
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(
  payload: SessionPayload,
  options: { expiresInMs?: number } = {}
): Promise<string> {
  const expiresInMs = options.expiresInMs ?? ENV.sessionTtlMs;
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);

  return new SignJWT({ uid: payload.uid, name: payload.name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expirationSeconds)
    .sign(getSessionSecret());
}

export async function verifySession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });
    const { uid, name } = payload as Record<string, unknown>;
    if (typeof uid !== "number" || !Number.isInteger(uid) || uid <= 0) return null;
    return { uid, name: typeof name === "string" ? name : "" };
  } catch {
    // Expired, tampered with, or signed under a rotated secret.
    return null;
  }
}

/** Reads the session token from the cookie header. */
export function readSessionToken(req: Request): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() !== COOKIE_NAME) continue;
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return undefined;
}
