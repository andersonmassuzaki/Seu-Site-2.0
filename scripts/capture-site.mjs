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

  // ---------- CONTENT SCRAPING ----------
  function abs(url) {
    if (!url) return null;
    try {
      return new URL(url, location.href).href;
    } catch {
      return url;
    }
  }

  function bestImageUrl(img) {
    if (!img) return null;
    if (img.currentSrc) return abs(img.currentSrc);
    if (img.srcset) {
      const parts = img.srcset
        .split(",")
        .map((s) => s.trim().split(" "))
        .filter((p) => p[0]);
      if (parts.length) return abs(parts[parts.length - 1][0]);
    }
    return abs(img.src || img.getAttribute("data-src"));
  }

  function imgSize(img) {
    return (img.naturalWidth || img.width || 0) * (img.naturalHeight || img.height || 0);
  }

  function visibleText(el, max = 600) {
    if (!el) return "";
    const t = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
    return t.slice(0, max);
  }

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0";
  }

  // Hero image: maior imagem visível na primeira dobra
  const viewportH = window.innerHeight;
  const allImages = Array.from(document.querySelectorAll("img")).filter(isVisible);
  const heroCandidates = allImages
    .filter((img) => img.getBoundingClientRect().top < viewportH * 1.2)
    .map((img) => ({ img, size: imgSize(img), url: bestImageUrl(img) }))
    .filter((c) => c.url && c.size > 40000)
    .sort((a, b) => b.size - a.size);
  const heroImage = heroCandidates[0]?.url || ogImage || null;

  // Galeria: próximas maiores imagens distintas
  const seenImgUrls = new Set([heroImage]);
  const gallery = [];
  for (const img of allImages
    .map((img) => ({ url: bestImageUrl(img), size: imgSize(img), alt: img.alt || "" }))
    .filter((c) => c.url && c.size > 30000)
    .sort((a, b) => b.size - a.size)) {
    if (seenImgUrls.has(img.url)) continue;
    seenImgUrls.add(img.url);
    gallery.push({ url: img.url, alt: img.alt.slice(0, 120) });
    if (gallery.length >= 8) break;
  }

  // Produtos: padroes Shopify/Woo/Wix/custom
  const productSelectors = [
    "[class*='product-card']",
    "[class*='product-item']",
    "[class*='ProductCard']",
    ".product",
    ".product-grid-item",
    ".grid-product",
    "[data-product]",
    "li.product",
    ".woocommerce-LoopProduct-link",
    "[class*='card'][class*='product']"
  ];
  const productNodes = new Set();
  for (const sel of productSelectors) {
    for (const el of document.querySelectorAll(sel)) {
      if (productNodes.size >= 60) break;
      if (isVisible(el)) productNodes.add(el);
    }
  }
  const priceRe = /R\$\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d{1,3}(?:[.,]\d{3})*[.,]\d{2}/;
  const products = [];
  for (const node of productNodes) {
    const img = node.querySelector("img");
    const imgUrl = bestImageUrl(img);
    if (!imgUrl) continue;
    const nameEl =
      node.querySelector(
        "[class*='product-title'], [class*='product-name'], [class*='card-title'], h2, h3, h4, .title, [class*='name']"
      ) || node;
    const name = visibleText(nameEl, 120);
    if (!name) continue;
    const text = visibleText(node, 400);
    const priceMatch = text.match(priceRe);
    const linkEl = node.closest("a") || node.querySelector("a");
    products.push({
      name: name.split("\n")[0].slice(0, 100),
      price: priceMatch ? priceMatch[0] : null,
      image: imgUrl,
      url: abs(linkEl?.href || "")
    });
    if (products.length >= 12) break;
  }

  // Fallback de produtos: links com img + preco em qualquer lugar
  if (products.length < 4) {
    const productLinks = Array.from(document.querySelectorAll("a")).filter((a) => {
      if (!isVisible(a)) return false;
      const img = a.querySelector("img");
      if (!img) return false;
      const text = visibleText(a, 300);
      return priceRe.test(text);
    });
    for (const a of productLinks) {
      const img = a.querySelector("img");
      const imgUrl = bestImageUrl(img);
      if (!imgUrl) continue;
      const text = visibleText(a, 300);
      const priceMatch = text.match(priceRe);
      const cleaned = text.replace(priceRe, "").replace(/\s+/g, " ").trim();
      const name = (img.alt || cleaned).split("\n")[0].slice(0, 100);
      if (!name) continue;
      if (products.find((p) => p.image === imgUrl)) continue;
      products.push({
        name,
        price: priceMatch ? priceMatch[0] : null,
        image: imgUrl,
        url: abs(a.href)
      });
      if (products.length >= 12) break;
    }
  }

  // Servicos: blocos com icone/titulo/descricao (uteis pra sites institucionais)
  const serviceSelectors = [
    "[class*='service']",
    "[class*='servico']",
    "[class*='feature']",
    "[class*='benefit']",
    "section [class*='card']"
  ];
  const serviceNodes = new Set();
  for (const sel of serviceSelectors) {
    for (const el of document.querySelectorAll(sel)) {
      if (serviceNodes.size >= 30) break;
      if (!isVisible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 120 || r.width > 600) continue;
      const h = el.querySelector("h2, h3, h4, h5, [class*='title']");
      const p = el.querySelector("p, [class*='desc']");
      if (h && p) serviceNodes.add(el);
    }
  }
  const services = [];
  for (const node of serviceNodes) {
    const title = visibleText(node.querySelector("h2, h3, h4, h5, [class*='title']"), 80);
    const desc = visibleText(node.querySelector("p, [class*='desc']"), 240);
    if (!title || !desc) continue;
    services.push({ title, description: desc });
    if (services.length >= 6) break;
  }

  // Sobre: maior paragrafo perto de palavras "sobre/quem somos/nossa historia"
  let about = "";
  const allP = Array.from(document.querySelectorAll("p")).filter(isVisible);
  const aboutKeywords = /sobre|quem somos|nossa hist|nossa empresa|nossa missao|about/i;
  const aboutNearby = allP
    .filter((p) => {
      const ctx =
        (p.closest("section")?.innerText || "") +
        " " +
        (p.previousElementSibling?.innerText || "");
      return aboutKeywords.test(ctx);
    })
    .sort((a, b) => visibleText(b, 9999).length - visibleText(a, 9999).length);
  if (aboutNearby[0]) about = visibleText(aboutNearby[0], 600);
  if (!about) {
    // fallback: maior paragrafo da pagina
    const longest = allP
      .map((p) => visibleText(p, 9999))
      .filter((t) => t.length > 80 && t.length < 800)
      .sort((a, b) => b.length - a.length)[0];
    about = longest ? longest.slice(0, 600) : "";
  }

  // Contato
  const phoneRe = /(\(?\d{2}\)?\s?9?\d{4}[-.\s]?\d{4})/;
  const allText = document.body.innerText || "";
  const phoneMatch = allText.match(phoneRe);
  const whatsappLink = document.querySelector(
    "a[href*='wa.me'], a[href*='whatsapp.com'], a[href*='api.whatsapp']"
  );
  const emailLink = document.querySelector("a[href^='mailto:']");
  const instaLink = document.querySelector(
    "a[href*='instagram.com']:not([href*='/sharer'])"
  );
  const facebookLink = document.querySelector("a[href*='facebook.com']:not([href*='sharer'])");
  const youtubeLink = document.querySelector("a[href*='youtube.com'], a[href*='youtu.be']");
  const tiktokLink = document.querySelector("a[href*='tiktok.com']");

  const addressEl =
    document.querySelector("address, [class*='address'], [class*='endereco']") || null;
  const address = addressEl ? visibleText(addressEl, 200) : "";

  // Navegacao principal (ate 7 itens)
  const navEl = document.querySelector("nav, header nav, [role='navigation']");
  const navItems = navEl
    ? Array.from(navEl.querySelectorAll("a"))
        .filter(isVisible)
        .map((a) => ({ label: visibleText(a, 30), href: abs(a.href) }))
        .filter((i) => i.label && i.label.length < 30)
        .slice(0, 7)
    : [];

  // Depoimentos
  const testimonialSelectors = [
    "[class*='testimonial']",
    "[class*='depoimento']",
    "[class*='review']",
    "blockquote"
  ];
  const testimonials = [];
  for (const sel of testimonialSelectors) {
    for (const el of document.querySelectorAll(sel)) {
      if (!isVisible(el)) continue;
      const text = visibleText(el, 400);
      if (text.length < 30) continue;
      const author = visibleText(
        el.querySelector("cite, [class*='author'], [class*='name'], footer, h4, h5"),
        80
      );
      testimonials.push({ text, author });
      if (testimonials.length >= 4) break;
    }
    if (testimonials.length >= 4) break;
  }

  const content = {
    hero_image: heroImage,
    gallery,
    products,
    services,
    about,
    contact: {
      phone: phoneMatch ? phoneMatch[0] : null,
      whatsapp: whatsappLink ? abs(whatsappLink.href) : null,
      email: emailLink ? emailLink.href.replace(/^mailto:/, "") : null,
      address
    },
    social: {
      instagram: instaLink ? abs(instaLink.href) : null,
      facebook: facebookLink ? abs(facebookLink.href) : null,
      youtube: youtubeLink ? abs(youtubeLink.href) : null,
      tiktok: tiktokLink ? abs(tiktokLink.href) : null
    },
    nav_items: navItems,
    testimonials
  };

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
    })(),
    content
  };
}
