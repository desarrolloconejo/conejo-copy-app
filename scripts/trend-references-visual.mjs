import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  for (const viewport of [{ name: "desktop", width: 1280, height: 900 }, { name: "mobile", width: 375, height: 812 }]) {
    await page.setViewport({ width: viewport.width, height: viewport.height });
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluate(() => document.getElementById("biblioteca")?.scrollIntoView());
    const control = await page.$('[aria-controls="biblioteca-content"]');
    if (!control) throw new Error("No se encontró el control de Biblioteca.");
    await control.click();
    await page.waitForFunction(() => !document.getElementById("biblioteca-content")?.hasAttribute("hidden"));
    const panel = await page.$('[aria-label="Referencias de tendencia"]');
    if (!panel) throw new Error("No se encontró la zona de referencias.");
    await panel.screenshot({ path: `/tmp/conejo-trend-references-${viewport.name}.png` });
  }
  console.log("Trend references visual capture passed.");
} finally {
  await browser.close();
}
