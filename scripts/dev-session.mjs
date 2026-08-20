/**
 * Sesión de desarrollo local, sin OAuth de Manus.
 *
 * Crea (o actualiza) un usuario en la base de datos y firma un token de sesión
 * con JWT_SECRET, el mismo que verifica server/_core/sdk.ts. El token se entrega
 * al navegador por sessionStorage, que client/src/main.tsx reenvía como
 * cabecera Authorization: la cookie no sirve en http porque se emite con
 * SameSite=None sin Secure.
 *
 * Uso: node scripts/dev-session.mjs
 */
import "dotenv/config";
import { SignJWT } from "jose";
import mysql from "mysql2/promise";

const { DATABASE_URL, JWT_SECRET, VITE_APP_ID, OWNER_OPEN_ID, PORT } = process.env;

for (const [key, value] of Object.entries({ DATABASE_URL, JWT_SECRET, VITE_APP_ID, OWNER_OPEN_ID })) {
  if (!value) {
    console.error(`Falta la variable ${key} en .env`);
    process.exit(1);
  }
}

const openId = OWNER_OPEN_ID;
const name = "Desarrollo local";

const connection = await mysql.createConnection(DATABASE_URL);
await connection.execute(
  `INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn)
   VALUES (?, ?, ?, 'dev', 'admin', NOW())
   ON DUPLICATE KEY UPDATE name = VALUES(name), role = 'admin', lastSignedIn = NOW()`,
  [openId, name, "dev@localhost"]
);
const [rows] = await connection.execute("SELECT id, openId, role FROM users WHERE openId = ?", [openId]);
await connection.end();

const token = await new SignJWT({ openId, appId: VITE_APP_ID, name })
  .setProtectedHeader({ alg: "HS256", typ: "JWT" })
  .setExpirationTime(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30)
  .sign(new TextEncoder().encode(JWT_SECRET));

const port = PORT || 3000;
console.log(`Usuario listo: id=${rows[0].id} openId=${rows[0].openId} role=${rows[0].role}\n`);
console.log(`Abre http://localhost:${port}/ y pega esto en la consola del navegador:\n`);
console.log(`sessionStorage.setItem('manus-cookie', 'app_session_id=${token}'); location.reload();`);
