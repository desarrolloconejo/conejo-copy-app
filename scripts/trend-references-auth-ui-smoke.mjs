import mysql from "mysql2/promise";
import puppeteer from "puppeteer-core";
import { sdk } from "../server/_core/sdk.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for the authenticated browser smoke test.");

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const browser = await puppeteer.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const stamp = `QA tendencia ${Date.now()}`;
let ownerId;

try {
  const [users] = await connection.query("SELECT * FROM users ORDER BY id ASC LIMIT 1");
  const user = users[0];
  if (!user?.id || !user?.openId) throw new Error("No authenticated owner exists for the trend-reference browser test.");
  ownerId = user.id;

  const token = await sdk.createSessionToken(user.openId, { name: user.name || "QA user" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setCookie({ name: "app_session_id", value: token, url: "http://127.0.0.1:3000/" });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle0", timeout: 30000 });

  const libraryControl = await page.$('[aria-controls="biblioteca-content"]');
  if (!libraryControl) throw new Error("No se encontró Biblioteca.");
  await libraryControl.click();
  await page.waitForFunction(() => !document.getElementById("biblioteca-content")?.hasAttribute("hidden"));

  const panel = await page.$('[aria-label="Referencias de tendencia"]');
  if (!panel) throw new Error("No se encontró el panel de referencias.");
  const hook = await panel.$('textarea[placeholder*="apertura"]');
  const insight = await panel.$('textarea[placeholder*="contraste"]');
  const insertTitle = await panel.$('input[placeholder*="núcleo"]');
  const tags = await panel.$('input[placeholder*="antes/después"]');
  if (!hook || !insight || !insertTitle || !tags) throw new Error("Faltan campos de carga de referencias.");
  await hook.type(`${stamp}: la demostración llega primero`);
  await insight.type("La prueba aparece antes de explicar la promesa.");
  await insertTitle.type("Prueba antes");
  await tags.type("qa, prueba");
  const selects = await panel.$$("select");
  await selects[0].select("TikTok");
  await selects[1].select("B");
  await panel.evaluate(element => [...element.querySelectorAll("button")].find(button => button.textContent?.includes("Guardar referencia"))?.click());
  await page.waitForFunction((text) => document.body.textContent?.includes(text), {}, stamp);

  const bankFilters = await panel.$$("select");
  if (bankFilters.length < 4) throw new Error("Faltan los filtros del banco de referencias.");
  await bankFilters[2].select("YouTube Shorts");
  await page.waitForFunction((text) => !document.querySelector('[aria-label="Referencias de tendencia"]')?.textContent?.includes(text), {}, stamp);
  await bankFilters[2].select("TikTok");
  await bankFilters[3].select("C");
  await page.waitForFunction((text) => !document.querySelector('[aria-label="Referencias de tendencia"]')?.textContent?.includes(text), {}, stamp);
  await bankFilters[3].select("B");
  await page.waitForFunction((text) => document.querySelector('[aria-label="Referencias de tendencia"]')?.textContent?.includes(text), {}, stamp);

  const search = await panel.$('input[placeholder*="Buscar por hook"]');
  if (!search) throw new Error("No se encontró la búsqueda de referencias.");
  await search.type(stamp);
  await page.waitForFunction((text) => document.querySelector('[aria-label="Referencias de tendencia"]')?.textContent?.includes(text), {}, stamp);
  await panel.evaluate(element => [...element.querySelectorAll("button")].find(button => button.textContent?.includes("Usar como punto de partida"))?.click());
  await page.waitForFunction((text) => {
    const field = [...document.querySelectorAll("#canvas label")].find(label => label.textContent?.includes("Hook hablado"))?.querySelector("textarea");
    const insert = [...document.querySelectorAll("#canvas label")].find(label => label.textContent?.includes("Insert-Titulo"))?.querySelector("input");
    return field?.value.includes(text) && insert?.value === "Prueba antes";
  }, {}, stamp);

  console.log("Authenticated trend-reference UI smoke passed: create, search and Canvas reuse verified.");
} finally {
  if (ownerId) await connection.query("DELETE FROM trendReferences WHERE ownerId = ? AND spoken LIKE ?", [ownerId, `${stamp}%`]);
  await browser.close();
  await connection.end();
}

process.exit(0);
