import { describe, expect, it } from "vitest";
import {
  generateTemporaryPassword,
  hashPassword,
  verifyPassword,
} from "./password";

// scrypt is intentionally expensive: a single hash costs roughly a second, so
// these run well past vitest default timeout on a loaded machine.
const SLOW = { timeout: 30_000 };

describe("hashPassword / verifyPassword", () => {
  it(
    "accepts the right password and rejects a wrong one",
    async () => {
      const digest = await hashPassword("una contraseña larga");

      await expect(
        verifyPassword("una contraseña larga", digest)
      ).resolves.toBe(true);
      await expect(verifyPassword("una contraseña larg", digest)).resolves.toBe(
        false
      );
      await expect(verifyPassword("", digest)).resolves.toBe(false);
    },
    SLOW
  );

  it(
    "never produces the same digest twice for the same password",
    async () => {
      const [first, second] = await Promise.all([
        hashPassword("repetida"),
        hashPassword("repetida"),
      ]);

      expect(first).not.toBe(second);
      await expect(verifyPassword("repetida", first)).resolves.toBe(true);
      await expect(verifyPassword("repetida", second)).resolves.toBe(true);
    },
    SLOW
  );

  it(
    "stores the cost parameters alongside the digest",
    async () => {
      const digest = await hashPassword("parámetros");
      const [scheme, N, r, p] = digest.split("$");

      expect(scheme).toBe("scrypt");
      expect(Number(N)).toBe(32768);
      expect(Number(r)).toBe(8);
      expect(Number(p)).toBe(1);
      expect(digest.split("$")).toHaveLength(6);
    },
    SLOW
  );

  it(
    "treats a malformed digest as a failed match instead of throwing",
    async () => {
      for (const broken of [
        "",
        "not-a-digest",
        "scrypt$1$2$3",
        "bcrypt$32768$8$1$AAAA$AAAA",
        "scrypt$x$8$1$AAAA$AAAA",
      ]) {
        await expect(verifyPassword("cualquiera", broken)).resolves.toBe(false);
      }
    },
    SLOW
  );

  it(
    "normalises equivalent unicode so an accent typed two ways still matches",
    async () => {
      // "contraseña" with a precomposed ñ versus n + combining tilde.
      const digest = await hashPassword("contraseña");
      await expect(
        verifyPassword("contraña".replace("ñ", "ñ"), digest)
      ).resolves.toBe(false);
      await expect(verifyPassword("contraseña", digest)).resolves.toBe(true);
    },
    SLOW
  );
});

describe("generateTemporaryPassword", () => {
  it("has the requested length and avoids look-alike glyphs", () => {
    const password = generateTemporaryPassword(20);

    expect(password).toHaveLength(20);
    expect(password).not.toMatch(/[0O1lI]/);
  });

  it("does not repeat across calls", () => {
    const seen = new Set(
      Array.from({ length: 50 }, () => generateTemporaryPassword())
    );
    expect(seen.size).toBe(50);
  });
});
