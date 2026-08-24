import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function userRecord(
  overrides: Partial<AuthenticatedUser> = {}
): AuthenticatedUser {
  return {
    id: 1,
    email: "redaccion@example.com",
    passwordHash: "scrypt$32768$8$1$AAAA$AAAA",
    name: "Redacción",
    role: "user",
    isActive: true,
    mustChangePassword: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function contextFor(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: () => undefined,
      cookie: () => undefined,
    } as unknown as TrpcContext["res"],
  };
}

describe("procedure guards", () => {
  it("keeps the user management router away from non-admin accounts", async () => {
    const caller = appRouter.createCaller(contextFor(userRecord()));

    await expect(caller.users.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(
      caller.users.create({
        email: "nuevo@example.com",
        name: "Nuevo",
        role: "user",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      caller.users.setActive({ id: 2, isActive: false })
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(caller.users.resetPassword({ id: 2 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("keeps the user management router away from anonymous callers", async () => {
    const caller = appRouter.createCaller(contextFor(null));

    await expect(caller.users.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects anonymous access to the working data", async () => {
    const caller = appRouter.createCaller(contextFor(null));

    await expect(caller.clients.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(caller.copyHistory.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(caller.trendReferences.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(caller.auditRules.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("stops an admin from locking themselves out", async () => {
    const admin = userRecord({
      id: 7,
      role: "admin",
      email: "admin@example.com",
    });
    const caller = appRouter.createCaller(contextFor(admin));

    await expect(
      caller.users.setActive({ id: 7, isActive: false })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("stops an admin from changing their own role", async () => {
    const admin = userRecord({
      id: 7,
      role: "admin",
      email: "admin@example.com",
    });
    const caller = appRouter.createCaller(contextFor(admin));

    await expect(
      caller.users.setRole({ id: 7, role: "user" })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("keeps role changes away from non-admin accounts", async () => {
    const caller = appRouter.createCaller(contextFor(userRecord()));

    await expect(
      caller.users.setRole({ id: 2, role: "admin" })
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("never returns the password digest from auth.me", async () => {
    const caller = appRouter.createCaller(contextFor(userRecord()));

    const me = await caller.auth.me();

    expect(me).not.toBeNull();
    expect(me).not.toHaveProperty("passwordHash");
    expect(me?.email).toBe("redaccion@example.com");
  });

  it("reports no session for an anonymous caller", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.auth.me()).resolves.toBeNull();
  });
});
