import { htmlEscape } from "../kit.mjs";

export function buildBarbershopPreview(lead, brand) {
  const content = brand?.content || {};
  const services = (content.services || []).slice(0, 6);
  const gallery = (content.gallery || []).slice(0, 9);
  const heroImage = content.hero_image || gallery[0]?.url || "";
  const testimonials = (content.testimonials || []).slice(0, 3);
  const nav = (content.nav_items || []).slice(0, 4);
  const contact = content.contact || {};
  const hours = brand?.opening_hours || [];

  const primary = brand?.primary || "#1f1410";
  const accent = brand?.palette?.[1] || "#b08454";
  const paper = brand?.body_bg || "#0f0a07";
  const ink = brand?.body_color || "#f3ecdf";
  const isDark = brand?.is_dark ?? true;
  const cardBg = isDark ? "#1a120e" : "#fff";
  const muted = isDark ? "#a89484" : "#6b5a4e";
  const line = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const name = lead.name || "Barbearia";
  const headline = brand?.headline || `${name}: tradicao em corte masculino`;
  const tagline = brand?.description || "Cortes, barba e cuidado masculino.";
  const rating = brand?.rating;
  const ratingCount = brand?.rating_count;
  const whatsappHref = contact.whatsapp || "#";
  const address = contact.address || "";
  const phone = contact.phone || "";

  const priceTable = [
    { name: "Corte tradicional", price: "R$ 45" },
    { name: "Barba completa", price: "R$ 35" },
    { name: "Combo corte + barba", price: "R$ 70" },
    { name: "Pezinho / acabamento", price: "R$ 20" },
    { name: "Sobrancelha na navalha", price: "R$ 20" },
    { name: "Hidratacao capilar", price: "R$ 40" }
  ];

  // SVG icons (Lucide style) por servico
  const svgScissors = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`;
  const svgRazor = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l5 5"/><path d="M8 8h11a2 2 0 0 1 2 2v3a3 3 0 0 1-3 3h-5l-9-9z"/></svg>`;
  const svgComb = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h18v3H3z"/><path d="M5 11v8M9 11v6M13 11v8M17 11v6M21 11v8"/></svg>`;
  const svgStar = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const svgClock = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  const svgSparkle = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>`;
  const serviceIcons = [svgScissors, svgRazor, svgComb, svgStar, svgClock, svgSparkle];

  function galleryGrid() {
    if (!gallery.length) return "";
    return `<div class="grid-gallery">
      ${gallery.map((g, i) => `<div class="gphoto ${i === 0 ? 'wide' : ''}" style="background-image:url('${htmlEscape(g.url)}')"></div>`).join("")}
    </div>`;
  }

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${htmlEscape(name)} - versao Seu Site 2.0</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --primary: ${primary};
  --accent: ${accent};
  --paper: ${paper};
  --card: ${cardBg};
  --ink: ${ink};
  --muted: ${muted};
  --line: ${line};
}
*,*::before,*::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }
h1, h2, h3, h4, h5 { text-decoration: none; text-underline-offset: 0; }
.h-serif { font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.01em; line-height: 1.05; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 2px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
.container { width: min(1240px, calc(100% - 40px)); margin: 0 auto; }

.preview-bar {
  background: var(--accent);
  color: ${primary};
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 700;
  padding: 8px 16px;
}

/* nav */
.nav-wrap {
  position: sticky; top: 0; z-index: 30;
  background: rgba(15, 10, 7, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line);
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 76px;
  gap: 24px;
}
.brand {
  font-family: 'Fraunces', serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.brand .sep { color: var(--accent); margin: 0 6px; }
.nav-links {
  display: flex; gap: 22px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}
.nav-links a:hover { color: var(--ink); }
.cta-pill {
  display: inline-flex;
  align-items: center; gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--accent);
  color: ${primary};
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.04em;
}
.cta-pill:hover { transform: translateY(-1px); }

/* hero */
.hero {
  position: relative;
  min-height: 86vh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  isolation: isolate;
  background: #000;
}
.hero-bg {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.72) contrast(1.08) saturate(1.08);
  z-index: -1;
  transform: scale(1.03);
}
.hero-bg::after {
  content: "";
  position: absolute; inset: 0;
  background:
    linear-gradient(180deg, rgba(15,10,7,0.15) 0%, rgba(15,10,7,0.55) 55%, ${paper} 100%),
    radial-gradient(ellipse at 15% 80%, rgba(15,10,7,0.78) 0%, transparent 65%);
}
.hero-bg::before {
  content: "";
  position: absolute; inset: 0; z-index: 1;
  background: radial-gradient(circle at 90% 10%, ${accent}33 0%, transparent 45%);
  mix-blend-mode: overlay;
  pointer-events: none;
}
.hero-content {
  padding: 72px 0;
  max-width: 720px;
}
.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 22px;
}
h1 {
  font-size: clamp(46px, 6.5vw, 92px);
  margin: 0 0 24px;
  color: #fff;
}
.hero-sub {
  color: rgba(255,255,255,0.85);
  font-size: 18px;
  max-width: 560px;
  margin: 0 0 32px;
}
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 28px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: transform .2s ease;
}
.btn:hover { transform: translateY(-1px); }
.btn-wa {
  background: var(--accent);
  color: ${primary};
  min-height: 48px;
}
.btn-wa:hover { background: #c4986a; }
.btn-wa svg { width: 18px; height: 18px; }
.btn-ghost {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.4);
  min-height: 48px;
}
.btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.7); }
.rating-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  color: #fff;
  margin-bottom: 18px;
  backdrop-filter: blur(8px);
}
.rating-chip strong { color: var(--accent); font-size: 16px; }

/* section */
.section { padding: 96px 0; }
.section-head { margin-bottom: 48px; }
.section-eyebrow {
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 14px;
}
.section h2 {
  font-size: clamp(34px, 4.4vw, 58px);
  margin: 0 0 14px;
}
.section .lede {
  color: var(--muted);
  font-size: 17px;
  max-width: 620px;
  margin: 0;
}

/* services list */
.services-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
}
.service-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 28px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 4px;
  transition: transform .2s ease, border-color .2s ease;
}
.service-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}
.service-icon {
  width: 56px; height: 56px;
  flex-shrink: 0;
  border-radius: 4px;
  background: ${primary};
  border: 1px solid var(--accent);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease;
}
.service-icon svg { width: 28px; height: 28px; }
.service-card:hover .service-icon { background: var(--accent); color: ${primary}; transform: rotate(-4deg); }
.service-body h3 {
  margin: 0 0 6px;
  font-size: 19px;
  font-weight: 600;
  color: var(--ink);
}
.service-body p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}

/* price table */
.prices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 80px;
}
.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
  gap: 24px;
}
.price-row:hover { background: rgba(176,132,84,0.04); padding-left: 8px; transition: padding 0.2s ease; }
.price-row .nm {
  color: var(--ink);
  font-size: 16px;
  font-weight: 500;
}
.price-row .pr {
  color: var(--accent);
  font-weight: 600;
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-feature-settings: "tnum";
  letter-spacing: -0.01em;
}
.price-note {
  margin-top: 24px;
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* gallery */
.grid-gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 200px;
  gap: 10px;
}
.gphoto {
  background-size: cover;
  background-position: center;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
  filter: saturate(1.05);
  transition: transform 0.5s ease;
}
.gphoto:hover { transform: scale(1.015); }
.gphoto.wide {
  grid-column: span 2;
  grid-row: span 2;
}
.gphoto::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.5));
  transition: opacity 0.3s ease;
}
.gphoto:hover::after { opacity: 0.4; }

/* stats / proof band */
.proof {
  background: ${primary};
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.proof-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 56px 0;
  text-align: center;
}
.proof-item {
  position: relative;
}
.proof-item + .proof-item::before {
  content: "";
  position: absolute;
  left: 0; top: 20%;
  width: 1px; height: 60%;
  background: var(--line);
}
.proof-num {
  display: block;
  font-family: 'Fraunces', serif;
  font-weight: 500;
  font-size: clamp(36px, 4vw, 48px);
  color: var(--accent);
  line-height: 1;
  margin-bottom: 8px;
  font-feature-settings: "tnum";
}
.proof-label {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}

/* info band */
.info-band {
  background: var(--card);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  padding: 56px 0;
}
.info-block h4 {
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 14px;
  font-weight: 700;
}
.info-block .v {
  font-family: 'Fraunces', serif;
  font-size: 24px;
  color: var(--ink);
  font-weight: 500;
  line-height: 1.3;
  margin: 0 0 8px;
}
.info-block .small {
  color: var(--muted);
  font-size: 13px;
  white-space: pre-line;
}

/* testimonials */
.quotes {
  display: grid;
  grid-template-columns: repeat(${Math.max(1, Math.min(testimonials.length, 3))}, 1fr);
  gap: 24px;
}
.quote {
  position: relative;
  padding: 36px 32px 32px;
  background: var(--card);
  border: 1px solid var(--line);
  border-left: 3px solid var(--accent);
  border-radius: 2px;
}
.quote::before {
  content: "\\201C";
  position: absolute;
  top: -18px; left: 18px;
  font-family: 'Fraunces', serif;
  font-size: 100px;
  line-height: 1;
  color: var(--accent);
  opacity: 0.35;
}
.stars { color: var(--accent); margin-bottom: 14px; font-size: 16px; letter-spacing: 3px; }
.quote p {
  font-family: 'Fraunces', serif;
  font-size: 19px;
  line-height: 1.45;
  color: var(--ink);
  margin: 0 0 22px;
  font-weight: 400;
}
.quote cite {
  font-style: normal;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

/* cta band */
.cta-band {
  position: relative;
  padding: 110px 0;
  text-align: center;
  background:
    linear-gradient(135deg, ${primary} 0%, #0a0604 100%);
  color: #fff;
  overflow: hidden;
  isolation: isolate;
}
.cta-band::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 40%, ${accent}33 0%, transparent 50%),
    radial-gradient(ellipse at 80% 60%, ${accent}1f 0%, transparent 55%);
  z-index: -1;
}
.cta-band .cta-eyebrow {
  font-size: 12px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 18px;
}
.cta-band h2 {
  font-size: clamp(36px, 4.8vw, 64px);
  margin: 0 0 18px;
  color: #fff;
  letter-spacing: -0.015em;
}
.cta-band p {
  margin: 0 auto 36px;
  max-width: 560px;
  color: rgba(255,255,255,0.78);
  font-size: 18px;
}
.cta-band .btn-wa { background: var(--accent); color: ${primary}; }
.cta-band .btn-wa:hover { background: #fff; }

/* footer */
footer {
  padding: 56px 0 32px;
  font-size: 13px;
  color: var(--muted);
  border-top: 1px solid var(--line);
}
.foot-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 32px;
}
.foot-grid h5 {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 16px;
  font-weight: 700;
}
.foot-grid p { margin: 0 0 8px; color: var(--muted); }
.foot-bottom {
  border-top: 1px solid var(--line);
  padding-top: 22px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

/* wa fab */
.wa-fab {
  position: fixed;
  bottom: 20px; right: 20px;
  width: 58px; height: 58px;
  border-radius: 999px;
  background: #25d366;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 14px 40px rgba(37,211,102,0.5);
  z-index: 60;
}

@media (max-width: 880px) {
  .services-grid, .prices, .foot-grid { grid-template-columns: 1fr; }
  .grid-gallery { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 160px; }
  .gphoto.wide { grid-column: span 2; grid-row: span 1; }
  .info-grid { grid-template-columns: 1fr; gap: 32px; }
  .nav-links { display: none; }
  .section { padding: 64px 0; }
  .quotes { grid-template-columns: 1fr; }
  .hero { min-height: 70vh; }
  .proof-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; padding: 40px 0; }
  .proof-item + .proof-item::before { display: none; }
  .hero-content { padding: 48px 0 40px; }
  h1 { margin-bottom: 18px; }
  .hero-sub { font-size: 16px; margin-bottom: 24px; }
  .cta-band { padding: 72px 0; }
}
@media (max-width: 540px) {
  .container { width: calc(100% - 28px); }
  h1 { font-size: 42px; }
  .grid-gallery { grid-template-columns: 1fr 1fr; grid-auto-rows: 130px; }
  .price-row { padding: 18px 0; }
  .price-row .pr { font-size: 22px; }
  .quote { padding: 30px 22px 24px; }
  .quote p { font-size: 17px; }
  .service-card { padding: 22px; }
}
</style>
</head>
<body>

<div class="preview-bar">Pre-visualizacao Seu Site 2.0 - simulacao baseada no perfil do Google Maps</div>

<div class="nav-wrap">
  <div class="container nav">
    <div class="brand">${htmlEscape(name.split(" ")[0])}<span class="sep">/</span>${htmlEscape(name.split(" ").slice(1).join(" ") || "barbearia")}</div>
    <div class="nav-links">
      ${nav.map((n) => `<a href="#">${htmlEscape(n.label)}</a>`).join("")}
    </div>
    <a class="cta-pill" href="${htmlEscape(whatsappHref)}" target="_blank" rel="noopener">Agendar ↗</a>
  </div>
</div>

<section class="hero">
  ${heroImage ? `<div class="hero-bg" style="background-image:url('${htmlEscape(heroImage)}')"></div>` : ""}
  <div class="container hero-content">
    ${rating ? `<div class="rating-chip"><strong>★ ${rating.toFixed(1)}</strong> <span>${ratingCount || 0} avaliacoes no Google</span></div>` : ""}
    <div class="hero-eyebrow">Tradicao em corte masculino</div>
    <h1 class="h-serif">${htmlEscape(headline)}</h1>
    <p class="hero-sub">${htmlEscape(tagline)}</p>
    <div class="hero-actions">
      <a class="btn btn-wa" href="${htmlEscape(whatsappHref)}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52z"/></svg>
        Agendar pelo WhatsApp
      </a>
      <a class="btn btn-ghost" href="#servicos">Ver servicos</a>
    </div>
  </div>
</section>

<section class="proof">
  <div class="container proof-grid">
    <div class="proof-item">
      <span class="proof-num">${rating ? rating.toFixed(1) : "5.0"}<span style="color:var(--muted);font-size:0.5em;margin-left:4px">★</span></span>
      <span class="proof-label">${ratingCount || 0} avaliacoes Google</span>
    </div>
    <div class="proof-item">
      <span class="proof-num">+5k</span>
      <span class="proof-label">Atendimentos por ano</span>
    </div>
    <div class="proof-item">
      <span class="proof-num">15min</span>
      <span class="proof-label">Tempo medio de espera</span>
    </div>
    <div class="proof-item">
      <span class="proof-num">100%</span>
      <span class="proof-label">Hora marcada</span>
    </div>
  </div>
</section>

<section id="servicos" class="section">
  <div class="container">
    <div class="section-head">
      <div class="section-eyebrow">Servicos</div>
      <h2 class="h-serif">O que fazemos por voce</h2>
      <p class="lede">Atendimento com hora marcada para voce nao perder tempo. Equipe especializada em corte e barba masculina.</p>
    </div>
    <div class="services-grid">
      ${services.map((s, i) => `
        <article class="service-card">
          <div class="service-icon">${serviceIcons[i % serviceIcons.length]}</div>
          <div class="service-body">
            <h3>${htmlEscape(s.title)}</h3>
            <p>${htmlEscape(s.description)}</p>
          </div>
        </article>
      `).join("")}
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="container">
    <div class="section-head">
      <div class="section-eyebrow">Tabela</div>
      <h2 class="h-serif">Precos referencia</h2>
      <p class="lede">Valores praticados no segmento. Confirme com a barbearia no momento do agendamento.</p>
    </div>
    <div class="prices">
      ${priceTable.map((p) => `
        <div class="price-row">
          <span class="nm">${htmlEscape(p.name)}</span>
          <span class="pr">${htmlEscape(p.price)}</span>
        </div>
      `).join("")}
    </div>
    <p class="price-note">Pagamentos: dinheiro · Pix · cartao em ate 3x</p>
  </div>
</section>

${gallery.length ? `
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="section-head">
      <div class="section-eyebrow">Galeria</div>
      <h2 class="h-serif">Nosso ambiente, nosso trabalho</h2>
    </div>
    ${galleryGrid()}
  </div>
</section>` : ""}

<section class="info-band">
  <div class="container info-grid">
    <div class="info-block">
      <h4>Endereco</h4>
      <p class="v">${htmlEscape(address.split(",").slice(0, 2).join(",") || "Onde estamos")}</p>
      <p class="small">${htmlEscape(address || "")}</p>
    </div>
    <div class="info-block">
      <h4>Horario</h4>
      <p class="v">${hours.length ? "De " + (hours[1]?.split(":")[0] || "ter") + " a " + (hours[5]?.split(":")[0] || "sab") : "Aberto"}</p>
      <p class="small">${hours.length ? hours.map((h) => htmlEscape(h)).join("\n") : "Confirme horario pelo WhatsApp."}</p>
    </div>
    <div class="info-block">
      <h4>Contato</h4>
      <p class="v">${htmlEscape(phone || "Fale com a gente")}</p>
      <p class="small">${whatsappHref !== "#" ? "Atendimento e agendamento via WhatsApp." : "Entre em contato."}</p>
    </div>
  </div>
</section>

${testimonials.length ? `
<section class="section">
  <div class="container">
    <div class="section-head">
      <div class="section-eyebrow">Clientes</div>
      <h2 class="h-serif">O que dizem sobre a gente</h2>
    </div>
    <div class="quotes">
      ${testimonials.map((t) => `
        <article class="quote">
          <div class="stars">${"★".repeat(t.rating || 5)}</div>
          <p>"${htmlEscape(t.text.slice(0, 220))}"</p>
          ${t.author ? `<cite>- ${htmlEscape(t.author)}</cite>` : ""}
        </article>
      `).join("")}
    </div>
  </div>
</section>` : ""}

<section class="cta-band">
  <div class="container">
    <div class="cta-eyebrow">Reserva express</div>
    <h2 class="h-serif">Pronto para o proximo corte?</h2>
    <p>Agendamento direto pelo WhatsApp. Atendimento rapido, hora marcada, sem fila de espera.</p>
    <a class="btn btn-wa" href="${htmlEscape(whatsappHref)}" target="_blank" rel="noopener">Agendar agora →</a>
  </div>
</section>

<footer>
  <div class="container">
    <div class="foot-grid">
      <div>
        <h5>${htmlEscape(name)}</h5>
        <p>${htmlEscape(tagline.slice(0, 160))}</p>
        ${rating ? `<p style="color:var(--accent)">★ ${rating.toFixed(1)} - ${ratingCount} avaliacoes no Google</p>` : ""}
      </div>
      <div>
        <h5>Visite</h5>
        <p>${htmlEscape(address || "")}</p>
      </div>
      <div>
        <h5>Atendimento</h5>
        ${phone ? `<p>${htmlEscape(phone)}</p>` : ""}
        ${whatsappHref !== "#" ? `<p><a href="${htmlEscape(whatsappHref)}" target="_blank" style="color:var(--accent)">WhatsApp</a></p>` : ""}
      </div>
    </div>
    <div class="foot-bottom">
      <span>(C) ${new Date().getFullYear()} ${htmlEscape(name)} - Simulacao Seu Site 2.0</span>
      <span>Pagamento: dinheiro, Pix, cartao</span>
    </div>
  </div>
</footer>

${whatsappHref !== "#" ? `<a class="wa-fab" href="${htmlEscape(whatsappHref)}" target="_blank" rel="noopener" aria-label="WhatsApp">
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52z"/></svg>
</a>` : ""}

</body>
</html>`;
}
