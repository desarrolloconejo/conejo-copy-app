import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { auditRules, clients, copyRecords, copyResults, trendReferences, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available: check DATABASE_URL");
  return db;
}

/** Emails are compared lowercased so sign-in is not case-sensitive. */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export type NewUser = {
  email: string;
  name: string;
  passwordHash: string;
  role?: "user" | "admin";
  mustChangePassword?: boolean;
};

export async function getUserById(id: number) {
  const db = await requireDb();
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function getUserByEmail(email: string) {
  const db = await requireDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);
  return rows[0];
}

export async function countUsers() {
  const db = await requireDb();
  const rows = await db.select({ id: users.id }).from(users);
  return rows.length;
}

export async function createUser(input: NewUser) {
  const db = await requireDb();
  await db.insert(users).values({
    email: normalizeEmail(input.email),
    name: input.name,
    passwordHash: input.passwordHash,
    role: input.role ?? "user",
    mustChangePassword: input.mustChangePassword ?? false,
  });
  return getUserByEmail(input.email);
}

export async function listUsers() {
  const db = await requireDb();
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      mustChangePassword: users.mustChangePassword,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .orderBy(asc(users.id));
}

export async function setUserActive(id: number, isActive: boolean) {
  const db = await requireDb();
  await db.update(users).set({ isActive }).where(eq(users.id, id));
  return getUserById(id);
}

export async function setUserRole(id: number, role: "user" | "admin") {
  const db = await requireDb();
  await db.update(users).set({ role }).where(eq(users.id, id));
  return getUserById(id);
}

export async function setUserPassword(
  id: number,
  passwordHash: string,
  mustChangePassword: boolean
) {
  const db = await requireDb();
  await db.update(users).set({ passwordHash, mustChangePassword }).where(eq(users.id, id));
  return getUserById(id);
}

export async function touchLastSignedIn(id: number) {
  const db = await requireDb();
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

export type CopyRecordPayload = {
  clientId: number;
  objective: string;
  platform: string;
  audience: string;
  tension: string;
  spoken: string;
  overlay: string;
  proof: string;
  firstFrame: string;
  cta: string;
  auditScore: number;
  primaryMetric: string;
  status: "draft" | "published" | "analyzed";
};

export type ResultPayload = {
  impressions: number;
  threeSecondViews: number;
  saves: number;
  shares: number;
  clicks: number;
  conversions: number;
  learning?: string;
};

export type TrendReferencePayload = {
  spoken: string;
  insertTitle?: string;
  platform: string;
  territory: string;
  sourceUrl?: string;
  insight: string;
  tags: string;
};

export async function listClientsByOwner(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.ownerId, ownerId)).orderBy(desc(clients.updatedAt));
}

export async function createClient(ownerId: number, name: string, sector: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(clients).values({ ownerId, name, sector });
  return Number(result[0].insertId);
}

export async function listRulesByOwner(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditRules).where(eq(auditRules.ownerId, ownerId)).orderBy(desc(auditRules.updatedAt));
}

export async function createAuditRule(ownerId: number, input: {
  clientId?: number;
  sector?: string;
  label: string;
  maxSpokenWords: number;
  maxOverlayWords: number;
  requireProof: boolean;
  preambles: string;
  tiredPhrases: string;
  tensionTerms: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  if (input.clientId) {
    const ownedClient = await db.select({ id: clients.id }).from(clients).where(and(eq(clients.id, input.clientId), eq(clients.ownerId, ownerId))).limit(1);
    if (!ownedClient[0]) throw new Error("Client not found");
  }
  const result = await db.insert(auditRules).values({ ownerId, ...input });
  return Number(result[0].insertId);
}

export async function createCopyRecord(ownerId: number, payload: CopyRecordPayload) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const ownedClient = await db.select({ id: clients.id }).from(clients).where(and(eq(clients.id, payload.clientId), eq(clients.ownerId, ownerId))).limit(1);
  if (!ownedClient[0]) throw new Error("Client not found");
  const result = await db.insert(copyRecords).values({ ownerId, ...payload });
  return Number(result[0].insertId);
}

export async function listCopyHistory(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    record: copyRecords,
    client: { id: clients.id, name: clients.name, sector: clients.sector },
    result: copyResults,
  }).from(copyRecords)
    .innerJoin(clients, eq(copyRecords.clientId, clients.id))
    .leftJoin(copyResults, eq(copyResults.copyRecordId, copyRecords.id))
    .where(eq(copyRecords.ownerId, ownerId))
    .orderBy(desc(copyRecords.updatedAt));
}

export async function upsertCopyResult(ownerId: number, copyRecordId: number, payload: ResultPayload) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const ownedRecord = await db.select({ id: copyRecords.id }).from(copyRecords).where(and(eq(copyRecords.id, copyRecordId), eq(copyRecords.ownerId, ownerId))).limit(1);
  if (!ownedRecord[0]) throw new Error("Copy record not found");
  await db.insert(copyResults).values({ copyRecordId, ...payload }).onDuplicateKeyUpdate({
    set: { ...payload, observedAt: new Date() },
  });
  await db.update(copyRecords).set({ status: "analyzed" }).where(eq(copyRecords.id, copyRecordId));
}

export async function listTrendReferences(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trendReferences).where(eq(trendReferences.ownerId, ownerId)).orderBy(desc(trendReferences.updatedAt));
}

export async function createTrendReference(ownerId: number, payload: TrendReferencePayload) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(trendReferences).values({ ownerId, ...payload });
  return Number(result[0].insertId);
}
