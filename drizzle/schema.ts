import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Login identifier. Stored lowercased so lookups are case-insensitive. */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Encoded scrypt digest. See server/auth/password.ts for the format. */
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Deactivated accounts keep their data but cannot sign in. */
  isActive: boolean("isActive").notNull().default(true),
  /** Set when an admin issues a temporary password. */
  mustChangePassword: boolean("mustChangePassword").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  /** Null until the first successful sign-in. */
  lastSignedIn: timestamp("lastSignedIn"),
});

export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  sector: varchar("sector", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditRules = mysqlTable("auditRules", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: int("clientId").references(() => clients.id, { onDelete: "cascade" }),
  sector: varchar("sector", { length: 120 }),
  label: varchar("label", { length: 120 }).notNull(),
  maxSpokenWords: int("maxSpokenWords").notNull().default(12),
  maxOverlayWords: int("maxOverlayWords").notNull().default(6),
  requireProof: boolean("requireProof").notNull().default(true),
  preambles: text("preambles").notNull(),
  tiredPhrases: text("tiredPhrases").notNull(),
  tensionTerms: text("tensionTerms").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const copyStatus = ["draft", "published", "analyzed"] as const;

export const copyRecords = mysqlTable("copyRecords", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: int("clientId").notNull().references(() => clients.id, { onDelete: "cascade" }),
  objective: varchar("objective", { length: 40 }).notNull(),
  platform: varchar("platform", { length: 40 }).notNull(),
  audience: text("audience").notNull(),
  tension: text("tension").notNull(),
  spoken: text("spoken").notNull(),
  overlay: text("overlay").notNull(),
  proof: text("proof").notNull(),
  firstFrame: text("firstFrame").notNull(),
  cta: text("cta").notNull(),
  auditScore: int("auditScore").notNull(),
  primaryMetric: varchar("primaryMetric", { length: 80 }).notNull(),
  status: mysqlEnum("status", copyStatus).notNull().default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const copyResults = mysqlTable("copyResults", {
  id: int("id").autoincrement().primaryKey(),
  copyRecordId: int("copyRecordId").notNull().unique().references(() => copyRecords.id, { onDelete: "cascade" }),
  impressions: int("impressions").notNull().default(0),
  threeSecondViews: int("threeSecondViews").notNull().default(0),
  saves: int("saves").notNull().default(0),
  shares: int("shares").notNull().default(0),
  clicks: int("clicks").notNull().default(0),
  conversions: int("conversions").notNull().default(0),
  learning: text("learning"),
  observedAt: timestamp("observedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const trendReferences = mysqlTable("trendReferences", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  spoken: text("spoken").notNull(),
  insertTitle: varchar("insertTitle", { length: 250 }),
  platform: varchar("platform", { length: 40 }).notNull(),
  territory: varchar("territory", { length: 60 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 1000 }),
  insight: text("insight").notNull(),
  tags: varchar("tags", { length: 500 }).notNull().default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
