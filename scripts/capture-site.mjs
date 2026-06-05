import fs from "node:fs";
import path from "node:path";
import { chromium, devices } from "playwright";
import { readCsv } from "../src/lib/csv.mjs";
import { kitSlug } from "../src/lib/kit.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const force = process.argv.includes("--force");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length) : null;

const outbox = readCsv(path.join(root, "data/outbox.csv"));
const leads = outbox.filter((l) => l.lead_id && l.url);

const browser = await chromium.launch();
let processed = 0;
let skipped = 0;
let failed = 0;

for (const lead of leads) {
  const slug = kitSlug(lead);
  if (only && only !== slug) continue;

  const previewDir = path.join(root, "kits", slug, "preview");
  const shotsDir = path.join(previewDir, "shots");
  const brandPath = path.join(root, "kits", slug, "brand.json");
  const desktopShot = path.join(shotsDir, "desktop.png");

  if (!force && fs.existsSync(desktopShot) && fs.existsSync(brandPath)) {
    skipped += 1;
    continue;
  }

  fs.mkdirSync(shotsDir, { recursive: true });

  try {
    console.log(`-> ${slug} (${lead.url})`);
    const brand = await capture(browser, lead.url, shotsDir);
    fs.writeFileSync(brandPath, `${JSON.stringify(brand, null, 2)}\n`);
    processed += 1;
  } catch (err) {
    console.warn(`   falhou: ${err.message}`);
    failed += 1;
  }
}

await browser.close();
console.log(
  `\nCaptura concluida. processados=${processed} pulados=${skipped} falhas=${failed}`
);

async function capture(browser, url, shotsDir) {
  // Desktop
  const desktopCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
  });
  const desktop = await desktopCtx.newPage();
  await desktop.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await desktop.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await desktop.waitForTimeout(1500);

  await desktop.screenshot({
    path: path.join(shotsDir, "desktop.png"),
    fullPage: false
  });
  const brand = await desktop.evaluate(extractBrandInPage);
  await desktopCtx.close();

  // Mobile
  const mobileCtx = await browser.newContext({ ...devices["iPhone 13"] });
  const mobile = await mobileCtx.newPage();
  await mobile.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await mobile.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await mobile.waitForTimeout(1500);
  await mobile.screenshot({
    path: path.join(shotsDir, "mobile.png"),
    fullPage: false
  });
  await mobileCtx.close();

  brand.captured_at = new Date().toISOString();
  brand.source_url = url;
  return brand;
}

function extractBrandInPage() {
  function parseRgb(str) {
    if (!str) return null;
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(",").map((x) => parseFloat(x.trim()));
    const [r, g, b, a = 1] = parts;
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return { r, g, b, a };
  }
  function isTransparent(c) {
    return !c || c.a === 0;
  }
  function luminance({ r, g, b }) {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function toHex(c) {
    if (!c) return null;
    const h = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
  }
  function score(rgb) {
    if (!rgb) return -1;
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    return max - min; // chroma — privilegia cores saturadas
  }

  const seenColors = new Map();
  function bump(rgb, weight = 1) {
    if (!rgb || rgb.a < 0.5) return;
    const key = `${Math.round(rgb.r / 16)}-${Math.round(rgb.g / 16)}-${Math.round(rgb.b / 16)}`;
    const prev = seenColors.get(key) || { rgb, count: 0 };
    prev.count += weight;
    seenColors.set(key, prev);
  }

  const headerEl =
    document.querySelector("header, nav, .header, #header, [class*='header']") ||
    document.body;
  const bodyStyle = getComputedStyle(document.body);
  const headerStyle = getComputedStyle(headerEl);

  const buttons = Array.from(
    document.querySelectorAll(
      "button, .btn, [class*='button'], a[class*='btn'], a[class*='cta'], input[type='submit']"
    )
  ).slice(0, 30);
  for (const b of buttons) {
    const s = getComputedStyle(b);
    const bg = parseRgb(s.backgroundColor);
    if (bg && !isTransparent(bg)) bump(bg, 3);
  }

  const links = Array.from(document.querySelectorAll("a")).slice(0, 40);
  for (const a of links) {
    const s = getComputedStyle(a);
    const c = parseRgb(s.color);
    if (c) bump(c, 1);
  }

  const headerBg = parseRgb(headerStyle.backgroundColor);
  if (headerBg && !isTransparent(headerBg)) bump(headerBg, 4);

  // top palette ordenada por contagem
  const palette = Array.from(seenColors.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((x) => toHex(x.rgb));

  // primary = cor mais saturada das mais frequentes
  const ranked = Array.from(seenColors.values()).sort(
    (a, b) => b.count - a.count
  );
  const candidates = ranked.slice(0, 6);
  candidates.sort((a, b) => score(b.rgb) - score(a.rgb));
  const primary = candidates[0] ? toHex(candidates[0].rgb) : null;

  // headline
  const h1 = document.querySelector("h1");
  const headline =
    (h1 && h1.innerText.trim()) ||
    document.title ||
    "";

  // logo
  let logo = null;
  const logoImg =
    document.querySelector(
      "header img, nav img, [class*='logo'] img, img[class*='logo'], img[alt*='logo' i]"
    ) || document.querySelector("img");
  if (logoImg && logoImg.src) {
    try {
      logo = new URL(logoImg.src, location.href).href;
    } catch {
      logo = logoImg.src;
    }
  }

  const favicon =
    document.querySelector("link[rel*='icon']")?.href ||
    `${location.origin}/favicon.ico`;

  const description =
    document.querySelector("meta[name='description']")?.content ||
    document.querySelector("meta[property='og:description']")?.content ||
    "";

  const ogImage =
    document.querySelector("meta[property='og:image']")?.content || null;

  return {
    title: document.title || "",
    headline: headline.slice(0, 200),
    description: description.slice(0, 300),
    body_bg: toHex(parseRgb(bodyStyle.backgroundColor)),
    body_color: toHex(parseRgb(bodyStyle.color)),
    header_bg: toHex(headerBg),
    primary,
    palette,
    font_family: bodyStyle.fontFamily,
    heading_font: h1 ? getComputedStyle(h1).fontFamily : bodyStyle.fontFamily,
    logo,
    favicon,
    og_image: ogImage,
    is_dark: (() => {
      const c = parseRgb(bodyStyle.backgroundColor);
      return c ? luminance(c) < 0.4 : false;
    })()
  };
}
