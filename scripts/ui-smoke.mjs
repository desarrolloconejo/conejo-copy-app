import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const downloadPath = "/tmp/conejo-copy-check-downloads";
await fs.rm(downloadPath, { recursive: true, force: true });
await fs.mkdir(downloadPath, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForSelector("textarea");

  const hero = await page.$eval("h1", (element) => element.textContent);
  if (!hero?.includes("Un hook es una decisión completa")) throw new Error("La cabina no cargó el encabezado esperado.");

  const updateSignals = await page.evaluate(() => ({
    insertTitle: document.body.textContent?.includes("Insert-Titulo"),
    retentionMap: document.body.textContent?.includes("Mapa de retención"),
    sharedObjective: [...document.querySelectorAll("select option")].some((option) => option.textContent === "Compartidos"),
    newClientControls: document.querySelectorAll('button[aria-label="Añadir cliente"], button[aria-label="Añadir cliente nuevo"]').length,
    objectiveGuide: document.body.textContent?.includes("Elige por el resultado, no por el formato."),
  }));
  if (!updateSignals.insertTitle || !updateSignals.retentionMap || !updateSignals.sharedObjective || updateSignals.newClientControls < 2 || !updateSignals.objectiveGuide) {
    throw new Error("Faltan Insert-Titulo, Compartidos, guía de objetivos, mapa de retención o controles de alta contextual de clientes.");
  }

  const dailyDesk = await page.$eval("#hoy", (element) => element.textContent);
  if (!dailyDesk?.includes("Mesa de producción") || !dailyDesk.includes("Abrir ficha de producción")) throw new Error("La Mesa de producción no se presentó como punto de entrada.");

  const buttonByLabel = async (label) => {
    const clicked = await page.evaluate((target) => {
      const button = [...document.querySelectorAll("button")].find((item) => item.textContent?.trim() === target || item.textContent?.includes(target));
      if (!button) return false;
      button.click();
      return true;
    }, label);
    if (!clicked) throw new Error(`No se encontró el botón: ${label}`);
  };

  await buttonByLabel("Abrir ficha de producción");
  await page.waitForFunction(() => {
    const canvas = document.getElementById("canvas");
    return Boolean(canvas && canvas.getBoundingClientRect().top < window.innerHeight * 0.7);
  }, { timeout: 5000 });

  const explanatoryIds = ["ventana", "fundamento", "territorios", "biblioteca", "visual", "cementerio", "numeros", "protocolo", "fuentes"];
  for (const id of explanatoryIds) {
    const content = await page.$(`#${id}-content`);
    const control = await page.$(`[aria-controls="${id}-content"]`);
    if (!content || !control) throw new Error(`No se encontró el control plegable de ${id}.`);
    if (!(await content.evaluate((element) => element.hasAttribute("hidden")))) throw new Error(`${id} debería estar plegado al cargar.`);
    await page.evaluate((contentId) => document.querySelector(`[aria-controls="${contentId}"]`)?.click(), `${id}-content`);
    await page.waitForFunction((contentId) => !document.getElementById(contentId)?.hasAttribute("hidden"), {}, `${id}-content`);
    await page.evaluate((contentId) => document.querySelector(`[aria-controls="${contentId}"]`)?.click(), `${id}-content`);
    await page.waitForFunction((contentId) => document.getElementById(contentId)?.hasAttribute("hidden"), {}, `${id}-content`);
  }
  const libraryControl = await page.$('[aria-controls="biblioteca-content"]');
  await libraryControl?.click();
  await page.waitForFunction(() => !document.getElementById("biblioteca-content")?.hasAttribute("hidden"));
  const trendPanelSignals = await page.evaluate(() => {
    const panel = document.querySelector('[aria-label="Referencias de tendencia"]');
    return {
      exists: Boolean(panel),
      hookInput: Boolean(panel?.querySelector('textarea[placeholder*="apertura"]')),
      insightInput: Boolean(panel?.querySelector('textarea[placeholder*="contraste"]')),
      sourceInput: Boolean(panel?.querySelector('input[type="url"]')),
      saveButton: panel?.textContent?.includes("Guardar referencia"),
      filters: panel?.querySelectorAll('select').length,
    };
  });
  if (!trendPanelSignals.exists || !trendPanelSignals.hookInput || !trendPanelSignals.insightInput || !trendPanelSignals.sourceInput || !trendPanelSignals.saveButton || (trendPanelSignals.filters ?? 0) < 4) {
    throw new Error("La zona de carga o filtros de referencias de tendencia no está completa.");
  }
  await libraryControl?.click();
  const guideContent = await page.$("#guia-objetivos-contenido");
  const guideControl = await page.$('[aria-controls="guia-objetivos-contenido"]');
  if (!guideContent || !guideControl || !(await guideContent.evaluate((element) => element.hasAttribute("hidden")))) throw new Error("La guía de objetivos debería estar plegada al cargar.");
  await guideControl.click();
  await page.waitForFunction(() => !document.getElementById("guia-objetivos-contenido")?.hasAttribute("hidden"));
  if (await page.$("#canvas-content")) throw new Error("Canvas no debe convertirse en una sección plegable.");

  const textareas = await page.$$("textarea");
  if (!textareas[4]) throw new Error("No se encontró el campo de hook hablado.");
  await textareas[4].click();
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("Control");
  await page.keyboard.type("Hola, este es un hook que debe activar una alerta de preámbulo");
  await buttonByLabel("Auditar hook");
  await page.waitForFunction(() => document.body.textContent?.includes("Preámbulo detectado"), { timeout: 5000 });

  const protocolLink = await page.$("a[href='#historial']");
  await protocolLink?.click();
  await page.waitForSelector("#historial");
  const filterCount = await page.$$eval("#historial select", (elements) => elements.length);
  if (filterCount < 2) throw new Error("Faltan filtros de historial.");

  await buttonByLabel("Cliente");
  await page.waitForSelector("input[placeholder='Nombre del cliente']", { timeout: 5000 });

  const session = await page.target().createCDPSession();
  await session.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath });
  await buttonByLabel("CSV");
  await new Promise((resolve) => setTimeout(resolve, 900));
  const downloads = await fs.readdir(downloadPath);
  if (!downloads.some((file) => file.endsWith(".csv"))) throw new Error("La exportación CSV no generó un archivo.");

  const popupPromise = new Promise((resolve) => browser.once("targetcreated", resolve));
  await buttonByLabel("PDF");
  const popupTarget = await Promise.race([popupPromise, new Promise((_, reject) => setTimeout(() => reject(new Error("La exportación PDF no abrió la vista imprimible.")), 5000))]);
  if (!popupTarget) throw new Error("La exportación PDF no abrió la vista imprimible.");

  console.log("UI smoke test passed: auditor, historial, filtros, CSV y PDF verificados.");
} finally {
  await browser.close();
}
