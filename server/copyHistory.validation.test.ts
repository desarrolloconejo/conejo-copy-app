import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function authenticatedContext(): TrpcContext {
  return {
    user: {
      id: 1,
      name: "Copy Check User",
      email: "copy@example.com",
      passwordHash: "scrypt$32768$8$1$AAAA$AAAA",
      isActive: true,
      mustChangePassword: false,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("copy-history router validation", () => {
  it("rejects a copy record without a valid client id before writing data", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    await expect(caller.copyHistory.create({
      clientId: 0,
      objective: "Guardados",
      platform: "Instagram Reels",
      audience: "Audiencia de prueba",
      tension: "Tensión de prueba",
      spoken: "Un hook con prueba",
      overlay: "Hook breve",
      proof: "Una prueba visible",
      firstFrame: "Un primer plano",
      cta: "Guardar",
      auditScore: 80,
      primaryMetric: "Guardados / reproducciones",
      status: "draft",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects an audit rule outside its supported word limits", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    await expect(caller.auditRules.create({
      label: "Regla inválida",
      maxSpokenWords: 2,
      maxOverlayWords: 6,
      requireProof: true,
      preambles: "hola",
      tiredPhrases: "espera al final",
      tensionTerms: "diferencia",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects incomplete or invalid trend references before writing data", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    await expect(caller.trendReferences.create({
      spoken: "Hook observado",
      platform: "TikTok",
      territory: "Curiosidad",
      sourceUrl: "no-es-un-enlace",
      insight: "x",
      tags: "tendencia",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
