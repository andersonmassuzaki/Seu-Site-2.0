import { chromium } from "playwright";
const previewPath = process.argv[2];
const outBase = process.argv[3] || "/tmp/shot";
if (!previewPath) {
  console.error("usage: node scripts/shot.mjs <preview.html> [out-base]");
  process.exit(1);
}
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto("file://" + previewPath, { waitUntil: "load" });
await page.evaluate(() => document.fonts && document.fonts.ready ? document.fonts.ready : null).catch(() => {});
await page.waitForTimeout(1800);
await page.screenshot({ path: `${outBase}-full.png`, fullPage: true });
await page.screenshot({ path: `${outBase}-fold.png`, fullPage: false });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
await page.screenshot({ path: `${outBase}-mobile.png`, fullPage: true });
await browser.close();
console.log("ok:", outBase);
