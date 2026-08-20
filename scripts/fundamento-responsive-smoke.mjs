import assert from "node:assert/strict";
import fs from "node:fs/promises";
import puppeteer from "puppeteer-core";

const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:3000";
const outputDirectory = "/tmp/conejo-fundamento-qa";
const cases = [
  { name: "desktop", width: 1280, height: 900, minWidth: 800 },
  { name: "tablet", width: 768, height: 1024, minWidth: 600 },
  { name: "mobile", width: 375, height: 812, maxWidth: 335 },
];

await fs.rm(outputDirectory, { recursive: true, force: true });
await fs.mkdir(outputDirectory, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  for (const testCase of cases) {
    const page = await browser.newPage();
    await page.setViewport({ width: testCase.width, height: testCase.height, isMobile: testCase.name === "mobile" });
    await page.goto(baseUrl, { waitUntil: "networkidle0" });
    const result = await page.evaluate(() => {
      const section = document.getElementById("fundamento");
      if (!section) throw new Error("Fundamento section not found");
      const style = getComputedStyle(section);
      const text = section.textContent ?? "";
      return {
        width: Math.round(section.getBoundingClientRect().width),
        marginLeft: Math.round(parseFloat(style.marginLeft)),
        pageOverflow: document.documentElement.scrollWidth > window.innerWidth,
        articleCount: section.querySelectorAll("article").length,
        includesPrinciples: text.includes("Cinco principios") && text.includes("Recompensa"),
        includesLayers: text.includes("Las tres capas") && text.includes("Test de las dos privaciones"),
      };
    });

    assert.equal(result.marginLeft, 0, `${testCase.name}: Fundamento must remain aligned to the reading column`);
    assert.equal(result.pageOverflow, false, `${testCase.name}: Fundamento must not create horizontal page overflow`);
    assert.equal(result.includesPrinciples, true, `${testCase.name}: The five principles must remain available`);
    assert.equal(result.includesLayers, true, `${testCase.name}: The three-layer guide must remain available`);
    assert.ok(result.articleCount >= 9, `${testCase.name}: The decision cards must render`);
    if (testCase.minWidth) assert.ok(result.width >= testCase.minWidth, `${testCase.name}: Fundamento should use the available column width`);
    if (testCase.maxWidth) assert.ok(result.width <= testCase.maxWidth, `${testCase.name}: Fundamento should fit the mobile content width`);

    const section = await page.$("#fundamento");
    if (!section) throw new Error("Fundamento section not found for screenshot");
    await section.screenshot({ path: `${outputDirectory}/fundamento-${testCase.name}.png` });
    await page.close();
    console.log(`${testCase.name}: ${result.width}px, ${result.articleCount} cards, no horizontal overflow.`);
  }
} finally {
  await browser.close();
}
