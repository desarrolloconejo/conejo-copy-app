import type { CookieOptions, Request } from "express";

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

/**
 * `sameSite: "lax"` keeps the cookie on same-site navigations, which is all a
 * standalone deployment needs, and — unlike "none" — it does not require the
 * Secure attribute. That is what lets the session work over plain HTTP in
 * development and on a server that does not terminate TLS yet.
 *
 * Once a TLS-terminating proxy sits in front, `secure` turns itself on: Express
 * reports https directly or through x-forwarded-proto with "trust proxy" set.
 */
export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(req),
  };
}
