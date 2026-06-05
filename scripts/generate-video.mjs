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
const musicArg = process.argv.find((a) => a.startsWith("--music="));
const musicPath = musicArg ? musicArg.slice("--music=".length) : null;

const VIDEO_W = 1280;
const VIDEO_H = 720;
const FPS = 30;

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
  const beforeShot = path.join(kitDir, "preview", "shots", "desktop.png");
  const finalMp4 = path.join(kitDir, "video.mp4");

  if (!fs.existsSync(previewFile)) continue;
  if (!force && fs.existsSync(finalMp4)) {
    skipped += 1;
    continue;
  }

  try {
    console.log(`-> ${slug}`);
    await buildEditedVideo({
      browser,
      lead,
      previewFile,
      beforeShot: fs.existsSync(beforeShot) ? beforeShot : null,
      brandPath: path.join(kitDir, "brand.json"),
      outMp4: finalMp4
    });
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

async function buildEditedVideo({ browser, lead, previewFile, beforeShot, brandPath, outMp4 }) {
  const brand = fs.existsSync(brandPath)
    ? JSON.parse(fs.readFileSync(brandPath, "utf8"))
    : {};
  const accent = pickAccent(brand);
  const accentInk = readableInk(accent);
  const name = lead.name || "Sua marca";

  const tmp = fs.mkdtempSync(path.join(root, ".tmp-video-"));
  const previewUrl = "file://" + previewFile;
  const clips = [];

  try {
    // 1) Card de abertura
    clips.push(
      await renderCard({
        browser,
        tmp,
        index: clips.length,
        html: cardHtml({
          background: "#0d0a08",
          fg: "#f6efe1",
          eyebrow: "PRÓXIMO PASSO",
          big: "Sua loja<br><em>hoje.</em>",
          accent
        }),
        durationMs: 1300
      })
    );

    // 2) "Antes": screenshot real com zoom out
    if (beforeShot) {
      clips.push(
        await stillClip({
          tmp,
          index: clips.length,
          imgPath: beforeShot,
          durationMs: 2200,
          // zoom-out + leve dessaturação para o "antes" parecer pesado
          filter:
            `zoompan=z='if(lte(zoom,1.0),1.18,zoom-0.0018)':d=${Math.round(2.2 * FPS)}:s=${VIDEO_W}x${VIDEO_H}:fps=${FPS},` +
            `eq=saturation=0.65:contrast=0.96`
        })
      );
    }

    // 3) Card divisor
    clips.push(
      await renderCard({
        browser,
        tmp,
        index: clips.length,
        html: cardHtml({
          background: accent,
          fg: accentInk,
          eyebrow: "EM 14 DIAS",
          big: "Como poderia ser ↓",
          accent: accentInk
        }),
        durationMs: 1100
      })
    );

    // 4) Hero do "Depois" com ken-burns
    clips.push(
      await recordScene({
        browser,
        tmp,
        index: clips.length,
        url: previewUrl,
        durationMs: 3000,
        prepare: async (page) => {
          await page.addStyleTag({
            content: `
              html, body { overflow: hidden !important; }
              .hero { animation: kb 3s ease-out both; transform-origin: center top; }
              @keyframes kb { from { transform: scale(1.0); } to { transform: scale(1.06); } }
            `
          });
        }
      })
    );

    // 5) Closeup num card de produto
    clips.push(
      await recordScene({
        browser,
        tmp,
        index: clips.length,
        url: previewUrl,
        durationMs: 2000,
        prepare: async (page) => {
          await page.evaluate(() => {
            const el = document.querySelector(".product");
            if (el) el.scrollIntoView({ block: "center" });
          });
          await page.waitForTimeout(150);
          await page.addStyleTag({
            content: `
              html, body { overflow: hidden !important; }
              .product:first-of-type {
                animation: zoomP 2s ease-out both;
                transform-origin: center center;
                z-index: 5;
                position: relative;
                box-shadow: 0 30px 70px rgba(0,0,0,0.25);
              }
              @keyframes zoomP { from { transform: scale(0.94); } to { transform: scale(1.12); } }
            `
          });
        }
      })
    );

    // 6) Grid de produtos com pan
    clips.push(
      await recordScene({
        browser,
        tmp,
        index: clips.length,
        url: previewUrl,
        durationMs: 2200,
        prepare: async (page) => {
          const top = await page.evaluate(() => {
            const g = document.querySelector(".grid-shop");
            return g ? g.getBoundingClientRect().top + window.scrollY - 60 : 0;
          });
          await page.evaluate((y) => window.scrollTo(0, y), top);
          await page.waitForTimeout(120);
          await page.addStyleTag({
            content: `
              html { scroll-behavior: smooth; }
              body { animation: pan 2.2s linear both; }
              @keyframes pan { from { transform: translateY(0); } to { transform: translateY(-160px); } }
            `
          });
        }
      })
    );

    // 7) Manifesto
    clips.push(
      await recordScene({
        browser,
        tmp,
        index: clips.length,
        url: previewUrl,
        durationMs: 2200,
        prepare: async (page) => {
          await page.evaluate(() => {
            const el = document.querySelector(".manifesto");
            if (el) el.scrollIntoView({ block: "start" });
          });
          await page.waitForTimeout(120);
          await page.addStyleTag({
            content: `
              html, body { overflow: hidden !important; }
              .manifesto { animation: kb 2.2s ease-out both; }
              @keyframes kb { from { transform: scale(1.0); } to { transform: scale(1.04); } }
            `
          });
        }
      })
    );

    // 8) Depoimentos
    clips.push(
      await recordScene({
        browser,
        tmp,
        index: clips.length,
        url: previewUrl,
        durationMs: 2400,
        prepare: async (page) => {
          await page.evaluate(() => {
            const el = document.querySelector(".quotes");
            if (el) el.scrollIntoView({ block: "center" });
          });
          await page.waitForTimeout(120);
          await page.addStyleTag({
            content: `
              html, body { overflow: hidden !important; }
              .stars { animation: pulse 1s ease-in-out infinite alternate; }
              @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.08); } }
            `
          });
        }
      })
    );

    // 9) CTA band
    clips.push(
      await recordScene({
        browser,
        tmp,
        index: clips.length,
        url: previewUrl,
        durationMs: 1900,
        prepare: async (page) => {
          await page.evaluate(() => {
            const el = document.querySelector(".cta-band");
            if (el) el.scrollIntoView({ block: "center" });
          });
          await page.waitForTimeout(120);
          await page.addStyleTag({
            content: `
              html, body { overflow: hidden !important; }
              .cta-band .btn-primary {
                animation: pulse 0.9s ease-in-out infinite alternate;
              }
              @keyframes pulse {
                from { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
                to { transform: scale(1.05); box-shadow: 0 14px 40px rgba(0,0,0,0.25); }
              }
            `
          });
        }
      })
    );

    // 10) WhatsApp FAB closeup
    clips.push(
      await renderCard({
        browser,
        tmp,
        index: clips.length,
        html: waCardHtml({ accent, accentInk, name }),
        durationMs: 1600
      })
    );

    // 11) Outro
    clips.push(
      await renderCard({
        browser,
        tmp,
        index: clips.length,
        html: cardHtml({
          background: "#0d0a08",
          fg: "#f6efe1",
          eyebrow: "SEU SITE 2.0",
          big: `Quer ver no detalhe?<br><em>Responde aí ↓</em>`,
          accent
        }),
        durationMs: 2600
      })
    );

    // Transcoda cada webm em mp4 (trimmado para a duracao alvo)
    const mp4s = [];
    for (let i = 0; i < clips.length; i += 1) {
      const out = path.join(tmp, `clip-${String(i).padStart(2, "0")}.mp4`);
      transcodeToMp4(clips[i].path, clips[i].durationMs, out);
      mp4s.push(out);
    }

    // Concat
    const listPath = path.join(tmp, "list.txt");
    fs.writeFileSync(
      listPath,
      mp4s.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n")
    );
    const concatTmp = path.join(tmp, "concat.mp4");
    runFfmpeg([
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-c", "copy",
      concatTmp
    ]);

    // Mixagem com musica opcional
    if (musicPath && fs.existsSync(musicPath)) {
      runFfmpeg([
        "-y",
        "-i", concatTmp,
        "-i", musicPath,
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        "-af", "volume=0.5",
        outMp4
      ]);
    } else {
      fs.copyFileSync(concatTmp, outMp4);
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// --- helpers ------------------------------------------------------

async function recordScene({ browser, tmp, index, url, durationMs, prepare }) {
  const clipDir = path.join(tmp, `scene-${index}`);
  fs.mkdirSync(clipDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: VIDEO_W, height: VIDEO_H },
    deviceScaleFactor: 1,
    recordVideo: { dir: clipDir, size: { width: VIDEO_W, height: VIDEO_H } }
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page
    .evaluate(() => (document.fonts ? document.fonts.ready : null))
    .catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(400);
  if (prepare) await prepare(page);
  await page.waitForTimeout(durationMs);
  const video = page.video();
  await page.close();
  const tmpVideo = await video.path();
  await context.close();
  return { path: tmpVideo, durationMs };
}

async function renderCard({ browser, tmp, index, html, durationMs }) {
  const cardFile = path.join(tmp, `card-${index}.html`);
  fs.writeFileSync(cardFile, html);
  return recordScene({
    browser,
    tmp,
    index,
    url: "file://" + cardFile,
    durationMs,
    prepare: null
  });
}

function transcodeToMp4(input, durationMs, output) {
  // pega APENAS os ultimos durationMs do clip (depois do load/prepare)
  const durSec = (durationMs / 1000).toFixed(2);
  runFfmpeg([
    "-y",
    "-sseof", `-${durSec}`,
    "-i", input,
    "-t", durSec,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-r", String(FPS),
    "-vf", `scale=${VIDEO_W}:${VIDEO_H}:force_original_aspect_ratio=decrease,pad=${VIDEO_W}:${VIDEO_H}:(ow-iw)/2:(oh-ih)/2:black,setsar=1`,
    "-an",
    "-movflags", "+faststart",
    output
  ]);
}

function stillClip({ tmp, index, imgPath, durationMs, filter }) {
  const out = path.join(tmp, `still-${index}.webm`);
  const dur = (durationMs / 1000).toFixed(2);
  runFfmpeg([
    "-y",
    "-loop", "1",
    "-t", dur,
    "-i", imgPath,
    "-vf", filter,
    "-r", String(FPS),
    "-c:v", "libvpx",
    "-b:v", "2M",
    "-an",
    out
  ]);
  return { path: out, durationMs };
}

function runFfmpeg(args) {
  const result = spawnSync("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
  if (result.status !== 0) {
    throw new Error("ffmpeg falhou: " + (result.stderr?.toString().slice(-500) || ""));
  }
}

function pickAccent(brand) {
  const isUseful = (h) => {
    if (!h || !/^#[0-9a-f]{6}$/i.test(h)) return false;
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return Math.max(r, g, b) - Math.min(r, g, b) >= 20;
  };
  if (isUseful(brand?.primary)) return brand.primary;
  const fromPalette = (brand?.palette || []).find(isUseful);
  return fromPalette || "#7a5a3a";
}

function readableInk(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return "#fff";
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? "#111" : "#fff";
}

function cardHtml({ background, fg, eyebrow, big, accent }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@600&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;height:100%;background:${background};color:${fg};
    font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;
    overflow:hidden;}
  .wrap{text-align:center;padding:40px;animation:in 700ms ease-out both;}
  .eyebrow{font-size:14px;letter-spacing:0.32em;text-transform:uppercase;
    color:${accent};margin-bottom:28px;font-weight:600;}
  h1{font-family:'Fraunces',serif;font-weight:500;font-size:108px;line-height:1;
    margin:0;letter-spacing:-0.01em;}
  h1 em{font-style:italic;color:${accent};}
  @keyframes in{from{opacity:0;transform:translateY(14px) scale(0.98);}
    to{opacity:1;transform:none;}}
</style></head><body><div class="wrap">
  <div class="eyebrow">${eyebrow}</div>
  <h1>${big}</h1>
</div></body></html>`;
}

function waCardHtml({ accent, accentInk, name }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500&family=Inter:wght@500;600&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;height:100%;background:#0d0a08;color:#f6efe1;
    font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;
    overflow:hidden;}
  .row{display:flex;align-items:center;gap:36px;animation:in 700ms ease-out both;}
  .fab{width:160px;height:160px;border-radius:999px;background:#25d366;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 18px 60px rgba(37,211,102,0.55);
    animation:pulse 1.2s ease-in-out infinite alternate;}
  .fab svg{width:84px;height:84px;color:#fff;}
  .copy h2{font-family:'Fraunces',serif;font-weight:500;font-size:54px;margin:0 0 12px;}
  .copy p{margin:0;color:#a89c8c;font-size:18px;}
  .tag{display:inline-block;background:${accent};color:${accentInk};
    font-size:12px;letter-spacing:0.18em;text-transform:uppercase;
    padding:6px 14px;border-radius:999px;font-weight:600;margin-bottom:16px;}
  @keyframes in{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
  @keyframes pulse{from{transform:scale(1);}to{transform:scale(1.08);}}
</style></head><body><div class="row">
  <div class="fab"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52z"/></svg></div>
  <div class="copy">
    <span class="tag">Próximo passo</span>
    <h2>Falar com a ${name}</h2>
    <p>Atendimento direto pelo WhatsApp</p>
  </div>
</div></body></html>`;
}
