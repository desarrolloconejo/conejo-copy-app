/**
 * Authenticated smoke test.
 *
 * Signs in through the real login form and checks that the working surface
 * renders. Replaces the browser scripts written for the Manus sandbox, which
 * assumed a Linux Chromium path, a seeded client list and an OAuth session.
 *
 *   node scripts/smoke.mjs <email> <contraseña> [url]
 *
 * Set CHROME_PATH if Chrome is not in the usual place for your system.
 */
import puppeteer from "puppeteer-core";

const [email, password, baseUrl = "http://localhost:3000"] = process.argv.slice(2);

if (!email || !password) {
  console.error("Uso: node scripts/smoke.mjs <email> <contraseña> [url]");
  process.exit(1);
}

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const checks = [];
const record = (name, detail) => {
  checks.push(`  ✓ ${name}${detail ? " — " + detail : ""}`);
};

let browser;
try {
  let launchError;
  for (const executablePath of CANDIDATES) {
    try {
      browser = await puppeteer.launch({
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-gpu"],
      });
      break;
    } catch (error) {
      launchError = error;
    }
  }
  if (!browser) {
    throw new Error(
      "No se encontró Chrome. Indica la ruta con CHROME_PATH. Último error: " + launchError?.message
    );
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const jsErrors = [];
  page.on("pageerror", error => jsErrors.push(String(error)));

  // 1. An anonymous visitor is sent to the login screen.
  await page.goto(baseUrl + "/", { waitUntil: "networkidle0" });
  if (new URL(page.url()).pathname !== "/login") {
    throw new Error("Sin sesión, la raíz debería redirigir a /login");
  }
  record("La raíz exige sesión");

  // 2. Wrong credentials are refused without saying which half failed.
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', password + "-incorrecta");
  await page.click('button[type="submit"]');
  await page.waitForSelector('[role="alert"]', { timeout: 15000 });
  record("Se rechazan credenciales incorrectas");

  // 3. Real credentials get in.
  await page.goto(baseUrl + "/login", { waitUntil: "networkidle0" });
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector("textarea", { timeout: 30000 });
  record("Se entra con credenciales correctas");

  // 4. The session rides in a cookie the page cannot read.
  const cookie = (await page.cookies()).find(item => item.name === "conejo_session");
  if (!cookie) throw new Error("No se emitió la cookie de sesión");
  if (!cookie.httpOnly) throw new Error("La cookie de sesión debería ser httpOnly");
  const storage = await page.evaluate(() => Object.keys(sessionStorage).length);
  if (storage !== 0) throw new Error("sessionStorage debería estar vacío");
  record("Sesión en cookie httpOnly", "sameSite=" + cookie.sameSite);

  // 5. The working surface is there.
  const heading = await page.$eval("h1", element => element.textContent.trim());
  const navLinks = await page.$$eval("nav a", items => items.length);
  if (navLinks < 10) throw new Error("Faltan secciones en la navegación: " + navLinks);
  record("Mesa de producción cargada", navLinks + " secciones · " + heading);

  if (jsErrors.length) throw new Error("Errores JS en la página: " + jsErrors.join(" | "));
  record("Sin errores de JavaScript");

  console.log("Smoke autenticado correcto:\n" + checks.join("\n"));
} catch (error) {
  if (checks.length) console.log(checks.join("\n"));
  console.error("\nSmoke fallido: " + (error instanceof Error ? error.message : error));
  process.exitCode = 1;
} finally {
  await browser?.close();
}
