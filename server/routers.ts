import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import {
  createAuditRule,
  createClient,
  createCopyRecord,
  listClientsByOwner,
  listCopyHistory,
  listRulesByOwner,
  listTrendReferences,
  upsertCopyResult,
  createTrendReference,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

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

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
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
