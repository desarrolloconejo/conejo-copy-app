import mysql from "mysql2/promise";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for the router persistence test.");

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const stamp = `qa-${Date.now()}`;
let clientId: number | undefined;
let trendReferenceId: number | undefined;

try {
  const [users] = await connection.query<any[]>("SELECT * FROM users ORDER BY id ASC LIMIT 1");
  const user = users[0];
  if (!user?.id) throw new Error("No authenticated owner exists for the persistence test.");

  const ctx: TrpcContext = {
    user: {
      id: user.id,
      openId: user.openId,
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      role: user.role,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      lastSignedIn: new Date(user.lastSignedIn),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
  const caller = appRouter.createCaller(ctx);

  const dailyClients = await caller.clients.list();
  const expectedClients = ["Mimesa", "Papelon", "Dulfit", "Gella"];
  if (!expectedClients.every((name) => dailyClients.some((client) => client.name === name))) {
    throw new Error("The authenticated client selector is missing one or more requested clients.");
  }

  clientId = await caller.clients.create({ name: `${stamp}-cliente`, sector: "QA" });
  await caller.auditRules.create({
    clientId,
    label: `${stamp}-regla`,
    maxSpokenWords: 16,
    maxOverlayWords: 8,
    requireProof: true,
    preambles: "hola",
    tiredPhrases: "secreto",
    tensionTerms: "cambia",
  });
  const storedRules = await caller.auditRules.list();
  const expandedRule = storedRules.find((rule) => rule.clientId === clientId);
  if (!expandedRule || expandedRule.maxSpokenWords !== 16 || expandedRule.maxOverlayWords !== 8 || !expandedRule.requireProof) {
    throw new Error("The authenticated rule flow did not persist the extended limits as expected.");
  }
  const copyRecordId = await caller.copyHistory.create({
    clientId,
    objective: "Guardados",
    platform: "Instagram Reels",
    audience: "Audiencia QA",
    tension: "Tensión QA",
    spoken: "Hook QA con prueba",
    overlay: "Hook QA",
    proof: "Prueba QA",
    firstFrame: "Fotograma QA",
    cta: "Guardar",
    auditScore: 82,
    primaryMetric: "Guardados / reproducciones",
    status: "draft",
  });
  await caller.copyHistory.saveResult({
    copyRecordId,
    impressions: 1000,
    threeSecondViews: 650,
    saves: 80,
    shares: 20,
    clicks: 14,
    conversions: 3,
    learning: "La prueba confirma la relación ficha-resultado.",
  });

  const history = await caller.copyHistory.list();
  const record = history.find((item) => item.record.id === copyRecordId);
  if (!record || record.record.status !== "analyzed" || record.client.id !== clientId || record.result?.impressions !== 1000 || record.result?.threeSecondViews !== 650) {
    throw new Error("The protected router did not persist the expected linked record and result.");
  }

  trendReferenceId = await caller.trendReferences.create({
    spoken: "La referencia QA abre con una tensión concreta",
    insertTitle: "Prueba primero",
    platform: "TikTok",
    territory: "B",
    sourceUrl: "https://example.com/qa-reference",
    insight: "La escena demuestra el resultado antes de explicar la promesa.",
    tags: "prueba, qa",
  });
  const references = await caller.trendReferences.list();
  const reference = references.find((item) => item.id === trendReferenceId);
  if (!reference || reference.spoken !== "La referencia QA abre con una tensión concreta" || reference.territory !== "B" || reference.tags !== "prueba, qa") {
    throw new Error("The authenticated trend reference flow did not persist the expected record.");
  }

  console.log("Router persistence test passed: clients, rules, copy results and trend references verified.");
} finally {
  if (trendReferenceId) await connection.query("DELETE FROM trendReferences WHERE id = ?", [trendReferenceId]);
  if (clientId) await connection.query("DELETE FROM clients WHERE id = ?", [clientId]);
  await connection.end();
}

process.exit(0);
