import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { auditRules, clients, copyRecords, copyResults, InsertUser, trendReferences, users } from "../drizzle/schema";
import { ENV } from './_core/env';

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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
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
