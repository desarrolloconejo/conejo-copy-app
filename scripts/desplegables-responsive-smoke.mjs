import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  const cases = [
    { name: "desktop", width: 1280, height: 720 },
    { name: "mobile", width: 375, height: 812 },
  ];

  for (const viewport of cases) {
    await page.setViewport({ width: viewport.width, height: viewport.height });
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluate(() => document.getElementById("fundamento")?.scrollIntoView());
    const control = await page.$('[aria-controls="fundamento-content"]');
    if (!control) throw new Error("No se encontró el control de Fundamento.");
    await control.click();
    await page.waitForFunction(() => !document.getElementById("fundamento-content")?.hasAttribute("hidden"));

    const overflow = await page.evaluate(() => ({
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      elements: [...document.querySelectorAll("*")]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { tag: element.tagName, id: element.id, className: element.className, right: Math.round(rect.right), width: Math.round(rect.width) };
        })
        .filter((item) => item.right > window.innerWidth + 2 || item.width > window.innerWidth + 2)
        .slice(0, 8),
    }));
    if (overflow.hasOverflow) throw new Error(`Fundamento tiene desbordamiento horizontal en ${viewport.name}: ${JSON.stringify(overflow.elements)}`);

    await page.screenshot({ path: `/tmp/conejo-desplegables-${viewport.name}.png`, fullPage: false });
  }

  console.log("Responsive collapsibles test passed: Fundamento abierto sin desbordes en escritorio y móvil.");
} finally {
  await browser.close();
}
