import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:3000";
const browser = await puppeteer.launch({ executablePath: "/usr/bin/chromium", headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });

try {
  const desktop = await browser.newPage();
  await desktop.setViewport({ width: 1280, height: 720 });
  await desktop.goto(baseUrl, { waitUntil: "networkidle0" });
  const desktopMetrics = await desktop.evaluate(() => {
    const section = document.getElementById("fundamento");
    if (!section) throw new Error("Fundamento section not found");
    const style = getComputedStyle(section);
    return { width: Math.round(section.getBoundingClientRect().width), marginLeft: Math.round(parseFloat(style.marginLeft)) };
  });
  assert.equal(desktopMetrics.width, 444, "Fundamento must keep the requested 444 px desktop width");
  assert.equal(desktopMetrics.marginLeft, 312, "Fundamento must keep the requested 312 px desktop offset");

  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 375, height: 812, isMobile: true });
  await mobile.goto(baseUrl, { waitUntil: "networkidle0" });
  const mobileMetrics = await mobile.evaluate(() => {
    const section = document.getElementById("fundamento");
    if (!section) throw new Error("Fundamento section not found");
    const style = getComputedStyle(section);
    return {
      width: Math.round(section.getBoundingClientRect().width),
      marginLeft: Math.round(parseFloat(style.marginLeft)),
      pageOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  assert.equal(mobileMetrics.marginLeft, 0, "Mobile layout must not retain the desktop offset");
  assert.equal(mobileMetrics.pageOverflow, false, "Mobile layout must not create horizontal page overflow");

  console.log(`Fundamento layout check passed: desktop ${desktopMetrics.width}px/${desktopMetrics.marginLeft}px, mobile ${mobileMetrics.width}px/${mobileMetrics.marginLeft}px.`);
} finally {
  await browser.close();
}
