/**
 * Applies pending migrations.
 *
 * Uses drizzle-orm's migrator rather than drizzle-kit: the kit is a development
 * dependency that needs TypeScript and the schema in source form, none of which
 * belongs in a runtime image. This reads the SQL files and the journal that
 * `drizzle-kit generate` already produced.
 *
 *   node dist/migrate.js
 *
 * Run it as a deliberate step, never automatically on boot: a restart should
 * not be able to alter the schema on its own.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "node:path";
import mysql from "mysql2/promise";
import { ENV } from "./_core/env";

/**
 * Bundled to dist/migrate.js, with the SQL copied to dist/drizzle. In
 * development the same file runs from source, where the folder sits at the
 * repository root.
 */
function migrationsFolder(): string {
  const here = import.meta.dirname;
  return process.env.NODE_ENV === "production"
    ? path.resolve(here, "drizzle")
    : path.resolve(here, "..", "drizzle");
}

async function main() {
  const folder = migrationsFolder();
  console.log(`Aplicando migraciones desde ${folder}`);

  // A dedicated connection: the pool the app uses is not up yet.
  const connection = await mysql.createConnection(ENV.databaseUrl);
  try {
    const db = drizzle(connection);
    await migrate(db, { migrationsFolder: folder });
    console.log("Migraciones aplicadas.");
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error(
    "No se pudieron aplicar las migraciones:",
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
