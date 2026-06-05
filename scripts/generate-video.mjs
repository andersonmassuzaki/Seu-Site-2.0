import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { readCsv } from "../src/lib/csv.mjs";
import { kitSlug } from "../src/lib/kit.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const force = process.argv.includes("--force");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length) : null;

const VIDEO_W = 1280;
const VIDEO_H = 720;

const outbox = readCsv(path.join(root, "data/outbox.csv"));
const leads = outbox.filter((l) => l.lead_id);

const browser = await chromium.launch();
let processed = 0;
let skipped = 0;
let failed = 0;

for (const lead of leads) {
  const slug = kitSlug(lead);
  if (only && only !== slug) continue;

  const kitDir = path.join(root, "kits", slug);
  const previewFile = path.join(kitDir, "preview", "index.html");
  const finalMp4 = path.join(kitDir, "video.mp4");

  if (!fs.existsSync(previewFile)) {
    continue;
  }
  if (!force && fs.existsSync(finalMp4)) {
    skipped += 1;
    continue;
  }

  try {
    console.log(`-> ${slug}`);
    await recordWalkthrough(browser, previewFile, finalMp4);
    processed += 1;
  } catch (err) {
    console.warn(`   falhou: ${err.message}`);
    failed += 1;
  }
}

await browser.close();
console.log(
  `\nVideos gerados. processados=${processed} pulados=${skipped} falhas=${failed}`
);

async function recordWalkthrough(browser, previewFile, outMp4) {
  const tmpDir = fs.mkdtempSync(path.join(root, ".tmp-video-"));
  const context = await browser.newContext({
    viewport: { width: VIDEO_W, height: VIDEO_H },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: tmpDir,
      size: { width: VIDEO_W, height: VIDEO_H }
    }
  });

  const page = await context.newPage();
  const fileUrl = "file://" + previewFile;
  await page.goto(fileUrl, { waitUntil: "load" });
  // espera fontes/imagens
  await page
    .evaluate(
      () => document.fonts && document.fonts.ready ? document.fonts.ready : null
    )
    .catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1200);

  // injeta scroll suave + leve scale do hero
  await page.addStyleTag({
    content: `
      html { scroll-behavior: smooth; }
      .hero-visual { animation: kenburns 14s ease-out both; }
      @keyframes kenburns { from { transform: scale(1); } to { transform: scale(1.06); } }
    `
  });

  // sequencia: parar em cada secao-chave
  const stops = await page.evaluate(() => {
    function offsetOf(sel) {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY : null;
    }
    return {
      hero: 0,
      products: offsetOf("#colecao") ?? offsetOf(".grid-shop") ?? 700,
      categories: offsetOf(".cat-strip") ?? 1500,
      manifesto: offsetOf(".manifesto") ?? 2200,
      testimonials: offsetOf(".quotes") ?? 2900,
      cta: offsetOf(".cta-band") ?? 3600,
      end: document.body.scrollHeight - window.innerHeight
    };
  });

  // tempo total ~28s
  await hold(page, 2800); // hero
  await scrollTo(page, stops.products);
  await hold(page, 3400); // produtos
  await scrollTo(page, stops.categories);
  await hold(page, 2600);
  await scrollTo(page, stops.manifesto);
  await hold(page, 3000);
  if (stops.testimonials) {
    await scrollTo(page, stops.testimonials);
    await hold(page, 2800);
  }
  await scrollTo(page, stops.cta);
  await hold(page, 2400);
  await scrollTo(page, stops.end);
  await hold(page, 2000);

  const video = page.video();
  await page.close();
  const tmpVideo = await video.path();
  await context.close();

  // converter webm -> mp4 H.264 + faststart
  ffmpegConvert(tmpVideo, outMp4);

  // limpar tmp
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

function hold(page, ms) {
  return page.waitForTimeout(ms);
}

async function scrollTo(page, top) {
  if (typeof top !== "number") return;
  await page.evaluate((y) => {
    window.scrollTo({ top: y, behavior: "smooth" });
  }, top);
  await page.waitForTimeout(1200); // tempo do smooth scroll
}

function ffmpegConvert(inputWebm, outputMp4) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i", inputWebm,
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "20",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-r", "30",
      "-an",
      outputMp4
    ],
    { stdio: ["ignore", "ignore", "pipe"] }
  );
  if (result.status !== 0) {
    throw new Error(
      "ffmpeg falhou: " + result.stderr?.toString().slice(-400)
    );
  }
}
