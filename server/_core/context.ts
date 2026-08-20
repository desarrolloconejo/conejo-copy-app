import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserById } from "../db";
import { readSessionToken, verifySession } from "./session";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const session = await verifySession(readSessionToken(opts.req));
    if (session) {
      const found = await getUserById(session.uid);
      // A deactivated account keeps its data but loses access immediately,
      // without waiting for the token to expire.
      if (found && found.isActive) user = found;
    }
  } catch (error) {
    // Authentication is optional for public procedures; a database hiccup
    // must not turn every request into a 500.
    console.warn("[Auth] Could not resolve session:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
