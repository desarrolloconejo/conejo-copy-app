import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createAuditRule,
  createClient,
  createCopyRecord,
  createTrendReference,
  createUser,
  getUserByEmail,
  getUserById,
  listClientsByOwner,
  listCopyHistory,
  listRulesByOwner,
  listTrendReferences,
  listUsers,
  normalizeEmail,
  setUserActive,
  setUserPassword,
  setUserRole,
  touchLastSignedIn,
  upsertCopyResult,
} from "./db";
import { generateTemporaryPassword, hashPassword, verifyPassword } from "./auth/password";
import { recordFailure, recordSuccess, retryAfterMs } from "./auth/rateLimit";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { signSession } from "./_core/session";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

const clientInput = z.object({ name: z.string().trim().min(2).max(120), sector: z.string().trim().min(2).max(120) });
const ruleInput = z.object({
  clientId: z.number().int().positive().optional(),
  sector: z.string().trim().max(120).optional(),
  label: z.string().trim().min(2).max(120),
  maxSpokenWords: z.number().int().min(3).max(30),
  maxOverlayWords: z.number().int().min(2).max(16),
  requireProof: z.boolean(),
  preambles: z.string().trim().max(1200),
  tiredPhrases: z.string().trim().max(1200),
  tensionTerms: z.string().trim().max(1200),
});
const copyInput = z.object({
  clientId: z.number().int().positive(),
  objective: z.string().trim().min(2).max(40),
  platform: z.string().trim().min(2).max(40),
  audience: z.string().trim().min(2).max(5000),
  tension: z.string().trim().min(2).max(5000),
  spoken: z.string().trim().min(2).max(1000),
  overlay: z.string().trim().max(1000),
  proof: z.string().trim().max(5000),
  firstFrame: z.string().trim().max(5000),
  cta: z.string().trim().max(1000),
  auditScore: z.number().int().min(0).max(100),
  primaryMetric: z.string().trim().min(2).max(80),
  status: z.enum(["draft", "published", "analyzed"]),
});
const resultInput = z.object({
  copyRecordId: z.number().int().positive(),
  impressions: z.number().int().min(0),
  threeSecondViews: z.number().int().min(0),
  saves: z.number().int().min(0),
  shares: z.number().int().min(0),
  clicks: z.number().int().min(0),
  conversions: z.number().int().min(0),
  learning: z.string().trim().max(5000).optional(),
});
const trendReferenceInput = z.object({
  spoken: z.string().trim().min(2).max(1000),
  insertTitle: z.string().trim().max(250).optional(),
  platform: z.string().trim().min(2).max(40),
  territory: z.string().trim().min(1).max(60),
  sourceUrl: z.string().trim().url().max(1000).optional(),
  insight: z.string().trim().min(2).max(5000),
  tags: z.string().trim().max(500),
});

const credentialsInput = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(200),
});
const newUserInput = z.object({
  email: z.string().trim().email().max(320),
  name: z.string().trim().min(2).max(160),
  role: z.enum(["user", "admin"]),
});
const passwordChangeInput = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(10, "La contraseña nueva necesita al menos 10 caracteres").max(200),
});

/** Never reveals which half of the pair was wrong. */
const INVALID_CREDENTIALS = "Email o contraseña incorrectos";

/**
 * A well-formed digest that no password matches, used to keep the timing of a
 * missing account close to that of a wrong password.
 */
const DUMMY_HASH =
  "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

