import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

/**
 * Cost parameters are stored alongside every digest, so these can be raised
 * later without invalidating passwords hashed under the old settings.
 */
const DEFAULTS = { N: 2 ** 15, r: 8, p: 1 };
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

// scrypt needs roughly 128 * N * r bytes; Node's default cap is below that for
// N = 32768, so raise it explicitly rather than letting the call fail.
const maxmemFor = (N: number, r: number) => 256 * N * r;

/** Encoded as `scrypt$N$r$p$salt$hash`, both binary parts in base64url. */
export async function hashPassword(password: string): Promise<string> {
  const { N, r, p } = DEFAULTS;
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, {
    N,
    r,
    p,
    maxmem: maxmemFor(N, r),
  });
  return ["scrypt", N, r, p, salt.toString("base64url"), derived.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, rawN, rawR, rawP, rawSalt, rawHash] = parts;
  const N = Number(rawN);
  const r = Number(rawR);
  const p = Number(rawP);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  let expected: Buffer;
  let salt: Buffer;
  try {
    expected = Buffer.from(rawHash, "base64url");
    salt = Buffer.from(rawSalt, "base64url");
  } catch {
    return false;
  }
  if (expected.length === 0 || salt.length === 0) return false;

  // Reject impossible cost parameters up front. Doing it here rather than
  // catching scrypt's error keeps genuine failures — running out of memory,
  // for instance — from being reported as a wrong password.
  const validCost =
    N > 1 && (N & (N - 1)) === 0 && r > 0 && p > 0 && N < 2 ** 24 && r < 1024 && p < 1024;
  if (!validCost) return false;

  const derived: Buffer = await scrypt(password.normalize("NFKC"), salt, expected.length, {
    N,
    r,
    p,
    maxmem: maxmemFor(N, r),
  });

  // Lengths always match here, but timingSafeEqual throws if they ever differ.
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

const TEMP_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Temporary password an admin hands over out of band. Avoids look-alike glyphs. */
export function generateTemporaryPassword(length = 14): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += TEMP_ALPHABET[bytes[i] % TEMP_ALPHABET.length];
  }
  return out;
}