/** Strips the digest before a user record ever leaves the server. */
function publicUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => (opts.ctx.user ? publicUser(opts.ctx.user) : null)),
    login: publicProcedure.input(credentialsInput).mutation(async ({ ctx, input }) => {
      const email = normalizeEmail(input.email);
      // Keyed by account and by source address, so neither a single account nor
      // a single origin can be hammered.
      const keys = ["email:" + email, "ip:" + (ctx.req.ip ?? "unknown")];
      const waitMs = Math.max(...keys.map(key => retryAfterMs(key)));
      if (waitMs > 0) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Demasiados intentos. Vuelve a probar en " +
            Math.ceil(waitMs / 1000) +
            " segundos.",
        });
      }

      const user = await getUserByEmail(email);
      const registerFailure = () => {
        keys.forEach(key => recordFailure(key));
        return new TRPCError({ code: "UNAUTHORIZED", message: INVALID_CREDENTIALS });
      };

      if (!user) {
        // Hash anyway so a missing account does not answer faster than a wrong
        // password and become enumerable by timing.
        await verifyPassword(input.password, DUMMY_HASH);
        throw registerFailure();
      }
      if (!(await verifyPassword(input.password, user.passwordHash))) throw registerFailure();
      if (!user.isActive) {
        keys.forEach(key => recordFailure(key));
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Esta cuenta está desactivada. Habla con un administrador.",
        });
      }

      keys.forEach(key => recordSuccess(key));
      await touchLastSignedIn(user.id);

      const token = await signSession({ uid: user.id, name: user.name });
      ctx.res.cookie(COOKIE_NAME, token, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: ENV.sessionTtlMs,
      });

      return publicUser({ ...user, lastSignedIn: new Date() });
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    changePassword: protectedProcedure
      .input(passwordChangeInput)
      .mutation(async ({ ctx, input }) => {
        const current = await getUserById(ctx.user.id);
        if (!current) throw new TRPCError({ code: "UNAUTHORIZED" });
        if (!(await verifyPassword(input.currentPassword, current.passwordHash))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "La contraseña actual no es correcta",
          });
        }
        await setUserPassword(ctx.user.id, await hashPassword(input.newPassword), false);
        return { success: true } as const;
      }),
  }),
  users: router({
    list: adminProcedure.query(() => listUsers()),
    create: adminProcedure.input(newUserInput).mutation(async ({ input }) => {
      const existing = await getUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Ya existe una cuenta con ese email" });
      }
      const temporaryPassword = generateTemporaryPassword();
      const created = await createUser({
        email: input.email,
        name: input.name,
        role: input.role,
        passwordHash: await hashPassword(temporaryPassword),
        mustChangePassword: true,
      });
      // Shown once to the admin: it is never stored in readable form.
      return { user: created ? publicUser(created) : null, temporaryPassword };
    }),
    setRole: adminProcedure
      .input(z.object({ id: z.number().int().positive(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ ctx, input }) => {
        if (input.id === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No puedes cambiar tu propio rol",
          });
        }
        const target = await getUserById(input.id);
        if (!target) throw new TRPCError({ code: "NOT_FOUND" });

        // Losing the last administrator would leave the app manageable only
        // from the server console.
        if (target.role === "admin" && target.isActive && input.role === "user") {
          const admins = (await listUsers()).filter(
            item => item.role === "admin" && item.isActive
          );
          if (admins.length <= 1) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Debe quedar al menos una cuenta de administración activa",
            });
          }
        }

        const updated = await setUserRole(input.id, input.role);
        return updated ? publicUser(updated) : null;
      }),
    setActive: adminProcedure
      .input(z.object({ id: z.number().int().positive(), isActive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (input.id === ctx.user.id && !input.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No puedes desactivar tu propia cuenta",
          });
        }
        const updated = await setUserActive(input.id, input.isActive);
        return updated ? publicUser(updated) : null;
      }),
    resetPassword: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const target = await getUserById(input.id);
        if (!target) throw new TRPCError({ code: "NOT_FOUND" });
        const temporaryPassword = generateTemporaryPassword();
        await setUserPassword(input.id, await hashPassword(temporaryPassword), true);
        return { temporaryPassword };
      }),
  }),
  clients: router({
    list: protectedProcedure.query(({ ctx }) => listClientsByOwner(ctx.user.id)),
    create: protectedProcedure.input(clientInput).mutation(({ ctx, input }) => createClient(ctx.user.id, input.name, input.sector)),
  }),
  auditRules: router({
    list: protectedProcedure.query(({ ctx }) => listRulesByOwner(ctx.user.id)),
    create: protectedProcedure.input(ruleInput).mutation(({ ctx, input }) => createAuditRule(ctx.user.id, input)),
  }),
  copyHistory: router({
    list: protectedProcedure.query(({ ctx }) => listCopyHistory(ctx.user.id)),
    create: protectedProcedure.input(copyInput).mutation(({ ctx, input }) => createCopyRecord(ctx.user.id, input)),
    saveResult: protectedProcedure.input(resultInput).mutation(({ ctx, input }) => {
      const { copyRecordId, ...payload } = input;
      return upsertCopyResult(ctx.user.id, copyRecordId, payload);
    }),
  }),
  trendReferences: router({
    list: protectedProcedure.query(({ ctx }) => listTrendReferences(ctx.user.id)),
    create: protectedProcedure.input(trendReferenceInput).mutation(({ ctx, input }) => createTrendReference(ctx.user.id, input)),
  }),
});

export type AppRouter = typeof appRouter;
